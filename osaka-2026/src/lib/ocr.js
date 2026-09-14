import { createWorker } from 'tesseract.js'

let workerPromise = null

async function getWorker() {
  if (!workerPromise) {
    workerPromise = createWorker(['jpn', 'eng'])
  }
  return workerPromise
}

export async function recognize(imageSource) {
  const worker = await getWorker()
  const { data } = await worker.recognize(imageSource)
  return { text: data.text, confidence: data.confidence, words: data.words }
}

export async function terminate() {
  if (!workerPromise) return
  const w = await workerPromise
  await w.terminate()
  workerPromise = null
}
