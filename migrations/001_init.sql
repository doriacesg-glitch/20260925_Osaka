-- =============================================================
-- LINE GP 小幫手 — Initial Schema (v1)
-- 執行方式：Neon Console → SQL Editor → 貼上整份 → Run
-- 可重複執行（有 IF NOT EXISTS）；正式環境改動請走新 migration。
-- =============================================================

-- ---------- 擴充 ----------
CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pg_trgm;    -- 模糊搜尋

-- ---------- 通用 ENUM ----------
DO $$ BEGIN
  CREATE TYPE doc_type_enum AS ENUM (
    'SDS','TST','SPE','MDS','CMR','CMQ','MSQ',
    'RCD','HSF','RCH','RCQ','PCN','DRW','OTH'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE doc_status_enum AS ENUM ('active','superseded','expired','cancelled','draft');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE part_status_enum AS ENUM ('active','superseded','obsolete','draft');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE change_type_enum AS ENUM (
    'MANUFACTURER_CHANGE','PART_NUMBER_CHANGE','MATERIAL_CHANGE',
    'SPEC_CHANGE','SUPPLIER_CHANGE','OTHER'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE link_target_enum AS ENUM (
    'PART','PART_REVISION','PRODUCT','PRODUCT_REVISION',
    'SUPPLIER','MANUFACTURER','COMPONENT_INSTANCE'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =============================================================
-- 使用者 (最小)
-- =============================================================
CREATE TABLE IF NOT EXISTS users (
  id           BIGSERIAL PRIMARY KEY,
  line_user_id TEXT UNIQUE,
  display_name TEXT NOT NULL,
  email        TEXT,
  role         TEXT NOT NULL DEFAULT 'engineer',  -- admin/engineer/readonly
  status       TEXT NOT NULL DEFAULT 'active',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- 主檔：供應商、原廠、分類
-- =============================================================
CREATE TABLE IF NOT EXISTS suppliers (
  id            BIGSERIAL PRIMARY KEY,
  code          TEXT UNIQUE,
  name          TEXT NOT NULL,
  name_en       TEXT,
  short_name    TEXT,
  country       TEXT,
  status        TEXT NOT NULL DEFAULT 'active',
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_suppliers_name_trgm ON suppliers USING gin (name gin_trgm_ops);

CREATE TABLE IF NOT EXISTS supplier_contacts (
  id           BIGSERIAL PRIMARY KEY,
  supplier_id  BIGINT NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  person_name  TEXT NOT NULL,
  department   TEXT,
  email        TEXT,
  phone        TEXT,
  extension    TEXT,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_supplier_contacts_supplier ON supplier_contacts(supplier_id);

CREATE TABLE IF NOT EXISTS manufacturers (
  id          BIGSERIAL PRIMARY KEY,
  code        TEXT UNIQUE,
  name        TEXT NOT NULL,
  name_en     TEXT,
  country     TEXT,
  status      TEXT NOT NULL DEFAULT 'active',
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_manufacturers_name_trgm ON manufacturers USING gin (name gin_trgm_ops);

CREATE TABLE IF NOT EXISTS part_categories (
  id      BIGSERIAL PRIMARY KEY,
  code    TEXT UNIQUE,
  name    TEXT NOT NULL,
  parent_id BIGINT REFERENCES part_categories(id)
);

CREATE TABLE IF NOT EXISTS customers (
  id            BIGSERIAL PRIMARY KEY,
  code          TEXT UNIQUE,
  name          TEXT NOT NULL,
  name_en       TEXT,
  status        TEXT NOT NULL DEFAULT 'active',
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- 部件主檔 + Revision (變更歷史核心)
-- =============================================================
CREATE TABLE IF NOT EXISTS parts (
  id                    BIGSERIAL PRIMARY KEY,
  internal_code         TEXT UNIQUE NOT NULL,           -- 手動輸入的公司內部料號
  part_category_id      BIGINT REFERENCES part_categories(id),
  description           TEXT,
  current_revision_id   BIGINT,                          -- 指向 part_revisions.id (deferred FK)
  status                part_status_enum NOT NULL DEFAULT 'active',
  created_by            BIGINT REFERENCES users(id),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_parts_internal_code ON parts(internal_code);
CREATE INDEX IF NOT EXISTS idx_parts_category ON parts(part_category_id);

CREATE TABLE IF NOT EXISTS part_revisions (
  id                    BIGSERIAL PRIMARY KEY,
  part_id               BIGINT NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  revision_no           TEXT NOT NULL,                   -- Rev.01, Rev.02
  manufacturer_id       BIGINT REFERENCES manufacturers(id),
  mfr_part_number       TEXT,                            -- 原廠型號
  supplier_id           BIGINT REFERENCES suppliers(id),
  supplier_part_number  TEXT,                            -- 供應商料號
  material              TEXT,
  specification         TEXT,
  weight                NUMERIC(18,6),
  weight_unit           TEXT,                            -- g / mg / kg
  status                part_status_enum NOT NULL DEFAULT 'active',
  effective_from        DATE,
  effective_to          DATE,
  change_log_id         BIGINT,                          -- 這版由哪張變更單建立 (deferred FK)
  notes                 TEXT,
  created_by            BIGINT REFERENCES users(id),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (part_id, revision_no)
);
CREATE INDEX IF NOT EXISTS idx_part_rev_part ON part_revisions(part_id);
CREATE INDEX IF NOT EXISTS idx_part_rev_mfr_pn ON part_revisions(mfr_part_number);
CREATE INDEX IF NOT EXISTS idx_part_rev_sup_pn ON part_revisions(supplier_part_number);
CREATE INDEX IF NOT EXISTS idx_part_rev_mfr_pn_trgm ON part_revisions USING gin (mfr_part_number gin_trgm_ops);

-- 補上 parts.current_revision_id 的 FK
DO $$ BEGIN
  ALTER TABLE parts
    ADD CONSTRAINT parts_current_revision_fk
    FOREIGN KEY (current_revision_id) REFERENCES part_revisions(id) DEFERRABLE INITIALLY DEFERRED;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =============================================================
-- 變更記錄 (單純留存，非審批)
-- =============================================================
CREATE TABLE IF NOT EXISTS change_logs (
  id                  BIGSERIAL PRIMARY KEY,
  change_no           TEXT UNIQUE NOT NULL,               -- CR-2026-0001
  part_id             BIGINT NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  from_revision_id    BIGINT REFERENCES part_revisions(id),
  to_revision_id      BIGINT REFERENCES part_revisions(id),
  change_type         change_type_enum NOT NULL,
  change_date         DATE NOT NULL,
  reason              TEXT NOT NULL,
  before_snapshot     JSONB,
  after_snapshot      JSONB,
  related_documents   BIGINT[],                            -- document.id 陣列
  notes               TEXT,
  created_by          BIGINT REFERENCES users(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_change_logs_part ON change_logs(part_id);
CREATE INDEX IF NOT EXISTS idx_change_logs_date ON change_logs(change_date);

DO $$ BEGIN
  ALTER TABLE part_revisions
    ADD CONSTRAINT part_rev_change_log_fk
    FOREIGN KEY (change_log_id) REFERENCES change_logs(id) DEFERRABLE INITIALLY DEFERRED;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 變更單流水號序列
CREATE SEQUENCE IF NOT EXISTS change_no_seq START 1;

-- =============================================================
-- 文件管理 (核心)
-- =============================================================
-- 每個類別一個獨立流水序列，避免撞號
CREATE SEQUENCE IF NOT EXISTS doc_seq_sds START 1;
CREATE SEQUENCE IF NOT EXISTS doc_seq_tst START 1;
CREATE SEQUENCE IF NOT EXISTS doc_seq_spe START 1;
CREATE SEQUENCE IF NOT EXISTS doc_seq_mds START 1;
CREATE SEQUENCE IF NOT EXISTS doc_seq_cmr START 1;
CREATE SEQUENCE IF NOT EXISTS doc_seq_cmq START 1;
CREATE SEQUENCE IF NOT EXISTS doc_seq_msq START 1;
CREATE SEQUENCE IF NOT EXISTS doc_seq_rcd START 1;
CREATE SEQUENCE IF NOT EXISTS doc_seq_hsf START 1;
CREATE SEQUENCE IF NOT EXISTS doc_seq_rch START 1;
CREATE SEQUENCE IF NOT EXISTS doc_seq_rcq START 1;
CREATE SEQUENCE IF NOT EXISTS doc_seq_pcn START 1;
CREATE SEQUENCE IF NOT EXISTS doc_seq_drw START 1;
CREATE SEQUENCE IF NOT EXISTS doc_seq_oth START 1;

-- 產生 doc_code 的函式：generate_doc_code('SDS') → 'SDS00000001'
CREATE OR REPLACE FUNCTION generate_doc_code(p_type TEXT)
RETURNS TEXT AS $$
DECLARE
  seq_name TEXT;
  n BIGINT;
BEGIN
  IF p_type !~ '^(SDS|TST|SPE|MDS|CMR|CMQ|MSQ|RCD|HSF|RCH|RCQ|PCN|DRW|OTH)$' THEN
    RAISE EXCEPTION 'Invalid doc type: %', p_type;
  END IF;
  seq_name := 'doc_seq_' || lower(p_type);
  EXECUTE format('SELECT nextval(%L)', seq_name) INTO n;
  RETURN p_type || lpad(n::text, 8, '0');
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS documents (
  id              BIGSERIAL PRIMARY KEY,
  doc_code        TEXT UNIQUE NOT NULL,                   -- SDS00000001
  doc_type        doc_type_enum NOT NULL,
  doc_no          TEXT,                                   -- 文件本身編號 (供應商給的)
  doc_name        TEXT NOT NULL,                          -- 文件命名
  doc_date        DATE,                                   -- 文件日期
  issuer_name     TEXT,                                   -- 出文件的廠商名稱
  file_location   TEXT,                                   -- 歸檔位置字串 (\\NAS\...\file.pdf)
  version         TEXT,
  status          doc_status_enum NOT NULL DEFAULT 'active',
  effective_from  DATE,
  effective_to    DATE,
  notes           TEXT,
  created_by      BIGINT REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(doc_type);
CREATE INDEX IF NOT EXISTS idx_documents_date ON documents(doc_date);
CREATE INDEX IF NOT EXISTS idx_documents_issuer ON documents(issuer_name);
CREATE INDEX IF NOT EXISTS idx_documents_name_trgm ON documents USING gin (doc_name gin_trgm_ops);

-- 測報延伸資料
CREATE TABLE IF NOT EXISTS test_report_details (
  document_id       BIGINT PRIMARY KEY REFERENCES documents(id) ON DELETE CASCADE,
  report_no         TEXT,                                 -- 檢測單位給的報告編號
  lab_name          TEXT,                                 -- SGS / BV / Intertek
  test_standard     TEXT,                                 -- IEC 62321 / EN 71-3 / ...
  sample_name       TEXT,
  sample_description TEXT
);
CREATE INDEX IF NOT EXISTS idx_tr_report_no ON test_report_details(report_no);

CREATE TABLE IF NOT EXISTS test_report_items (
  id                BIGSERIAL PRIMARY KEY,
  document_id       BIGINT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  test_item         TEXT NOT NULL,                        -- Pb / Cd / DEHP
  cas_no            TEXT,
  method            TEXT,
  result_value      NUMERIC(18,6),
  result_text       TEXT,                                 -- 'N.D.' / '<10'
  result_unit       TEXT,                                 -- mg/kg, ppm, wt%
  detection_limit   NUMERIC(18,6),
  regulation_limit  NUMERIC(18,6),
  pass_fail         TEXT,                                 -- PASS/FAIL/NA
  notes             TEXT
);
CREATE INDEX IF NOT EXISTS idx_tr_items_doc ON test_report_items(document_id);
CREATE INDEX IF NOT EXISTS idx_tr_items_cas ON test_report_items(cas_no);

-- 文件 ↔ 部件/產品/供應商 多對多
CREATE TABLE IF NOT EXISTS document_links (
  id            BIGSERIAL PRIMARY KEY,
  document_id   BIGINT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  target_type   link_target_enum NOT NULL,
  target_id     BIGINT NOT NULL,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (document_id, target_type, target_id)
);
CREATE INDEX IF NOT EXISTS idx_doc_links_target ON document_links(target_type, target_id);

-- =============================================================
-- 產品 & BOM (多層)
-- =============================================================
CREATE TABLE IF NOT EXISTS products (
  id                    BIGSERIAL PRIMARY KEY,
  model                 TEXT NOT NULL,
  part_number           TEXT,                             -- 公司內部產品料號
  customer_id           BIGINT REFERENCES customers(id),
  customer_part_number  TEXT,                             -- 客戶端料號
  description           TEXT,
  current_revision_id   BIGINT,
  status                TEXT NOT NULL DEFAULT 'active',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_products_model ON products(model);
CREATE INDEX IF NOT EXISTS idx_products_pn ON products(part_number);

CREATE TABLE IF NOT EXISTS product_revisions (
  id              BIGSERIAL PRIMARY KEY,
  product_id      BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  revision_no     TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'active',
  effective_from  DATE,
  effective_to    DATE,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_id, revision_no)
);

DO $$ BEGIN
  ALTER TABLE products
    ADD CONSTRAINT products_current_rev_fk
    FOREIGN KEY (current_revision_id) REFERENCES product_revisions(id) DEFERRABLE INITIALLY DEFERRED;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS bom_items (
  id                    BIGSERIAL PRIMARY KEY,
  product_revision_id   BIGINT NOT NULL REFERENCES product_revisions(id) ON DELETE CASCADE,
  parent_bom_item_id    BIGINT REFERENCES bom_items(id) ON DELETE CASCADE,
  part_id               BIGINT NOT NULL REFERENCES parts(id),
  part_revision_id      BIGINT REFERENCES part_revisions(id),      -- 當時採用哪版
  quantity              NUMERIC(18,6) NOT NULL DEFAULT 1,
  position              TEXT,
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_bom_prev ON bom_items(product_revision_id);
CREATE INDEX IF NOT EXISTS idx_bom_parent ON bom_items(parent_bom_item_id);
CREATE INDEX IF NOT EXISTS idx_bom_part ON bom_items(part_id);

-- =============================================================
-- 物質 (供未來法規查詢用，先建骨架)
-- =============================================================
CREATE TABLE IF NOT EXISTS substances (
  id          BIGSERIAL PRIMARY KEY,
  cas_no      TEXT UNIQUE,
  ec_no       TEXT,
  name_en     TEXT NOT NULL,
  name_zh     TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_substances_cas ON substances(cas_no);
CREATE INDEX IF NOT EXISTS idx_substances_name_trgm ON substances USING gin (name_en gin_trgm_ops);

CREATE TABLE IF NOT EXISTS substance_aliases (
  id           BIGSERIAL PRIMARY KEY,
  substance_id BIGINT NOT NULL REFERENCES substances(id) ON DELETE CASCADE,
  alias        TEXT NOT NULL,
  UNIQUE (substance_id, alias)
);
CREATE INDEX IF NOT EXISTS idx_substance_alias_trgm ON substance_aliases USING gin (alias gin_trgm_ops);

-- =============================================================
-- Audit Log
-- =============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id           BIGSERIAL PRIMARY KEY,
  user_id      BIGINT REFERENCES users(id),
  action       TEXT NOT NULL,                             -- CREATE/UPDATE/DELETE/VIEW
  entity_type  TEXT NOT NULL,
  entity_id    BIGINT,
  before_data  JSONB,
  after_data   JSONB,
  ip_address   TEXT,
  reason       TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_user_time ON audit_logs(user_id, created_at DESC);

-- =============================================================
-- 初始種子：部件分類
-- =============================================================
INSERT INTO part_categories (code, name) VALUES
  ('IC','IC / 半導體'),
  ('CAP','電容'),
  ('RES','電阻'),
  ('IND','電感'),
  ('CON','連接器'),
  ('PCB','印刷電路板'),
  ('METAL','金屬件'),
  ('PLASTIC','塑膠件'),
  ('CABLE','線材'),
  ('LABEL','標籤'),
  ('PACK','包材'),
  ('OTHER','其他')
ON CONFLICT (code) DO NOTHING;

-- =============================================================
-- 使用範例 (執行後你可以試試)
-- =============================================================
-- 新增一個供應商
--   INSERT INTO suppliers (code, name) VALUES ('SUP001','大聯大');
-- 新增一個原廠
--   INSERT INTO manufacturers (code, name) VALUES ('MFR001','NXP');
-- 新增一個部件
--   INSERT INTO parts (internal_code, part_category_id, description)
--   VALUES ('IC-001', (SELECT id FROM part_categories WHERE code='IC'), 'MCU 32-bit')
--   RETURNING id;
-- 為它新增第一版
--   INSERT INTO part_revisions (part_id, revision_no, manufacturer_id, mfr_part_number,
--                                supplier_id, supplier_part_number, material, weight, weight_unit)
--   VALUES (1, 'Rev.01', 1, 'XYZ-100', 1, 'DA-XYZ-100', 'ABS', 0.5, 'g')
--   RETURNING id;
-- 綁回 parts.current_revision_id
--   UPDATE parts SET current_revision_id = 1 WHERE id = 1;
-- 新增一份 SDS
--   INSERT INTO documents (doc_code, doc_type, doc_name, doc_date, issuer_name, file_location)
--   VALUES (generate_doc_code('SDS'), 'SDS', 'NXP XYZ-100 SDS', '2026-01-15',
--           'NXP', '\\NAS\GP\SDS\NXP-XYZ-100.pdf')
--   RETURNING id, doc_code;
-- 把 SDS 掛給部件
--   INSERT INTO document_links (document_id, target_type, target_id)
--   VALUES (1, 'PART', 1);
