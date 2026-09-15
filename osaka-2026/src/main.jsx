import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App.jsx'
import { registerSW } from 'virtual:pwa-register'

registerSW({ immediate: true })

// dev 模式掛 __seed 到 window,方便一次性初始化 Firestore
if (import.meta.env.DEV) {
  import('./lib/seedFirestore.js')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
