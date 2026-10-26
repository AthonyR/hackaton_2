import { createBrowserRouter, Navigate } from 'react-router'
import { privateAccessRoutes, publicAccessRoutes } from '../modules/access/routes'
import { SessionBoundary } from '../modules/access/SessionBoundary'
import { wantedRoutes } from '../modules/wanted/routes'
import { newsRoutes } from '../modules/news/routes'
import { sagaRoutes } from '../modules/sagas/routes'
import { AppLayout } from './AppLayout'
import { NotFoundPage } from '../shared/ui/NotFoundPage'
import { RouteErrorPage } from '../shared/ui/RouteErrorPage'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      ...publicAccessRoutes,
      {
        element: <SessionBoundary />,
        children: [
          ...privateAccessRoutes,
          ...wantedRoutes,
          ...newsRoutes,
          ...sagaRoutes,
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
