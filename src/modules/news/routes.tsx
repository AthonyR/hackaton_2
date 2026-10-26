import type { RouteObject } from 'react-router'
import { ModulePlaceholder } from '../../shared/ui/ModulePlaceholder'

export const newsRoutes: RouteObject[] = [
  { path: 'news', element: <ModulePlaceholder title="News Coo" checkpoint="CP4 · Grand Line" owner="B" description="Feed con cursor e infinite scroll. La API requiere aprobar la inspección del CP3." /> },
  { path: 'news/:id', element: <ModulePlaceholder title="Detalle de la noticia" checkpoint="CP4 · Grand Line" owner="B" description="Detalle y verificación de rumores, conservando el estado del feed al regresar." /> },
]
