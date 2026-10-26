# Módulo A — Zarpar (CP1)

## Funcionalidades

- Registro con `teamName`, `email` y `password`; inicia sesión directamente con la respuesta.
- Login con la cuenta compartida del equipo.
- Validación de campos y errores del backend junto al campo correspondiente. Incluye
  email/nombre duplicados, `details` del servidor y errores generales con reintento al enviar.
- Una sola solicitud de acceso en vuelo; formulario deshabilitado mientras se envía.
  Se cancela la request si se abandona el formulario.
- JWT persistido con el token store de la base; no se persiste la contraseña.
- Restauración mediante `/auth/me`, con estado de verificación y error recuperable.
  Una falla de red conserva el token. Un 401 lo invalida.
- Todas las rutas funcionales privadas pasan por `SessionBoundary`.
  Al entrar después del login, se restaura `pathname + search + hash`.
- Logout desde la cabecera. También se refleja un logout entre pestañas.
- Temporizador de expiración según `expiresAt`, con comprobación al recuperar el foco.
- Dashboard conectado a `/dashboard/summary`, con métricas, desglose de estados/frutas,
  recompensas destacadas y estado vacío cuando `wanted.total === 0`.
- Estado de `/log-pose`, enlace a la cola oficial de inspección o a sagas si ya está abierto.
  No se simula ni se cambia el bloqueo del servidor.
- Carga y errores independientes para el resumen y el Log Pose, con reintento y actualización manual.
- Página 404 y fallback de errores de renderizado conservados de la base.

## Archivos de integración

`src/modules/access/` contiene el módulo. `src/app/AppLayout.tsx` incorpora los enlaces
de acceso y el cierre de sesión. El router y las carpetas de B/C conservan sus contratos.

Para B/C, importar `useAuth` desde `../access/useAuth` si necesitan datos de la sesión.
Las llamadas usan `apiRequest` y los tipos de `src/shared/api/types.ts`.
No crear otro token store ni otro router. El cliente HTTP ya invalida la sesión ante 401.

## Verificación realizada

- `npm run build` y `npm run lint`.
- Pruebas en navegador con respuestas simuladas únicamente durante QA: login incorrecto,
  destino privado con query/hash, registro con sesión directa, duplicados y validaciones por
  campo, bloqueo del formulario al enviar, restauración con carga/error/reintento,
  logout, 401 del dashboard, resumen vacío, errores de recursos y estados del Log Pose.
- Las respuestas simuladas se sirvieron con un proceso temporal externo al código entregable.
  No hay usuarios de prueba ni fixtures en `src/`, ni se usan al ejecutar normalmente la app.
- Consulta sin credenciales a `/auth/me` del backend oficial: 401 `UNAUTHORIZED` y CORS permitido.

## Pendiente del equipo

Probar registro/login con la cuenta oficial desde la app; no se proporcionaron credenciales
ni se creó una cuenta real como parte del desarrollo. El equipo conserva su único registro oficial.
Completar integrantes y TEAM_CODE en los entregables al conocer sus datos reales.
Implementar CP2 antes de solicitar la inspección CP3, y continuar B/C según el reparto.

## Para explicar en la inspección

La guarda evita mostrar páginas privadas antes de comprobar la sesión. `/auth/me` confirma
que el JWT guardado sigue siendo válido. Mientras espera, se muestra carga; si hay una falla
de red permite reintentar y, ante un 401, vuelve al login.

El destino se guarda en el estado de navegación y se valida como ruta interna antes de
regresar. Incluye filtros y fragmentos para mantener la intención del usuario.

Los efectos abortan sus requests al desmontarse. Los resultados se aplican solo si la solicitud
sigue vigente. El cliente no permite que un 401 de un token antiguo cierre una sesión nueva.
Los formularios evitan envíos duplicados y convierten los errores estructurados en mensajes por campo.
