// GEMINI 的地盤 — 完整規格請看 repo root 的 GEMINI_HANDOFF.md
//
// Props:user, trip, stops, today
//
// 這頁的目的:
//   顯示 6 天完整行程 + 備選區,支援:
//   - 天內拖曳換順序(reorderWithinDay)
//   - 跨天拖曳(moveToDay,可從 backup 拖到正式天)
//   - 每格左滑選單:改備註 / 改時間 / 移到備選(moveToBackup)/ 刪除
//   - 點卡片開 Google Maps(places[id].googleMapsUrl)
//   - 展開看 richDescription、highlights、caveats
//
// 用 useItineraryMutations(stops) 拿到操作 API。

import { places } from '../../data/itinerary'
import { useItineraryMutations } from '../../hooks/useItineraryMutations'

export default function ItineraryMode({ stops }) {
  const mutations = useItineraryMutations(stops)
  const days = [1, 2, 3, 4, 5, 6, 'backup']

  return (
    <div className="p-6 space-y-6">
      <p className="text-xs text-ink/50">
        TODO — Gemini 實作。已收到 stops={stops.length},
        mutations = {Object.keys(mutations).join(', ')}
      </p>
      {days.map((d) => (
        <section key={d}>
          <h2 className="text-sm font-bold text-sage-deep mb-2">
            {d === 'backup' ? '備選區' : `第 ${d} 天`}
          </h2>
          <ul className="text-xs text-ink/70 space-y-1">
            {stops
              .filter((s) => s.day === d)
              .sort((a, b) => a.order - b.order)
              .map((s) => (
                <li key={s.id}>
                  {s.arriveAt ? `${s.arriveAt} · ` : ''}
                  {places[s.placeId]?.name ?? s.placeId}
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
