# Catálogo con aspecto de tienda de aplicaciones

## Resultado

Rediseñar únicamente la página del catálogo para explorar aplicaciones como en una tienda: una selección destacada, secciones por categoría, tarjetas con distintos tamaños y búsqueda/filtros que sigan funcionando.

## Cambios propuestos

1. **Portada del catálogo:** conservar la cabecera y el buscador existentes; añadir una franja de aplicaciones destacadas con 1–2 tarjetas grandes y otras de apoyo, mostrando nombre, icono, categoría, descripción breve y acciones para visitar o guardar en favoritos.
2. **Destacadas automáticas:** escoger aplicaciones existentes a partir de su fecha de incorporación más reciente; si falta la fecha, usar un orden estable por nombre. No añadir controles de edición ni cambiar la base de datos.
3. **Explorar por categorías:** separar las aplicaciones en secciones con título traducido y una selección visible de tarjetas por sección; ofrecer una acción para ver todas las aplicaciones de esa categoría mediante el filtro existente. Mantener un acceso claro al conjunto completo de aplicaciones.
4. **Búsqueda y filtros:** al escribir o elegir una categoría, mostrar resultados pertinentes sin repetir la portada de destacadas; conservar el comportamiento de favoritos y enlaces externos.
5. **Adaptación visual:** diseño compacto y legible en móvil y escritorio, con jerarquía de tamaños, espacios y colores acordes al estilo de WosaNova; respetar el modo claro/oscuro y los textos en español/inglés.
6. **Comprobación:** probar portada, búsqueda, selección de categoría, visita y favoritos en ambos tamaños de pantalla y revisar que no haya errores nuevos.

## Notas técnicas

- Reorganizar la presentación del catálogo usando los datos que ya carga `CatalogService`; las aplicaciones no tienen actualmente un campo de “destacada”.
- Aislar las nuevas piezas visuales del catálogo para no alterar las tarjetas usadas en otras páginas.
- Aprovechar las traducciones existentes y añadir las etiquetas nuevas en ambos idiomas; aplicar colores mediante los tokens visuales del proyecto.
- El criterio de “más recientes” refleja `created_at`, no una clasificación de popularidad o valoración.
