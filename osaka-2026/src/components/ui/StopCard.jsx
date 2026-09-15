import { KindBadge, kindIcon } from './KindBadge'

// 顯示一格 stop 卡片,可點擊觸發 onClick
export function StopCard({ stop, place, onClick, showOrder = true }) {
  if (!place) {
    return (
      <div className="p-3 bg-red-50 rounded-lg text-xs text-red-700">
        缺少地點資料:{stop.placeId}
      </div>
    )
  }
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white/70 backdrop-blur rounded-xl p-3 border border-ink/5 hover:border-sage-deep/30 hover:shadow-sm transition-all"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-sage/20 flex items-center justify-center text-lg">
          {kindIcon(place.kind)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            {stop.arriveAt && (
              <span className="text-xs font-mono text-sage-deep">{stop.arriveAt}</span>
            )}
            {showOrder && stop.order != null && (
              <span className="text-[10px] text-ink/40">#{stop.order + 1}</span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-ink leading-tight truncate">
            {place.name}
          </h3>
          {place.description && (
            <p className="text-xs text-ink/60 mt-1 line-clamp-2">{place.description}</p>
          )}
          {stop.note && (
            <p className="text-xs text-sage-deep mt-1 italic">📝 {stop.note}</p>
          )}
        </div>
      </div>
    </button>
  )
}
