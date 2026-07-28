# CLAUDE.md — App Template

> **Este repositorio es un cascarón (template), no una aplicación.** La primera tarea sobre él es
> convertirlo en un proyecto real: ver [`.github/skills/new-project/SKILL.md`](.github/skills/new-project/SKILL.md)
> o el comando `/new-project`.

## Fuentes de verdad

| Documento | Contenido |
|---|---|
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Guía completa de arquitectura y forma de programar. Agnóstica de negocio — **no se modifica** al arrancar un proyecto |
| [`.github/copilot-instructions.md`](.github/copilot-instructions.md) | Resumen operativo de las reglas (mismo contenido, versión corta) |
| [`.github/skills/SKILLS.md`](.github/skills/SKILLS.md) | Skills locales del repo |
| [`README.md`](README.md) | Qué es el template, cómo arrancarlo y tabla de placeholders |

Ante cualquier duda de estructura, patrón o convención → `ARCHITECTURE.md`.

## Skills locales — cargar antes de generar código de ese tipo

`@new-project` (arrancar el proyecto) · `@api-endpoint` (endpoint + mock MSW) ·
`@success-notifications` (toasts de éxito) · `@i18n` (cualquier texto visible) ·
`@testing` (Jasmine + Karma) · `@track-todos` (registrar TODOs en `TODOS.md`) ·
`@create-skill` (crear una skill nueva).

Viven en [`.github/skills/`](.github/skills/); son válidas tanto para Claude Code como para Copilot.

## Reglas que más se incumplen

- `type` siempre, nunca `interface`; sin `any`.
- `inject()` + signals + `input()`/`output()`/`viewChild()`; `OnPush` siempre.
- Orden estricto de secciones en componentes (`// Injections` → `// ViewChilds` → `// Models` →
  `// Inputs` → `// Outputs` → `// Data` → `// Computeds` → `// Effects` → `// Methods`).
- `firstValueFrom` en la capa API + URL relativa; nunca `subscribe()` fuera de interceptores.
- Cero texto hardcodeado: todo por i18n (`| translate` / `translate.instant()`).
- Todo endpoint nuevo lleva su mock MSW espejo en `src/fake-backend/`.
- Código, comentarios y nombres de fichero en inglés; textos de usuario en español.

## Comandos

```bash
npm start                       # dev server con MSW (http://localhost:4200)
npm run start:tst               # dev server contra la API de test
npm run rename -- "Nombre App"  # sustituir los placeholders del template
npm run format                  # prettier + stylelint --fix (antes de commitear)
npm test                        # Jasmine + Karma
npx ng build                    # build de producción
```

Commits: conventional commits (`feat:`, `fix:`, `refactor:`…).
