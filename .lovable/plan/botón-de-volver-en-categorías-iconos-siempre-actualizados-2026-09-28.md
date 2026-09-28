# Botón de volver en categorías + iconos siempre actualizados

## 1. Botón "Volver" en la vista de categoría
- Al entrar en una categoría (o ver resultados de búsqueda), mostrar un botón con flecha "Volver al catálogo" junto al título.
- Al pulsarlo: se quita la categoría y la búsqueda y se vuelve a la portada del catálogo (destacadas + categorías), subiendo al inicio de la página.
- Textos en español e inglés.

## 2. Iconos que faltan: detección y reemplazo automático

### En el navegador (inmediato)
- Cuando un icono falla, probar en orden varias fuentes en lugar de una sola: icono guardado de la app -> icono guardado en la base de datos -> Brandfetch -> icono del propio sitio (apple-touch-icon / favicon) -> servicio de favicons de Google -> DuckDuckGo -> inicial de la app.
- Detectar también iconos "falsos": imágenes que cargan pero son el globo genérico o demasiado pequeñas (menos de 32 px), y tratarlas como fallidas.
- Cuando una fuente funciona, recordarla para que la siguiente visita cargue directamente la buena.
- Cuando todas fallan, avisar en segundo plano para que el servidor busque un reemplazo.

### En el servidor (mantenimiento continuo)
- Nueva función que revisa todos los iconos: comprueba que cada uno responde y es una imagen válida; si no, busca un reemplazo con la misma cadena de fuentes y lo guarda.
- Los iconos buenos se copian a tu propio almacenamiento, para no depender de webs externas que cambian o bloquean.
- Se ejecuta automáticamente cada semana y también al recibir un aviso de icono roto.
- Se registra cuándo se revisó cada icono y de dónde salió, para no repetir trabajo.

### Resultado esperado
- Los iconos rotos se sustituyen solos en la primera carga y quedan corregidos para todos los usuarios tras la revisión.

## Detalles técnicos
- `CatalogContent.tsx`: botón con `ArrowLeft` junto al `h1` cuando `filteredView`; llama a `onClear` + `onCategoryChange(null)` y `window.scrollTo`.
- `useAppLogo.tsx`: cadena de fallbacks con índice en estado; validación en `onLoad` por `naturalWidth < 32`; `sessionStorage`/`localStorage` para la fuente buena.
- Nueva edge function `refresh-app-icons` (reutiliza `fetch-brandfetch`): valida HEAD/GET + content-type + tamaño, sube a un bucket público `app-icons` y hace upsert en `app_icons` (añadir columnas `source`, `last_checked_at`, `status` si no existen). Programada con `pg_cron` semanal; invocable por app concreta al reportar fallo.
- Traducciones `catalog.back` (es/en).
