import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App.jsx'
import { registerSW } from 'virtual:pwa-register'

registerSW({ immediate: true })

// 掛 __seed 到 window,方便手動初始化 Firestore
// (灌完種子之後就用不到了,不會被自動觸發)
import('./lib/seedFirestore.js')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
