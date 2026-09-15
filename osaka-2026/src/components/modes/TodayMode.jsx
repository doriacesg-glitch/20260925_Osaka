import { useState, useMemo } from 'react'
import { places, stopsByDay } from '../../data/itinerary'
import { TRIP } from '../../config/trip'
import { useItineraryMutations } from '../../hooks/useItineraryMutations'
import { StopCard } from '../ui/StopCard'
import { StopDetailSheet } from '../ui/StopDetailSheet'

// 「今天」焦點頁
// - 旅程未開始:倒數 + Day 1 預覽
// - 旅程進行中:今日行程 + 下一站高亮
// - 旅程結束:結束卡 + Day 6 回顧
// - 也可以左右切換看其他天

export default function TodayMode({ stops, today }) {
  const mutations = useItineraryMutations(stops)
  const [viewDay, setViewDay] = useState(
    today.status === 'during' ? today.day : today.status === 'before' ? 1 : 6,
  )
  const [selectedStop, setSelectedStop] = useState(null)

  const dayStops = useMemo(() => stopsByDay(stops, viewDay), [stops, viewDay])
  const now = useMemo(() => new Date(), [])

  // 找「下一站」— 只有 today.status === 'during' 且 viewDay === today.day 才算
  const nextStopIndex = useMemo(() => {
    if (today.status !== 'during' || viewDay !== today.day) return -1
    const nowHm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    return dayStops.findIndex((s) => s.arriveAt && s.arriveAt > nowHm)
  }, [today, viewDay, dayStops, now])

  return (
    <div className="min-h-full">
      {/* Header */}
      <header className="px-5 pt-6 pb-4 bg-gradient-to-b from-sage/20 to-transparent">
        <p className="text-xs text-ink/50">{TRIP.title}</p>
        <h1 className="text-2xl font-bold text-sage-deep mt-1">
          {today.status === 'before' && `倒數 ${today.daysUntil} 天`}
          {today.status === 'during' && `第 ${today.day} 天`}
          {today.status === 'after' && `旅程結束了`}
        </h1>
        <p className="text-sm text-ink/70 mt-1">
          {today.status === 'before' && `9/25 出發 · 現在正在夢想中`}
          {today.status === 'during' && `${dayDate(today.day)} · Doria 🐧 & Ray 🐱`}
          {today.status === 'after' && `已經 ${today.daysSince} 天前的回憶`}
        </p>
      </header>

      {/* 天數切換 */}
      <div className="px-5 mb-3">
        <div className="flex gap-1 overflow-x-auto -mx-1 px-1 pb-1">
          {[1, 2, 3, 4, 5, 6].map((d) => (
            <button
              key={d}
              onClick={() => setViewDay(d)}
              className={[
                'flex-shrink-0 px-3 py-1.5 rounded-full text-xs transition-colors',
                viewDay === d
                  ? 'bg-sage-deep text-paper'
                  : 'bg-white/60 text-ink/60 hover:bg-white',
                today.status === 'during' && today.day === d && viewDay !== d
                  ? 'ring-1 ring-sage-deep/50'
                  : '',
              ].join(' ')}
            >
              第 {d} 天
              {today.status === 'during' && today.day === d && <span className="ml-1">●</span>}
            </button>
          ))}
        </div>
      </div>

      {/* 行程列 */}
      <div className="px-5 pb-6 space-y-2">
        {dayStops.length === 0 ? (
          <p className="text-center text-ink/40 text-sm py-8">這天沒有行程</p>
        ) : (
          dayStops.map((stop, idx) => (
            <div key={stop.id} className="relative">
              {idx === nextStopIndex && (
                <div className="absolute -left-2 top-0 bottom-0 w-1 rounded-full bg-sage-deep" />
              )}
              <StopCard
                stop={stop}
                place={places[stop.placeId]}
                onClick={() => setSelectedStop(stop)}
                showOrder={false}
              />
            </div>
          ))
        )}
      </div>

      <StopDetailSheet
        open={!!selectedStop}
        onClose={() => setSelectedStop(null)}
        stop={selectedStop}
        place={selectedStop ? places[selectedStop.placeId] : null}
        mutations={mutations}
      />
    </div>
  )
}

function dayDate(day) {
  const dates = ['09/25 週五', '09/26 週六', '09/27 週日', '09/28 週一', '09/29 週二', '09/30 週三']
  return dates[day - 1] ?? ''
}
