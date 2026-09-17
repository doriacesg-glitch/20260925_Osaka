import { hotel } from '../../data/hotel'

export default function HotelMode() {
  return (
    <div className="min-h-full pb-6">
      {/* Hero */}
      <header className="px-5 pt-6 pb-5 bg-gradient-to-b from-accent-soft/60 via-primary-soft/30 to-transparent">
        <p className="text-xs text-ink-soft tracking-wider uppercase">🏠 六天大本營</p>
        <h1 className="text-3xl font-hand font-bold text-primary mt-1 leading-tight">{hotel.nameZh}</h1>
        <p className="text-xs text-ink-faint mt-2">{hotel.nameEn}</p>
      </header>

      {/* 照片 grid — 佔位圖(Round 3 放實際照片) */}
      <section className="px-5 mb-6">
        <div className="grid grid-cols-2 gap-2">
          {hotel.photos.map((p, i) => (
            <div
              key={p.src}
              className="aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-primary-soft to-accent-soft border border-edge shadow-soft relative group"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* 佔位圖 — 若之後放實際照片,把這段換成 <img src={p.src} /> */}
              <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-40">
                {['🏠', '🥤', '♨️', '🛏'][i] ?? '📷'}
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent p-2">
                <p className="text-[10px] text-white leading-tight">{p.caption}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-ink-faint text-center mt-2 italic">
          照片:Round 3 貼上真實圖片
        </p>
      </section>

      {/* Vibe */}
      <section className="px-5 mb-6">
        <div className="bg-white/60 rounded-2xl p-4 border border-edge shadow-soft">
          <p className="text-sm leading-relaxed text-ink whitespace-pre-line">
            {hotel.vibe}
          </p>
        </div>
      </section>

      {/* Check-in / out */}
      <section className="px-5 mb-6 flex gap-3">
        <Metric label="Check-in" value={hotel.checkIn} />
        <Metric label="Check-out" value={hotel.checkOut} />
      </section>

      {/* 地址 & 電話 */}
      <section className="px-5 mb-6">
        <h2 className="text-sm font-bold text-primary mb-3">📮 聯絡資訊</h2>
        <div className="bg-white/70 rounded-2xl p-4 border border-edge shadow-soft space-y-3">
          <ContactRow label="地址" icon="📍">
            <p className="text-sm text-ink">{hotel.address}</p>
            <p className="text-[10px] text-ink-faint mt-0.5">{hotel.addressEn}</p>
            <a
              href={hotel.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-xs px-3 py-1 rounded-full bg-primary text-paper shadow-pumpkin hover:bg-primary-light"
            >
              🗺 在 Google Maps 開啟
            </a>
          </ContactRow>

          <ContactRow label="電話" icon="📞">
            <a href={`tel:${hotel.phone}`} className="text-sm text-primary font-mono">
              {hotel.phoneDisplay}
            </a>
            <p className="text-[10px] text-ink-faint mt-0.5">
              國際:{hotel.phone}
            </p>
          </ContactRow>

          <ContactRow label="信箱" icon="✉️">
            <a href={`mailto:${hotel.email}`} className="text-sm text-primary break-all">
              {hotel.email}
            </a>
          </ContactRow>
        </div>
      </section>

      {/* 每日福利 */}
      <section className="px-5 mb-6">
        <h2 className="text-sm font-bold text-primary mb-3">✨ 每日福利(全部免費)</h2>
        <div className="grid grid-cols-2 gap-3">
          {hotel.dailyPerks.map((p, i) => (
            <div
              key={p.title}
              className="bg-white/70 rounded-2xl p-3 border border-edge shadow-soft hover:shadow-lift transition-shadow"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="text-2xl mb-1 animate-float" style={{ animationDelay: `${i * 200}ms` }}>{p.icon}</div>
              <div className="text-sm font-semibold text-ink">{p.title}</div>
              <div className="text-[10px] text-primary mt-0.5">{p.time}</div>
              <div className="text-xs text-ink-soft mt-1 leading-snug">{p.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 位置動線 */}
      <section className="px-5 mb-6">
        <h2 className="text-sm font-bold text-primary mb-3">🚊 交通動線</h2>
        <div className="bg-white/70 rounded-2xl p-4 border border-edge shadow-soft space-y-2">
          <p className="text-xs"><span className="text-ink-faint">區域:</span> {hotel.location.area}</p>
          <p className="text-xs"><span className="text-ink-faint">最近站:</span> {hotel.location.nearestStation}</p>
          <p className="text-xs"><span className="text-ink-faint">步行:</span> {hotel.location.walkFromStation}</p>
          <div className="border-t border-edge pt-2 mt-2">
            <p className="text-xs text-ink-faint mb-1">動線提醒</p>
            <ul className="text-xs space-y-1">
              {hotel.location.accessNotes.map((n) => (
                <li key={n}>· {n}</li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-ink-soft pt-2 border-t border-edge mt-2">
            🚶 {hotel.location.landmarks}
          </p>
        </div>
      </section>

      {/* 你會愛上的小事 */}
      <section className="px-5 mb-6">
        <h2 className="text-sm font-bold text-primary mb-3">💛 你會愛上這裡的小事</h2>
        <ul className="space-y-2">
          {hotel.loveables.map((l, i) => (
            <li key={i} className="flex gap-2 text-sm text-ink">
              <span className="text-primary">✦</span>
              <span>{l}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 誠實面 */}
      <section className="px-5">
        <h2 className="text-sm font-bold text-ink-soft mb-3">⚠️ 誠實面</h2>
        <ul className="space-y-2">
          {hotel.caveats.map((c, i) => (
            <li key={i} className="text-xs text-ink-soft italic">· {c}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function Metric({ label, value }) {
  return (
    <div className="flex-1 bg-white/70 rounded-2xl p-3 text-center border border-edge shadow-soft">
      <p className="text-xs text-ink-faint">{label}</p>
      <p className="text-2xl font-mono font-bold text-primary mt-1">{value}</p>
    </div>
  )
}

function ContactRow({ label, icon, children }) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-soft/50 flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-ink-faint mb-0.5">{label}</p>
        {children}
      </div>
    </div>
  )
}
