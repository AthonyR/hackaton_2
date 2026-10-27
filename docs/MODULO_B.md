# Módulo B — Carteles (CP2) y News Coo (CP4)

Implementado sobre `4ed9006b02bb45466072cbf83be9e17a61820546`, con la base y A ya publicados.
Esta entrega es local y por ZIP. No se hicieron commits ni push de B.

## Carteles

- `/wanted`: consulta paginada al servidor, con `page` desde 0 y tamaños 10/20/50.
- Estado, tripulación, fruta (incluido `NONE`), búsqueda, orden y tamaño combinables.
- Búsqueda con espera de 400 ms o envío explícito con Enter/Buscar.
- URL como fuente del estado: se normalizan valores inválidos y se preservan atrás/adelante,
  recarga y enlaces compartidos. Los cambios de filtros, búsqueda, tamaño u orden reinician página.
- Una página fuera del total se corrige usando los totales reales de la API.
- AbortController y comprobación de vigencia evitan aplicar respuestas antiguas.
- El contenedor de resultados conserva su altura para carga, error y vacío.
- `/wanted/:id`: datos, biografía, avistamiento e historial desde la API; incluye loading,
  error/reintento y 404. Al regresar se conservan filtros y posición del listado montado.
- `/crews` carga las opciones del filtro y permite reintentar si falla.

## Noticias

- `/news`: carga inicial sin cursor y siguientes mediante el `nextCursor` opaco del backend.
- Scroll automático con IntersectionObserver; fallback mediante scroll/resize si no está disponible.
  No se usa un botón para cargar páginas ni una librería de infinite scroll.
- Tipo, prioridad y estado en la URL. Cambiar filtros crea una sesión nueva del feed,
  cancela la anterior y comienza sin cursor. Ninguna respuesta de la sesión anterior se aplica.
- Una sola carga en vuelo y deduplicación por ID, incluso dentro de una misma página.
- Error de carga adicional conserva las noticias previas. Reintentar usa el mismo cursor.
- Un cursor inválido permite reiniciar sin cursor. Un cursor repetido/inconsistente detiene
  la carga automática y ofrece reinicio para evitar bucles.
- Fin de lista con `hasMore: false`; no se siguen solicitando páginas.
- `/news/:id`: detalle en un dialog nativo con foco contenido, Escape y cierre accesible.
  El feed permanece montado, se conserva scroll y se devuelve el foco al enlace de origen.
  Cerrar el detalle no vuelve a consultar páginas ya cargadas.
- Verificación de rumores con PATCH a `CONFIRMED` o `DEBUNKED`. Acciones deshabilitadas al enviar,
  confirmación al completar y error que conserva el estado anterior y permite reintentar.
- El feed cambia solo tras el éxito del servidor. Si la noticia deja de cumplir un filtro,
  se retira del resultado; su versión actualizada impide que un duplicado atrasado la reintroduzca.
- Un 409 con `current` muestra el estado actual; un 423 muestra el bloqueo y lleva al dashboard
  para consultar el Log Pose. No se modifica el desbloqueo oficial.

## Integración

Solo se añadieron archivos dentro de `src/modules/wanted/` y `src/modules/news/`, y se reemplazaron
sus rutas temporales por rutas anidadas. Se actualizaron README y guías de entrega.
No se cambiaron A, C, el router principal, archivos compartidos, dependencias ni lockfile.
No hay caché global del servidor ni librerías prohibidas; el feed usa estado propio de la visita.
Al salir del módulo o cerrar sesión se descarta ese estado.

## Verificación

- Build de producción y lint del proyecto.
- Comprobaciones de lógica con respuestas simuladas: parseo y normalización de URL,
  parámetros combinados, una carga en vuelo, deduplicación, fin de lista, preservación al fallar,
  reintento con el cursor correcto, descarte de respuesta vieja, cursor repetido y verificación
  mientras se reciben datos posteriores.
- Navegador con un servidor temporal de QA: página fuera de rango, cambio de filtro a página 0,
  búsqueda agrupada, detalle y regreso sin pedir el listado otra vez, error/reintento de carteles,
  423 de noticias, scroll 20 → 40 → 45, fin de lista, verificación fallida y exitosa,
  bloqueo de botones durante PATCH, retorno al feed en su posición con las 45 noticias
  y sin nuevas consultas, filtro en URL y recuperación de la última página tras un error.
- Los datos y el servidor de QA no forman parte del código ni del ZIP. Ejecutar normalmente
  usa la API pública configurada en `.env.local`.

Pendiente: prueba autenticada con la cuenta oficial del equipo y acceso a noticias una vez aprobado
CP3. No se creó una cuenta real ni se consumieron credenciales del equipo durante estas pruebas.
C/CP5 y los datos personales de los entregables siguen pendientes.
