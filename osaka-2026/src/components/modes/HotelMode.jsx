import { hotel } from '../../data/hotel'

export default function HotelMode() {
  return (
    <div className="min-h-full pb-6">
      {/* Hero */}
      <header className="px-5 pt-6 pb-5 bg-gradient-to-b from-washi-pink/40 to-transparent">
        <p className="text-xs text-ink-soft tracking-wider uppercase">六天大本營</p>
        <h1 className="text-3xl font-hand font-bold text-primary mt-1 leading-tight">{hotel.nameZh}</h1>
        <p className="text-xs text-ink-faint mt-2">{hotel.nameEn}</p>
        <p className="text-xs text-ink-faint">{hotel.brand}</p>
      </header>

      {/* Vibe */}
      <section className="px-5 mb-6">
        <div className="bg-white/60 rounded-2xl p-4 border border-ink/5">
          <p className="text-sm leading-relaxed text-ink/80 whitespace-pre-line">
            {hotel.vibe}
          </p>
        </div>
      </section>

      {/* Check-in / out */}
      <section className="px-5 mb-6 flex gap-3">
        <Metric label="Check-in" value={hotel.checkIn} />
        <Metric label="Check-out" value={hotel.checkOut} />
      </section>

      {/* 每日福利 */}
      <section className="px-5 mb-6">
        <h2 className="text-sm font-bold text-sage-deep mb-3">✨ 每日福利(全部免費)</h2>
        <div className="grid grid-cols-2 gap-3">
          {hotel.dailyPerks.map((p) => (
            <div key={p.title} className="bg-white/70 rounded-xl p-3 border border-ink/5">
              <div className="text-2xl mb-1">{p.icon}</div>
              <div className="text-sm font-semibold text-ink">{p.title}</div>
              <div className="text-[10px] text-sage-deep mt-0.5">{p.time}</div>
              <div className="text-xs text-ink/60 mt-1 leading-snug">{p.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 位置動線 */}
      <section className="px-5 mb-6">
        <h2 className="text-sm font-bold text-sage-deep mb-3">📍 位置與交通</h2>
        <div className="bg-white/70 rounded-xl p-4 border border-ink/5 space-y-2">
          <p className="text-xs"><span className="text-ink/50">區域:</span> {hotel.location.area}</p>
          <p className="text-xs"><span className="text-ink/50">最近站:</span> {hotel.location.nearestStation}</p>
          <p className="text-xs"><span className="text-ink/50">步行:</span> {hotel.location.walkFromStation}</p>
          <div className="border-t border-ink/10 pt-2 mt-2">
            <p className="text-xs text-ink/50 mb-1">動線提醒</p>
            <ul className="text-xs space-y-1">
              {hotel.location.accessNotes.map((n) => (
                <li key={n}>· {n}</li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-ink/60 pt-2 border-t border-ink/10 mt-2">
            🚶 {hotel.location.landmarks}
          </p>
        </div>
      </section>

      {/* 你會愛上的小事 */}
      <section className="px-5 mb-6">
        <h2 className="text-sm font-bold text-sage-deep mb-3">💛 你會愛上這裡的小事</h2>
        <ul className="space-y-2">
          {hotel.loveables.map((l, i) => (
            <li key={i} className="flex gap-2 text-sm text-ink/80">
              <span className="text-sage-deep">✦</span>
              <span>{l}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 誠實面 */}
      <section className="px-5 mb-6">
        <h2 className="text-sm font-bold text-ink/60 mb-3">⚠️ 誠實面(不美化)</h2>
        <ul className="space-y-2">
          {hotel.caveats.map((c, i) => (
            <li key={i} className="text-xs text-ink/60 italic">· {c}</li>
          ))}
        </ul>
      </section>

      {/* 訂房連結 */}
      <section className="px-5">
        <h2 className="text-sm font-bold text-sage-deep mb-3">🔗 訂房連結</h2>
        <div className="flex flex-col gap-2">
          {Object.entries(hotel.links).map(([platform, url]) => (
            <a
              key={platform}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-2 rounded-lg bg-white/70 border border-ink/10 text-ink/70 hover:bg-white hover:border-sage-deep/30"
            >
              {platformLabel(platform)} ↗
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}

function Metric({ label, value }) {
  return (
    <div className="flex-1 bg-white/70 rounded-xl p-3 text-center border border-ink/5">
      <p className="text-xs text-ink/50">{label}</p>
      <p className="text-xl font-mono font-bold text-sage-deep mt-1">{value}</p>
    </div>
  )
}

function platformLabel(p) {
  return { ctrip: '攜程 Ctrip', ezTravel: 'ezTravel 易遊網', trip: 'Trip.com' }[p] || p
}
