// GEMINI 的地盤 — 完整規格請看 repo root 的 GEMINI_HANDOFF.md
//
// Props(App shell 傳進來):
//   user   — Firebase Auth user(匿名)
//   trip   — trips/{id} 文件內容
//   stops  — 全部 stops(已按 order 排序,含 backup)
//   today  — { status: 'before'|'during'|'after', day: 1..6 | null, daysUntil?, daysSince? }
//
// 這頁的目的:
//   旅程當下的「今日焦點」 — 只顯示 today.day 那天的行程,
//   以及「下一站在哪裡/幾分鐘後」的頂部提示。
//   旅程未開始/結束時,顯示對應的封面。

import { places, stopsByDay } from '../../data/itinerary'

export default function TodayMode({ user, trip, stops, today }) {
  return (
    <div className="p-6 space-y-4">
      <p className="text-xs text-ink/50">
        TODO — Gemini 實作。已收到 props:user={user?.uid?.slice(0, 6)},
        stops={stops.length},today={JSON.stringify(today)}
      </p>
      <pre className="text-xs text-ink/60 whitespace-pre-wrap">
        {today.day
          ? stopsByDay(stops, today.day)
              .map((s) => `${s.arriveAt ?? ''} ${places[s.placeId]?.name ?? s.placeId}`)
              .join('\n')
          : today.status === 'before'
            ? `倒數 ${today.daysUntil} 天出發`
            : `旅程結束 ${today.daysSince} 天`}
      </pre>
    </div>
  )
}
