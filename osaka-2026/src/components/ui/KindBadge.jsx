// 依 place.kind 顯示對應圖示與顏色
const KINDS = {
  hotel:         { icon: '🏠', label: '住宿',   className: 'bg-washi-pink/40 text-ink' },
  transport:     { icon: '🚊', label: '交通',   className: 'bg-washi-blue/40 text-ink' },
  photo:         { icon: '📷', label: '景點',   className: 'bg-sage/30 text-sage-deep' },
  food:          { icon: '🍴', label: '美食',   className: 'bg-orange-100 text-orange-800' },
  shopping:      { icon: '🛍', label: '購物',   className: 'bg-yellow-100 text-yellow-800' },
  entertainment: { icon: '🎢', label: '娛樂',   className: 'bg-purple-100 text-purple-800' },
}

export function KindBadge({ kind, size = 'sm' }) {
  const k = KINDS[kind] || { icon: '📍', label: '地點', className: 'bg-ink/10 text-ink' }
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1'
  return (
    <span className={`inline-flex items-center gap-1 rounded-full ${sizeClass} ${k.className}`}>
      <span>{k.icon}</span>
      <span>{k.label}</span>
    </span>
  )
}

export function kindIcon(kind) {
  return (KINDS[kind] || { icon: '📍' }).icon
}
