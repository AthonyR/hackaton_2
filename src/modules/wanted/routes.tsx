import type { RouteObject } from 'react-router'
import { ModulePlaceholder } from '../../shared/ui/ModulePlaceholder'

export const wantedRoutes: RouteObject[] = [
  { path: 'wanted', element: <ModulePlaceholder title="Carteles de Se Busca" checkpoint="CP2 · East Blue" owner="B" description="Listado con paginación del servidor, búsqueda, filtros y estado en la URL." /> },
  { path: 'wanted/:id', element: <ModulePlaceholder title="Detalle del cartel" checkpoint="CP2 · East Blue" owner="B" description="Detalle del cartel y regreso al listado conservando su estado." /> },
]
