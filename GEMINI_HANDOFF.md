# Gemini 交接文件 — 大阪 2026 PWA

> 這份文件寫給 Gemini(視覺 UI 負責人)。
> 資料層與邏輯層已由 Claude 建好,這裡告訴你**每個 mode 該做什麼、資料從哪拿、
> 如何寫入變更**。

## 分工紀律(必守)

- **你的地盤**:`osaka-2026/src/components/ui/`、`osaka-2026/src/components/modes/`
- **不要動**:`hooks/`、`lib/`、`config/`、`data/`
- 若 UI 需要新資料欄位 → **回報 Doria**,由 Claude 加進資料層。

## 視覺方向(Doria 定案)

- **氛圍**:水彩手繪風,兩個人一起編織的旅遊小書 —— 旅程中自動長出來,回國變收藏
- **配色**(已在 `tailwind.config.js`):
  - `paper` `#f5efe4` 米色底
  - `sage` / `sage-deep` `#a7b89a` / `#7a8c6d` 鼠尾草綠(主色)
  - `ink` `#3b3a36` 文字
  - `washi-pink` `#e8c7c1` / `washi-blue` `#b8cbd6` 和紙膠帶點綴色
- **元素**:拍立得、和紙膠帶、手寫字體(fontFamily `hand`)
- **Mascot**:企鵝(Doria)、貓(Ray)

---

## 4 個 Mode(app 的頂層畫面)

app shell(`src/App.jsx`)已經做好底部 tab bar,你只需要在 `src/components/modes/`
實作以下 4 個檔案(stub 已建好,你直接改 return 內容即可):

| 檔案 | 頁面 | 主要工作 |
|---|---|---|
| `TodayMode.jsx`     | ☀️ 今天 | 旅程中的當日焦點 |
| `ItineraryMode.jsx` | 📖 行程 | 完整 6 天 + 備選,拖曳/左滑編輯 |
| `HotelMode.jsx`     | 🏠 飯店 | 逸之彩獨立資訊頁 |
| `MemoriesMode.jsx`  | 📷 回憶 | 拍立得/票根/手寫筆記牆 |

每個 mode 收到相同 props:

```jsx
{ user, trip, stops, today }
```

- `user` — Firebase Auth 匿名 user(有 `uid`)
- `trip` — 旅程本體(可能是 null,還沒 seed 前)
- `stops` — 全部時間軸格,已按 `order` 排序,`day` 從 1..6 或 `'backup'`
- `today` — `{ status: 'before'|'during'|'after', day: 1..6|null, daysUntil?, daysSince? }`

---

## 資料 schema

### `src/data/itinerary.js`

兩層設計:

```js
places = {
  'ajinoya': {
    name: '味乃家 御好燒(難波本店)',
    kind: 'food',           // hotel | transport | photo | food | shopping | entertainment
    googleMapsUrl: '...',   // 點卡片開這個
    description: '...',     // 短版(PDF 官方版)
    richDescription: '...', // 長版(200-300 字,可展開看)
    hoursNote: '...',       // 選填
    highlights: [...],      // 選填 — 亮點條列
    caveats: [...],         // 選填 — 注意事項
    source: 'https://...',  // 選填 — 引用來源
    unverified: true,       // 選填 — 標紅提醒使用者:資料不確定
    unverifiedNote: '...',
  },
  // ...共 40 個
}

defaultStops = [
  {
    id: 's-2-4',
    placeId: 'ajinoya',
    day: 2,              // 1..6 或 'backup'
    order: 4,            // 同一天內的順序
    arriveAt: '12:17',   // 選填,時間字串
    duration: 60,        // 選填,停留分鐘數
    note: '...',         // 選填,備註
  },
  // ...
]
```

> ⚠️ `defaultStops` 是**初始種子**。App 啟動後真正的資料在 Firestore
> `trips/osaka-2026/stops` 子集合。你在 UI 讀 `stops` prop 就對了。

helper:
```js
import { places, stopsByDay, getPlace } from '../../data/itinerary'
stopsByDay(stops, 3)   // 取第 3 天所有 stops(已排序)
getPlace('ajinoya')    // 取 place 資訊
```

### `src/data/hotel.js`

單一 export:
```js
import { hotel } from '../../data/hotel'

hotel.nameZh          // 「溫泉大阪逸之彩酒店 日本橋」
hotel.vibe            // 情境化描述(適合放 hero)
hotel.dailyPerks      // [{time, icon, title, desc}] — 6 項每日福利
hotel.location        // {area, nearestStation, walkFromStation, accessNotes[], landmarks}
hotel.loveables       // 5 項「你會愛上這裡的小事」
hotel.caveats         // 3 項誠實面
hotel.links           // {ctrip, ezTravel, trip} 訂房連結
```

---

## 改變行程資料(拖曳/左滑要用)

```js
import { useItineraryMutations } from '../../hooks/useItineraryMutations'

function ItineraryMode({ stops }) {
  const {
    reorderWithinDay,  // (day, fromIndex, toIndex) — 同天換順序
    moveToDay,         // (stopId, toDay, toIndex?) — 跨天/從 backup 拖到正式天
    moveToBackup,      // (stopId) — 快捷:移到備選
    updateStop,        // (stopId, {arriveAt, duration, note, ...}) — 改欄位
    removeStop,        // (stopId) — 刪除
    addStop,           // ({placeId, day, arriveAt?, duration?, note?}) — 新增
  } = useItineraryMutations(stops)

  // 呼叫後不用手動更新 UI — Firestore 會即時推更新回來
}
```

**Firestore 是即時同步的** — 你呼叫 mutation → Firestore 更新 → `useTrip`
收到 snapshot → 重渲染。所以不要維護本地 state,直接讀 `stops` 即可。

---

## 常見的 UI 需求 → 對應 API

| 使用者動作 | 呼叫 |
|---|---|
| 「拖動一格換到今天另一個時段」 | `reorderWithinDay(day, from, to)` |
| 「把備選那家餐廳拖到第 3 天下午」 | `moveToDay(stopId, 3, toIndex)` |
| 「左滑 → 移到備選」 | `moveToBackup(stopId)` |
| 「左滑 → 改備註」 | `updateStop(stopId, { note: '記得預約' })` |
| 「左滑 → 刪除」 | `removeStop(stopId)` |
| 「點卡片 → 開 Google Maps」 | `window.open(places[placeId].googleMapsUrl)` |

---

## 常用 UI 元件(建議放 `components/ui/`)

- `<PolaroidCard>` — 拍立得樣式的照片卡
- `<WashiTape>` — 和紙膠帶裝飾條(垂直/水平)
- `<HandwrittenLabel>` — 手寫字標籤
- `<TimelineItem>` — 行程卡(可拖曳、可左滑)
- `<PenguinMascot>` / `<CatMascot>` — 兩個 mascot 元件
- `<EmptyState>` — 空狀態插畫(米色紙 + 手繪小圖)

---

## 圖片/資源

- 目前 `public/` 只有 favicon;拍立得/膠帶素材由你決定用 SVG 生成或 PNG
- Mascot 若要用向量,可放 `src/assets/` 並直接 import
- **不用** Firebase Storage(照片全部本機),直接用 `<input type="file">` + `FileReader` + IndexedDB(用現成的 `src/lib/offlineQueue.js` 或另建 hook)

---

## 檔案地圖速查

```
src/
├── App.jsx                       ← Claude 建好,不要動
├── main.jsx                      ← Claude 建好,不要動
├── config/
│   ├── firebase.js               ← Claude
│   ├── trip.js                   ← Claude
│   └── modes.js                  ← Claude
├── data/
│   ├── itinerary.js              ← Claude(40 places + 60 stops)
│   └── hotel.js                  ← Claude
├── hooks/
│   ├── useAuth.js                ← Claude
│   ├── useTrip.js                ← Claude
│   ├── useItineraryMutations.js  ← Claude(拖曳/編輯 API)
│   └── useToday.js               ← Claude
├── lib/
│   ├── ocr.js                    ← Claude(Tesseract)
│   ├── offlineQueue.js           ← Claude(idb-keyval)
│   ├── staticMap.js              ← Claude(現在 Doria 決定用 Google Maps 連結,這個暫時沒用到)
│   └── seedFirestore.js          ← Claude
├── styles/globals.css            ← Claude
└── components/
    ├── ui/          ← 【Gemini 的地盤】
    └── modes/       ← 【Gemini 的地盤】
        ├── TodayMode.jsx         ← 你來實作
        ├── ItineraryMode.jsx     ← 你來實作
        ├── HotelMode.jsx         ← 你來實作
        └── MemoriesMode.jsx      ← 你來實作
```
