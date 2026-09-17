// 記帳分類 — 給圓餅圖 + 篩選用
export const EXPENSE_CATEGORIES = [
  { id: 'food',       label: '餐飲', icon: '🍜', color: '#E76D3C' },
  { id: 'transport',  label: '交通', icon: '🚊', color: '#6B4E96' },
  { id: 'attraction', label: '景點', icon: '🎭', color: '#F4C066' },
  { id: 'shopping',   label: '購物', icon: '🛍', color: '#E85E9F' },
  { id: 'hotel',      label: '住宿', icon: '🏠', color: '#7DB88A' },
  { id: 'souvenir',   label: '伴手禮', icon: '🎁', color: '#B84A20' },
  { id: 'other',      label: '其他', icon: '✨', color: '#A89BC0' },
]

export function getCategory(id) {
  return EXPENSE_CATEGORIES.find((c) => c.id === id) ?? EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1]
}

// 幣別
export const CURRENCIES = [
  { code: 'JPY', symbol: '¥', label: '日圓', rate: 1 },
  { code: 'TWD', symbol: 'NT$', label: '台幣', rate: 4.6 }, // 1 TWD ≈ 4.6 JPY 示意值,Round 2 會做動態匯率
]
