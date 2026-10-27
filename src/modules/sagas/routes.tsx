import type { RouteObject } from 'react-router'
import { SagasPage } from './SagasPage'
import { SagaStoryPage } from './SagaStoryPage'

export const sagaRoutes: RouteObject[] = [
  { path: 'sagas', element: <SagasPage /> },
  { path: 'sagas/:id', element: <SagaStoryPage /> },
]
