# LINE GP 小幫手 — 新手上路指南 (SETUP GUIDE)

這份文件帶你從 0 開始，一步一步準備好所有帳號與金鑰。
完成後，我們才會開始寫程式。

> **重要原則**
> - 所有金鑰、Token、密碼 **絕對不能貼進聊天、不能 commit 到 Git**
> - 只放進 GCP Secret Manager 或本機 `.env`（`.env` 已被 `.gitignore` 擋掉）
> - 若你不小心貼出來了，立刻到對應平台「重新產生 (regenerate)」使舊的失效

---

## 目錄

- [Part 0. 準備清單](#part-0-準備清單)
- [Part 1. GCP 帳號與消費保護](#part-1-gcp-帳號與消費保護)
- [Part 2. Neon Postgres 資料庫](#part-2-neon-postgres-資料庫)
- [Part 3. LINE Bot（你已完成，只做確認）](#part-3-line-bot)
- [Part 4. Gemini API Key](#part-4-gemini-api-key)
- [Part 5. Secret 存放位置對照表](#part-5-secret-存放位置對照表)
- [Part 6. 完成檢查表](#part-6-完成檢查表)

---

## Part 0. 準備清單

開始前確認你有：
- [ ] 一個 Google 帳號（用來登入 GCP、Neon、Gemini）
- [ ] 一張信用卡（GCP 綁卡用，我們會設 $1 硬上限，不會被扣款）
- [ ] LINE Developers 帳號 + 已建好的 Messaging API Channel（你已完成 ✅）
- [ ] GitHub 帳號（你已完成 ✅）

預計耗時：**30–45 分鐘**

---

## Part 1. GCP 帳號與消費保護

### 1-1. 註冊 GCP

1. 開啟 https://console.cloud.google.com
2. 用 Google 帳號登入
3. 首次登入會出現「開始免費試用」→ 同意條款
4. 填寫國家、信用卡（**只是驗證身份，不會自動扣款**）
5. Google 會給你 **US$300 免費額度，90 天內用**（我們根本用不到）

### 1-2. 建立專案

1. 左上角「選取專案」→「新增專案」
2. 專案名稱：`line-gphelper`
3. 專案 ID 會自動產生（例如 `line-gphelper-472315`）→ **記下這個 ID**
4. 建立

### 1-3. 設定消費告警與上限（**這是保護你的關鍵步驟**）

**A. 設 $0.5 警告通知**

1. 左側選單 → **帳單 (Billing)** → **預算與快訊 (Budgets & alerts)**
2. 點「建立預算」
3. 名稱：`monthly-alert`
4. 時間範圍：每月
5. 金額：**USD 0.5**
6. 快訊門檻：50%、90%、100%（超過時 email 通知你）
7. 儲存

**B. 設 $1 硬上限（自動關閉服務）**

Google Cloud **沒有官方的「硬上限自動關閉」按鈕**，但可以透過以下方式做到接近效果：

1. 建第二個預算，金額 **USD 1**
2. 勾選「Connect a Pub/Sub topic to this budget」
3. 這步驟需要一個 Cloud Function 觸發器來「自動停用計費」——設定較複雜

**簡化建議（對你的用量夠用）**：
- 只設 **$0.5 email 告警**
- 每週看一次 Billing 頁面
- 你的用量預估 **每月 $0**（Cloud Run + Secret Manager Free Tier 綽綽有餘）

> 若你想要「硬上限自動關閉」的完整設定，我在 Phase 4 部署前會另外教你。目前先設 email 告警即可。

### 1-4. 啟用需要的 API

到「API 和服務 → 程式庫」搜尋並啟用：
- [ ] **Cloud Run Admin API**
- [ ] **Secret Manager API**
- [ ] **Artifact Registry API**（Cloud Run 部署需要）
- [ ] **Cloud Build API**（打包用）

（點進去按「啟用」即可，不用設定）

### ✅ Part 1 完成後你會有
- GCP 專案 ID（例如 `line-gphelper-472315`）
- $0.5 email 告警已設
- 4 個 API 已啟用

---

## Part 2. Neon Postgres 資料庫

### 2-1. 註冊 Neon

1. 開啟 https://neon.tech
2. 點「Sign Up」→ 用 Google 帳號登入
3. 選 Free plan

### 2-2. 建立 Project

1. Project name：`line-gphelper`
2. Postgres version：**16**（預設即可）
3. Region：**AWS ap-northeast-1 (Tokyo)** ← 對台灣延遲最低
4. Database name：`gphelper`
5. 建立

### 2-3. 拿到連線字串

建立完成後，Neon 會顯示「Connection string」，長這樣：

```
postgresql://gphelper_owner:XXXXXXXX@ep-xxx-xxx.ap-northeast-1.aws.neon.tech/gphelper?sslmode=require
```

**⚠️ 這串等於你的資料庫密碼，不能外流。**

**你要做的事：**
1. 複製這串
2. **暫時**貼到本機文字檔（例如 `~/gphelper-secrets.txt`），這個檔案**絕對不能進 Git**
3. 之後我們會把它移到 GCP Secret Manager

### 2-4. 確認連線正常

在 Neon Console 上方有「SQL Editor」，執行：
```sql
SELECT version();
```
若看到 `PostgreSQL 16.x on ...` 就 OK。

### ✅ Part 2 完成後你會有
- Neon 連線字串（暫存本機檔案）
- 一個空的 `gphelper` 資料庫

---

## Part 3. LINE Bot

你已經完成，我們只確認你手上有這 2 樣東西：

### 3-1. 需要的資訊

到 LINE Developers Console → 你的 Provider → 你的 Channel：

1. **Basic settings** 分頁 → **Channel secret**
   - 長這樣：`abc123def456...`（32 字元）

2. **Messaging API** 分頁 → **Channel access token (long-lived)**
   - 若還沒發行，按「Issue」發行一個
   - 長這樣：`XXXXXXXXXXX...`（很長一串）

3. **Messaging API** 分頁 → 找到 **Your user ID**（**這是你自己的 LINE userId**）
   - 若找不到，用 LINE 傳一句話給 Bot 後，我們可以從 log 撈
   - 格式：`U` 開頭 + 32 字元，例如 `U1234567890abcdef...`

### 3-2. Webhook 設定（現在不用改，之後 Cloud Run 部署完再回來設）

- Webhook URL：**先留空**，之後填 `https://line-gphelper-xxx.run.app/line/webhook`
- Use webhook：**ON**
- Auto-reply messages：**OFF**（避免跟你的 Bot 打架）
- Greeting messages：**OFF**

### ⚠️ 需要你做的重要一件事
把這 3 樣東西暫存到 `~/gphelper-secrets.txt`：
```
LINE_CHANNEL_SECRET=abc123...
LINE_CHANNEL_ACCESS_TOKEN=XXXXXXXX...
LINE_MY_USER_ID=U1234567890abcdef...
```

### ✅ Part 3 完成後你會有
- Channel Secret
- Channel Access Token
- 你自己的 LINE userId（Whitelist 會用）

---

## Part 4. Gemini API Key

### 4-1. 取得 API Key

1. 開啟 https://aistudio.google.com/apikey
2. 用 Google 帳號登入
3. 點「Create API key」
4. 選擇「Create API key in existing project」→ 選你剛建的 `line-gphelper`
5. 複製 API Key（`AIzaSy...` 開頭）

### 4-2. 確認方案

- Free tier 對 `gemini-2.5-flash` 目前規則（會變動）：
  - 15 RPM（每分鐘 15 次請求）
  - 1500 RPD（每天 1500 次）
- **Free tier 會用你的 prompt 訓練模型** → 我們的方案是「送給 Gemini 前先 PII 脫敏」

### ⚠️ 暫存
把 Gemini API Key 加到 `~/gphelper-secrets.txt`：
```
GEMINI_API_KEY=AIzaSy...
```

### ✅ Part 4 完成後你會有
- Gemini API Key

---

## Part 5. Secret 存放位置對照表

| 名稱 | 存放位置 | 說明 |
|---|---|---|
| `DATABASE_URL` | GCP Secret Manager | Neon 連線字串 |
| `LINE_CHANNEL_SECRET` | GCP Secret Manager | LINE 驗簽用 |
| `LINE_CHANNEL_ACCESS_TOKEN` | GCP Secret Manager | 呼叫 LINE API 用 |
| `GEMINI_API_KEY` | GCP Secret Manager | 呼叫 Gemini 用 |
| `LINE_USER_WHITELIST` | GCP Secret Manager | 你的 LINE userId（逗號分隔可多人） |
| 你自己的 `~/gphelper-secrets.txt` | 本機（**絕不進 Git**） | 你自己備份用 |
| `.env.example` | Git repo | 只放「變數名稱」，不放值 |

**進到 Phase 4 時我會帶你**：
1. 一條指令把每個 secret 寫進 GCP Secret Manager
2. Cloud Run 部署時自動注入這些 secret 到程式

---

## Part 6. 完成檢查表

當你全部完成，請回覆我以下清單的勾選狀態：

- [ ] GCP 專案已建立，專案 ID 是：`__________`
- [ ] GCP $0.5 email 告警已設
- [ ] Cloud Run / Secret Manager / Artifact Registry / Cloud Build API 已啟用
- [ ] Neon Project 已建立，region 是 Tokyo
- [ ] Neon 連線字串已暫存本機
- [ ] LINE Channel Secret + Access Token + 我的 userId 已暫存本機
- [ ] Gemini API Key 已取得並暫存本機
- [ ] `~/gphelper-secrets.txt` **沒有** 進 Git

---

## 常見問題 (FAQ)

**Q1. GCP 綁卡會不會被扣款？**
A. Free tier 用不完就不會扣。$0.5 告警是雙保險。你的用量預估每月 $0。

**Q2. Neon 免費會不會被暫停？**
A. Neon Free 「不會」像 Supabase 那樣閒置就暫停，可長期使用。

**Q3. Gemini API 免費層會被拿去訓練是不是很危險？**
A. 我們的架構已設計「PII 脫敏」，客戶名、供應商名、人名絕不會進 Gemini。

**Q4. 我不小心把 secret 貼到 Git / 聊天了怎麼辦？**
A. 立刻到對應平台按「Regenerate / Rotate」，舊的立刻失效。

**Q5. 我 LINE Channel 找不到 my userId？**
A. 沒關係，Cloud Run 部署後我們從 Webhook log 撈第一次傳訊息的 userId 即可。

---

## 下一步（你完成 Part 1–4 後）

回報給我：
1. GCP 專案 ID（**只有 ID 可以貼，其他 secret 不要貼**）
2. 完成檢查表勾選狀態
3. 遇到的任何錯誤截圖或訊息

我接下來會寫：
- **`docs/ARCHITECTURE.md`** — 完整系統架構
- **`docs/DATABASE.md`** — ER Model 與 Schema
- **`docs/SECURITY.md`** — 資安設計
- **`docs/MVP_TASKS.md`** — MVP 開發任務

然後才進入實作（Phase 4 MVP）。
