# Skills locales — Resumen

> Solo se listan las skills creadas en este repositorio.

| Skill | Invocación | Para qué sirve |
|---|---|---|
| `new-project` | `@new-project` | Convertir este template en una aplicación real: renombrar placeholders, purgar el dominio de ejemplo, decidir el flujo de auth y montar los dominios reales |
| `api-endpoint` | `@api-endpoint` | Crear un endpoint: servicio en `core/api/{familia}/`, tipos Request/Response y mock handler MSW en `fake-backend/` con su wiring |
| `success-notifications` | `@success-notifications` | Añadir headers `HttpCustomHeader` (éxito custom, éxito por defecto, ocultar loader) a métodos de servicio API y sus tags en `httpRequest.*` del i18n |
| `i18n` | `@i18n` | Añadir, actualizar o revisar cualquier texto visible al usuario: convención de claves `{domain}.{component}.{grupo}.{clave}` en camelCase, `TranslatePipe` en templates, `translate.instant()` en TS, `common.*` para acciones comunes |
| `testing` | `@testing` | Escribir tests unitarios con Jasmine + Karma: setup de `TestBed`, mocks con `jasmine.createSpyObj`, signals e inputs, organización de describes, cobertura mínima del 80% |
| `track-todos` | `@track-todos` | Registrar cualquier TODO generado en el código dentro de `TODOS.md` (raíz del proyecto): asignación de sección, formato de tabla y eliminación de la fila al resolverse |
| `create-skill` | `@create-skill` | Crear una nueva skill local siguiendo las convenciones del proyecto y actualizar este fichero `SKILLS.md` |
