# Copilot Instructions — App Template

## Fuente de verdad

La guía completa de arquitectura y forma de programar está en [`ARCHITECTURE.md`](../ARCHITECTURE.md)
(raíz del repo). Ante cualquier duda de estructura, patrón o convención, consultarla. Este fichero
es solo el resumen operativo.

Para tareas concretas existen **skills locales** en [`.github/skills/`](./skills/SKILLS.md):
`@new-project`, `@api-endpoint`, `@success-notifications`, `@i18n`, `@testing`, `@track-todos`,
`@create-skill`. Cargar la skill correspondiente antes de generar código de ese tipo.

---

## Este repo es un template

Mientras el proyecto siga llamándose `App Template` / `app-template`, es un **cascarón sin dominio
propio**. Si el usuario describe la aplicación que quiere construir, cargar `@new-project` antes de
tocar nada: renombra los placeholders, purga el dominio `example` y monta los dominios reales.
Placeholders y pasos manuales: [`README.md`](../README.md) § Placeholders.

---

## Proyecto

SPA Angular 20 (standalone + signals) con npm y Angular CLI. Sin librerías corporativas: estilos
propios en `src/styles/`, mock backend con MSW en `src/fake-backend/`, i18n con @ngx-translate,
toasts con ngx-toastr.

```
core/      Infraestructura: api/ (servicios HTTP, ver abajo), guards/, interceptors/, services/
pages/     Dominios de negocio (login/, main/ — de ejemplo) — vertical slices
shared/    Reutilizables entre 2+ dominios: components/, enums/, models/, pipes/, services/, utils/, validations/
```

- Los ficheros viven en el nivel más bajo posible; suben a `shared/` solo con un 2º consumidor real.
- Sin prefijos redundantes en carpetas (`form/`, no `login-form/`).
- Alias: `@core/`, `@shared/`, `@pages/`.

## Capa API (`core/api/`)

- Un folder por familia de endpoint (primer segmento de URL): `core/api/example/` con
  `example.service.ts` + `example.types.ts`. Segmentos más profundos = métodos, nunca subcarpetas.
- Siempre `firstValueFrom(this.http.METHOD<Response>(...))` — la capa API devuelve `Promise`.
- **URLs relativas** (`'/example'`): el interceptor antepone `environment.api` y añade el token.
- Tipos calcan el método: `updateExample` → `UpdateExampleRequest` / `UpdateExampleResponse`.
- Átomos semánticos en `shared/models/` (ej. `Token`) — no `string`/`number` a pelo si existe alias.
- Todo endpoint tiene su mock MSW espejo en `fake-backend/handlers/{familia}/` (skill `@api-endpoint`).
- Toasts de éxito via headers `HttpCustomHeader` con tag i18n (skill `@success-notifications`).

## Componentes

Orden de secciones **estricto** con comentarios separadores:
`// Injections` → `// ViewChilds` → `// Models` → `// Inputs` → `// Outputs` → `// Data` →
`// Computeds` → `// Effects` → `// Methods` (lifecycle primero, luego privados, luego públicos).

- `inject()` siempre — nunca constructor. Visibilidad explícita: `private` por defecto,
  `public` solo si el template lo usa. Los `effect` siempre `private`.
- Signals para todo estado reactivo (`signal`/`computed`/`effect`); nunca mutar contenido de un
  signal — siempre `set`/`update`. APIs nuevas: `input()`, `output()`, `viewChild()`, `model()`.
- `ChangeDetectionStrategy.OnPush` siempre; `styleUrl` singular; sin `standalone: true`;
  componentes de página con `export default`.
- Control flow moderno: `@if` / `@for` / `@switch`.
- async/await sobre RxJS: nada de `subscribe()` fuera de interceptores. Llamadas independientes
  en paralelo con `Promise.all`.
- Early returns, llaves siempre, sin `await` en la última llamada de una función `void`.
- Handlers `handle{Acción}`; navegación `navTo{Destino}` / `navBack`; booleans `is/has/should`.

## TypeScript

- `type` siempre — nunca `interface` para datos. `import type` para imports solo de tipos.
- Sin `any` (usar `unknown` + type guard). Nada de magic strings/numbers → enum o constante.
- Código, comentarios y nombres de fichero en **inglés**; términos de dominio en español.
- Ficheros kebab-case: `*.component.ts`, `*.service.ts`, `*.types.ts` (nunca `.model.ts`),
  `*.enum.ts`, `*.pipe.ts`, `*.utils.ts`, `*.validators.ts`.

## Estilos (SCSS)

Guía completa del sistema de estilos: [`src/styles/README.md`](../src/styles/README.md).

- Todo SCSS de componente empieza con `@use 'imports' as *;` y scopa con `:host`
  (encapsulación por defecto — no se usa `ViewEncapsulation.None`).
- Variables y mixins de `src/styles/` siempre: `$spacing-md`, `$color-primary-500`, `rem(24)`,
  `@include breakpoint('tablet')`… Nunca valores hardcodeados ni estilos inline.
- Clases globales (`grid-template` + `col-*`, `field-group`, `buttons-group`) se usan,
  jamás se redefinen.

## i18n — obligatorio

Cero texto visible hardcodeado: `| translate` en template, `translate.instant()` en TS.
Claves `{domain}.{component}.{grupo}.{clave}` en camelCase, en `src/assets/i18n/es.json`.
Acciones comunes desde `common.*`. Detalles: skill `@i18n`.

## TODOs

Todo `// TODO` se registra en `TODOS.md` (raíz). Detalles: skill `@track-todos`.

## Tests

Jasmine + Karma, cobertura mínima 80% **exigida** (`npm run test:ci` falla por debajo). Todo fichero
con lógica nace con su spec. Detalles: skill `@testing`.

## Comandos

```bash
npm start                       # dev server con MSW (http://localhost:4200)
npm run start:tst               # dev server contra la API de test
npm run rename -- "Nombre App"  # sustituir los placeholders del template
npm run format                  # prettier + stylelint --fix (antes de commitear)
npm run lint                    # ESLint (reglas de arquitectura)
npm test                        # Jasmine + Karma (watch)
npm run test:ci                 # una pasada headless; falla si cobertura < 80%
npx ng build                    # build de producción
```

## Git

Conventional commits (`feat:`, `fix:`, `refactor:`…). `npm run lint` + `npm run format` antes de commitear.
Hook `pre-commit` (husky + lint-staged) formatea/valida automáticamente los ficheros staged.
Hook `pre-push` ejecuta `npm run test:ci`.

---

## Checklist rápido

- [ ] Fichero en la carpeta correcta y al nivel más bajo posible
- [ ] Orden de secciones del componente + visibilidad explícita
- [ ] `inject()`, signals, `input()`/`output()`/`viewChild()`; nada de APIs legacy
- [ ] `type` (no `interface`); átomos de `shared/models/`; `{Method}Request/Response`
- [ ] API: `firstValueFrom` + URL relativa; mock MSW espejo creado
- [ ] SCSS con `@use 'imports' as *` + `:host`; variables/mixins; sin redefinir clases globales
- [ ] Todo texto visible con `| translate` / `translate.instant()`
- [ ] Accesibilidad: `type` en `<button>`, `alt` en imágenes, `<label>` asociado, interactivos con teclado
- [ ] Early returns; llaves siempre; sin `subscribe()`; sin mutar signals
- [ ] TODOs registrados en `TODOS.md`; commit con conventional commits
