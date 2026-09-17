import { useState } from 'react'
import { BottomSheet } from './BottomSheet'
import { KindBadge } from './KindBadge'

// 點某格 stop 之後彈出:顯示地點詳情 + 行程動作
// 需要 mutations 才能執行「移到備選/刪除/改備註/改時間」等
export function StopDetailSheet({ open, onClose, stop, place, mutations }) {
  const [editingNote, setEditingNote] = useState(false)
  const [noteDraft, setNoteDraft] = useState(stop?.note ?? '')
  const [editingTime, setEditingTime] = useState(false)
  const [timeDraft, setTimeDraft] = useState(stop?.arriveAt ?? '')

  if (!stop || !place) return null

  const closeAndReset = () => {
    setEditingNote(false)
    setEditingTime(false)
    onClose()
  }

  const saveNote = async () => {
    await mutations.updateStop(stop.id, { note: noteDraft })
    setEditingNote(false)
  }

  const saveTime = async () => {
    await mutations.updateStop(stop.id, { arriveAt: timeDraft || null })
    setEditingTime(false)
  }

  const moveToBackup = async () => {
    if (!confirm(`把「${place.name}」移到備選區?`)) return
    await mutations.moveToBackup(stop.id)
    closeAndReset()
  }

  const removeStop = async () => {
    if (!confirm(`從行程刪除「${place.name}」?(這只會刪掉這一格,備選區的同名地點不受影響)`)) return
    await mutations.removeStop(stop.id)
    closeAndReset()
  }

  return (
    <BottomSheet open={open} onClose={closeAndReset} title={place.name}>
      <div className="px-5 py-4 space-y-4">
        {/* Kind badge + Google Maps 開啟 */}
        <div className="flex items-center justify-between">
          <KindBadge kind={place.kind} size="md" />
          {place.googleMapsUrl && (
            <a
              href={place.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded-full bg-primary text-paper shadow-pumpkin hover:bg-primary-light"
            >
              🗺 開 Google Maps
            </a>
          )}
        </div>

        {/* 時間 */}
        <Row label="抵達時間">
          {editingTime && mutations ? (
            <div className="flex gap-2">
              <input
                type="time"
                value={timeDraft}
                onChange={(e) => setTimeDraft(e.target.value)}
                className="flex-1 px-2 py-1 rounded border border-ink/20 bg-white"
              />
              <button onClick={saveTime} className="px-3 py-1 rounded bg-primary text-paper text-xs">存</button>
              <button onClick={() => setEditingTime(false)} className="px-3 py-1 rounded bg-ink/10 text-xs">取消</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-mono">{stop.arriveAt ?? '—'}</span>
              {mutations && (
                <button onClick={() => setEditingTime(true)} className="text-xs text-primary underline">改</button>
              )}
            </div>
          )}
        </Row>

        {/* 停留 */}
        {stop.duration != null && (
          <Row label="預計停留">{stop.duration} 分鐘</Row>
        )}

        {/* 備註 */}
        <Row label="備註">
          {editingNote && mutations ? (
            <div className="space-y-2">
              <textarea
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                rows={3}
                className="w-full px-2 py-1 rounded border border-ink/20 bg-white text-sm"
                placeholder="記得訂位、忌口、集合點..."
              />
              <div className="flex gap-2">
                <button onClick={saveNote} className="px-3 py-1 rounded bg-primary text-paper text-xs">存</button>
                <button onClick={() => { setEditingNote(false); setNoteDraft(stop.note ?? '') }} className="px-3 py-1 rounded bg-ink/10 text-xs">取消</button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="italic text-ink-soft">{stop.note || '(尚無)'}</span>
              {mutations && (
                <button onClick={() => setEditingNote(true)} className="text-xs text-primary underline">改</button>
              )}
            </div>
          )}
        </Row>

        {/* 官方短介紹 */}
        {place.description && (
          <Row label="簡介">{place.description}</Row>
        )}

        {/* 詳細介紹 */}
        {place.richDescription && (
          <details className="border-t border-ink/10 pt-3">
            <summary className="text-xs text-sage-deep cursor-pointer">📖 展開詳細介紹</summary>
            <p className="text-sm text-ink/80 mt-2 whitespace-pre-line leading-relaxed">
              {place.richDescription}
            </p>
          </details>
        )}

        {/* 亮點 */}
        {place.highlights?.length > 0 && (
          <div>
            <p className="text-xs text-ink/50 mb-1">✨ 亮點</p>
            <ul className="text-sm text-ink/80 space-y-0.5">
              {place.highlights.map((h) => (
                <li key={h}>· {h}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 注意 */}
        {place.caveats?.length > 0 && (
          <div>
            <p className="text-xs text-ink/50 mb-1">⚠️ 注意</p>
            <ul className="text-sm text-ink/80 space-y-0.5">
              {place.caveats.map((c) => (
                <li key={c}>· {c}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 未確認 */}
        {place.unverified && (
          <div className="text-xs bg-yellow-100 text-yellow-800 rounded-lg p-3">
            ⚠️ 資料未經完全確認:{place.unverifiedNote}
          </div>
        )}

        {/* 營業時間 */}
        {place.hoursNote && (
          <Row label="營業時間">{place.hoursNote}</Row>
        )}

        {/* 資料來源 */}
        {place.source && (
          <p className="text-[10px] text-ink/40">
            資料來源:<a href={place.source} target="_blank" rel="noopener noreferrer" className="underline">{place.source}</a>
          </p>
        )}

        {/* 動作區 */}
        {mutations && (
          <div className="pt-4 border-t border-ink/10 flex gap-2 flex-wrap">
            {stop.day !== 'backup' && (
              <button
                onClick={moveToBackup}
                className="text-xs px-3 py-2 rounded-full bg-washi-blue/40 text-ink hover:bg-washi-blue/60"
              >
                📦 移到備選
              </button>
            )}
            <button
              onClick={removeStop}
              className="text-xs px-3 py-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200"
            >
              🗑 刪除這格
            </button>
          </div>
        )}
      </div>
    </BottomSheet>
  )
}

function Row({ label, children }) {
  return (
    <div>
      <p className="text-xs text-ink/50 mb-1">{label}</p>
      <div className="text-sm text-ink/80">{children}</div>
    </div>
  )
}
