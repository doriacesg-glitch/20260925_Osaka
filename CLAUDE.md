# 大阪 2026 旅遊手帳 PWA — 專案守則

## 分工紀律(重要)

**Claude 負責全部**(資料 + 邏輯 + 視覺),直到 Doria 找到穩定的視覺協作方 (Gemini) 。

- 視覺方向由 Doria 決定;沒有明確方向時,Claude 做「先能動、乾淨、克制」的功能版
- 未來若 Gemini 加入,他的地盤是 `osaka-2026/src/components/ui/`
  與 `osaka-2026/src/components/modes/`;
  Claude 交出視覺主導權,只顧資料/邏輯層

## 專案定位

給 Doria(企鵝 🐧)與 Ray(貓 🐱)在 2026/9/25–9/30 大阪旅行使用的 PWA。
兩個人一起編織的旅遊小書 —— 在旅程中就自動長出來,回國後變成收藏。
視覺:水彩手繪風(米色/鼠尾草綠底 + 拍立得 + 和紙膠帶) — 這是理想方向,
若目前實作還沒到位,先確保功能可運作。

## 技術棧(已定案)

- React 18 + Vite + Tailwind CSS v3
- PWA:`vite-plugin-pwa`(Workbox)
- 後端:Firebase(Auth 匿名 + Firestore)
- 地圖:Google Maps 網址(用 `googleMapsUrl` 直接開)
- OCR:Tesseract.js(客戶端)
- 部署:Firebase Hosting

**照片政策**:本機儲存,不用 Firebase Storage,兩人各自拍(Doria 決定)。

## 專案位置

實作在 `osaka-2026/` 子目錄。
