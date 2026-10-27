# Módulo C — Poneglyph: la Gran Saga (CP5)

Implementado sobre `76b8aea194db87952e7f8c07dfb809a76d38fea2` (base + A + B recibidos de main).
Entrega local por ZIP. El integrante C revisa, incorpora y hace su commit/push.

## Resumen e historia

- `/sagas` consulta las sagas disponibles. Títulos, sinopsis, número de etapas, distancia,
  islas y paleta proceden de `/sagas`.
- `/sagas/:id` consulta una sola vez `/sagas/{id}/story` para cada historia abierta.
  Cambiar de etapa no vuelve a solicitar la historia.
- Narrativa completa por etapas, con una columna de lectura continua y un panel persistente.
  El panel está al lado en desktop y encima de la narrativa en mobile.
- La etapa activa es la única fuente para la isla, el barco, la paleta, las métricas y la URL.
  El barco se ubica con `island.x/y`, dentro del sistema de coordenadas `map.width/height`.
- SVG generado desde los puntos de las etapas: ruta completa atenuada y recorrido acumulado
  resaltado hasta la isla activa. No se usa un mapa pregrabado ni imágenes oficiales.
- Las cuatro métricas se muestran con sus etiquetas, valores y unidades reales. Los números
  se cambian directamente al activar la etapa, sin interpolarlos ni inventar datos intermedios.
- Progreso por etapas e indicación explícita de la etapa actual.
- La historia conserva todos sus párrafos en el DOM y visibles durante todo el recorrido;
  no depende de ocultar o reproducir contenido.

## Scroll, URL y teclado

La etapa se identifica mediante `?stage=<slug>`, con el slug entregado por la API.
Abrir o recargar esa URL lleva directamente a su etapa, incluso en mobile. Un slug inexistente
se normaliza a la primera etapa. Los IDs de saga se escapan antes de construir la ruta de API.

El scroll actualiza la URL con replace, para no llenar el historial. Botones, selector y teclado
crean entradas de navegación; atrás/adelante restaura la etapa correspondiente. No hay un ciclo
de scroll disparado por las propias actualizaciones de URL.

- Botones Anterior/Siguiente y selector accesible de etapas.
- Flechas izquierda/derecha entre etapas cuando el foco está dentro de la experiencia.
- Home/End (Inicio/Fin) a la primera/última etapa; se respeta la interacción normal del selector.
- Cada salto por teclado o controles lleva el foco al título de la etapa sin ocultar su contenido.
- SVG con título/descripción accesibles y progreso con nombre, valor y etapa actual.

## Animaciones y compatibilidad

- CSS Scroll-driven Animations, con una view timeline por etapa, para el progreso de lectura.
- Si no hay soporte de timeline/range, la barra de lectura usa la posición calculada con scroll
  y requestAnimationFrame. Mapa, métricas y navegación usan ese mismo motor en ambos casos.
- Links con View Transition API a través de React Router cuando hay soporte. Si no lo hay,
  la navegación funciona normalmente. Los títulos tienen nombres únicos de transición.
- `prefers-reduced-motion` se lee con matchMedia y se actualiza si la preferencia cambia.
  En ese modo no se solicitan View Transitions; CSS desactiva transiciones/animaciones de la
  experiencia y oculta la barra animada de lectura. El texto, mapa, métricas y progreso siguen visibles.
- Todos los saltos a etapas usan desplazamiento inmediato, evitando depender del smooth scroll.
- No se añadieron GSAP, Motion, Scrollama ni otra dependencia de animación.

## Errores y estados

Carga, error/reintento, lista vacía, historia sin etapas y 404. Un 423 conserva el bloqueo del
servidor y ofrece consultar Log Pose/CP3 en el dashboard. Las requests se cancelan al desmontar;
una respuesta antigua de otra saga no se aplica a la vista actual.

## Validación realizada

- Build y lint de producción.
- Comprobaciones de lógica: slug válido/inválido, progreso, ruta acumulada geométricamente,
  una sola etapa, paletas y nombres de transición seguros/únicos.
- Navegador con datos temporales de QA: 423, error y reintento de resumen/historia, lista vacía,
  historia vacía, 404, URL inválida, sincronización por scroll, cambio de métricas, navegación
  por teclado e historial, enlace directo y viewport móvil de 390 × 844.
- Se verificó en el registro de requests que avanzar por etapas no repite la consulta de historia.
- Se revisaron las rutas de fallback y movimiento reducido en el código; no se alteraron las
  preferencias de accesibilidad del sistema del usuario para probarlas.
- El proceso y los datos de QA son externos al proyecto y no se incluyen en el ZIP.

Pendiente: validar el flujo con la cuenta oficial y el desbloqueo real del CP3. No se creó una
cuenta nueva ni se usaron credenciales oficiales durante las pruebas.

## Alcance de los cambios

Código únicamente en `src/modules/sagas/`. Se conservan A, B, router principal, cliente de API,
dependencias y lockfile. Se actualizan README, estado y guías de incorporación.
