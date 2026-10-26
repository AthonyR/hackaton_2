import type { RouteObject } from 'react-router'
import { AuthPage } from './AuthPage'
import { DashboardPage } from './DashboardPage'

export const publicAccessRoutes: RouteObject[] = [
  {
    path: 'login',
    element: <AuthPage key="login" mode="login" />,
  },
  {
    path: 'register',
    element: <AuthPage key="register" mode="register" />,
  },
]

export const privateAccessRoutes: RouteObject[] = [
  {
    path: 'dashboard',
    element: <DashboardPage />,
  },
]
