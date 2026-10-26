import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { router } from './app/router'
import { ModuleProviders } from './modules/access/ModuleProviders'
import './styles.css'

const root = document.getElementById('root')
if (!root) throw new Error('No se encontró el elemento raíz de la aplicación.')

createRoot(root).render(
  <StrictMode>
    <ModuleProviders>
      <RouterProvider router={router} />
    </ModuleProviders>
  </StrictMode>,
)
