import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../config/firebase'
import { TRIP } from '../config/trip'

function extOf(file) {
  const m = /\.([a-z0-9]+)$/i.exec(file.name ?? '')
  return m ? m[1].toLowerCase() : 'bin'
}

export async function uploadPhoto(file, { userId, kind = 'photo' } = {}) {
  const id = crypto.randomUUID()
  const path = `trips/${TRIP.id}/${kind}/${userId ?? 'anon'}/${id}.${extOf(file)}`
  const r = ref(storage, path)
  await uploadBytes(r, file, { contentType: file.type })
  const url = await getDownloadURL(r)
  return { path, url }
}
