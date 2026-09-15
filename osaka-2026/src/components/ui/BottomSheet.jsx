import { useEffect } from 'react'

// 極簡底部彈出面板,點背景/上滑把手/Esc 關閉
export function BottomSheet({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return
    const onEsc = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm animate-[fadeIn_.15s]"
        onClick={onClose}
      />
      <div
        className="absolute inset-x-0 bottom-0 max-h-[85vh] bg-paper rounded-t-3xl shadow-2xl flex flex-col animate-[slideUp_.2s_ease-out]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex-shrink-0 pt-2 flex justify-center">
          <div className="w-10 h-1 rounded-full bg-ink/20" />
        </div>
        {title && (
          <div className="px-5 pt-2 pb-3 border-b border-ink/10">
            <h2 className="text-lg font-bold text-sage-deep">{title}</h2>
          </div>
        )}
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </div>
  )
}
