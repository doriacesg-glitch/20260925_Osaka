const KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
const BASE = 'https://maps.googleapis.com/maps/api/staticmap'

export function staticMapUrl({
  lat,
  lng,
  zoom = 15,
  width = 640,
  height = 360,
  scale = 2,
  markerColor = '0x7a8c6d',
  label = '',
} = {}) {
  if (lat == null || lng == null) return ''
  const center = `${lat},${lng}`
  const marker = `color:${markerColor}${label ? `|label:${label}` : ''}|${center}`
  const params = new URLSearchParams({
    center,
    zoom: String(zoom),
    size: `${width}x${height}`,
    scale: String(scale),
    markers: marker,
    language: 'ja',
    key: KEY ?? '',
  })
  return `${BASE}?${params.toString()}`
}
