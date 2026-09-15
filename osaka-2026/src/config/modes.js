// 4 個主要模式的 manifest
// Gemini 只需要在對應的 componentPath 建 React 元件(default export)
// App shell 會 lazy-load 這些 component

export const MODES = [
  {
    id: 'today',
    label: '今天',
    icon: '☀️',
    componentPath: 'TodayMode',
    description: '旅程中的當日焦點卡:下一個地點、進行中、已完成',
  },
  {
    id: 'itinerary',
    label: '行程',
    icon: '📖',
    componentPath: 'ItineraryMode',
    description: '完整 6 天 + 備選區,拖曳/左滑編輯',
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
