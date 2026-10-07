# App Template 🧩

> **Cascarón Angular 20 listo para convertirse en cualquier aplicación.**
> No es una app funcional: es la arquitectura, la infraestructura y las convenciones ya montadas,
> más un dominio de ejemplo desechable que enseña cómo se programa aquí.

---

## 🚀 Arrancar un proyecto nuevo (la vía rápida)

Este repositorio está preparado para que **una IA lo transforme en el proyecto real a partir de un
solo prompt**. Clona, instala y pide el arranque:

```bash
git clone <repo-url> mi-proyecto
cd mi-proyecto
npm install
```

En Claude Code:

```
/new-project Una app para gestionar expedientes: listado con filtros, alta y edición, y login corporativo
```

En Copilot: `@new-project` + la misma descripción.

La skill [`new-project`](.github/skills/new-project/SKILL.md) se encarga de todo el ciclo:
renombrar los placeholders, purgar el dominio de ejemplo, decidir si se conserva el flujo de
autenticación, montar los dominios reales con sus mocks y dejar la documentación al día.

### …o a mano

```bash
npm run rename -- "Gestión de Expedientes"            # slug derivado del nombre
npm run rename -- "Gestión de Expedientes" --slug exp # slug explícito
npm run rename -- "Gestión de Expedientes" --dry      # ver qué cambiaría
```

Después: renombrar la carpeta del repo, ajustar `src/environments/`, y seguir la checklist de la
skill `new-project`.

---

## 🏷️ Placeholders del template

Todo lo que hay que sustituir para que el proyecto deje de ser un cascarón:

| Placeholder | Dónde vive | Sustituir por |
|---|---|---|
| `app-template` | `package.json`, `angular.json` (nombre del proyecto y `buildTarget`), docs | Slug técnico en kebab-case |
| `App Template` | `src/index.html` (`<title>`), `src/assets/i18n/es.json` (`app.name`), docs | Nombre visible de la aplicación |
| Carpeta del repo | Sistema de ficheros | El slug técnico (**a mano**, con el editor cerrado) |
| `https://api.example.com` | `src/environments/environment.prod.ts` | URL real de la API de producción |
| `https://api-tst.example.com` | `src/environments/environment.tst.ts` | URL real de la API de test |
| Dominio `example` | `src/app/core/api/example/`, `src/fake-backend/handlers/example/` | Borrar y crear los dominios reales |
| Página `main` | `src/app/pages/main/` | Primera pantalla real (ojo a la ruta `**`) |
| Paleta de color | `src/styles/base/_variables.scss` | Colores de marca del proyecto |
| Favicon | `src/assets/images/favicon.ico` | Icono del proyecto |

Los dos primeros los cubre `npm run rename`. El resto es decisión de proyecto.

---

## 📚 Documentación

| Documento | Para qué |
|---|---|
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | **Fuente de verdad**: arquitectura y forma de programar, agnóstica de negocio |
| [`CLAUDE.md`](CLAUDE.md) / [`.github/copilot-instructions.md`](.github/copilot-instructions.md) | Resumen operativo para los agentes de IA |
| [`.github/skills/SKILLS.md`](.github/skills/SKILLS.md) | Skills locales invocables |

---

## 🧱 Qué trae montado

- **Angular 20** standalone + **signals**, `ChangeDetectionStrategy.OnPush`, control flow `@if`/`@for`.
- **Arquitectura por capas**: `core/` (api, guards, interceptors, services) · `pages/` (vertical
  slices de dominio) · `shared/` (reutilizables sin lógica de negocio).
- **Capa API tipada** en `core/api/{familia}/` con `firstValueFrom` y URLs relativas.
- **Fake backend con MSW** (`src/fake-backend/`): la app arranca sin backend real.
- **Interceptor HTTP** con token, loader global, manejo de errores y toasts (`ngx-toastr`).
- **Auth de ejemplo**: login, guard, refresh token automático — eliminable de una pieza.
- **i18n** con `@ngx-translate` (`src/assets/i18n/es.json`), cero texto hardcodeado.
- **SCSS propio** (sin librería corporativa): variables, mixins, grid, layouts en `src/styles/`.
- **Utils y validaciones** reutilizables: fechas, formularios, objetos, delay, validadores.
- **Calidad**: ESLint + Prettier + Stylelint, path aliases (`@core/`, `@shared/`, `@pages/`),
  configuración multi-entorno (dev / tst / prod), tests con Jasmine + Karma.

### Estructura

```
src/app/
├── core/              # Infraestructura y estado global (singleton)
│   ├── api/           # Un folder por familia de endpoint: service + types
│   ├── guards/        # Protección de rutas
│   ├── interceptors/  # Token, loader, errores
│   └── services/      # Servicios con estado (auth, loader, respuesta HTTP)
├── pages/             # Dominios de negocio — vertical slices
└── shared/            # Reutilizables entre 2+ dominios (sin lógica de negocio)
    ├── components/  constants/  directives/  enums/  models/
    └── pipes/  services/  utils/  validations/

src/fake-backend/      # MSW: handlers y mocks espejo de cada endpoint
src/environments/      # environment.ts (dev) · .tst.ts · .prod.ts
src/styles/            # base/ (variables, globals) · ui/ (grid, layouts) · utils/ (mixins)
```

**¿Core o Shared?** Core = estado global, singleton, lógica de negocio, efectos secundarios.
Shared = presentacional, puro, reutilizable, sin dominio. Un fichero nace en el nivel más bajo
posible y solo sube cuando aparece un **segundo consumidor real**. Detalle en `ARCHITECTURE.md` §3.

---

## 🛠️ Desarrollo

Requisitos: Node.js 20.19+ (o 22.12+) y Angular CLI 20+.

```bash
npm install         # instalar dependencias
npm start           # dev server con MSW → http://localhost:4200
npm run start:tst   # dev server contra la API de test
npm test            # tests (Jasmine + Karma) en modo watch
npm run test:ci     # una pasada headless; falla si la cobertura baja del 80%
npm run lint        # ESLint (reglas de arquitectura)
npm run build       # build de producción
npm run format      # prettier + stylelint --fix (obligatorio antes de commitear)
```

El mock backend se activa con `useMSW: true` en `src/environments/environment.ts`: ponlo a `false`
para atacar una API real en desarrollo. MSW **solo existe en desarrollo**: los builds `tst` y
producción no incluyen ni el worker ni su código.

---

## 📋 Convenciones (resumen)

- Ficheros kebab-case: `*.component.ts`, `*.service.ts`, `*.types.ts`, `*.enum.ts`, `*.utils.ts`.
- Clases `PascalCase`, variables y métodos `camelCase`, constantes `SCREAMING_SNAKE_CASE`.
- `type` siempre (nunca `interface` para datos), sin `any`, `import type` para tipos.
- Código, comentarios y nombres de fichero en **inglés**; textos de usuario en **español** vía i18n.
- Commits: conventional commits (`feat:`, `fix:`, `refactor:`…).

La versión completa y normativa está en [`ARCHITECTURE.md`](ARCHITECTURE.md).

---

## 🤝 Mantener el template

Las mejoras genéricas (utils, componentes base, reglas de arquitectura) vuelven a este repositorio;
la lógica de dominio de cada proyecto **nunca**. Si añades una convención nueva, documéntala en
`ARCHITECTURE.md` y, si merece automatizarse, crea una skill con `@create-skill`.
