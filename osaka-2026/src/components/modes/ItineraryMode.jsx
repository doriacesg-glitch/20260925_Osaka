import { useState } from 'react'
import { places, stopsByDay } from '../../data/itinerary'
import { useItineraryMutations } from '../../hooks/useItineraryMutations'
import { StopCard } from '../ui/StopCard'
import { StopDetailSheet } from '../ui/StopDetailSheet'

const DAY_LABELS = {
  1: { label: '第 1 天', date: '09/25 週五', accent: 'bg-red-100' },
  2: { label: '第 2 天', date: '09/26 週六', accent: 'bg-orange-100' },
  3: { label: '第 3 天', date: '09/27 週日', accent: 'bg-yellow-100' },
  4: { label: '第 4 天', date: '09/28 週一', accent: 'bg-green-100' },
  5: { label: '第 5 天', date: '09/29 週二', accent: 'bg-blue-100' },
  6: { label: '第 6 天', date: '09/30 週三', accent: 'bg-indigo-100' },
  backup: { label: '備選區', date: '想去就加進去', accent: 'bg-purple-100' },
}

export default function ItineraryMode({ stops }) {
  const mutations = useItineraryMutations(stops)
  const [selectedStop, setSelectedStop] = useState(null)
  const [collapsed, setCollapsed] = useState({}) // { day: true } 表示摺疊

  const toggle = (d) => setCollapsed((c) => ({ ...c, [d]: !c[d] }))

  return (
    <div className="min-h-full">
      <header className="px-5 pt-6 pb-3">
        <h1 className="text-2xl font-bold text-sage-deep">📖 全部行程</h1>
        <p className="text-xs text-ink/60 mt-1">
          點任一格看詳情或編輯 · 目前不支援拖曳(下次更新)
        </p>
      </header>

      <div className="pb-6 space-y-3">
        {[1, 2, 3, 4, 5, 6, 'backup'].map((day) => {
          const dayStops = stopsByDay(stops, day)
          const meta = DAY_LABELS[day]
          const isCollapsed = collapsed[day] ?? false

          return (
            <section key={day} className="px-5">
              <button
                onClick={() => toggle(day)}
                className={`w-full flex items-center justify-between rounded-xl px-4 py-2 ${meta.accent}/50`}
              >
                <div className="flex items-baseline gap-2">
                  <h2 className="text-sm font-bold text-ink">{meta.label}</h2>
                  <span className="text-xs text-ink/50">{meta.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ink/60">{dayStops.length} 項</span>
                  <span className="text-ink/40">{isCollapsed ? '▸' : '▾'}</span>
                </div>
              </button>

              {!isCollapsed && (
                <div className="mt-2 space-y-2">
                  {dayStops.length === 0 ? (
                    <p className="text-center text-ink/30 text-xs py-4">(空)</p>
                  ) : (
                    dayStops.map((stop) => (
                      <StopCard
                        key={stop.id}
                        stop={stop}
                        place={places[stop.placeId]}
                        onClick={() => setSelectedStop(stop)}
                        showOrder={day === 'backup'}
                      />
                    ))
                  )}
                </div>
              )}
            </section>
          )
        })}
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
