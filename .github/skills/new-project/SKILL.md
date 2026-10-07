---
name: new-project
description: >
  Use when this template repository is being turned into a real application for the first time.
  ALWAYS invoke this skill when the user describes the app they want to build on top of the
  template ("quiero una app que...", "este proyecto va a ser...", "monta una aplicación de..."),
  or when the user asks in Spanish to arrancar el proyecto, iniciar el proyecto, renombrar el
  proyecto, quitar el ejemplo, personalizar el template, empezar de cero, or bootstrap.
  Covers renaming the placeholders, purging the example/demo code, deciding whether to keep the
  auth flow, scaffolding the real domains and wiring the rest of the local skills.
user-invocable: true
---

# Skill: Arrancar un proyecto nuevo desde el template

Este repositorio es un **cascarón** (template). No tiene dominio propio: lo que trae es la
arquitectura de [`ARCHITECTURE.md`](../../../ARCHITECTURE.md), la infraestructura HTTP/auth/i18n
y un dominio de ejemplo desechable.

Esta skill convierte el cascarón en la aplicación real que pide el usuario, en un solo paso.

---

## 1. Recopilar la información mínima

Antes de tocar nada, tener claro (preguntar solo lo que no se deduzca del prompt del usuario):

| Dato | Ejemplo | Si falta |
|---|---|---|
| **Nombre visible** | `Gestión de Expedientes` | Preguntar — es obligatorio |
| **Slug técnico** | `expedientes` | Derivarlo del nombre visible |
| **Qué hace la app** | "listar y editar expedientes" | Preguntar — es obligatorio |
| **Dominios/pantallas** | `expedient/`, `person/` | Proponerlos a partir de la funcionalidad |
| **¿Necesita login?** | sí / no | Asumir que **sí** (el template ya lo trae) |
| **URLs de API** | `https://api...` | Dejar el placeholder y registrar un TODO |

No bloquear el trabajo por las URLs de API: se arranca con MSW (`useMSW: true` en desarrollo).

---

## 2. Renombrar los placeholders

```bash
npm run rename -- "Nombre Visible"            # slug derivado automáticamente
npm run rename -- "Nombre Visible" --slug foo # slug explícito
```

Sustituye `App Template` → nombre visible y `app-template` → slug en `package.json`,
`angular.json`, `src/index.html`, `src/assets/i18n/es.json` y la documentación.

**Lo que el script NO hace y hay que rematar a mano:**

- Renombrar la **carpeta del repositorio** al slug (requiere cerrar el editor).
- Actualizar `src/environments/environment.ts|tst|prod.ts` con las URLs reales de API.
- Sustituir `src/assets/images/favicon.ico` y la paleta de `src/styles/base/_variables.scss`.
- Revisar las utilidades de `src/styles/ui/` (grid, layouts, textos): son una base genérica y
  básica (ver "Nota sobre el cascarón" en [`src/styles/README.md`](../../../src/styles/README.md)).
  Si la app adopta una librería de estilos o un design system propio, borrar las que dejen de
  usarse; si se siguen usando tal cual, no hace falta tocar nada.

---

## 3. Purgar el dominio de ejemplo

El ejemplo existe solo para enseñar el flujo `core/api → signal → template`. Una vez entendido,
**se borra entero** (no se deja "por si acaso"):

```
src/app/core/api/example/          → borrar carpeta
src/fake-backend/handlers/example/ → borrar carpeta + quitar el wiring de src/fake-backend/index.ts
src/app/pages/main/                → reconvertir en la primera pantalla real, o borrar y ajustar app.routes.ts
```

En `src/assets/i18n/es.json`: borrar el bloque `main.*` si desaparece la página, y las claves
`httpRequest.*.custom*` (son mensajes de demo del mock, no de la app real).

Los specs se van con su código (`example.service.spec.ts`, `main.component.spec.ts`): si se
reconvierte `main`, reescribir su spec. La cobertura exigida (80%) debe seguir cumpliéndose.

> Antes de borrar `pages/main/`, comprobar la ruta comodín de `src/app/app.routes.ts`
> (`{ path: '**', redirectTo: 'main' }`): debe apuntar a una ruta que exista.

---

## 4. Decidir el flujo de autenticación

El template trae login + guard + refresh token + interceptor. **Si la aplicación no lo necesita**,
se elimina completo — no se deja código muerto:

```
src/app/pages/login/                  src/app/core/guards/auth.guard.ts
src/app/core/api/login/               src/app/core/api/refresh-token/
src/app/core/services/auth.service.ts src/app/shared/models/auth.types.ts
src/fake-backend/handlers/login/      src/fake-backend/handlers/refresh-token/
```

…más el bloque de usuario de `shared/components/header/` (y con él `ngx-pipes`, que solo se usa
ahí para `ucfirst`: `npm uninstall ngx-pipes`), las claves `login.*` del i18n,
la parte de token de `core/interceptors/http.interceptor.ts` y las rutas afectadas.
Con ellos se van sus specs (`auth.service`, `auth.guard`, `login`, `refresh-token`), y hay que
quitar los casos de token/refresh de `http.interceptor.spec.ts` y de `header.component.spec.ts`.

Si **sí** la necesita: ajustar `fake-backend/handlers/login/mocks.ts` al contrato real del backend
y revisar los tipos de `core/api/login/login.types.ts`.

---

## 5. Ajustar el shell de UI y la base genérica

El template trae piezas propias y mínimas. Decidir cada una según la app (preguntar si no se deduce
del prompt, sobre todo si se va a usar una **librería de componentes**):

| Pieza | Qué hacer |
|---|---|
| `shared/components/header/` | Adaptar al header real o sustituir por el de la librería |
| `shared/components/footer/` | Está vacío: rellenarlo o borrarlo (+ `app.component.*`) si la app no tiene footer |
| `shared/components/global-loader/` | Mantener, o sustituir su template por el spinner de la librería (el `LoaderService` y el header `SHOW_LOADER` se quedan) |
| `src/styles/base/_globals.scss` | Ajustar los estilos de elementos (`body`, `h1`, `h2`…) a la tipografía del proyecto, o quitarlos si los pone la librería |
| `shared/utils/`, `shared/validations/`, `shared/pipes/` | Son la librería base: se mantienen. Borrar solo lo que una librería del proyecto duplique |

---

## 6. Montar el dominio real

Un dominio por *vertical slice* bajo `pages/{domain}/`, siguiendo §3 y §10 de `ARCHITECTURE.md`.
Para cada pieza, **cargar antes la skill correspondiente**:

| Pieza a crear | Skill |
|---|---|
| Servicio API + tipos + mock MSW | `@api-endpoint` |
| Toast de éxito en escrituras | `@success-notifications` |
| Cualquier texto visible | `@i18n` |
| Tests (cobertura mínima 80%) | `@testing` |
| Cualquier `// TODO` generado | `@track-todos` |

Orden recomendado: rutas y páginas vacías → capa API + mocks → formularios/tablas → estilos → tests.

---

## 7. Actualizar la documentación del repo

- **`README.md`**: sustituir la descripción de template por la de la aplicación real
  (qué hace, dominios, endpoints) y borrar las secciones "Arrancar un proyecto nuevo",
  "Placeholders del template" y "Mantener el template".
- **`.github/copilot-instructions.md`**: actualizar el título y la línea de dominios de la sección
  *Proyecto* con los dominios reales.
- **`ARCHITECTURE.md`**: **no se toca**. Es agnóstico de negocio y se mantiene como fuente de verdad.

---

## 8. Retirar el andamiaje del template

Lo que solo sirve para arrancar el proyecto **se borra** al terminar (esta skill incluida):

- `scripts/rename-project.mjs` (y `scripts/` si queda vacía) + el script `rename` de `package.json`.
- `.github/skills/new-project/` + su fila en `.github/skills/SKILLS.md`.
- `.claude/commands/new-project.md`.
- Toda referencia a `@new-project`, `/new-project` y `npm run rename` en `CLAUDE.md` (aviso inicial)
  y en `.github/copilot-instructions.md` (lista de skills, sección "Este repo es un template" y
  comandos).

---

## 9. Verificar antes de dar por hecho el arranque

```bash
npm run format
npm run lint
npm run test:ci  # falla si la cobertura baja del 80%
npx ng build
npm start        # comprobar que arranca con MSW y que no quedan rutas rotas
```

---

## Checklist final

- [ ] `npm run rename` ejecutado y carpeta del repo renombrada
- [ ] `environment.ts|tst|prod.ts` sin placeholders `api.example.com` (o TODO registrado)
- [ ] Dominio `example` borrado (API + handlers MSW + wiring + claves i18n)
- [ ] Auth conservado íntegro o eliminado íntegro — nunca a medias
- [ ] Shell de UI (header, footer, global-loader, `_globals.scss`) revisado
- [ ] Ruta `**` apuntando a una ruta existente
- [ ] Dominios reales creados como vertical slices, con sus mocks MSW
- [ ] Cero texto hardcodeado (todo por `@i18n`)
- [ ] `README.md` y `copilot-instructions.md` describen la app real; `ARCHITECTURE.md` intacto
- [ ] Andamiaje retirado: script `rename`, skill y comando `new-project`, referencias en docs
- [ ] Specs de referencia de `main`/`example` sustituidas por las de la app real
- [ ] `npm run format` + `npm run lint` + `npm run test:ci` + `npx ng build` en verde

## Regla de oro

> El template no se "adapta" dejando restos: lo que no forma parte de la aplicación real
> **se borra**. Un cascarón bien arrancado no contiene la palabra `example`.
