---
name: i18n
description: >
  Use when adding, updating, or reviewing any user-visible text in this Angular project — labels, titles,
  placeholders, button texts, table column headers, modal titles/descriptions, or notification messages.
  Also use when the user asks in Spanish about traducciones, i18n, internacionalización, textos traducibles,
  claves de traducción, añadir texto, hardcoded text, cambiar un texto visible, etiquetas, títulos,
  mensajes de éxito, or any task that involves text shown to the user. Covers: key naming convention,
  JSON structure in src/assets/i18n/es.json, TranslatePipe in templates, translate.instant() in TypeScript,
  common.* for shared actions, and httpRequest.* tags for HTTP notifications.
user-invocable: true
---

# Skill: Traducciones (i18n)

## 1. Cuándo usar esta skill

Cada vez que se escribe texto visible al usuario — en un template HTML, en un array de configuración,
en un modal o en un mensaje de notificación — ese texto **debe** venir del fichero de traducciones,
nunca hardcodeado.

## 2. Fichero y estructura

Un único JSON por idioma: `src/assets/i18n/es.json`. Grupos de nivel raíz existentes:

| Grupo raíz | Contenido |
|---|---|
| `common` | Acciones comunes reutilizables (`cancel`, `accept`…) — **nunca duplicar por dominio** |
| `httpRequest` | Tags de notificaciones HTTP: `error.*`, `warning.*`, `success.*` (ver skill `@success-notifications`) |
| `form` | Mensajes de error de validación de formularios (`requiredError`, `maxLengthError`…) |
| `{domain}` | Un grupo por dominio/pantalla de `pages/` (`login`, `main`…) y por componente compartido (`globalLoader`) |

## 3. Convención de claves

```
{domain}.{component}.{grupo}.{clave}    ← forma completa
{domain}.{clave}                         ← cuando el dominio tiene una sola pantalla
```

- **camelCase** en todos los niveles — nunca kebab-case dentro del JSON.
- Grupos semánticos estándar cuando hay varios textos del mismo tipo: `tabs`, `columns`, `buttons`,
  `modal`, `notifications`, `steps`, `menu`, `header`, `filters`, `searcher`.
- Textos únicos sin grupo: `title`, `noResults`, `welcomeMessage`.
- Sufijos descriptivos consistentes: `usernameLabel` / `usernamePlaceholder`, `saveTitle` / `saveDescription`.
- No se traducen: valores de `id=`, rutas de API, nombres de enums, clases CSS.

```json
{
  "login": {
    "title": "Acceso",
    "usernameLabel": "Usuario",
    "usernamePlaceholder": "Introduce tu usuario",
    "submitButton": "Acceder"
  }
}
```

## 4. Uso en templates HTML

Importar `TranslatePipe` en `imports[]` del componente **solo si el template lo usa**:

```html
<h1>{{ 'login.title' | translate }}</h1>

<label for="login-input-username">{{ 'login.usernameLabel' | translate }}</label>
<input id="login-input-username" [placeholder]="'login.usernamePlaceholder' | translate" ... />

<button id="login-btn-submit" type="submit">{{ 'login.submitButton' | translate }}</button>
```

**Regla para atributos e inputs de componente**: binding `[placeholder]="'clave' | translate"`, no
interpolación `placeholder="{{ ... }}"` — la interpolación puede causar flicker con OnPush.

## 5. Uso en TypeScript

`TranslateService` inyectado **solo si hay `.instant()`**:

```typescript
// Injections
private translate = inject(TranslateService);

// Data — inject() resuelve antes que los inicializadores, así que esto es válido:
public tabsConfig: TabConfig[] = [
  { id: Tab.FIRST, label: this.translate.instant('main.tabs.first') },
];
```

- Si la config necesita un `TemplateRef` de `viewChild`, entonces es `computed()` (la señal es el
  viewChild, no la traducción).
- Textos construidos en métodos (confirmaciones, mensajes): `translate.instant()` directamente en el método.
- Interpolación de parámetros: `translate.instant('form.maxLengthError', { max: 200 })` y en el JSON
  `"Máximo {{max}} caracteres"`.

## Checklist

- [ ] Ningún texto visible hardcodeado en template ni en TS
- [ ] `TranslatePipe` en `imports[]` solo si el template lo usa
- [ ] `TranslateService` inyectado solo si hay `.instant()`
- [ ] Claves nuevas en `es.json` siguiendo `{domain}.{component}.{grupo}.{clave}` en camelCase
- [ ] Acciones comunes desde `common.*` (no duplicar por dominio)
- [ ] Tags de notificaciones HTTP bajo `httpRequest.*`
