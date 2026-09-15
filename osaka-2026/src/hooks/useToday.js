// 算「今天是旅程第幾天」
// 如果還沒開始,回傳 { status: 'before', day: null, daysUntil }
// 如果已結束,回傳 { status: 'after', day: null, daysSince }
// 如果進行中,回傳 { status: 'during', day: 1..6 }

import { useEffect, useState } from 'react'
import { TRIP } from '../config/trip'

// yyyy-mm-dd 字串 → 日本時區當日 00:00 的 Date
function jstDate(ymd) {
  return new Date(`${ymd}T00:00:00+09:00`)
}

function todayJstYmd() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TRIP.timezone,
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
}

function daysBetween(a, b) {
  return Math.round((b - a) / (1000 * 60 * 60 * 24))
}

export function useToday() {
  const [today, setToday] = useState(() => compute())

  useEffect(() => {
    // 每小時重算一次,跨日就會反應
    const t = setInterval(() => setToday(compute()), 60 * 60 * 1000)
    return () => clearInterval(t)
  }, [])

  return today
}

function compute() {
  const start = jstDate(TRIP.startDate)
  const end = jstDate(TRIP.endDate)
  const nowYmd = todayJstYmd()
  const now = jstDate(nowYmd)

  if (now < start) {
    return { status: 'before', day: null, daysUntil: daysBetween(now, start) }
  }
  if (now > end) {
    return { status: 'after', day: null, daysSince: daysBetween(end, now) }
  }
  return {
    status: 'during',
    day: daysBetween(start, now) + 1, // 1..6
    daysUntil: 0,
  }
}
