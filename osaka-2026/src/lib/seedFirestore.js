// 一次性 seed:把 defaultStops 寫進 Firestore trips/{id}/stops
// 使用方式:在瀏覽器 console 呼叫 window.__seed() 一次
// (為了不誤觸,不會在 App 啟動時自動跑)

import { doc, setDoc, collection, writeBatch, getDocs, serverTimestamp } from 'firebase/firestore'
import { db } from '../config/firebase'
import { TRIP } from '../config/trip'
import { defaultStops } from '../data/itinerary'

export async function seedTrip({ force = false } = {}) {
  const tripRef = doc(db, 'trips', TRIP.id)
  const stopsCol = collection(db, 'trips', TRIP.id, 'stops')

  // 檢查是否已經有資料
  const existing = await getDocs(stopsCol)
  if (existing.size > 0 && !force) {
    console.warn(
      `[seed] Firestore 已有 ${existing.size} 個 stops,略過。要強制覆蓋請傳 { force: true }`,
    )
    return { skipped: true, existing: existing.size }
  }

  // 寫 trip 文件本體
  await setDoc(tripRef, {
    title: TRIP.title,
    startDate: TRIP.startDate,
    endDate: TRIP.endDate,
    travelers: TRIP.travelers,
    timezone: TRIP.timezone,
    updatedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  }, { merge: true })

  // 分批寫 stops(Firestore batch 上限 500,我們只有 ~50,一批搞定)
  const batch = writeBatch(db)
  defaultStops.forEach((stop) => {
    batch.set(doc(stopsCol, stop.id), {
      ...stop,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  })
  await batch.commit()

  return { seeded: defaultStops.length }
}

// 掛到 window 方便手動觸發
if (typeof window !== 'undefined') {
  window.__seed = seedTrip
}
