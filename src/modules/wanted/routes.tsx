import type { RouteObject } from 'react-router'
import { WantedModule } from './WantedModule'
import { WantedDetailPage } from './WantedDetailPage'

export const wantedRoutes: RouteObject[] = [
  { path: 'wanted', element: <WantedModule />, children: [{ path: ':id', element: <WantedDetailPage /> }] },
]
