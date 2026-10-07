---
name: create-skill
description: Use when the user wants to create a new local skill for this project. Also use when the user asks in Spanish to crear una skill, añadir una skill, nueva skill, hacer una skill, or any task that involves packaging domain knowledge into a reusable Copilot skill file. Always sets user-invocable to true. After creating the skill, MUST update .github/skills/SKILLS.md with a new row for the skill.
user-invocable: true
---

# Skill: Crear una nueva skill local

## Cuándo usar esta skill

Cuando el usuario quiera empaquetar conocimiento de dominio, convenciones o patrones de este
proyecto en una skill reutilizable que Copilot pueda invocar automáticamente o explícitamente
con `@nombre-skill`.

---

## Estructura obligatoria de una skill

Cada skill vive en su propia carpeta dentro de `.github/skills/`:

```
.github/skills/
└── {nombre-skill}/
    └── SKILL.md
```

**Reglas de nombre de carpeta:**
- Kebab-case en inglés: `api-endpoint`, `success-notifications`, `create-skill`
- Sin prefijos redundantes: si el proyecto ya tiene contexto, no repetirlo en el nombre

---

## Frontmatter obligatorio

```yaml
---
name: {nombre-skill}
description: {descripción completa — ver sección abajo}
user-invocable: true
---
```

**`user-invocable: true` siempre** — nunca dejarlo en `false` en este proyecto.

### Cómo escribir la `description`

La `description` es lo más importante: Copilot la usa para decidir **si activar la skill
automáticamente**. Debe incluir:

1. **Descripción en inglés** de cuándo usar la skill (empezar con "Use when…")
2. **Palabras clave en español** que el usuario podría escribir (para auto-detección en conversaciones en español)
3. **Qué cubre** la skill (tecnologías, patrones, clases clave)

```yaml
description: Use when {scenario in English}. Also use when the user asks in Spanish to {palabras clave en español separadas por comas}. Covers {lista de lo que incluye la skill}.
```

Si la descripción es larga, usar el bloque `>` de YAML para multi-línea.

---

## Estructura interna del SKILL.md

Después del frontmatter, el contenido es Markdown libre. Sigue este esquema:

```markdown
# Skill: {Nombre legible}

## 1. Cuándo usar esta skill
Breve párrafo de contexto.

## 2. Patrón principal
Código de ejemplo completo y funcional. Nunca pseudocódigo.

## 3. Reglas clave
Lista de bullet points con las decisiones importantes.

## Checklist
- [ ] Punto obligatorio 1
- [ ] Punto obligatorio 2
```

**Principios de contenido:**
- **Código real**, no pseudocódigo ni placeholders genéricos — usar ejemplos del propio proyecto cuando sea posible
- **Conciso**: una skill larga que nadie lee vale menos que una corta y precisa
- **Sin repetir** lo que ya está en `copilot-instructions.md` o `ARCHITECTURE.md` — la skill añade
  detalle específico, no repite las instrucciones globales
- Comentarios en **inglés**, términos de dominio en **español** (misma convención que el proyecto)

---

## Proceso paso a paso para crear una skill

### Paso 1 — Entender qué cubre la skill

Antes de escribir, responder:
- ¿Qué tarea concreta hace el usuario cuando invoca esta skill?
- ¿Qué código/patrón produce? ¿Qué archivos genera o modifica?
- ¿Qué palabras en español usaría el usuario para pedirlo?

### Paso 2 — Crear el archivo

```
.github/skills/{nombre-skill}/SKILL.md
```

Con el frontmatter completo (`name`, `description`, `user-invocable: true`) y el contenido
siguiendo el esquema de la sección anterior.

### Paso 3 — Actualizar SKILLS.md ⚠️ OBLIGATORIO

Después de crear la skill, **siempre** añadir una nueva fila en `.github/skills/SKILLS.md`:

```markdown
| `{nombre-skill}` | `@{nombre-skill}` | {una línea: qué hace, qué genera, cuándo usarla} |
```

**Formato de la descripción en SKILLS.md:**
- Máximo una línea
- Mencionar qué archivos genera o qué utilidades usa si es relevante
- Sin puntos al final

### Paso 4 — Verificar

- [ ] Carpeta en `.github/skills/{nombre-skill}/`
- [ ] Archivo llamado exactamente `SKILL.md`
- [ ] Frontmatter con `name`, `description`, `user-invocable: true`
- [ ] `description` incluye palabras clave en español
- [ ] Contenido con código real del proyecto
- [ ] Fila añadida en `.github/skills/SKILLS.md`

---

## Ejemplo completo de skill mínima

```markdown
---
name: form-submit
description: Use when the user needs to validate and submit a reactive form. Also use when the user asks in Spanish to enviar un formulario, validar un formulario, guardar un formulario, scroll al primer error, or similar. Covers markAllControlsAsTouched, sleep and FormService.navigateToFormError with the early-return flow.
user-invocable: true
---

# Skill: Envío de formulario

## Cuándo usar

Cuando un componente con reactive form necesita validar antes de guardar y llevar al usuario al
primer error si el formulario no es válido.

## Patrón

```typescript
// Injections
private formService = inject(FormService);

public async handleSave(): Promise<void> {
  markAllControlsAsTouched(this.form);

  if (!this.form.valid) {
    await sleep(); // Let the UI render validation errors before scrolling
    this.formService.navigateToFormError();
    return;
  }

  await this.exampleService.createExample(this.form.value);
}
```

## Reglas clave
- `markAllControlsAsTouched` siempre antes de comprobar `valid`
- Early return si el formulario no es válido
- Mensajes de error con el pipe `errorMessage` (skill `@i18n`)
```
