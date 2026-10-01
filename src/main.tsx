import '@fontsource-variable/playfair-display/wght.css'
import '@fontsource-variable/dm-sans/wght.css'
import '@fontsource-variable/jetbrains-mono/wght.css'
import './index.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
