---
name: track-todos
description: >
  Use when adding a TODO comment to the code or when a task is identified as pending during
  code generation. ALWAYS invoke this skill after writing any // TODO or <!-- TODO --> comment
  in any file. Also use when the user asks in Spanish to registrar un todo, apuntar una tarea
  pendiente, añadir al seguimiento, registrarlo en el fichero de todos, actualizar el TODOS.md,
  or any task that involves tracking a pending item. Covers the TODOS.md structure at the
  project root, section assignment rules, status icons, and the removal workflow when a TODO
  is resolved.
user-invocable: true
---

# Skill: Registrar TODOs en TODOS.md

## 1. Cuándo usar esta skill

**Siempre** que se escriba un comentario `// TODO` o `<!-- TODO -->` en cualquier archivo del
proyecto, o cuando se identifique una tarea pendiente durante la generación de código, hay que
actualizar `TODOS.md` en la raíz del proyecto (crearlo si no existe).

## 2. Archivo de seguimiento

**Ruta:** `TODOS.md` (raíz del proyecto). Secciones estándar — cada TODO va a la que le corresponde:

| Sección | Cuándo usar |
|---------|-------------|
| **1. Pendiente de Backend** | El TODO espera un endpoint, un contrato o un ID que aún no ha dado backend |
| **2. Funcionalidades pendientes** | Lógica de negocio sin implementar (navegar a, llamar endpoint, guardar datos) |
| **3. Fake Backend** | Un problema o mock pendiente en los handlers MSW de `src/fake-backend/` |
| **4. Otros** | Cualquier pendiente que no encaje arriba (crear nueva sección si se repite el tema) |

> **SCSS — regla de exclusión:** un `// TODO` en un `.scss` que solo contiene un selector vacío
> **no se registra**. Solo se registran TODOs de SCSS con descripción concreta del estilo que falta.

## 3. Formato de entrada en la tabla

```
| ⏳ | [fichero.ts](ruta/relativa/al/archivo.ts#Lnnn) | Descripción literal del TODO |
```

- **Estado:** `⏳` pendiente, `🚫` bloqueado por terceros.
- **Enlace:** ruta relativa desde la raíz con número de línea `#Lnnn`. Nunca rutas absolutas.
- **Descripción:** copiar literalmente el texto del TODO, sin el prefijo "TODO:".

## 4. Pasos obligatorios después de escribir un TODO

1. Identificar la sección de `TODOS.md` que le corresponde.
2. Añadir la fila con el formato de la sección 3.
3. Si el TODO necesita contexto ("cuando backend publique X"), incluirlo en la descripción.

## 5. Cuando un TODO se resuelve

`TODOS.md` solo contiene **pendientes reales** — nunca se marcan filas como completadas:

1. **Eliminar la fila completa** de la tabla.
2. Eliminar el comentario `// TODO` del código (si no lo ha hecho ya el usuario).
3. Si una sección queda vacía, eliminar también la sección.

Si se edita el texto de un TODO sin resolverlo, actualizar la descripción de la fila para que
coincida. Nunca dejar filas apuntando a líneas que ya no existen.

## Regla de oro

> Si generas un `// TODO` en el código y no actualizas `TODOS.md`, el TODO queda huérfano.
> **Siempre actualiza `TODOS.md`.**
