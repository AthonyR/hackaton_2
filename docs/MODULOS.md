# Trabajo por módulos

La base, A y B están publicados en `main` (commit `76b8aea`). C está implementado localmente
y se entrega como ZIP para que su responsable lo incorpore.
El reparto siguiente es una propuesta por responsabilidades; no asigna nombres ni autorías.
El README original conserva el enunciado y tiene prioridad sobre esta guía.

## Reparto y límites

| Responsable | Carpetas propias | Entrega funcional |
| --- | --- | --- |
| A | `src/modules/access/` | CP1: registro, login, sesión, logout, dashboard y Log Pose |
| B | `src/modules/wanted/`, `src/modules/news/` | CP2: carteles; CP4: noticias y verificación |
| C | `src/modules/sagas/` | CP5: resumen, historia, mapa y scroll |

Los tres deben entender CP1 y CP2 y participar en la inspección presencial del CP3.
Solo el docente desbloquea Grand Line. Un error 423 debe mostrarse como bloqueo.

Cada módulo incorpora sus páginas, componentes, hooks, servicios y estilos locales dentro
de su carpeta. Los tres módulos ya tienen sus rutas funcionales; se conservan sus exports.
Los módulos se importan una sola vez desde `src/app/router.tsx`.
No importes archivos internos de otro módulo; usa `src/shared/` para los contratos comunes.

## Archivos compartidos

Coordinar cambios en `package.json`, `package-lock.json`, `src/main.tsx`, `src/app/`,
`src/styles.css`, `src/shared/` y las configuraciones. Responsable propuesto: A.
No cambies dependencias ni estilos globales desde B o C sin acordarlo.
El diseño inicial es solo un contenedor mínimo; no es el diseño final de la aplicación.

## Integración del acceso (A, ya implementado)

- El contexto de sesión está montado en `ModuleProviders.tsx`.
- `SessionBoundary.tsx` espera `/auth/me` al recargar y protege las rutas de A, B y C.
  Un 401 limpia el token y regresa al login conservando el destino completo.
- `useAuth()` está disponible desde `src/modules/access/useAuth.ts` y expone:
  `status: 'checking' | 'authenticated' | 'anonymous'`, `user: User | null`,
  `team: Team | null`, `login(input: LoginRequest): Promise<void>`,
  `register(input: RegisterRequest): Promise<void>` y `logout(): void`.
  Login/registro admiten un `AbortSignal` opcional como segundo argumento.
  También expone `restoreError` y `retrySession()` para fallas al restaurar.
- Lee el JWT con `tokenStore.get()`. Usa `tokenStore.set(response.token)` solo después de
  registro o login exitoso y `tokenStore.clear()` al salir.
- El provider se suscribe a `tokenStore.subscribe()` para reflejar logout o un 401 autenticado.
  Usa `/auth/me` para restaurar; la presencia de un JWT no demuestra una sesión válida.
- La guarda conserva el destino completo (`pathname`, `search`, `hash`) al enviar al login.
  Durante la verificación se muestra un estado de carga o error recuperable, sin mostrar login.
- El login y registro están en `publicAccessRoutes`; dashboard está en `privateAccessRoutes`.
- El dashboard consulta `/log-pose` y `/dashboard/summary` con sus tipos reales. El bloqueo de Grand Line
  lo aplica el backend; B y C deben manejar también `ApiError.status === 423`.

## Cliente HTTP y tipos

`src/shared/api/schema.ts` se generó desde el contrato oficial guardado en `docs/openapi.json`.
No editarlo a mano. `npm run api:types` regenera los tipos desde esa copia local,
sin pedir credenciales ni necesitar la API disponible. El esquema incluye ejemplos oficiales:
no son datos reales del equipo ni deben mostrarse como resultados en la aplicación.

```tsx
import { apiRequest } from '../../shared/api/client'
import { ApiError, isAbortError, getErrorMessage } from '../../shared/api/api-error'
import type { WantedPage, WantedQuery } from '../../shared/api/types'

const controller = new AbortController()
const query: WantedQuery = { page: 0, size: 20, sort: 'bounty,desc' }

// Ejecutar dentro del servicio/hook del módulo; este bloque es un ejemplo de contrato.
const page = await apiRequest<WantedPage>('/wanted', {
  query,
  signal: controller.signal,
})
```

Para registrar o iniciar sesión, usa `method: 'POST'`, `auth: false` y `body` con el
tipo `RegisterRequest` o `LoginRequest`. La base `/api/v1` ya viene de la configuración:
no la repitas en las rutas. Escapa los IDs opacos con `encodeURIComponent(id)` al construir
rutas de detalle. `/crews` devuelve `Crew[]` y `/sagas` devuelve `SagaSummary[]`;
`/wanted` usa `WantedPage` y `/news/feed` usa `NewsFeed`.

El cliente adjunta el Bearer vigente, omite filtros vacíos y preserva errores de servidor.
`ApiError` expone `status`, `code`, `message`, `details`, `traceId`, `retryAfterSeconds`
y `current` (este último es `unknown`; verifica su estructura antes de usarlo).
Los errores de red se propagan y se pueden mostrar con `getErrorMessage()`.
Ignora cancelaciones con `isAbortError()`; no las muestres como fallas al usuario.
Una respuesta exitosa se tipa según T: no hay validación del JSON completo en runtime.

No hay caché, deduplicación, paginación ni reintentos automáticos: cada módulo debe
implementar su comportamiento. Aceptar `signal` permite cancelar requests, pero no basta:
protege también el estado contra respuestas antiguas, especialmente en cambios de filtros.
No añadas React Query, SWR ni librerías equivalentes.

## Rutas y comportamiento pendiente

| Ruta | Módulo | Pendiente principal |
| --- | --- | --- |
| `/login`, `/register`, `/dashboard` | A | Implementado; pendiente prueba con la cuenta oficial del equipo |
| `/wanted`, `/wanted/:id` | B | Incorporado a main; pendiente prueba con cuenta oficial |
| `/news`, `/news/:id` | B | Incorporado a main; pendiente prueba con cuenta oficial y desbloqueo CP3 |
| `/sagas`, `/sagas/:id` | C | Implementado; pendiente incorporación del ZIP, cuenta oficial y desbloqueo CP3 |

`/` redirige a `/dashboard`. Hay una página 404 y un fallback para errores de renderizado.
Los tres módulos consultan la API real configurada;
no hay fixtures ni un backend de prueba en el código entregable.
No se ha registrado una tripulación ni probado acceso autenticado con la cuenta oficial.

## Coordinación e incorporación

1. Compartir esta base en el repositorio del equipo antes de desarrollar encima.
2. Cada compañero abre la raíz del repositorio, usa Node 24 y ejecuta `npm ci`.
3. Copiar `.env.example` a `.env.local` y ejecutar `npm run dev`.
4. Trabajar en el módulo encargado. Usar `npm run lint` y `npm run build` antes de incorporar.
5. Si se trabaja secuencialmente sobre `main`, actualizar antes de cada entrega con
   `git pull --ff-only origin main`, conservando primero los cambios locales.
6. No sobrescribir configuraciones, archivos locales ni trabajo de otro integrante.
   Si alguien ya modificó `main`, conciliar antes de copiar una entrega antigua.

Antes de la entrega final completar `hackathon.json` con TEAM_CODE y los integrantes reales,
y añadir sus nombres/códigos al README. No se generaron identidades ficticias ni credenciales.
Base, A y B están en `origin/main`. Se confirmó y recibió el push de B antes de preparar C.
C se entrega por ZIP y su responsable hace el commit/push: ver `docs/INTEGRAR_C.md`.
Después de su push, actualizar la copia principal antes de la revisión final del equipo.

## Referencias técnicas

- [Vite](https://vite.dev/guide/)
- [Tailwind con Vite](https://tailwindcss.com/docs/installation/using-vite)
- [React Router](https://reactrouter.com/start/declarative/installation)
- [Swagger oficial](https://logpose-api-jg7f.onrender.com/docs)
