import { useState, useMemo, useEffect } from 'react'
import { useExpenses } from '../../hooks/useExpenses'
import { useExpenseMutations } from '../../hooks/useExpenseMutations'
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  ALL_CATEGORIES,
  getCategory,
  getPayment,
  getPayer,
  toTWD,
  getRate,
  setRate,
  REFUND_THRESHOLD,
} from '../../data/expenseCategories'
import { ExpenseEntrySheet } from '../ui/ExpenseEntrySheet'
import { BottomSheet } from '../ui/BottomSheet'

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

  const [entryOpen, setEntryOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [rateOpen, setRateOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const mutations = useExpenseMutations()

  const openNew = () => { setEditing(null); setEntryOpen(true) }
  const openEdit = (exp) => { setEditing(exp); setEntryOpen(true) }

  const handleSubmit = async (data) => {
    if (previewMode) { alert('Preview 模式無法儲存'); return }
    if (editing) await mutations.updateExpense(editing.id, data)
    else await mutations.addExpense(data)
    // 退稅門檻主動通知
    checkRefundThreshold([...expenses, data], data, setToast)
  }
  const handleDelete = async (exp) => {
    if (previewMode) return
    if (!confirm(`刪除「${exp.title}」?`)) return
    await mutations.removeExpense(exp.id)
  }

  return (
    <div className="min-h-full pb-24">
      <header className="px-5 pt-6 pb-3 bg-gradient-to-b from-accent-soft/60 to-transparent flex justify-between items-start">
        <div>
          <p className="text-xs text-ink-soft tracking-wider uppercase">🎃 Expenses</p>
          <h1 className="text-4xl font-hand font-bold text-primary mt-1">消費</h1>
        </div>
        <button
          onClick={() => setRateOpen(true)}
          className="text-xs px-3 py-1.5 rounded-full bg-white/70 border border-edge text-ink-soft hover:bg-white"
          title="設定匯率"
        >
          💱 1 TWD = {(1 / getRate()).toFixed(2)} JPY
        </button>
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

      <div className="px-5">
        {subTab === 'ledger'   && <LedgerView expenses={expenses} loading={loading} onNew={openNew} onEdit={openEdit} onDelete={handleDelete} />}
        {subTab === 'stats'    && <StatsView expenses={expenses} />}
        {subTab === 'refund'   && <RefundView expenses={expenses} />}
        {subTab === 'calc'     && <ComingSoon title="購物試算" icon="🧮" desc="日圓 ↔ 台幣即時換算,含消費稅、退稅預估" />}
        {subTab === 'wishlist' && <ComingSoon title="生火清單" icon="🔥" desc="想買的清單,加入下次購物試算" />}
      </div>

      {/* 新增按鈕(浮動) */}
      {subTab === 'ledger' && (
        <button
          onClick={openNew}
          className="fixed right-5 bottom-24 z-40 w-14 h-14 rounded-full bg-primary text-paper text-2xl shadow-lift hover:scale-110 active:scale-95 transition-transform"
          aria-label="新增記錄"
        >
          +
        </button>
      )}

      <ExpenseEntrySheet
        open={entryOpen}
        onClose={() => setEntryOpen(false)}
        onSubmit={handleSubmit}
        initial={editing}
      />

      <RateSheet open={rateOpen} onClose={() => setRateOpen(false)} />

      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </div>
  )
}

// 匯率設定面板
function RateSheet({ open, onClose }) {
  // 顯示成 1 TWD = X JPY(比較直覺)
  const [twdToJpy, setTwdToJpy] = useState(() => (1 / getRate()).toFixed(3))
  useEffect(() => {
    if (open) setTwdToJpy((1 / getRate()).toFixed(3))
  }, [open])
  const save = () => {
    const v = parseFloat(twdToJpy)
    if (!Number.isFinite(v) || v <= 0) { alert('請輸入有效數字'); return }
    setRate(1 / v) // JPY_to_TWD
    onClose()
    // 重新整理畫面
    window.location.reload()
  }
  return (
    <BottomSheet open={open} onClose={onClose} title="設定匯率(出國前設定一次)">
      <div className="px-5 py-4 space-y-4">
        <div className="bg-primary-soft/40 rounded-2xl p-4">
          <p className="text-xs text-ink-soft mb-2">1 台幣 = ? 日圓</p>
          <div className="flex items-center gap-2">
            <span className="text-xl font-mono">1 TWD =</span>
            <input
              type="number"
              step="0.01"
              value={twdToJpy}
              onChange={(e) => setTwdToJpy(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-edge bg-white text-2xl font-mono font-bold text-primary text-right"
            />
            <span className="text-xl font-mono">JPY</span>
          </div>
          <p className="text-[10px] text-ink-faint mt-2">
            例:2025 年常見 4.4 ~ 4.8 之間;去銀行/機場換匯拿到的匯率填在這裡
          </p>
        </div>
        <div className="text-xs text-ink-soft space-y-1">
          <p>💡 設定後,App 內所有 NT$ 換算都用這個匯率</p>
          <p>💡 中途改匯率不會影響已記錄的日圓金額,只影響顯示的台幣換算</p>
        </div>
        <button
          onClick={save}
          className="w-full py-3 rounded-2xl bg-primary text-paper font-semibold shadow-pumpkin"
        >
          儲存並套用
        </button>
      </div>
    </BottomSheet>
  )
}

// 頂部彈出通知
function Toast({ msg, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 6000)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div className="fixed top-4 inset-x-4 z-50 animate-[slideDown_.3s_ease-out]">
      <div className="bg-halloween-slime/95 text-white rounded-2xl px-4 py-3 shadow-lift flex items-start gap-3">
        <span className="text-2xl">💴</span>
        <div className="flex-1 text-sm">
          <p className="font-semibold">達到退稅門檻!</p>
          <p className="text-xs opacity-90 mt-0.5">{msg}</p>
        </div>
        <button onClick={onClose} className="text-white/80 hover:text-white">✕</button>
      </div>
      <style>{`@keyframes slideDown { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
    </div>
  )
}

// 檢查退稅門檻:新加的這筆若是可退稅分類,累加同店同日總額,達門檻通知
function checkRefundThreshold(allExpenses, newExp, setToast) {
  const cat = getCategory(newExp.category)
  if (!cat.refundable) return
  if (!newExp.storeName) return

  const dt = newExp.spentAt ?? new Date()
  const dayKey = dateKey(dt)
  const total = allExpenses
    .filter((e) => e.type === 'expense')
    .filter((e) => e.storeName === newExp.storeName)
    .filter((e) => dateKey(e.spentAt) === dayKey)
    .filter((e) => getCategory(e.category).refundable)
    .reduce((sum, e) => sum + (e.amount ?? 0), 0)

  if (total >= REFUND_THRESHOLD) {
    setToast(`${newExp.storeName}(${dayKey})同店同日累計 ¥${total.toLocaleString()},記得結帳前跟店員說「免稅」!`)
  }
}

// ============================================================
// 💴 退稅頁 — 找出所有「同店同日累積可退稅金額 ≥ 門檻」的組合
// ============================================================
function RefundView({ expenses }) {
  const groups = useMemo(() => refundGroups(expenses), [expenses])

  return (
    <div className="space-y-4 pb-6">
      {/* 說明卡 */}
      <section className="bg-halloween-slime/20 border border-halloween-slime/40 rounded-2xl p-4">
        <h3 className="text-sm font-bold text-halloween-slime mb-1">💴 退稅條件</h3>
        <ul className="text-xs text-ink space-y-0.5">
          <li>· 同店 · 同日累積 ≥ ¥{REFUND_THRESHOLD.toLocaleString()}</li>
          <li>· 分類為「購物」(一般品)或「伴手禮」(消耗品)</li>
          <li>· 結帳當下要出示護照 + 說要免稅</li>
          <li>· 消耗品要「打包封口」不能拆開,一般品可以現場用</li>
        </ul>
      </section>

      {/* 已達門檻的組合 */}
      <section>
        <h3 className="text-sm font-bold text-primary mb-2">✅ 已達門檻(現場結帳記得跟店員說免稅!)</h3>
        {groups.eligible.length === 0 ? (
          <p className="text-xs text-ink-faint text-center py-4">還沒有達到 ¥5,000 的組合</p>
        ) : (
          <ul className="space-y-2">
            {groups.eligible.map((g) => (
              <RefundCard key={g.key} g={g} eligible />
            ))}
          </ul>
        )}
      </section>

      {/* 差一點就到 */}
      <section>
        <h3 className="text-sm font-bold text-ink-soft mb-2">💭 快要到門檻(再加一點就能退稅)</h3>
        {groups.almost.length === 0 ? (
          <p className="text-xs text-ink-faint text-center py-4">目前沒有</p>
        ) : (
          <ul className="space-y-2">
            {groups.almost.map((g) => (
              <RefundCard key={g.key} g={g} />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function RefundCard({ g, eligible }) {
  const remain = REFUND_THRESHOLD - g.total
  return (
    <li className={`rounded-2xl p-3 border ${eligible ? 'bg-halloween-slime/10 border-halloween-slime/40' : 'bg-white/70 border-edge'}`}>
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-sm font-semibold text-ink">{g.storeName}</p>
          <p className="text-[10px] text-ink-faint">{g.dateLabel}</p>
        </div>
        <div className="text-right">
          <p className={`font-mono text-sm font-bold ${eligible ? 'text-halloween-slime' : 'text-ink-soft'}`}>
            ¥{g.total.toLocaleString()}
          </p>
          {!eligible && (
            <p className="text-[10px] text-primary-dark">差 ¥{remain.toLocaleString()}</p>
          )}
        </div>
      </div>
      <div className="text-[10px] text-ink-faint space-y-0.5 pt-2 border-t border-edge/50 mt-1">
        {g.items.map((it) => (
          <div key={it.id} className="flex justify-between">
            <span className="truncate">{getCategory(it.category).icon} {it.title}</span>
            <span className="font-mono ml-2">¥{it.amount.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </li>
  )
}

function refundGroups(expenses) {
  // 只看可退稅分類的支出
  const eligibleItems = expenses.filter((e) =>
    e.type === 'expense' && e.storeName && getCategory(e.category).refundable
  )
  // group by store + date
  const m = new Map()
  for (const e of eligibleItems) {
    const dk = dateKey(e.spentAt)
    const key = `${e.storeName}||${dk}`
    if (!m.has(key)) {
      m.set(key, { key, storeName: e.storeName, dateLabel: dk, items: [], total: 0 })
    }
    const g = m.get(key)
    g.items.push(e)
    g.total += e.amount
  }
  const all = Array.from(m.values()).sort((a, b) => b.total - a.total)
  return {
    eligible: all.filter((g) => g.total >= REFUND_THRESHOLD),
    almost: all.filter((g) => g.total < REFUND_THRESHOLD && g.total >= 2000),
  }
}

// ============================================================
// 📓 記帳頁(依日期分組)
// ============================================================
function LedgerView({ expenses, loading, onNew, onEdit, onDelete }) {
  const summary = useMemo(() => summarize(expenses), [expenses])
  const groups = useMemo(() => groupByDate(expenses), [expenses])

  return (
    <>
      {/* 頂部總覽:支出 / 收入 / 結餘 */}
      <section className="grid grid-cols-3 gap-2 mb-4">
        <SummaryCard label="總支出" amount={summary.expense} color="text-primary-dark" prefix="-¥" />
        <SummaryCard label="總收入" amount={summary.income}  color="text-halloween-slime" prefix="+¥" />
        <SummaryCard label="結餘"   amount={summary.income - summary.expense} color="text-accent" prefix="¥" signed />
      </section>

      {loading ? (
        <p className="text-center text-ink-faint text-sm py-8">讀取中…</p>
      ) : groups.length === 0 ? (
        <EmptyLedger onNew={onNew} />
      ) : (
        <div className="space-y-4">
          {groups.map((g) => (
            <section key={g.date}>
              <div className="flex items-center justify-between px-2 mb-1.5">
                <p className="text-xs text-ink-soft font-semibold">{g.dateLabel}</p>
                <p className={`text-xs font-mono ${g.dayNet >= 0 ? 'text-halloween-slime' : 'text-primary-dark'}`}>
                  {g.dayNet >= 0 ? '+' : '-'}¥{Math.abs(g.dayNet).toLocaleString()}
                </p>
              </div>
              <ul className="bg-white/70 rounded-2xl border border-edge shadow-soft overflow-hidden">
                {g.items.map((e, i) => (
                  <ExpenseRow
                    key={e.id}
                    e={e}
                    onEdit={() => onEdit(e)}
                    onDelete={() => onDelete(e)}
                    isLast={i === g.items.length - 1}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  )
}

function SummaryCard({ label, amount, color, prefix = '¥', signed }) {
  const val = Math.abs(amount)
  const sign = signed ? (amount >= 0 ? '+' : '-') : ''
  return (
    <div className="bg-white/70 rounded-2xl p-2.5 border border-edge shadow-soft text-center">
      <p className="text-[10px] text-ink-faint">{label}</p>
      <p className={`text-sm font-mono font-bold ${color} truncate`}>
        {signed ? sign : prefix.charAt(0)}¥{val.toLocaleString()}
      </p>
      <p className="text-[9px] text-ink-faint">
        NT${toTWD(val).toLocaleString()}
      </p>
    </div>
  )
}

function ExpenseRow({ e, onEdit, onDelete, isLast }) {
  const cat = getCategory(e.category)
  const pay = getPayment(e.paymentMethod)
  const payer = getPayer(e.payer)
  const isIncome = e.type === 'income'
  return (
    <li className={`flex items-center gap-3 p-3 ${!isLast ? 'border-b border-edge' : ''}`}>
      <button
        onClick={onEdit}
        className="flex-1 flex items-center gap-3 text-left min-w-0"
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
          style={{ background: cat.color + '30' }}
        >
          {cat.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-ink truncate">
            {e.title}
            {e.storeName && (
              <span className="text-ink-faint font-normal ml-1">· {e.storeName}</span>
            )}
          </p>
          <p className="text-[10px] text-ink-faint truncate">
            {cat.label}
            {e.type === 'expense' && ` · ${pay.icon}${e.cardName ? pay.label + '('+e.cardName+')' : pay.label} · ${payer.icon}${payer.label}`}
            {e.note && ` · 📝 ${e.note}`}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className={`text-sm font-mono font-semibold ${isIncome ? 'text-halloween-slime' : 'text-primary-dark'}`}>
            {isIncome ? '+' : '-'}¥{e.amount.toLocaleString()}
          </p>
          <p className="text-[9px] text-ink-faint">NT${toTWD(e.amount).toLocaleString()}</p>
        </div>
      </button>
      <button
        onClick={onDelete}
        className="flex-shrink-0 w-7 h-7 rounded-full text-ink-faint hover:bg-red-100 hover:text-red-700 transition-colors"
        aria-label="刪除"
      >
        ✕
      </button>
    </li>
  )
}

function EmptyLedger({ onNew }) {
  return (
    <div className="text-center py-12 text-ink-faint">
      <div className="text-5xl mb-3 animate-float">🎃</div>
      <p className="text-sm mb-1">還沒有記帳紀錄</p>
      <p className="text-xs mb-6">按下方 + 開始記</p>
      <button
        onClick={onNew}
        className="px-4 py-2 rounded-full bg-primary text-paper text-sm shadow-pumpkin"
      >
        + 新增第一筆
      </button>
    </div>
  )
}

// ============================================================
// 📊 消費統計
// ============================================================
function StatsView({ expenses }) {
  const [drilldown, setDrilldown] = useState(null) // 選中的 category id → 進到該分類的各店

  const onlyExpenses = expenses.filter((e) => e.type === 'expense')

  // Chart 1:分類佔比(若 drilldown → 顯示該分類各店)
  const chart1 = useMemo(() => {
    if (drilldown) {
      return storesInCategory(onlyExpenses, drilldown)
    }
    return categoryShare(onlyExpenses)
  }, [onlyExpenses, drilldown])

  // Chart 2:每天花費長條
  const chart2 = useMemo(() => dailyBar(onlyExpenses), [onlyExpenses])

  // Chart 3:各店消費占比(全部支出)
  const chart3 = useMemo(() => storeShare(onlyExpenses), [onlyExpenses])

  if (onlyExpenses.length === 0) {
    return (
      <div className="text-center py-12 text-ink-faint">
        <div className="text-5xl mb-3">📊</div>
        <p className="text-sm">還沒有資料可以統計</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Chart 1: 分類佔比 + drilldown */}
      <ChartCard
        title={drilldown ? `${getCategory(drilldown).icon} ${getCategory(drilldown).label} · 各店` : '分類佔比'}
        subtitle={drilldown ? '點下面 legend 回上一層' : '點分類 → 看該分類各店占比'}
      >
        <div className="flex items-center gap-4">
          <DonutChart segments={chart1.segments} total={chart1.total} centerIcon={drilldown ? getCategory(drilldown).icon : '🎃'} />
          <ul className="flex-1 space-y-1 min-w-0 max-h-40 overflow-y-auto">
            {drilldown && (
              <li>
                <button
                  onClick={() => setDrilldown(null)}
                  className="text-xs text-accent underline mb-1"
                >
                  ← 回分類
                </button>
              </li>
            )}
            {chart1.segments.map((s) => (
              <li key={s.id}>
                <button
                  disabled={!!drilldown}
                  onClick={() => !drilldown && setDrilldown(s.id)}
                  className={`w-full flex items-center gap-2 text-xs py-1 px-1 rounded ${!drilldown ? 'hover:bg-primary-soft/30 cursor-pointer' : 'cursor-default'}`}
                >
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                  <span className="text-ink-soft flex-1 truncate text-left">{s.icon ?? '🏷'} {s.label}</span>
                  <span className="font-mono text-ink">
                    ¥{s.amount.toLocaleString()}
                  </span>
                  <span className="text-ink-faint text-[10px] w-8 text-right">
                    {((s.amount / chart1.total) * 100).toFixed(0)}%
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </ChartCard>

      {/* Chart 2: 每天長條 */}
      <ChartCard title="每天花費" subtitle="長條越高當天花越多">
        <DailyBar data={chart2} />
      </ChartCard>

      {/* Chart 3: 各店占比 */}
      <ChartCard title="各店消費占比" subtitle="全部支出對各店的分配">
        <div className="flex items-center gap-4">
          <DonutChart segments={chart3.segments} total={chart3.total} centerIcon="🏪" />
          <ul className="flex-1 space-y-1 min-w-0 max-h-40 overflow-y-auto">
            {chart3.segments.map((s) => (
              <li key={s.label} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                <span className="text-ink-soft flex-1 truncate">{s.label}</span>
                <span className="font-mono text-ink">¥{s.amount.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      </ChartCard>
    </div>
  )
}

function ChartCard({ title, subtitle, children }) {
  return (
    <section className="bg-white/70 rounded-3xl p-4 border border-edge shadow-soft">
      <div className="mb-3">
        <h3 className="text-sm font-bold text-primary">{title}</h3>
        {subtitle && <p className="text-[10px] text-ink-faint">{subtitle}</p>}
      </div>
      {children}
    </section>
  )
}

// SVG donut(可換中心 icon)
function DonutChart({ segments, total, centerIcon }) {
  const size = 120
  const cx = size / 2
  const cy = size / 2
  const r = 52
  const inner = 28
  if (total === 0 || segments.length === 0) {
    return <div className="w-[120px] h-[120px] rounded-full bg-paper2 border-2 border-dashed border-primary/30" />
  }
  let cum = 0
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-[120px] h-[120px] flex-shrink-0 drop-shadow-md">
      {segments.map((s) => {
        const start = cum
        const value = s.amount / total
        cum += value
        return (
          <path
            key={s.id ?? s.label}
            d={arcPath(cx, cy, r, inner,
              start * Math.PI * 2 - Math.PI / 2,
              cum * Math.PI * 2 - Math.PI / 2)}
            fill={s.color}
            stroke="#FFF5E1"
            strokeWidth="1"
          />
        )
      })}
      <text x={cx} y={cy + 6} textAnchor="middle" fontSize="18">{centerIcon}</text>
    </svg>
  )
}

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

// 每天長條
function DailyBar({ data }) {
  if (data.length === 0) return null
  const max = Math.max(...data.map((d) => d.amount), 1)
  return (
    <div className="space-y-1.5">
      {data.map((d) => (
        <div key={d.date} className="flex items-center gap-2">
          <span className="text-[10px] text-ink-soft w-12 flex-shrink-0">{d.dateLabel}</span>
          <div className="flex-1 h-6 bg-paper2 rounded-full overflow-hidden relative">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary-light transition-all"
              style={{ width: `${(d.amount / max) * 100}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-ink w-16 text-right">
            ¥{d.amount.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  )
}

// ============================================================
// 聚合函式
// ============================================================
function summarize(expenses) {
  let expense = 0, income = 0
  for (const e of expenses) {
    if (e.type === 'income') income += e.amount
    else expense += e.amount
  }
  return { expense, income }
}

function groupByDate(expenses) {
  const map = new Map()
  for (const e of expenses) {
    const key = e.spentAtLabel ?? dateKey(e.spentAt)
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(e)
  }
  return Array.from(map.entries()).map(([dateLabel, items]) => {
    let dayNet = 0
    for (const it of items) {
      dayNet += it.type === 'income' ? it.amount : -it.amount
    }
    return { date: dateLabel, dateLabel, items, dayNet }
  })
}

function dateKey(spentAt) {
  const d = spentAt?.toDate?.() ?? spentAt ?? new Date()
  const dt = new Date(d)
  return `${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getDate()).padStart(2, '0')}`
}

function categoryShare(expenses) {
  const m = new Map()
  let total = 0
  for (const e of expenses) {
    total += e.amount
    m.set(e.category, (m.get(e.category) ?? 0) + e.amount)
  }
  const segments = EXPENSE_CATEGORIES
    .map((c) => ({ ...c, amount: m.get(c.id) ?? 0 }))
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount)
  return { segments, total }
}

function storesInCategory(expenses, categoryId) {
  const m = new Map()
  let total = 0
  for (const e of expenses) {
    if (e.category !== categoryId) continue
    total += e.amount
    const key = e.storeName ?? e.title
    m.set(key, (m.get(key) ?? 0) + e.amount)
  }
  const cat = getCategory(categoryId)
  const segments = Array.from(m.entries())
    .map(([label, amount], i) => ({
      id: label,
      label,
      amount,
      color: colorVariant(cat.color, i),
    }))
    .sort((a, b) => b.amount - a.amount)
  return { segments, total }
}

function storeShare(expenses) {
  const m = new Map()
  let total = 0
  for (const e of expenses) {
    total += e.amount
    const key = e.storeName ?? e.title
    m.set(key, (m.get(key) ?? 0) + e.amount)
  }
  const palette = ['#E76D3C','#6B4E96','#F4C066','#E85E9F','#7DB88A','#B84A20','#A89BC0','#4A90E2','#B884D9','#F09550']
  const segments = Array.from(m.entries())
    .map(([label, amount], i) => ({ label, amount, color: palette[i % palette.length] }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10)
  return { segments, total }
}

function dailyBar(expenses) {
  const m = new Map()
  for (const e of expenses) {
    const key = e.spentAtLabel ?? dateKey(e.spentAt)
    m.set(key, (m.get(key) ?? 0) + e.amount)
  }
  return Array.from(m.entries())
    .map(([dateLabel, amount]) => ({ date: dateLabel, dateLabel, amount }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

// 變化 hue,做同色系的變體
function colorVariant(base, i) {
  // 簡單:混白到不同程度
  const shades = [base, mix(base, '#FFFFFF', 0.15), mix(base, '#FFFFFF', 0.3), mix(base, '#FFFFFF', 0.45), mix(base, '#000000', 0.15), mix(base, '#000000', 0.3)]
  return shades[i % shades.length]
}
function mix(a, b, t) {
  const pa = hex(a), pb = hex(b)
  const r = Math.round(pa[0] * (1 - t) + pb[0] * t)
  const g = Math.round(pa[1] * (1 - t) + pb[1] * t)
  const bl = Math.round(pa[2] * (1 - t) + pb[2] * t)
  return `#${[r,g,bl].map((v) => v.toString(16).padStart(2, '0')).join('')}`
}
function hex(c) {
  const s = c.replace('#','')
  return [0,2,4].map((i) => parseInt(s.slice(i, i + 2), 16))
}

// ============================================================
function ComingSoon({ title, icon, desc }) {
  return (
    <div className="bg-white/70 rounded-3xl p-8 border border-edge shadow-soft text-center">
      <div className="text-5xl mb-3 animate-bob">{icon}</div>
      <h2 className="text-xl font-hand font-bold text-primary">{title}</h2>
      <p className="text-sm text-ink-soft mt-2 leading-relaxed">{desc}</p>
      <p className="text-xs text-ink-faint mt-4 italic">Round 3 開放</p>
    </div>
  )
}

// preview 用假資料
const DEMO = [
  { id: 'd1', type: 'expense', title: '味乃家綜合燒', storeName: '味乃家',        amount: 2280,  category: 'food',       spentAtLabel: '09/26', paymentMethod: 'card', cardName: '國泰', payer: 'doria' },
  { id: 'd2', type: 'expense', title: 'Metro 一日券', storeName: '大阪 Metro',    amount: 620,   category: 'transport',  spentAtLabel: '09/26', paymentMethod: 'ic',   payer: 'ray' },
  { id: 'd3', type: 'expense', title: '海遊館 × 2',   storeName: '海遊館',        amount: 5000,  category: 'attraction', spentAtLabel: '09/26', paymentMethod: 'card', cardName: '國泰', payer: 'both' },
  { id: 'd4', type: 'expense', title: '藥妝面膜組',   storeName: '心齋橋松本清',   amount: 3800,  category: 'souvenir',   spentAtLabel: '09/26', paymentMethod: 'cash', payer: 'doria' },
  { id: 'd4b',type: 'expense', title: '零食伴手禮',   storeName: '心齋橋松本清',   amount: 2200,  category: 'souvenir',   spentAtLabel: '09/26', paymentMethod: 'cash', payer: 'doria' },
  { id: 'd5', type: 'expense', title: '千層酥 × 2',   storeName: 'grenier',      amount: 2000,  category: 'food',       spentAtLabel: '09/27', paymentMethod: 'cash', payer: 'ray' },
  { id: 'd6', type: 'expense', title: 'USJ 門票 × 2', storeName: '環球影城',      amount: 22000, category: 'attraction', spentAtLabel: '09/29', paymentMethod: 'card', cardName: '國泰', payer: 'both' },
  { id: 'd7', type: 'income',  title: '藥妝退稅',     storeName: '心齋橋松本清',   amount: 480,   category: 'refund',     spentAtLabel: '09/26', payer: 'doria' },
]

function useExpensesSafe() {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useExpenses()
  } catch {
    return { expenses: [], loading: false }
  }
}
