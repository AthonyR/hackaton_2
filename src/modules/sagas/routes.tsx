import type { RouteObject } from 'react-router'
import { ModulePlaceholder } from '../../shared/ui/ModulePlaceholder'

export const sagaRoutes: RouteObject[] = [
  { path: 'sagas', element: <ModulePlaceholder title="Las sagas del Grand Line" checkpoint="CP5 · Poneglyph" owner="C" description="Resumen de las sagas disponibles. La API requiere aprobar la inspección del CP3." /> },
  { path: 'sagas/:id', element: <ModulePlaceholder title="Historia de la saga" checkpoint="CP5 · Poneglyph" owner="C" description="Narrativa por scroll con mapa persistente, etapas, métricas y navegación accesible." /> },
]
