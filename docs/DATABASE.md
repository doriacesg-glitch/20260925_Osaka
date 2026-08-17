# DATABASE.md — Schema 說明

> 對應腳本：`migrations/001_init.sql`
> DB：Neon Postgres 16 (region: AWS Tokyo)
> 執行方式：Neon Console → SQL Editor → 貼上 `001_init.sql` 全文 → Run

---

## 一、模組總覽

| 模組 | 主要表 |
|---|---|
| 使用者 | `users` |
| 主檔 | `suppliers`, `supplier_contacts`, `manufacturers`, `part_categories`, `customers` |
| 部件 + 變更 | `parts`, `part_revisions`, `change_logs` |
| 文件 | `documents`, `test_report_details`, `test_report_items`, `document_links` |
| 產品 + BOM | `products`, `product_revisions`, `bom_items` |
| 物質 | `substances`, `substance_aliases` |
| 稽核 | `audit_logs` |

---

## 二、核心設計理念

### 1. 部件用「主檔 + Revision」
- `parts` = 邏輯身份（永不刪，`internal_code` 唯一）
- `part_revisions` = 每次變更新增一筆
- `parts.current_revision_id` 指向目前生效版
- **舊版永遠留著**，方便追溯歷史 BOM 用的是哪一版

### 2. 原廠 / 供應商 分離
同一顆 IC 可能不同供應商賣、同一供應商可能賣多家原廠貨。
`manufacturers` 與 `suppliers` 是兩張獨立表。

### 3. 文件多對多綁定
一份 SDS 可能適用同原廠多個型號 → `document_links` 是多對多表。
`target_type` 決定綁到 `PART` / `PART_REVISION` / `PRODUCT` / `SUPPLIER` / `MANUFACTURER`。

### 4. 文件流水號規則
`doc_code = 前3碼類別 + 8碼流水`，如 `SDS00000001`。
每個類別獨立 Sequence，永不重號、不重置。
新增時呼叫：`generate_doc_code('SDS')`。

**類別對照**：
| 前綴 | 類別 |
|---|---|
| SDS | SDS |
| TST | 測試報告 |
| SPE | 規格書 |
| MDS | MDS |
| CMR | 衝突礦產宣告書 |
| CMQ | 衝突礦產調查表 |
| MSQ | 物質調查表 |
| RCD | 法規符合性聲明 |
| HSF | HSF 宣告書 |
| RCH | REACH 聲明書 |
| RCQ | REACH 調查表 |
| PCN | PCN |
| DRW | 圖面 |
| OTH | 其他 |

### 5. 變更記錄（非審批）
`change_logs` 只做記錄留存：
- 記錄變更類型、日期、原因、前後快照、關聯文件
- 觸發時機：更新部件 → 提示填變更原因 → 建新 `part_revision` + 寫 `change_logs`
- 部件詳情頁顯示變更時間軸

### 6. BOM
- `bom_items` 用 `parent_bom_item_id` 支援多層（Adjacency List）
- 記錄「當時用的 `part_revision_id`」，部件之後換版不會影響歷史 BOM

### 7. 檔案本體
本階段 **不存實體檔案**，只在 `documents.file_location` 存字串（NAS 路徑、雲端路徑、URL）。
未來要串 GCS 時再加 `file_url` 相關欄位。

---

## 三、常用查詢範例

### 查料號 → 看部件現況 + 所有文件
```sql
SELECT p.internal_code, pr.mfr_part_number, m.name AS manufacturer,
       s.name AS supplier, pr.material, pr.weight, pr.weight_unit
FROM parts p
JOIN part_revisions pr ON pr.id = p.current_revision_id
LEFT JOIN manufacturers m ON m.id = pr.manufacturer_id
LEFT JOIN suppliers s ON s.id = pr.supplier_id
WHERE p.internal_code = 'IC-001';

SELECT d.doc_code, d.doc_type, d.doc_name, d.doc_date, d.file_location
FROM document_links dl
JOIN documents d ON d.id = dl.document_id
WHERE dl.target_type = 'PART' AND dl.target_id = (SELECT id FROM parts WHERE internal_code='IC-001')
ORDER BY d.doc_date DESC;
```

### 查原廠型號 → 反查哪些產品用到
```sql
SELECT DISTINCT p.model, p.part_number
FROM parts pt
JOIN part_revisions pr ON pr.part_id = pt.id
JOIN bom_items b ON b.part_revision_id = pr.id
JOIN product_revisions prv ON prv.id = b.product_revision_id
JOIN products p ON p.id = prv.product_id
WHERE pr.mfr_part_number = 'XYZ-100';
```

### 部件變更歷史
```sql
SELECT cl.change_no, cl.change_date, cl.change_type, cl.reason,
       cl.before_snapshot, cl.after_snapshot
FROM change_logs cl
WHERE cl.part_id = (SELECT id FROM parts WHERE internal_code='IC-001')
ORDER BY cl.change_date DESC;
```

### BOM 遞迴展開
```sql
WITH RECURSIVE tree AS (
  SELECT id, parent_bom_item_id, part_id, part_revision_id, 1 AS lvl
  FROM bom_items
  WHERE product_revision_id = 1 AND parent_bom_item_id IS NULL
  UNION ALL
  SELECT b.id, b.parent_bom_item_id, b.part_id, b.part_revision_id, t.lvl+1
  FROM bom_items b JOIN tree t ON b.parent_bom_item_id = t.id
)
SELECT lvl, p.internal_code, pr.mfr_part_number, m.name
FROM tree t
JOIN parts p ON p.id = t.part_id
JOIN part_revisions pr ON pr.id = t.part_revision_id
LEFT JOIN manufacturers m ON m.id = pr.manufacturer_id
ORDER BY t.lvl, p.internal_code;
```

---

## 四、操作順序（第一次建部件）

1. 新增 `suppliers`（若還沒有）
2. 新增 `manufacturers`（若還沒有）
3. `INSERT INTO parts (internal_code, part_category_id, description) RETURNING id;`
4. `INSERT INTO part_revisions (part_id='上一步的id', revision_no='Rev.01', ...) RETURNING id;`
5. `UPDATE parts SET current_revision_id='上一步的id' WHERE id='第3步的id';`
6. 需要文件時：
   - `INSERT INTO documents (doc_code, doc_type, doc_name, ...) VALUES (generate_doc_code('SDS'), 'SDS', ...) RETURNING id;`
   - `INSERT INTO document_links (document_id, target_type, target_id) VALUES (...);`

腳本檔尾也有可直接複製的 INSERT 範例。

---

## 五、後續 migration 規則

- 檔名格式：`migrations/00N_描述.sql`
- 每個檔案只包含新增/變更，**不改舊 migration**
- 執行順序照檔名數字
- 之後我加自動化工具（Alembic 或 sqitch）前，先手動在 Neon Console 執行

---

## 六、備份

Neon Free 內建：
- **PITR (Point-in-Time Recovery) 24 小時**
- 手動每週用 `pg_dump` 匯出一份保底（我之後寫成 GitHub Actions 排程）
