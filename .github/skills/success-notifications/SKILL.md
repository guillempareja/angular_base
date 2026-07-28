---
name: success-notifications
description: Use when adding success, warning or loader HTTP headers to an API service call — via the HttpCustomHeader enum (CUSTOM_SUCCESS_MESSAGE, SHOW_DEFAULT_SUCCESS_MESSAGE, SHOW_LOADER). Also use when the user asks in Spanish to añadir mensaje de éxito, notificación de éxito, toast de éxito, mensaje al crear, mensaje al guardar, header de éxito, ocultar el loader, or any task involving a toast after an HTTP call. Covers the tag-based header mechanism resolved by HttpResponseHandlerService against httpRequest.* i18n keys, and the backend warning header.
user-invocable: true
---

# Skill: Notificaciones de éxito en llamadas API

## 1. Cuándo usar esta skill

Cuando un método de servicio en `core/api/` debe mostrar un toast al usuario tras completarse
(típicamente operaciones que crean, modifican o eliminan un registro).

El mecanismo: la llamada declara **headers HTTP especiales** (enum `HttpCustomHeader`, en
`shared/enums/http-custom-headers.enum.ts`). El interceptor global los recoge y delega en
`HttpResponseHandlerService`, que muestra el toast (ngx-toastr). **El componente nunca gestiona toasts.**

## 2. Los headers disponibles

| Header (`HttpCustomHeader`) | Valor | Efecto |
|---|---|---|
| `CUSTOM_SUCCESS_MESSAGE` | tag i18n (ej. `'customSuccess'`) | Toast de éxito con el texto de `httpRequest.success.{tag}` |
| `SHOW_DEFAULT_SUCCESS_MESSAGE` | `'true'` | Toast de éxito genérico (`httpRequest.success.default`) |
| `SHOW_LOADER` | `'false'` | La llamada NO muestra el loader global |
| `CUSTOM_WARNING_MESSAGE` | *(lo pone el backend en la response)* | Toast de warning con `httpRequest.warning.{tag}` |

**Importante**: el header lleva un **tag**, no un texto traducido — la traducción la resuelve
`HttpResponseHandlerService` contra el JSON de i18n. No inyectar `TranslateService` en el servicio API.

## 3. Patrones

### Éxito con mensaje custom

```typescript
// core/api/example/example.service.ts
import { HttpCustomHeader } from '@shared/enums/http-custom-headers.enum';

public updateExample(id: ExampleId, body: UpdateExampleRequest): Promise<UpdateExampleResponse> {
  return firstValueFrom(
    this.http.put<UpdateExampleResponse>(`/example/${id}`, body, {
      headers: {
        [HttpCustomHeader.CUSTOM_SUCCESS_MESSAGE]: 'updateExampleSuccess',
      },
    }),
  );
}
```

Y su clave en `src/assets/i18n/es.json`:

```json
{
  "httpRequest": {
    "success": {
      "updateExampleSuccess": "Los cambios se han guardado correctamente.",
      "default": "Operación realizada con éxito."
    }
  }
}
```

### Éxito con mensaje genérico

```typescript
headers: {
  [HttpCustomHeader.SHOW_DEFAULT_SUCCESS_MESSAGE]: 'true',
},
```

### Llamada silenciosa (sin loader global)

```typescript
headers: {
  [HttpCustomHeader.SHOW_LOADER]: 'false',
},
```

## 4. Reglas clave

- El tag debe existir como clave en `httpRequest.success.*` del JSON de i18n — añadirla siempre en pareja.
- Los textos respetan la concordancia de género de la entidad ("Buzón creado", "Solicitud creada").
- Los errores HTTP **no llevan header**: el interceptor los convierte en toast de error
  automáticamente (`httpRequest.error.*`); los componentes no capturan errores genéricos.
- `CUSTOM_WARNING_MESSAGE` lo emite el **backend** en la response; solo hay que asegurar que el tag
  exista en `httpRequest.warning.*`.

## Checklist

- [ ] Header añadido con `HttpCustomHeader` (nunca string mágico)
- [ ] El valor es un tag, no un texto traducido
- [ ] Clave `httpRequest.success.{tag}` añadida a `es.json`
- [ ] Texto con concordancia de género correcta
- [ ] El componente no muestra toasts ni captura errores genéricos
