import { useState, useEffect, useMemo } from 'react'
import { BottomSheet } from './BottomSheet'
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  PAYMENT_METHODS,
  PAYERS,
  toTWD,
} from '../../data/expenseCategories'
import { places } from '../../data/itinerary'

// 計算機式記帳輸入面板
// props:
//   open, onClose,
//   onSubmit(data) — 存檔時呼叫
//   initial — 編輯模式時的既有資料
export function ExpenseEntrySheet({ open, onClose, onSubmit, initial }) {
  const isEdit = !!initial
  const [type, setType] = useState('expense')
  const [display, setDisplay] = useState('0') // 計算機顯示字串
  const [category, setCategory] = useState('food')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [cardName, setCardName] = useState('')
  const [title, setTitle] = useState('')
  const [storeName, setStoreName] = useState('')
  const [spentAt, setSpentAt] = useState(() => new Date().toISOString().slice(0, 16))
  const [note, setNote] = useState('')
  const [payer, setPayer] = useState('doria')
  const [placeId, setPlaceId] = useState('')

  // 打開/編輯時重置
  useEffect(() => {
    if (!open) return
    if (initial) {
      setType(initial.type ?? 'expense')
      setDisplay(String(initial.amount ?? 0))
      setCategory(initial.category ?? (initial.type === 'income' ? 'refund' : 'food'))
      setPaymentMethod(initial.paymentMethod ?? 'cash')
      setCardName(initial.cardName ?? '')
      setTitle(initial.title ?? '')
      setStoreName(initial.storeName ?? '')
      setNote(initial.note ?? '')
      setPayer(initial.payer ?? 'doria')
      setPlaceId(initial.placeId ?? '')
      const dt = initial.spentAt?.toDate?.() ?? initial.spentAt ?? new Date()
      setSpentAt(new Date(dt).toISOString().slice(0, 16))
    } else {
      setType('expense')
      setDisplay('0')
      setCategory('food')
      setPaymentMethod('cash')
      setCardName('')
      setTitle('')
      setStoreName('')
      setSpentAt(new Date().toISOString().slice(0, 16))
      setNote('')
      setPayer('doria')
      setPlaceId('')
    }
  }, [open, initial])

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES

  // 若切了 type,分類自動切到第一個
  useEffect(() => {
    const list = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES
    if (!list.find((c) => c.id === category)) {
      setCategory(list[0].id)
    }
  }, [type, category])

  const amount = useMemo(() => evalExpr(display), [display])
  const twd = toTWD(amount)

  const handleKey = (k) => {
    setDisplay((d) => nextDisplay(d, k))
  }

  const handleSubmit = () => {
    if (amount <= 0) {
      alert('金額必須大於 0')
      return
    }
    if (!title.trim()) {
      alert('請輸入項目名稱')
      return
    }
    onSubmit({
      type,
      amount,
      category,
      title,
      storeName: storeName || null,
      spentAt: new Date(spentAt),
      paymentMethod,
      cardName: paymentMethod === 'card' ? cardName : null,
      note,
      payer,
      placeId: placeId || null,
    })
    onClose()
  }

  // 產出景點選項(排除 hotel 重複)
  const placeOptions = useMemo(() => {
    const seen = new Set()
    return Object.entries(places)
      .filter(([id, p]) => {
        if (seen.has(p.name)) return false
        seen.add(p.name)
        return p.kind !== 'transport'
      })
      .map(([id, p]) => ({ id, name: p.name, kind: p.kind }))
  }, [])

  return (
    <BottomSheet open={open} onClose={onClose} title={isEdit ? '編輯' : '新增記錄'}>
      <div className="px-5 py-4 space-y-4">
        {/* 支出 / 收入 切換 */}
        <div className="flex gap-2 p-1 bg-paper2 rounded-2xl">
          <TabBtn active={type === 'expense'} onClick={() => setType('expense')}>
            💸 支出
          </TabBtn>
          <TabBtn active={type === 'income'} onClick={() => setType('income')}>
            💰 收入
          </TabBtn>
        </div>

        {/* 大字金額顯示 */}
        <div className={`rounded-2xl p-4 text-right ${type === 'income' ? 'bg-halloween-slime/20' : 'bg-primary-soft/40'}`}>
          <p className="text-[10px] text-ink-faint">
            {type === 'income' ? '收入' : '支出'} · 約 NT${twd.toLocaleString()}
          </p>
          <p className="font-mono text-3xl font-bold text-ink truncate">
            {type === 'income' ? '+' : '-'}¥{display}
          </p>
        </div>

        {/* 分類 horizontal scroll */}
        <div>
          <p className="text-[10px] text-ink-faint mb-1.5">分類</p>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={[
                  'flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all',
                  category === c.id
                    ? 'ring-2 ring-primary shadow-soft'
                    : 'opacity-60 hover:opacity-100',
                ].join(' ')}
                style={{ background: c.color + '25' }}
              >
                <span className="text-xl">{c.icon}</span>
                <span className="text-[10px]">{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 付款方式(4 個) */}
        {type === 'expense' && (
          <div>
            <p className="text-[10px] text-ink-faint mb-1.5">付款方式</p>
            <div className="grid grid-cols-4 gap-2">
              {PAYMENT_METHODS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPaymentMethod(p.id)}
                  className={[
                    'py-2 rounded-xl text-xs transition-all flex flex-col items-center gap-0.5',
                    paymentMethod === p.id
                      ? 'ring-2 ring-primary bg-white shadow-soft'
                      : 'bg-paper2/60 opacity-70',
                  ].join(' ')}
                >
                  <span>{p.icon}</span>
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
            {paymentMethod === 'card' && (
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="卡別(選填,例:國泰、台新)"
                className="mt-2 w-full px-3 py-2 rounded-xl border border-edge bg-white text-sm"
              />
            )}
            {paymentMethod === 'ic' && (
              <p className="mt-2 text-[10px] text-ink-faint italic">
                Suica / ICOCA / 悠遊卡等 IC 卡
              </p>
            )}
          </div>
        )}

        {/* 付款人(僅支出) */}
        {type === 'expense' && (
          <div>
            <p className="text-[10px] text-ink-faint mb-1.5">付款人</p>
            <div className="grid grid-cols-3 gap-2">
              {PAYERS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPayer(p.id)}
                  className={[
                    'py-2 rounded-xl text-xs transition-all flex flex-col items-center gap-0.5',
                    payer === p.id
                      ? 'ring-2 ring-primary bg-white shadow-soft'
                      : 'bg-paper2/60 opacity-70',
                  ].join(' ')}
                >
                  <span>{p.icon}</span>
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 關聯景點(選填) */}
        <div>
          <p className="text-[10px] text-ink-faint mb-1">關聯景點(選填)</p>
          <select
            value={placeId}
            onChange={(e) => setPlaceId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-edge bg-white text-sm"
          >
            <option value="">— 不關聯 —</option>
            {placeOptions.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* 項目名稱 + 店家 */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-[10px] text-ink-faint mb-1">項目名稱 *</p>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="味乃家綜合燒"
              className="w-full px-3 py-2 rounded-xl border border-edge bg-white text-sm"
            />
          </div>
          <div>
            <p className="text-[10px] text-ink-faint mb-1">店家(選填)</p>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="味乃家"
              className="w-full px-3 py-2 rounded-xl border border-edge bg-white text-sm"
            />
          </div>
        </div>

        {/* 時間 */}
        <div>
          <p className="text-[10px] text-ink-faint mb-1">時間</p>
          <input
            type="datetime-local"
            value={spentAt}
            onChange={(e) => setSpentAt(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-edge bg-white text-sm font-mono"
          />
        </div>

        {/* 備註 */}
        <div>
          <p className="text-[10px] text-ink-faint mb-1">備註(選填)</p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="兩人分,含服務費…"
            className="w-full px-3 py-2 rounded-xl border border-edge bg-white text-sm resize-none"
          />
        </div>

        {/* 計算機鍵盤 */}
        <div>
          <p className="text-[10px] text-ink-faint mb-1.5">金額</p>
          <div className="grid grid-cols-4 gap-1.5">
            {['7','8','9','⌫',
              '4','5','6','+',
              '1','2','3','-',
              '00','0','.','C'].map((k) => (
              <button
                key={k}
                onClick={() => handleKey(k)}
                className={[
                  'py-3 rounded-xl text-lg font-mono font-semibold transition-colors',
                  ['+','-','⌫','C'].includes(k)
                    ? 'bg-accent/15 text-accent hover:bg-accent/25'
                    : 'bg-white border border-edge text-ink hover:bg-primary-soft/40',
                ].join(' ')}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        {/* 儲存 */}
        <button
          onClick={handleSubmit}
          className="w-full py-3 rounded-2xl bg-primary text-paper font-semibold shadow-pumpkin hover:bg-primary-light transition-colors"
        >
          {isEdit ? '💾 更新' : '✓ 儲存'}
        </button>
      </div>
    </BottomSheet>
  )
}

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={[
        'flex-1 py-2 rounded-xl text-sm font-semibold transition-all',
        active ? 'bg-white text-primary shadow-soft' : 'text-ink-faint',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

// --- 計算機邏輯 ---
function nextDisplay(current, key) {
  // C 清除
  if (key === 'C') return '0'
  // 退格
  if (key === '⌫') {
    const next = current.slice(0, -1)
    return next.length === 0 ? '0' : next
  }
  // 加減 — 用 eval 支援(限定安全字元)
  if (key === '+' || key === '-') {
    // 如果最後一個字已經是運算符,取代
    if (['+','-'].includes(current.slice(-1))) {
      return current.slice(0, -1) + key
    }
    return current + key
  }
  // 小數點
  if (key === '.') {
    const lastSeg = current.split(/[+\-]/).pop()
    if (lastSeg.includes('.')) return current // 已有
    return current + '.'
  }
  // 00
  if (key === '00') {
    if (current === '0') return '0'
    return current + '00'
  }
  // 數字
  if (current === '0') return key
  return current + key
}

// 安全評估 + - 運算(僅數字與 +-)
function evalExpr(expr) {
  const cleaned = expr.replace(/[^0-9.+-]/g, '')
  try {
    // Function 比 eval 稍安全,且我們已 sanitize
    // eslint-disable-next-line no-new-func
    const v = Function(`"use strict"; return (${cleaned || '0'})`)()
    return Math.max(0, Math.round(Number(v) || 0))
  } catch {
    return 0
  }
}
