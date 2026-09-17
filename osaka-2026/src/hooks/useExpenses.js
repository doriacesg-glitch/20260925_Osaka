import { useEffect, useState } from 'react'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../config/firebase'
import { TRIP } from '../config/trip'

// 訂閱 trips/{id}/expenses(按 spentAt 由新至舊)
export function useExpenses() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(
      collection(db, 'trips', TRIP.id, 'expenses'),
      orderBy('spentAt', 'desc'),
    )
    const unsub = onSnapshot(q, (snap) => {
      setExpenses(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }, (err) => {
      console.error('[useExpenses]', err)
      setLoading(false)
    })
    return unsub
  }, [])

  return { expenses, loading }
}
