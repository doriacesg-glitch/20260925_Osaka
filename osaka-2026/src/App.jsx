// App shell — 只負責:
//   1. 匿名登入(auth gate) — 失敗會 fallback 到 preview 模式
//   2. 訂閱 trip + stops(preview 模式改用 defaultStops)
//   3. 底部 tab 切模式
//   4. lazy-load 每個 mode 的 UI

import { Suspense, lazy, useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useTrip } from './hooks/useTrip'
import { useToday } from './hooks/useToday'
import { MODES, DEFAULT_MODE } from './config/modes'
import { TRIP } from './config/trip'
import { defaultStops } from './data/itinerary'

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
  const [previewOptIn, setPreviewOptIn] = useState(false)

  // === Preview 模式(登入失敗時的降級)===
  // 使用者可以看 UI + 資料,但不能改也不能同步
  const previewMode = !!authError || (previewOptIn && authLoading)

  if (authError && !previewOptIn) {
    return (
      <Fullscreen>
        <p className="text-red-700 text-sm mb-3">
          Firebase 登入失敗
        </p>
        <p className="text-xs text-ink-soft mb-4 font-mono bg-red-50 p-2 rounded max-w-xs mx-auto text-left">
          {authError.message}
        </p>
        <p className="text-xs text-ink-soft mb-6">
          Firebase 還沒接好,不過你可以先預覽 UI。
          <br />
          預覽模式:能切頁、看行程與飯店資訊,<br />
          但改備註/移項目/同步都不會生效。
        </p>
        <button
          onClick={() => setPreviewOptIn(true)}
          className="px-5 py-2 rounded-full bg-primary text-paper text-sm shadow-soft hover:bg-primary-light"
        >
          進 Preview 模式 →
        </button>
      </Fullscreen>
    )
  }

  if (!previewMode && (authLoading || !user)) return <Splash message="登入中…" />
  if (!previewMode && tripLoading) return <Splash message="讀取行程中…" />

  // 決定用 Firestore 的 stops 還是 defaultStops
  const usingPreview = previewMode || previewOptIn
  const effectiveStops = usingPreview ? defaultStops : stops
  const effectiveUser = user ?? { uid: 'preview', isAnonymous: true }

  // 還沒 seed 過:提示灌入(僅正式模式)
  if (!usingPreview && effectiveStops.length === 0) {
    return (
      <Fullscreen>
        <p className="text-ink text-sm mb-3">Firestore 還沒有行程資料</p>
        <p className="text-xs text-ink-soft mb-4">
          在瀏覽器 console 執行:
          <br />
          <code className="mt-2 inline-block px-3 py-1 rounded bg-ink/10 font-mono text-primary">
            window.__seed()
          </code>
        </p>
      </Fullscreen>
    )
  }

  const Mode = MODE_COMPONENTS[modeId]
  const modeProps = {
    user: effectiveUser,
    trip,
    stops: effectiveStops,
    today,
    previewMode: usingPreview,
  }

  return (
    <div className="min-h-screen flex flex-col">
      {usingPreview && <PreviewBanner />}
      <main className="flex-1 pb-20">
        <Suspense fallback={<Splash message="載入中…" />}>
          <Mode {...modeProps} />
        </Suspense>
      </main>
      <BottomTabs current={modeId} onChange={setModeId} />
    </div>
  )
}

function PreviewBanner() {
  return (
    <div className="bg-yellow-100 border-b border-yellow-300 px-4 py-2 text-xs text-yellow-900 text-center">
      🔒 Preview 模式:改動不會儲存,兩人也不會同步
    </div>
  )
}

function Splash({ message }) {
  return (
    <Fullscreen>
      <div className="text-2xl">🐧 🐱</div>
      <p className="text-ink-soft mt-3">{message}</p>
    </Fullscreen>
  )
}

function Fullscreen({ children }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 text-center">
      <div>
        <h1 className="text-4xl font-hand font-bold text-primary mb-3">{TRIP.title}</h1>
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
