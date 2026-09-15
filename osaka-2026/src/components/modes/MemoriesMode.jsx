// 回憶頁 — 第一版:本機照片預覽 grid
// 之後可以擴充:OCR 票根、手寫筆記、日誌等

import { useState, useEffect } from 'react'
import { get, set } from 'idb-keyval'

const STORE_KEY = 'osaka-2026:memories'

export default function MemoriesMode() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    get(STORE_KEY).then((v) => {
      setItems(v ?? [])
      setLoading(false)
    })
  }, [])

  async function onPick(e) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    const newItems = await Promise.all(
      files.map((f) => new Promise((resolve) => {
        const r = new FileReader()
        r.onload = () => resolve({
          id: crypto.randomUUID(),
          dataUrl: r.result,
          name: f.name,
          addedAt: Date.now(),
        })
        r.readAsDataURL(f)
      })),
    )
    const next = [...items, ...newItems]
    setItems(next)
    await set(STORE_KEY, next)
    e.target.value = '' // 清空 input,同名檔可以再選
  }

  async function remove(id) {
    if (!confirm('刪除這張照片?')) return
    const next = items.filter((i) => i.id !== id)
    setItems(next)
    await set(STORE_KEY, next)
  }

  return (
    <div className="min-h-full pb-6">
      <header className="px-5 pt-6 pb-4 bg-gradient-to-b from-washi-yellow/50 to-transparent">
        <p className="text-xs text-ink-soft tracking-wider uppercase">Memories</p>
        <h1 className="text-4xl font-hand font-bold text-primary mt-1">回憶</h1>
        <p className="text-xs text-ink-soft mt-1">
          照片只存在你的手機,不同步、不上傳
        </p>
      </header>

      {/* 加圖按鈕 */}
      <div className="px-5 mb-4">
        <label className="block w-full text-center py-3 rounded-xl border-2 border-dashed border-sage-deep/40 bg-white/50 text-sage-deep text-sm cursor-pointer hover:bg-white/80">
          + 加照片(可多選)
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={onPick}
          />
        </label>
      </div>

      {/* 內容 */}
      {loading ? (
        <p className="text-center text-ink/40 text-sm py-8">讀取中…</p>
      ) : items.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <p className="text-4xl mb-3">🐧 🐱</p>
          <p className="text-sm text-ink/60">還沒有回憶</p>
          <p className="text-xs text-ink/40 mt-1">旅程中拍的照片、票根、手寫紙條都可以丟進來</p>
        </div>
      ) : (
        <div className="px-5">
          <div className="grid grid-cols-3 gap-2">
            {items.map((it) => (
              <div key={it.id} className="relative group aspect-square bg-white/70 rounded-lg overflow-hidden border border-ink/10">
                <img src={it.dataUrl} alt={it.name} className="w-full h-full object-cover" />
                <button
                  onClick={() => remove(it.id)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="刪除"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-ink/40 text-center mt-4">
            共 {items.length} 張 · 存在本機 IndexedDB
          </p>
        </div>
      )}
    </div>
  )
}
