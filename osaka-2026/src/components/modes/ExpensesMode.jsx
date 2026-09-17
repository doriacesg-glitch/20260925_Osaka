import { useState } from 'react'
import { useExpenses } from '../../hooks/useExpenses'
import { EXPENSE_CATEGORIES, getCategory, CURRENCIES } from '../../data/expenseCategories'

const SUB_TABS = [
  { id: 'ledger',    label: '記帳',     icon: '📓' },
  { id: 'calc',      label: '購物試算', icon: '🧮' },
  { id: 'stats',     label: '消費統計', icon: '📊' },
  { id: 'refund',    label: '退稅',     icon: '💴' },
  { id: 'wishlist',  label: '生火清單', icon: '🔥' },
]

export default function ExpensesMode({ previewMode }) {
  const [subTab, setSubTab] = useState('ledger')
  const live = useExpensesSafe()
  const expenses = previewMode ? DEMO : live.expenses
  const loading = previewMode ? false : live.loading

  return (
    <div className="min-h-full pb-6">
      <header className="px-5 pt-6 pb-3 bg-gradient-to-b from-accent-soft/60 to-transparent">
        <p className="text-xs text-ink-soft tracking-wider uppercase">🎃 Expenses</p>
        <h1 className="text-4xl font-hand font-bold text-primary mt-1">消費</h1>
      </header>

      {/* 子分頁 pills */}
      <nav className="px-5 mb-4 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {SUB_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id)}
              className={[
                'flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer',
                subTab === t.id
                  ? 'bg-primary text-paper shadow-pumpkin scale-105'
                  : 'bg-white/70 text-ink-soft hover:bg-white',
              ].join(' ')}
            >
              <span className="mr-1">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {/* 內容 */}
      <div className="px-5">
        {subTab === 'ledger'   && <LedgerView expenses={expenses} loading={loading} />}
        {subTab === 'calc'     && <ComingSoon title="購物試算" icon="🧮" desc="日圓 ↔ 台幣即時換算,含服務費、優惠、退稅預估" />}
        {subTab === 'stats'    && <ComingSoon title="消費統計" icon="📊" desc="依日期/類別/景點的花費趨勢圖" />}
        {subTab === 'refund'   && <ComingSoon title="退稅" icon="💴" desc="追蹤有退稅資格的消費,產出到機場退稅單" />}
        {subTab === 'wishlist' && <ComingSoon title="生火清單" icon="🔥" desc="想買的清單,點下加入下次購物試算" />}
      </div>
    </div>
  )
}

// 主頁:圓餅 + 記帳列表
function LedgerView({ expenses, loading }) {
  const totals = summarize(expenses)
  return (
    <>
      {/* 圓餅圖 dashboard */}
      <section className="bg-white/70 rounded-3xl p-4 shadow-soft border border-edge mb-4">
        <div className="flex items-center gap-4">
          <PieChart totals={totals} />
          <div className="flex-1">
            <p className="text-xs text-ink-soft">目前總花費</p>
            <p className="text-3xl font-hand font-bold text-primary leading-tight">
              ¥{totals.grand.toLocaleString()}
            </p>
            <p className="text-[10px] text-ink-faint mt-1">
              約 NT${Math.round(totals.grand / 4.6).toLocaleString()}
            </p>
          </div>
        </div>
        {/* 分類 legend */}
        <div className="mt-3 pt-3 border-t border-edge grid grid-cols-2 gap-2">
          {totals.byCategory.slice(0, 6).map((c) => (
            <div key={c.id} className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
              <span className="text-ink-soft flex-1 truncate">{c.icon} {c.label}</span>
              <span className="font-mono text-ink">¥{c.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 新增按鈕 */}
      <button
        disabled
        className="w-full mb-4 py-3 rounded-2xl border-2 border-dashed border-primary/30 text-primary/60 text-sm cursor-not-allowed"
      >
        + 新增消費(Round 2 開放)
      </button>

      {/* 消費列表 */}
      <section>
        <h2 className="text-xs text-ink-soft mb-2 tracking-wider">最近的花費</h2>
        {loading ? (
          <p className="text-center text-ink-faint text-sm py-8">讀取中…</p>
        ) : expenses.length === 0 ? (
          <div className="text-center py-10 text-ink-faint">
            <div className="text-4xl mb-2">🎃</div>
            <p className="text-sm">還沒有記帳紀錄</p>
            <p className="text-xs mt-1">旅程開始就會慢慢長出來</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {expenses.map((e) => {
              const cat = getCategory(e.category)
              return (
                <li
                  key={e.id}
                  className="bg-white/70 rounded-2xl p-3 border border-edge shadow-soft flex items-center gap-3"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                    style={{ background: cat.color + '30' }}
                  >
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">{e.title}</p>
                    <p className="text-xs text-ink-faint">
                      {cat.label} · {e.spentAtLabel}
                      {e.payer && ` · ${e.payer} 付`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-semibold text-ink">
                      ¥{e.amount.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-ink-faint">
                      NT${Math.round(e.amount / 4.6).toLocaleString()}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </>
  )
}

// 圓餅圖 — SVG 手繪(避開 chart lib bundle)
function PieChart({ totals }) {
  const size = 100
  const cx = size / 2
  const cy = size / 2
  const r = 42
  const inner = 22 // donut hole

  if (totals.grand === 0) {
    return (
      <div className="w-[100px] h-[100px] rounded-full bg-paper2 border-2 border-dashed border-primary/30 flex items-center justify-center animate-float">
        <span className="text-2xl">🎃</span>
      </div>
    )
  }

  let cumulative = 0
  const segs = totals.byCategory
    .filter((c) => c.amount > 0)
    .map((c) => {
      const start = cumulative
      const value = c.amount / totals.grand
      cumulative += value
      return { ...c, start, end: cumulative }
    })

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-[100px] h-[100px] drop-shadow-md">
      {segs.map((s) => (
        <path
          key={s.id}
          d={arcPath(cx, cy, r, inner, s.start * Math.PI * 2 - Math.PI / 2, s.end * Math.PI * 2 - Math.PI / 2)}
          fill={s.color}
          stroke="#FFF5E1"
          strokeWidth="1"
        />
      ))}
      {/* 中心南瓜 */}
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize="16">🎃</text>
    </svg>
  )
}

// SVG donut arc path
function arcPath(cx, cy, r, ir, startRad, endRad) {
  const largeArc = endRad - startRad > Math.PI ? 1 : 0
  const x1 = cx + r * Math.cos(startRad)
  const y1 = cy + r * Math.sin(startRad)
  const x2 = cx + r * Math.cos(endRad)
  const y2 = cy + r * Math.sin(endRad)
  const x3 = cx + ir * Math.cos(endRad)
  const y3 = cy + ir * Math.sin(endRad)
  const x4 = cx + ir * Math.cos(startRad)
  const y4 = cy + ir * Math.sin(startRad)
  return [
    `M ${x1} ${y1}`,
    `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${ir} ${ir} 0 ${largeArc} 0 ${x4} ${y4}`,
    'Z',
  ].join(' ')
}

// 資料聚合
function summarize(expenses) {
  const byCategoryMap = new Map()
  let grand = 0
  for (const e of expenses) {
    grand += e.amount
    const cur = byCategoryMap.get(e.category) ?? 0
    byCategoryMap.set(e.category, cur + e.amount)
  }
  const byCategory = EXPENSE_CATEGORIES.map((c) => ({
    ...c,
    amount: byCategoryMap.get(c.id) ?? 0,
  })).sort((a, b) => b.amount - a.amount)
  return { grand, byCategory }
}

// 4 個尚未實作的子分頁
function ComingSoon({ title, icon, desc }) {
  return (
    <div className="bg-white/70 rounded-3xl p-8 border border-edge shadow-soft text-center">
      <div className="text-5xl mb-3 animate-bob">{icon}</div>
      <h2 className="text-xl font-hand font-bold text-primary">{title}</h2>
      <p className="text-sm text-ink-soft mt-2 leading-relaxed">{desc}</p>
      <p className="text-xs text-ink-faint mt-4 italic">Round 2 / 3 開放</p>
    </div>
  )
}

// preview 用的假資料
const DEMO = [
  { id: 'd1', title: '味乃家御好燒 綜合燒', amount: 2280, category: 'food',      spentAtLabel: '09/26 週六', payer: 'Doria' },
  { id: 'd2', title: '大阪 Metro 一日券',    amount: 620,  category: 'transport', spentAtLabel: '09/26 週六', payer: 'Ray' },
  { id: 'd3', title: '海遊館門票 × 2',        amount: 5000, category: 'attraction',spentAtLabel: '09/26 週六', payer: 'Doria' },
  { id: 'd4', title: '心齋橋藥妝(面膜)',    amount: 1580, category: 'shopping',  spentAtLabel: '09/26 週六', payer: 'Doria' },
  { id: 'd5', title: 'grenier 千層酥 × 2',   amount: 2000, category: 'food',      spentAtLabel: '09/27 週日', payer: 'Ray' },
]

// preview 保守 fallback:hook 呼叫失敗時給空
function useExpensesSafe() {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useExpenses()
  } catch {
    return { expenses: [], loading: false }
  }
}
