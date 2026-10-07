---
name: api-endpoint
description: Use when creating a new API endpoint in this Angular project — a service method that calls the backend, its TypeScript types, and the corresponding fake-backend mock handler (MSW). Also use when the user asks in Spanish to crear un endpoint, añadir una llamada al backend, crear un servicio de API, crear los tipos de un endpoint, crear el mock, crear el handler de MSW, or any task related to connecting a new backend operation. Covers folder structure under core/api/, molecular type imports from shared/models/, naming conventions for request/response types, service with firstValueFrom and relative URLs, and fake-backend structure with handlers + mocks files.
user-invocable: true
---

# Skill: Crear un endpoint de API

## 1. Estructura de carpetas

La app consume **un único backend**: un folder por **familia de endpoint** (primer segmento de la URL).
Cada folder contiene exactamente dos ficheros:

```
core/api/
└── {familia}/
    ├── {familia}.service.ts
    └── {familia}.types.ts
```

**Regla de profundidad** — solo el primer segmento de URL crea carpeta:

- `GET /example` → `core/api/example/`
- `GET /example/document` → mismo `example/`, método nuevo (`getExampleDocument`)
- `POST /login` → `core/api/login/`
- ❌ `core/api/example/document/` — nunca un segundo nivel

## 2. Types (`{familia}.types.ts`)

```typescript
// core/api/example/example.types.ts
//----------------------------------------------------------------
// DOMAIN DATA TYPES
//----------------------------------------------------------------

export type ExampleId = number;

export type ExampleData = {
  example: string;
};

//----------------------------------------------------------------
// API REQUEST / RESPONSE TYPES
//----------------------------------------------------------------

// getExample
export type GetExampleResponse = ExampleData;

// createExample
export type CreateExampleRequest = ExampleData;
export type CreateExampleResponse = {
  message: string;
  id: ExampleId;
};
```

Reglas:

- **Tipado molecular**: antes de escribir `string`/`number`/`Date` a pelo, buscar un alias semántico
  en `@shared/models/` (ej. `Token` en `auth.types.ts`). Si el concepto es transversal y no existe,
  crearlo ahí; si es puntual, definirlo en el propio `{familia}.types.ts`.
- **Los nombres de tipos calcan el método**: `createExample` → `CreateExampleRequest` / `CreateExampleResponse`.
- Dos bloques con comentario-banner: tipos de dominio arriba, Request/Response abajo.
- `type` siempre, `interface` nunca. `import type` para imports solo de tipos.
- Un `types.ts` puede re-exportar átomos que sus consumidores necesiten (`export type { Token };`).

## 3. Service (`{familia}.service.ts`)

```typescript
// core/api/example/example.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { CreateExampleRequest, CreateExampleResponse, GetExampleResponse } from './example.types';

@Injectable({
  providedIn: 'root',
})
export class ExampleService {
  // Injections
  private http = inject(HttpClient);

  // Methods
  public getExample(): Promise<GetExampleResponse> {
    return firstValueFrom(this.http.get<GetExampleResponse>('/example'));
  }

  public createExample(body: CreateExampleRequest): Promise<CreateExampleResponse> {
    return firstValueFrom(this.http.post<CreateExampleResponse>('/example', body));
  }
}
```

Reglas:

- Siempre `firstValueFrom(this.http.METHOD<ResponseType>(...))` — la capa API devuelve `Promise`,
  nunca `Observable` (excepción única: `RefreshTokenService`, consumido por el interceptor).
- **URLs relativas** (`'/example'`): el interceptor (`core/interceptors/http.interceptor.ts`)
  antepone `environment.api` — nunca concatenar la base URL ni hardcodear `/api/...`.
- `@Injectable({ providedIn: 'root' })` siempre.
- **Métodos 100% en inglés**, aunque el segmento de URL esté en otro idioma.
- Si la operación debe mostrar toast de éxito → skill `@success-notifications`.
- Descargas de fichero: `responseType: 'blob'` y tipo de respuesta `Blob`.

## 4. Fake-backend (MSW) — espejo del endpoint

```
fake-backend/handlers/
└── {familia}/
    ├── handlers.ts               ← Interceptores http.get/post/put/delete de MSW
    ├── mocks.ts                  ← Datos mock estáticos
    └── index.ts                  ← export * from './handlers'; export * from './mocks';
```

### mocks.ts

```typescript
// fake-backend/handlers/example/mocks.ts
export const exampleGetMock = {
  example: 'Datos de ejemplo del backend',
};

export const examplePostMock = {
  message: 'Creado correctamente',
  id: 1,
};
```

- Objetos planos con datos realistas, **sin anotaciones de tipo** (se infieren) y sin lógica.
- Solo los campos que la UI necesita.

### handlers.ts

```typescript
// fake-backend/handlers/example/handlers.ts
import { http, HttpResponse } from 'msw';
import { sleep } from '@shared/utils/delay.utils';
import { exampleGetMock, examplePostMock } from './mocks';

export const exampleHandlers = [
  // GET /api/example
  http.get('/api/example', async () => {
    await sleep();
    return HttpResponse.json(exampleGetMock);
  }),

  // POST /api/example
  http.post('/api/example', async () => {
    await sleep();
    return HttpResponse.json(examplePostMock);
  }),

  // PUT /api/example/:id  (merge body → UI refleja lo enviado)
  http.put('/api/example/:id', async ({ request }) => {
    await sleep();
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ ...exampleGetMock, ...body });
  }),

  // DELETE /api/example/:id
  http.delete('/api/example/:id', async () => {
    await sleep();
    return new HttpResponse(null, { status: 204 });
  }),
];
```

- Las URLs llevan el prefijo `/api` (valor de `environment.api` en dev): MSW intercepta **después**
  de que el interceptor haya antepuesto la base.
- Lo más simples posible: interceptar y devolver el mock. `await sleep()` para simular latencia.
- Updates: `{ ...mock, ...body }`. Deletes: `204` sin body.
- **Orden**: rutas más específicas primero, las base con `/:id` al final (MSW machea de arriba a abajo).
- Utilidades para casos especiales en `fake-backend/utils/`: `getWarningHeaders(tag)`,
  `getDocumentHeaders(filename, mime)`, `generatePDF()`.

### Wiring

```typescript
// fake-backend/browser.ts — añadir al setupWorker
import { exampleHandlers } from './handlers/example';

export const worker = setupWorker(
  ...loginHandlers,
  ...refreshTokenHandlers,
  ...exampleHandlers,
);
```

```typescript
// fake-backend/index.ts — re-exportar la familia
export * from './handlers/example';
```

## 5. Flujo completo (siempre los 5 pasos)

1. `{familia}.types.ts` — tipos Request/Response
2. `{familia}.service.ts` — servicio con `firstValueFrom`
3. `mocks.ts` — datos mock
4. `handlers.ts` — interceptores MSW
5. Wiring — `handlers/{familia}/index.ts` + `browser.ts` + `fake-backend/index.ts`

## Checklist

- [ ] Carpeta `core/api/{familia}/` (un solo nivel; segmentos profundos = métodos)
- [ ] Tipos con átomos de `@shared/models/` cuando existan; `{Method}Request/Response`
- [ ] Servicio: `firstValueFrom`, URL relativa, `providedIn: 'root'`, métodos en inglés
- [ ] `fake-backend/handlers/{familia}/` con `handlers.ts` + `mocks.ts` + `index.ts`
- [ ] Handlers con prefijo `/api`, `await sleep()` en escrituras, específicos antes que `/:id`
- [ ] `browser.ts` y `fake-backend/index.ts` actualizados
