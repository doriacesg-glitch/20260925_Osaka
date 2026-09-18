// 支出分類
// refundable: 該分類是否有機會退稅(日本觀光客退稅條件 = 一般品或消耗品,同店同日達 5,000 円)
export const EXPENSE_CATEGORIES = [
  { id: 'food',       label: '餐飲',   icon: '🍜', color: '#E76D3C', refundable: false, note: '在店內用餐一般不能退稅' },
  { id: 'transport',  label: '交通',   icon: '🚊', color: '#6B4E96', refundable: false },
  { id: 'attraction', label: '景點',   icon: '🎭', color: '#F4C066', refundable: false, note: '門票不退稅' },
  { id: 'shopping',   label: '購物',   icon: '🛍', color: '#E85E9F', refundable: true,  note: '一般品(衣服/雜貨)在同店同日 ≥¥5,000' },
  { id: 'hotel',      label: '住宿',   icon: '🏠', color: '#7DB88A', refundable: false, note: '訂房費用不退稅' },
  { id: 'souvenir',   label: '伴手禮', icon: '🎁', color: '#B84A20', refundable: true,  note: '消耗品(食品/藥妝/化妝品)在同店同日 ≥¥5,000' },
  { id: 'other',      label: '其他',   icon: '✨', color: '#A89BC0', refundable: false },
]

// 收入分類
export const INCOME_CATEGORIES = [
  { id: 'refund',    label: '退稅',     icon: '💴', color: '#7DB88A' },
  { id: 'discount',  label: '折扣',     icon: '🏷', color: '#F4C066' },
  { id: 'other_in',  label: '其他收入', icon: '💰', color: '#B884D9' },
]

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]

export function getCategory(id) {
  return ALL_CATEGORIES.find((c) => c.id === id) ?? EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1]
}

// 付款人
export const PAYERS = [
  { id: 'doria', label: 'Doria',  icon: '🐧', color: '#E76D3C' },
  { id: 'ray',   label: 'Ray',    icon: '🐱', color: '#6B4E96' },
  { id: 'both',  label: '共同',   icon: '👥', color: '#7DB88A' },
]

export function getPayer(id) {
  return PAYERS.find((p) => p.id === id) ?? PAYERS[0]
}

// 付款方式(4 種)
export const PAYMENT_METHODS = [
  { id: 'cash', label: '現金', icon: '💵', color: '#7DB88A' },
  { id: 'card', label: '刷卡', icon: '💳', color: '#6B4E96' },
  { id: 'ic',   label: 'IC 卡', icon: '🔷', color: '#4A90E2', hint: 'Suica / ICOCA / 悠遊卡' },
  { id: 'misc', label: '其他', icon: '❔', color: '#A89BC0' },
]

export function getPayment(id) {
  return PAYMENT_METHODS.find((p) => p.id === id) ?? PAYMENT_METHODS[0]
}

// 匯率(存在 localStorage,出國前設定一次)
const RATE_KEY = 'osaka-2026:rate:JPY_to_TWD'
export const DEFAULT_JPY_TO_TWD = 1 / 4.6 // 預設 1 JPY = 0.217 TWD

export function getRate() {
  try {
    const v = parseFloat(localStorage.getItem(RATE_KEY))
    if (Number.isFinite(v) && v > 0) return v
  } catch { /* noop */ }
  return DEFAULT_JPY_TO_TWD
}

export function setRate(jpyToTwd) {
  try { localStorage.setItem(RATE_KEY, String(jpyToTwd)) } catch { /* noop */ }
}

export function toTWD(jpy) {
  return Math.round(jpy * getRate())
}

// 退稅門檻(2024 觀光客免稅)
export const REFUND_THRESHOLD = 5000 // 同店同日 ≥ ¥5,000
