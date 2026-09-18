import { useCallback } from 'react'
import { collection, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../config/firebase'
import { TRIP } from '../config/trip'

const col = () => collection(db, 'trips', TRIP.id, 'expenses')
const ref = (id) => doc(db, 'trips', TRIP.id, 'expenses', id)

export function useExpenseMutations() {
  const addExpense = useCallback(async (data) => {
    const docRef = await addDoc(col(), {
      // 必填
      type: data.type ?? 'expense',       // expense | income
      amount: Number(data.amount) || 0,   // JPY(內部一律日圓)
      category: data.category,
      title: data.title?.trim() || '',
      spentAt: data.spentAt ?? new Date(),
      paymentMethod: data.paymentMethod ?? 'cash', // cash | card | ic | misc
      // 選填
      cardName: data.cardName?.trim() || null,
      note: data.note?.trim() || null,
      placeId: data.placeId ?? null,
      storeName: data.storeName?.trim() || null,  // 給「各店消費占比」用
      payer: data.payer ?? 'doria',                // 'doria' | 'ray' | 'both'
      // 系統
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return docRef.id
  }, [])

  const updateExpense = useCallback(async (id, partial) => {
    await updateDoc(ref(id), {
      ...partial,
      updatedAt: serverTimestamp(),
    })
  }, [])

  const removeExpense = useCallback(async (id) => {
    await deleteDoc(ref(id))
  }, [])

  return { addExpense, updateExpense, removeExpense }
}
