// App shell — 只負責:
//   1. 匿名登入(auth gate)
//   2. 訂閱 trip + stops
//   3. 底部 tab 切模式
//   4. lazy-load 每個 mode 的 UI(Gemini 在 components/modes/ 實作)
//
// 這個檔案不做視覺設計 — 樣式最小。Gemini 的地盤在 components/modes/ 與 components/ui/。

import { Suspense, lazy, useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useTrip } from './hooks/useTrip'
import { useToday } from './hooks/useToday'
import { MODES, DEFAULT_MODE } from './config/modes'
import { TRIP } from './config/trip'

const MODE_COMPONENTS = Object.fromEntries(
  MODES.map((m) => [
    m.id,
    lazy(() => import(`./components/modes/${m.componentPath}.jsx`)),
  ]),
)

export default function App() {
  const { user, loading: authLoading, error: authError } = useAuth()
  const { trip, stops, loading: tripLoading } = useTrip()
  const today = useToday()
  const [modeId, setModeId] = useState(DEFAULT_MODE)

  if (authError) {
    return (
      <Fullscreen>
        <p className="text-red-600">登入失敗:{authError.message}</p>
        <p className="text-sm text-ink/60 mt-2">
          可能是 Firebase Auth 匿名登入沒開,回 Console 檢查。
        </p>
      </Fullscreen>
    )
  }

  if (authLoading || !user) return <Splash message="登入中…" />
  if (tripLoading) return <Splash message="讀取行程中…" />

  // 還沒 seed 過:提示灌入
  if (stops.length === 0) {
    return (
      <Fullscreen>
        <p className="text-ink/70">Firestore 還沒有行程資料。</p>
        <p className="text-sm text-ink/60 mt-2">
          在瀏覽器 console 執行:
          <code className="ml-1 px-1 rounded bg-ink/10">window.__seed()</code>
        </p>
      </Fullscreen>
    )
  }

  const Mode = MODE_COMPONENTS[modeId]
  const modeProps = { user, trip, stops, today }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 pb-20">
        <Suspense fallback={<Splash message="載入中…" />}>
          <Mode {...modeProps} />
        </Suspense>
      </main>
      <BottomTabs current={modeId} onChange={setModeId} />
    </div>
  )
}

function Splash({ message }) {
  return (
    <Fullscreen>
      <div className="text-2xl">🐧 🐱</div>
      <p className="text-ink/60 mt-3">{message}</p>
    </Fullscreen>
  )
}

function Fullscreen({ children }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 text-center">
      <div>
        <h1 className="text-3xl font-hand font-bold text-primary mb-2">{TRIP.title}</h1>
        {children}
      </div>
    </div>
  )
}

// 底部 tab bar
function BottomTabs({ current, onChange }) {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 border-t border-edge bg-paper/95 backdrop-blur-md shadow-lift"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            className={[
              'flex-1 py-2.5 flex flex-col items-center gap-0.5 transition-all cursor-pointer',
              current === m.id
                ? 'text-primary scale-105'
                : 'text-ink-faint hover:text-ink-soft',
            ].join(' ')}
          >
            <span className="text-lg" aria-hidden>{m.icon}</span>
            <span className={`text-[10px] ${current === m.id ? 'font-semibold' : ''}`}>{m.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
