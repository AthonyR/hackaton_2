import type { RouteObject } from 'react-router'
import { NewsModule } from './NewsModule'
import { NewsDetailPage } from './NewsDetailPage'

export const newsRoutes: RouteObject[] = [
  { path: 'news', element: <NewsModule />, children: [{ path: ':id', element: <NewsDetailPage /> }] },
]
