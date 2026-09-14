import { useEffect, useState } from 'react'
import { doc, collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../config/firebase'
import { TRIP } from '../config/trip'

export function useTrip() {
  const [trip, setTrip] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const tripRef = doc(db, 'trips', TRIP.id)
    const itemsRef = query(
      collection(db, 'trips', TRIP.id, 'items'),
      orderBy('createdAt', 'asc'),
    )

    let gotTrip = false
    let gotItems = false
    const done = () => gotTrip && gotItems && setLoading(false)

    const unsubTrip = onSnapshot(tripRef, (snap) => {
      setTrip(snap.exists() ? { id: snap.id, ...snap.data() } : null)
      gotTrip = true
      done()
    })

    const unsubItems = onSnapshot(itemsRef, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      gotItems = true
      done()
    })

    return () => {
      unsubTrip()
      unsubItems()
    }
  }, [])

  return { trip, items, loading }
}
