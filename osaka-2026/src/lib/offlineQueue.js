import { get, set, del } from 'idb-keyval'

const KEY = 'osaka-2026:offline-queue'

async function readQueue() {
  return (await get(KEY)) ?? []
}

async function writeQueue(q) {
  if (q.length === 0) await del(KEY)
  else await set(KEY, q)
}

export async function enqueue(job) {
  const q = await readQueue()
  q.push({ ...job, id: crypto.randomUUID(), queuedAt: Date.now() })
  await writeQueue(q)
}

export async function peekAll() {
  return readQueue()
}

export async function remove(id) {
  const q = await readQueue()
  await writeQueue(q.filter((j) => j.id !== id))
}

export async function flush(handler) {
  const q = await readQueue()
  const remaining = []
  for (const job of q) {
    try {
      await handler(job)
    } catch {
      remaining.push(job)
    }
  }
  await writeQueue(remaining)
  return { done: q.length - remaining.length, left: remaining.length }
}
