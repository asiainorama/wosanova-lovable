# Buscador del catálogo: derecha, mitad de ancho, estilo invertido

## Objetivo
El buscador/filtro del catálogo se vuelve un elemento destacado: alineado a la derecha, con la mitad del ancho actual en escritorio, colores invertidos de alto contraste y esquinas redondeadas como las etiquetas de categorías.

## Cambios

### 1. Posición y ancho — `src/components/catalog/CatalogContent.tsx`
- Contenedor del buscador pasa de `relative z-20 max-w-2xl` a `relative z-20 ml-auto w-full sm:w-1/2`:
  - Alineado a la derecha (`ml-auto`).
  - En móvil mantiene ancho completo; desde `sm` ocupa la mitad del ancho disponible (aprox. la mitad de lo que ocupa hoy en escritorio).

### 2. Estilo invertido del campo — `src/components/UnifiedSearchBar.tsx`
- Modo claro: fondo negro con texto e iconos blancos. Modo oscuro: fondo blanco con texto e iconos negros.
  - Se usa `bg-foreground` + `text-background`, que se invierten solos entre modos.
  - Icono de lupa, botón de limpiar (X) y flecha del desplegable en `text-background`.
  - Placeholder en blanco/negro con opacidad (p. ej. `placeholder:text-background/60`).
  - Se eliminan las clases actuales `bg-gray-100`, `bg-blue-50`, `text-gray-800` y variantes dark.
- Bordes redondeados completos (`rounded-full`) para igualar las etiquetas de categorías.
- El anillo de foco (`ring-primary/20`) se mantiene pero ajustado para verse sobre fondo negro/blanco.
- Cuando hay categoría seleccionada, en lugar del borde izquierdo azul se marca con un pequeño punto/tono del tema dentro del campo, conservando el contraste.

### 3. Desplegable de categorías con el mismo esquema
- El panel del desplegable adopta el mismo fondo invertido que el campo (negro en claro, blanco en oscuro) con esquinas redondeadas (`rounded-2xl`) y sombra.
- Opciones: texto `text-background`; hover/selección con fondo semitransparente (`bg-background/10`) que garantiza contraste sobre ambos fondos; opción activa marcada además con `font-semibold` y el check en `text-primary` (el rosa primario contrasta bien sobre negro y blanco).
- Separador de "Todas las categorías" con `border-background/10`.

### 4. Contraste
- Todos los colores salen de tokens semánticos (`foreground`, `background`, `primary`); nada hardcodeado, así el esquema funciona en claro y oscuro sin desajustes.

## Verificación
- Build del proyecto.
- Playwright en 1280 y 390: buscador a la derecha a media anchura, escritura sin perder foco, desplegable legible y con buen contraste en ambos modos.
