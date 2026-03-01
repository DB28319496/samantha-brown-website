import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ContentProvider } from './cms/ContentProvider'
import { SelectionProvider } from './cms/SelectionContext'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ContentProvider>
      <SelectionProvider>
        <App />
      </SelectionProvider>
    </ContentProvider>
  </StrictMode>,
)
