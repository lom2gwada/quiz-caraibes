import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthGate, configureEngine } from '@engine'
import { appConfig } from './appConfig'
import { appSpec } from './appSpec'
import '@engine/styles.css'
import './app.css'

configureEngine(appConfig)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthGate spec={appSpec} />
  </StrictMode>,
)
