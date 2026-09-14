import { useEffect, useState } from 'react'
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import { auth } from '../config/firebase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(
      auth,
      (u) => {
        if (u) {
          setUser(u)
          setLoading(false)
        } else {
          signInAnonymously(auth).catch((e) => {
            setError(e)
            setLoading(false)
          })
        }
      },
      (e) => {
        setError(e)
        setLoading(false)
      },
    )
    return unsub
  }, [])

  return { user, loading, error }
}
