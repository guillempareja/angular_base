# Sistema de estilos

Guía de cómo se estructuran y se escriben los estilos de esta aplicación. Es una
versión ampliada de [`ARCHITECTURE.md`](../../ARCHITECTURE.md) § 13, centrada en
dar contexto sobre **dónde va cada cosa** y **por qué**.

No usamos ninguna librería de estilos externa: el sistema es **propio** y vive
en `src/styles/`. La tipografía, el espaciado, los colores y las utilidades se
definen aquí una sola vez y se consumen desde todos los componentes.

---

## Idea clave: dos niveles de estilos

Cada estilo vive en **el nivel más bajo posible**. Solo sube de nivel cuando se
demuestra que se repite.

1. **Estilos encapsulados por componente** — el lugar por defecto. Cada
   componente (página o pieza reutilizable) lleva su propio `*.scss` con **sus**
   estilos, aislados del resto por la encapsulación de Angular (`Emulated`, la
   de por defecto). Si un estilo solo afecta a un componente, se queda ahí.

2. **Estilos globales / compartidos** — `src/styles/`. Solo lo verdaderamente
   transversal: variables de diseño, funciones, mixins, estilos base de los
   elementos HTML y las clases globales de UI que se reutilizan en muchas
   pantallas.

> **Regla mental:** cuando algo visual se repite mucho, lo normal es **crear un
> componente** y meter el estilo ahí. Pero hay cosas que se repiten y **no son
> un componente** (el tamaño de los títulos, el `rem()` para convertir px, un
> color de marca, un mixin de _flex_ centrado, un grid de columnas…). Eso es
> exactamente lo que vive en `src/styles/`, para no replicar los mismos valores
> en cada pantalla.

---

## Estilos encapsulados por componente

Todo SCSS de componente empieza igual:

```scss
@use 'imports' as *;

:host {
  @include flex-center;

  .header-wrapper {
    min-height: rem(100);
    padding: $spacing-xs $spacing-xl;
  }
}
```

Puntos importantes:

- **`@use 'imports' as *;` en la primera línea.** Da acceso a variables,
  funciones y mixins sin repetir rutas. Funciona porque `angular.json` declara
  `stylePreprocessorOptions.includePaths: ["src/styles"]`, así que `'imports'`
  resuelve a [`_imports.scss`](_imports.scss). Ese fichero es la **fachada** que
  reexporta (`@forward`) las variables y las utils — lo único que un componente
  necesita.
- **Se scopa con `:host`** y se anidan los selectores dentro. Como la
  encapsulación es la de por defecto (Emulated), estos estilos **no se filtran**
  a otros componentes. No se usa `ViewEncapsulation.None`.
- **Variables y mixins siempre**, nunca valores hardcodeados: `$spacing-md`,
  `$color-primary-500`, `rem(24)`, `@include breakpoint('tablet')`… Nada de
  colores/espaciados/tamaños a pelo ni estilos inline en el template.
- Las **clases globales de UI** (`grid-template` + `col-*`, `field-group`,
  `buttons-group`, `clamped-text`) se **usan pero nunca se redefinen** en el
  SCSS del componente. El SCSS del componente solo añade sus espaciados y
  detalles propios.

---

## La carpeta `src/styles/`

```
styles/
├── app.scss            ← Entry point global (registrado en angular.json): solo @use 'base' + @use 'ui'
├── _imports.scss       ← Fachada para componentes: @forward de variables + utils
├── base/               ← Cimientos: reset, variables y estilos base de elementos HTML
│   ├── _normalize.scss ← normalize.css (reset entre navegadores)
│   ├── _variables.scss ← TODAS las variables de diseño (única fuente de verdad)
│   └── _globals.scss   ← Estilos base de elementos (body, h1/h2, img, ul, input…)
├── ui/                 ← Clases globales reutilizables que NO son un componente
│   ├── _grid.scss      ← .grid-template + .col-1…col-12 (+ .new-row, mixins de grid)
│   ├── _layouts.scss   ← .field-group, .buttons-group
│   └── _texts.scss     ← .clamped-text
└── utils/              ← Herramientas para escribir estilos (no generan CSS por sí solas)
    ├── _functions.scss ← rem($px): convierte px → rem
    └── _mixins.scss    ← breakpoint, flex-center, text-ellipsis, fade-in, line-clamp, flex-wrap, spin
```

Hay **dos puntos de entrada distintos**, y conviene no confundirlos:

- [`app.scss`](app.scss) → se registra en `angular.json` y se aplica
  **globalmente** a toda la app. Solo hace `@use 'base'` + `@use 'ui'`, es
  decir, saca CSS real (reset, estilos de elementos y clases globales).
- [`_imports.scss`](_imports.scss) → es la **fachada para componentes**. Solo
  hace `@forward` de variables y utils, **no genera CSS**; únicamente expone
  tokens y helpers a cada `*.scss` de componente vía `@use 'imports' as *;`.

### `base/` — cimientos

- **`_normalize.scss`**: normalize.css, para partir de una base consistente
  entre navegadores.
- **`_variables.scss`**: la **única fuente de verdad** del diseño. Son variables
  **Sass** (no CSS custom properties), organizadas por escala:
  - **Colores**: paletas `$color-primary-{10..700}`, `$color-secondary-*`,
    `$color-error-*`, `$color-warning-*`, `$color-success-*`,
    `$color-neutral-*`, `$color-basic-black/white`.
  - **Tipografía**: `$font-family`, `$base-font-size`, `$base-line-height`,
    `$small-font-size`.
  - **Espaciados**: escala `$spacing-5xs` (2px) … `$spacing-9xl` (104px),
    siempre en `rem()`.
  - **Bordes**: `$border-radius-xs` … `$border-radius-xxl`.
  - **Breakpoints**: mapa `$breakpoints`
    (phone/tablet/laptop/desktop/wide-screen) que consume el mixin
    `breakpoint($device)`.
  - **Otros**: `$page-max-width`, `$transition-speed`.
- **`_globals.scss`**: estilos base de los **elementos HTML** (no de clases).
  Aquí está, por ejemplo, el tamaño/color/espaciado por defecto de `h1` y `h2`,
  del `body`, de `img`, `ul`, `input`… Es el sitio para decir "todos los `h1` de
  la app se ven así" sin repetirlo en cada pantalla.

### `ui/` — clases globales reutilizables (que no son un componente)

Aquí viven los estilos que se **repiten mucho** pero **no justifican un
componente**. Son clases y mixins globales que cualquier plantilla puede
aplicar:

- **`_grid.scss`**: sistema de rejilla de 12 columnas. `.grid-template` como
  contenedor y `.col-1`… `.col-12` para el ancho de cada hijo (`.new-row` fuerza
  salto de fila). Se usa en formularios y detalles: `col-4` para campo estándar,
  `col-6`/`col-8`, `col-12` para textos largos.
- **`_layouts.scss`**: agrupaciones habituales de layout, como `.field-group`
  (grupo label + control) y `.buttons-group` (barra de botones con _flex-wrap_).
- **`_texts.scss`**: utilidades de texto reutilizables, como `.clamped-text`
  (recorte a N líneas). Es el ejemplo típico de "estilo de texto que se repite
  en muchas pantallas y no es un componente".

Cuando detectes un patrón visual que se repite en varias pantallas y no encaje
como componente (un título con un tratamiento concreto, un contenedor
recurrente, una utilidad de texto…), este es su sitio.

### `utils/` — herramientas para escribir estilos

No producen CSS por sí solas; son helpers que se consumen desde componentes y
desde el resto de `src/styles/`:

- **`_functions.scss`**: `rem($px)` convierte píxeles a `rem` (`rem(24)` →
  `1.5rem`). Se usa para todos los tamaños en px.
- **`_mixins.scss`**: mixins reutilizables — `breakpoint($device)` (media
  queries a partir del mapa de breakpoints), `flex-center`, `text-ellipsis`,
  `fade-in`, `line-clamp`, `flex-wrap`, `spin`.

---

## Dónde poner un estilo nuevo — decisión rápida

- ¿Solo lo usa **un componente**? → en su `*.scss`, dentro de `:host`.
- ¿Es un **valor de diseño** (color, espaciado, tamaño, breakpoint)? →
  `base/_variables.scss`.
- ¿Es el estilo por defecto de un **elemento HTML** (`h1`, `body`, `input`…)? →
  `base/_globals.scss`.
- ¿Es un **patrón visual reutilizable** que no es un componente (grid, grupo de
  campos, utilidad de texto)? → `ui/`.
- ¿Es una **función o mixin** para escribir estilos? → `utils/`.

Regla transversal: sube a `src/styles/` **solo** cuando haya un segundo
consumidor real; hasta entonces, el estilo se queda encapsulado en su
componente.

---

## Nota sobre el cascarón (template)

Las utilidades de `ui/` (el grid de 12 columnas, los grupos de layout, las
utilidades de texto) son una base **genérica y básica** pensada para arrancar
rápido. Son deliberadamente sencillas: si en el futuro el proyecto adopta una
librería de estilos o un design system propio, es probable que estas utilidades
dejen de usarse. En ese caso, la que no se necesite se elimina sin miedo.
Mientras se usen (p. ej. el grid en la pantalla de login), se mantienen.

---

## Herramientas

- **Stylelint** (`stylelint-config-standard-scss` + prettier) valida todo
  `.scss`.
- **`npm run format`** formatea y aplica _fixes_ automáticos antes de commitear.
