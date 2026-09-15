// 給 UI(Gemini)呼叫的行程異動 hook
// stops 存在 Firestore 的 trips/{TRIP.id}/stops 子集合
// 每個 stop 文件包含:{ placeId, day, order, arriveAt, duration, note }
//
// 這個 hook 不做「先本地更新再同步」的樂觀 UI —— Firestore 自己就會即時
// 推更新回來,所以呼叫這裡的 mutator 之後,UI 會透過 useTrip / useStops
// 收到新版本。

import { useCallback } from 'react'
import {
  collection,
  doc,
  writeBatch,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { TRIP } from '../config/trip'

const stopsCol = () => collection(db, 'trips', TRIP.id, 'stops')
const stopRef = (id) => doc(db, 'trips', TRIP.id, 'stops', id)

// 重新編號一組 stop 的 order (0, 1, 2, ...)
// 假設 arrayOfStops 已經是使用者想要的順序
async function rewriteOrder(arrayOfStops) {
  const batch = writeBatch(db)
  arrayOfStops.forEach((stop, idx) => {
    batch.update(stopRef(stop.id), { order: idx, updatedAt: serverTimestamp() })
  })
  await batch.commit()
}

export function useItineraryMutations(allStops) {
  // --- 重新排序:同一天內拖曳換位置 ---
  // dayStops: 使用者當前看到的那天的 stops (已排序),
  // fromIndex/toIndex: 拖曳的原始位置與目標位置
  const reorderWithinDay = useCallback(
    async (day, fromIndex, toIndex) => {
      const dayStops = allStops
        .filter((s) => s.day === day)
        .sort((a, b) => a.order - b.order)
      const next = [...dayStops]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      await rewriteOrder(next)
    },
    [allStops],
  )

  // --- 把 stop 從某天移到另一天(或備選) ---
  // toIndex: 目標天的插入位置(可選,不給就放最後)
  const moveToDay = useCallback(
    async (stopId, toDay, toIndex = null) => {
      const target = allStops.find((s) => s.id === stopId)
      if (!target) return

      const fromDay = target.day
      const targetDayStops = allStops
        .filter((s) => s.day === toDay && s.id !== stopId)
        .sort((a, b) => a.order - b.order)

      // 先在來源天把它拿掉,並重新編號
      const sourceDayStops = allStops
        .filter((s) => s.day === fromDay && s.id !== stopId)
        .sort((a, b) => a.order - b.order)

      // 插入目標位置
      const insertAt = toIndex == null ? targetDayStops.length : toIndex
      const merged = [
        ...targetDayStops.slice(0, insertAt),
        { ...target, day: toDay },
        ...targetDayStops.slice(insertAt),
      ]

      // 一個 batch 更新:目標天新順序 + 這個 stop 的 day + 來源天重新編號
      const batch = writeBatch(db)
      merged.forEach((s, idx) => {
        batch.update(stopRef(s.id), {
          order: idx,
          ...(s.id === stopId ? { day: toDay } : {}),
          updatedAt: serverTimestamp(),
        })
      })
      sourceDayStops.forEach((s, idx) => {
        batch.update(stopRef(s.id), { order: idx, updatedAt: serverTimestamp() })
      })
      await batch.commit()
    },
    [allStops],
  )

  // --- 快捷:移到備選區 ---
  const moveToBackup = useCallback(
    (stopId) => moveToDay(stopId, 'backup'),
    [moveToDay],
  )

  // --- 更新單一 stop 的欄位(改時間、備註、換 place 等) ---
  const updateStop = useCallback(async (stopId, partial) => {
    await updateDoc(stopRef(stopId), {
      ...partial,
      updatedAt: serverTimestamp(),
    })
  }, [])

  // --- 刪除一個 stop ---
  const removeStop = useCallback(
    async (stopId) => {
      const target = allStops.find((s) => s.id === stopId)
      if (!target) return
      const remaining = allStops
        .filter((s) => s.day === target.day && s.id !== stopId)
        .sort((a, b) => a.order - b.order)
      const batch = writeBatch(db)
      batch.delete(stopRef(stopId))
      remaining.forEach((s, idx) => {
        batch.update(stopRef(s.id), { order: idx, updatedAt: serverTimestamp() })
      })
      await batch.commit()
    },
    [allStops],
  )

  // --- 新增 stop 到某天最後 ---
  const addStop = useCallback(
    async ({ placeId, day, arriveAt = null, duration = 60, note = '' }) => {
      const dayCount = allStops.filter((s) => s.day === day).length
      await addDoc(stopsCol(), {
        placeId,
        day,
        order: dayCount,
        arriveAt,
        duration,
        note,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    },
    [allStops],
  )

  return {
    reorderWithinDay,
    moveToDay,
    moveToBackup,
    updateStop,
    removeStop,
    addStop,
  }
}
