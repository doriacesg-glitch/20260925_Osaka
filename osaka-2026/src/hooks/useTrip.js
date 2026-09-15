import { useEffect, useState } from 'react'
import { doc, collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '../config/firebase'
import { TRIP } from '../config/trip'

// 訂閱 trips/{id} 文件 + stops 子集合(行程時間軸)
//
// 回傳:
//   trip     — 旅程文件本體(可能為 null,還沒建立時)
//   stops    — 全部 stops(依 day + order 排序),包含 backup
//   loading  — 兩個訂閱都好了才 false
export function useTrip() {
  const [trip, setTrip] = useState(null)
  const [stops, setStops] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const tripRef = doc(db, 'trips', TRIP.id)
    // 用 orderBy('order') 之後再自己按 day 分組;
    // 混排 backup 與 1..6 沒關係,UI 會用 stopsByDay 過濾。
    const stopsRef = query(
      collection(db, 'trips', TRIP.id, 'stops'),
      orderBy('order', 'asc'),
    )

    let gotTrip = false
    let gotStops = false
    const done = () => gotTrip && gotStops && setLoading(false)

    const unsubTrip = onSnapshot(tripRef, (snap) => {
      setTrip(snap.exists() ? { id: snap.id, ...snap.data() } : null)
      gotTrip = true
      done()
    })

    const unsubStops = onSnapshot(stopsRef, (snap) => {
      setStops(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      gotStops = true
      done()
    })

    return () => {
      unsubTrip()
      unsubStops()
    }
  }, [])

  return { trip, stops, loading }
}
