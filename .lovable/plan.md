# Pantallas como ventanas sobre el inicio

## Qué cambia para el usuario
- El header pierde el botón Home: queda el menú a la izquierda y la lupa (catálogo) a la derecha.
- Catálogo, Área personal y Mis apps se abren como una ventana a pantalla completa por encima del inicio, con una "X" arriba a la derecha. Al pulsarla (o la tecla Escape) se cierra y se ve el inicio debajo.
- Las direcciones siguen funcionando (`/catalog`, `/profile`, `/manage`): si se abren directamente o se recarga, aparece el inicio con la ventana abierta encima.
- En el catálogo se quita el botón "Volver al inicio" (lo sustituye la X). Se mantiene "Apps instaladas".
- En Mis apps se añade un botón "Volver al catálogo" junto al título.
- El panel de administración no cambia.

## Detalles técnicos
- `AppRouter.tsx`: la ruta `/` pasa a ser layout con `<Outlet />`; `catalog`, `manage` y `profile` se vuelven rutas hijas. `manage` y `profile` conservan la redirección a `/auth` sin sesión.
- `Index.tsx`: renderiza `<Outlet />` tras el contenido.
- Nuevo `src/components/overlay/ScreenOverlay.tsx`: contenedor `fixed inset-0 z-50` con scroll propio, animación de entrada sutil, bloqueo de scroll del fondo, botón X (`aria-label` traducido) que navega a `/`, cierre con Escape, y fondo de pantalla del usuario (`getBackgroundStyle`) o fondo del catálogo según pantalla.
- `Catalog.tsx`, `Manage.tsx`, `Profile.tsx`: se envuelven en `ScreenOverlay` y dejan de renderizar `Header`; el scroll del catálogo usa el contenedor del overlay (`catalog-container`).
- `Header.tsx`: se elimina el enlace Home y el estado `isHomePage`; la lupa sigue en azul cuando el catálogo está abierto.
- `CatalogContent.tsx`: se quita "Volver al inicio".
- `Manage.tsx`: botón "Volver al catálogo" (`Link` a `/catalog`).
- `useSwipeGestures`: sin cambios; el sidebar se abre desde el inicio.
- Traducciones ES/EN: `overlay.close`, `manage.backToCatalog`.
- Verificación con Playwright en 390 y 1280: abrir/cerrar cada ventana, recarga directa en `/catalog`, `/manage`, `/profile`, y botón a catálogo desde Mis apps.
