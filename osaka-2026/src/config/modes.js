// 5 個主要模式的 manifest
export const MODES = [
  {
    id: 'today',
    label: '今天',
    icon: '☀️',
    componentPath: 'TodayMode',
    description: '旅程中的當日焦點卡',
  },
  {
    id: 'itinerary',
    label: '行程',
    icon: '📖',
    componentPath: 'ItineraryMode',
    description: '完整 6 天 + 備選,拖曳/左滑編輯',
  },
  {
    id: 'expenses',
    label: '消費',
    icon: '🎃',
    componentPath: 'ExpensesMode',
    description: '記帳、購物試算、消費統計、退稅、生火清單',
  },
  {
    id: 'hotel',
    label: '飯店',
    icon: '🏠',
    componentPath: 'HotelMode',
    description: '逸之彩酒店的資訊、福利、動線',
  },
  {
    id: 'memories',
    label: '回憶',
    icon: '📷',
    componentPath: 'MemoriesMode',
    description: '拍立得、票根、手寫筆記牆',
  },
]

export const DEFAULT_MODE = 'today'
