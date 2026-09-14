# 大阪 2026 旅遊手帳 PWA — 專案守則

## 分工紀律(重要)

視覺層由 Gemini 負責產出,Claude 負責資料層與邏輯層。

- **Claude 的地盤**:`osaka-2026/src/hooks/`、`osaka-2026/src/lib/`、
  `osaka-2026/src/config/`、`osaka-2026/src/data/`
- **Gemini 的地盤**:`osaka-2026/src/components/ui/`、
  `osaka-2026/src/components/modes/`
- 若 UI 需要新欄位,回報使用者請 Gemini 處理,**不要自己動 components**。

## 專案定位

給 Doria(企鵝 🐧)與 Ray(貓 🐱)在 2026/9/25–9/30 大阪旅行使用的 PWA。
兩個人一起編織的旅遊小書 —— 在旅程中就自動長出來,回國後變成收藏。
視覺:水彩手繪風(米色/鼠尾草綠底 + 拍立得 + 和紙膠帶)。

## 技術棧(已定案)

- React 18 + Vite + Tailwind CSS
- PWA:`vite-plugin-pwa`(Workbox)
- 後端:Firebase(Auth 匿名 + Firestore + Storage)
- 地圖:Google Static Maps API
- OCR:Tesseract.js(客戶端)
- 部署:Firebase Hosting

## 專案位置

實作在 `osaka-2026/` 子目錄。
