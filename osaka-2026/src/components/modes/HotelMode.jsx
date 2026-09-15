// GEMINI 的地盤 — 完整規格請看 repo root 的 GEMINI_HANDOFF.md
//
// Props:user, trip, stops, today
//
// 這頁的目的:
//   逸之彩酒店的獨立資訊頁,資料來自 src/data/hotel.js
//   建議區塊:
//     - Hero:氛圍描述(vibe)+ 主圖
//     - 每日福利(dailyPerks)— 卡片格
//     - 位置與交通(location + accessNotes)+ Google Maps 連結
//     - 你會愛上這裡的小事(loveables)
//     - 誠實面(caveats)
//     - 訂房連結(links)

import { hotel } from '../../data/hotel'

export default function HotelMode() {
  return (
    <div className="p-6 space-y-4">
      <p className="text-xs text-ink/50">
        TODO — Gemini 實作。資料在 src/data/hotel.js。
      </p>
      <h1 className="text-xl font-bold text-sage-deep">{hotel.nameZh}</h1>
      <p className="text-sm text-ink/70">{hotel.vibe}</p>
      <ul className="text-xs text-ink/60">
        {hotel.dailyPerks.map((p) => (
          <li key={p.title}>{p.icon} {p.title} — {p.desc}</li>
        ))}
      </ul>
    </div>
  )
}
