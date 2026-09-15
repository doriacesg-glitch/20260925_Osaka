// GEMINI 的地盤 — 完整規格請看 repo root 的 GEMINI_HANDOFF.md
//
// Props:user, trip, stops, today
//
// 這頁的目的:
//   旅行中/旅行後看的「回憶」— 拍立得、票根、手寫筆記牆。
//   照片存在本機(不上傳 — 由 Doria 決定)。
//
//   之後如果要加 OCR 票根:src/lib/ocr.js 已就緒(recognize(imageSource) 回 {text, confidence})
//   之後如果要加離線佇列:src/lib/offlineQueue.js 已就緒

export default function MemoriesMode() {
  return (
    <div className="p-6 space-y-4">
      <p className="text-xs text-ink/50">
        TODO — Gemini 實作。這頁完全沒開工,設計方向請跟 Doria 確認。
      </p>
    </div>
  )
}
