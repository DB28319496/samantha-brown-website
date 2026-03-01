import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ContentProvider } from './cms/ContentProvider'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ContentProvider>
      <App />
    </ContentProvider>
  </StrictMode>,
)
