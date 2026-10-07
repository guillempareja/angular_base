# Guía de arquitectura y forma de programar — Frontend Angular

> Documento **agnóstico de negocio**: describe cómo estructuramos, organizamos y escribimos el código
> en nuestros proyectos frontend, para poder replicarlo en cualquier proyecto nuevo.
> No contiene lógica de dominio. Los ejemplos usan entidades genéricas (`Entity`, `EntityA`, `EntityB`)
> solo como ilustración.
>
> La aplicación se describe como una **aplicación Angular única (monolito)**. Los nombres de librerías
> concretas (design system, utilidades corporativas) son intercambiables: cada proyecto usará las suyas.

---

## 1. Filosofía general

Principios que gobiernan todas las demás decisiones:

1. **Screaming architecture**: la estructura de carpetas grita el dominio, no el framework.
   `pages/person/`, `pages/expedient/`… son *vertical slices*: cada dominio contiene sus pantallas,
   componentes, servicios, enums y utilidades.
2. **Los ficheros viven en el nivel más bajo posible.** Un componente/servicio/util nace dentro de la
   pantalla que lo usa. Solo "sube" (a la carpeta del dominio, o a `shared/`) cuando aparece un
   **segundo consumidor real**. `shared/` no es un cajón de sastre: si solo lo usa un dominio, se queda en ese dominio.
3. **Componentes tontos, lógica en servicios.** Los componentes orquestan y pintan; el estado
   compartido y la lógica de negocio viven en servicios. Los componentes "padre" de sub-pantallas no
   contienen lógica de sus hijos.
4. **Extraer funciones utilitarias a la mínima.** Cualquier transformación reutilizable (formateo,
   mapeo, ordenación, validación) se saca a un `*.utils.ts`, un pipe o un validator — nunca se
   duplica ni se deja inline en el componente. Para transformaciones de presentación en template se
   prefieren **pipes** sobre métodos helper en el componente.
5. **Reutilización de componentes**: un formulario que se usa en alta y en modificación es **un solo
   componente** parametrizado con `input`/`output`; nunca dos copias.
6. **Todo tipado, todo explícito**: TypeScript `strict`, sin `any` (usar `unknown` + type guard),
   tipos "moleculares" compartidos, visibilidad explícita en cada miembro.
7. **Angular moderno**: standalone components, signals (`signal`/`computed`/`effect`),
   `inject()`, `input()`/`output()`/`viewChild()`/`model()`, control flow `@if`/`@for`/`@switch`,
   `ChangeDetectionStrategy.OnPush` siempre.
8. **async/await sobre RxJS**: las llamadas HTTP se convierten a promesas con `firstValueFrom`.
   Nada de `subscribe()` manual ni cadenas de operadores salvo en interceptores.

---

## 2. Stack técnico

| Pieza | Elección |
|---|---|
| Framework | Angular 20+ (standalone, signals) |
| Gestión de paquetes | npm |
| Tooling | Angular CLI (`ng serve`, `ng build`, `ng test`) |
| Tests | Karma + Jasmine (cobertura mínima 80%) |
| Mock backend local | MSW (Mock Service Worker) en `src/fake-backend/` |
| i18n | @ngx-translate (JSON único por idioma en `assets/i18n/`) |
| Notificaciones | ngx-toastr (toasts disparados desde el interceptor HTTP, ver §7) |
| Formato/calidad | Prettier + ESLint + Stylelint (conventional commits como convención) |
| Estilos | SCSS propio en `src/styles/` (variables, mixins, funciones y clases globales, ver §13) |

Scripts estándar en `package.json`: `start`, `start:tst`, `build`, `watch`, `test`, `test:ci`, `lint`, `format`.

---

## 3. Estructura de carpetas

```
src/
├── app/
│   ├── app.component.*            ← Shell de la app
│   ├── app.config.ts              ← Providers (router, http+interceptores, i18n, toastr)
│   ├── app.routes.ts              ← Rutas raíz, lazy loading por dominio
│   ├── core/                      ← Infraestructura Angular (sin UI)
│   │   ├── api/                   ← Servicios HTTP + tipos, por familia de endpoint (ver §5)
│   │   ├── guards/                ← Guards de ruta (AuthGuard)
│   │   ├── interceptors/          ← Interceptores HTTP (ver §7)
│   │   └── services/              ← Servicios de infraestructura (auth, loader, respuesta HTTP)
│   ├── pages/                     ← Dominios de negocio (vertical slices)
│   │   ├── login/
│   │   └── main/
│   └── shared/                    ← Reutilizables entre 2+ dominios
│       ├── components/            ← Componentes UI compartidos (header, footer, global-loader)
│       ├── constants/             ← Constantes (opciones de radio, dropdowns estáticos…)
│       ├── directives/
│       ├── enums/                 ← Enums transversales (HttpCustomHeader…)
│       ├── models/                ← Tipos "moleculares"/átomos de dominio (ver §6)
│       ├── pipes/                 ← Pipes de presentación (isInvalidControl, errorMessage…)
│       ├── services/              ← Servicios transversales (form…)
│       ├── utils/                 ← Funciones puras (*.utils.ts)
│       └── validations/           ← Validators de formulario reutilizables
├── assets/
│   ├── i18n/                      ← JSON de traducciones (uno por idioma)
│   └── images/
├── environments/                  ← environment.ts (dev+MSW) + environment.tst.ts + environment.prod.ts
├── styles/                        ← Sistema de estilos global SCSS (ver §13)
└── fake-backend/                  ← Mocks MSW (espejo de core/api, ver §8) — SOLO desarrollo
    ├── enable-mocking.ts          ← Arranca el worker si `environment.useMSW` (llamado desde main.ts)
    ├── enable-mocking.noop.ts     ← Sustituto vacío para tst/producción (fileReplacements)
    ├── index.ts                   ← Entry point: re-exporta worker y handlers
    ├── browser.ts                 ← setupWorker con todos los handlers
    ├── utils/                     ← Utilidades de mock (headers, generador de documentos)
    └── handlers/
```

### Estructura interna de un dominio (`pages/{domain}/`)

Cada dominio se organiza por **pantallas**, y cada pantalla por sub-componentes:

```
pages/{domain}/
├── {domain}.routes.ts             ← Rutas lazy del dominio
├── {screen}/                      ← Una carpeta por pantalla (list/, detail/, registration/…)
│   ├── {screen}.component.{ts,html,scss}
│   ├── components/                ← Sub-componentes propios de la pantalla
│   ├── enums/
│   └── services/                  ← Estado propio de la pantalla
├── components/                    ← Componentes compartidos entre pantallas DEL dominio
├── utils/                         ← Utils propios del dominio
└── services/                      ← Servicios propios del dominio
```

### Reglas de carpetas

- **Sin prefijos redundantes**: `pages/{domain}/components/form/`, no `{domain}-form/` (la ruta ya lo dice).
- **Profundidad controlada** en `core/api`: máximo primer segmento de URL (ver §5).
- Cada componente = su propia carpeta con `.ts` + `.html` + `.scss` (+ `.spec.ts`).
- Los sub-componentes de un componente van en `components/` dentro de su carpeta (anidamiento recursivo).
- Cada pantalla/feature puede tener sus propios `enums/`, `services/`, `utils/` locales.

### Alias de imports (tsconfig `paths`)

```json
"paths": {
  "@core/*":   ["src/app/core/*"],
  "@shared/*": ["src/app/shared/*"],
  "@pages/*":  ["src/app/pages/*"]
}
```

### Orden de imports en cada fichero

1. Angular core
2. Terceros
3. Alias `@core/`, `@shared/`, `@pages/`
4. Relativos (`./example.types`)

---

## 4. Nomenclatura de ficheros

```
*.component.ts / .html / .scss / .spec.ts
*.service.ts
*.types.ts        ← tipos (NUNCA .model.ts ni .interface.ts)
*.enum.ts
*.pipe.ts
*.directive.ts
*.utils.ts
*.validators.ts
*.routes.ts
*.constants.ts
```

- Ficheros y carpetas en **kebab-case**.
- **Código, comentarios y nombres de fichero en inglés.** Los **términos de dominio** se mantienen
  en el idioma del negocio (ej. campos que vienen del backend en el idioma propio de cada proyecto).
- Las URL de rutas de la app pueden ir en idioma de negocio (`/listado`, `/registro`) porque son visibles al usuario.

---

## 5. Capa de API (`core/api/`)

La app consume **un único backend** (no hay nivel de microservicio): un folder por **familia de
endpoint** (primer segmento de la URL). Cada folder contiene exactamente dos ficheros:
`{familia}.service.ts` y `{familia}.types.ts`.

```
core/api/
├── example/
│   ├── example.service.ts         ← Endpoints bajo /example
│   └── example.types.ts
├── login/
│   ├── login.service.ts           ← POST /login
│   └── login.types.ts
└── refresh-token/
    ├── refresh-token.service.ts   ← POST /refreshToken
    └── refresh-token.types.ts
```

**Regla de profundidad**: solo el primer segmento de URL crea carpeta. Segmentos más profundos
(`/example/document`) van como **otro método en el mismo servicio**, nunca como carpeta nueva.

- `GET /example` → `core/api/example/`
- `GET /example/document` → mismo `example/`, método nuevo (`getExampleDocument`)
- `POST /login` → `core/api/login/`

### Servicio API — plantilla

```typescript
@Injectable({ providedIn: 'root' })
export class ExampleService {
  // Injections
  private http = inject(HttpClient);

  // Methods
  public getExample(): Promise<GetExampleResponse> {
    return firstValueFrom(this.http.get<GetExampleResponse>('/example'));
  }

  public updateExample(id: ExampleId, body: UpdateExampleRequest): Promise<UpdateExampleResponse> {
    return firstValueFrom(this.http.put<UpdateExampleResponse>(`/example/${id}`, body));
  }
}
```

Reglas:

- **Siempre `firstValueFrom(this.http.METHOD<ResponseType>(...))`** — la capa API devuelve `Promise`, nunca `Observable`.
  Excepción única: `RefreshTokenService.refreshToken()` devuelve `Observable` porque se consume
  dentro del pipeline de reintento del interceptor HTTP (ver §7).
- **URLs relativas** (`'/example'`): el interceptor HTTP antepone `environment.api` a toda request
  (ver §7) — los servicios **nunca** concatenan la base URL ni hardcodean `/api/...`.
  Hay un `environment.{env}.ts` por entorno (`environment.ts` dev+MSW, `tst`, `prod`) con `api` y `useMSW`.
- `@Injectable({ providedIn: 'root' })` siempre.
- **Nombres de método 100% en inglés** aunque la carpeta refleje un segmento de URL en otro idioma
  (la carpeta es un artefacto de URL; el método es código): `searchEntities()`, no un verbo traducido literalmente.
- **Los nombres de tipos calcan el nombre del método**: `updateExample` → `UpdateExampleRequest` / `UpdateExampleResponse`.

### Tipos API — plantilla (`{familia}.types.ts`)

```typescript
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

- Dos bloques separados por comentario-banner: tipos de dominio arriba, Request/Response abajo.
- Los Request/Response suelen ser **alias o derivados** (`Omit`, `Pick`, `Partial`) de los tipos de dominio.

### Notificaciones de éxito en escrituras

Las operaciones que deben mostrar un toast de éxito lo declaran con **headers HTTP especiales**
(enum `HttpCustomHeader`, en `shared/enums/`) que el interceptor global recoge y convierte en
notificación — el componente no gestiona toasts:

```typescript
public updateExample(id: ExampleId, body: UpdateExampleRequest): Promise<UpdateExampleResponse> {
  return firstValueFrom(
    this.http.put<UpdateExampleResponse>(`/example/${id}`, body, {
      headers: {
        [HttpCustomHeader.CUSTOM_SUCCESS_MESSAGE]: 'updateExampleSuccess', // tag i18n, no texto
      },
    }),
  );
}
```

- El header lleva un **tag** (no texto traducido): el `HttpResponseHandlerService` lo resuelve
  contra la clave `httpRequest.success.{tag}` del JSON de i18n.
- Para el mensaje genérico ("Operación realizada con éxito") basta con
  `[HttpCustomHeader.SHOW_DEFAULT_SUCCESS_MESSAGE]: 'true'`.
- El backend puede devolver avisos con el header `Back-Custom-Warning-Message` (tag resuelto contra
  `httpRequest.warning.{tag}`); el interceptor los convierte en toast de warning.
- Para llamadas que no deben mostrar el loader global: `[HttpCustomHeader.SHOW_LOADER]: 'false'`.

---

## 6. Modelos moleculares (`shared/models/`)

Los tipos se construyen de forma **molecular**: primero alias atómicos con significado de dominio,
luego se componen en tipos mayores.

```typescript
// shared/models/auth.types.ts — átomo
export type Token = string;

// core/api/login/login.types.ts — molécula
export type LoginResponse = {
  username: string;
  token: Token;
  refreshToken: Token;
};
```

Reglas:

- **Nunca escribir `string`/`number`/`Date` a pelo** en un tipo de API si existe (o puede existir)
  un alias semántico en `shared/models/`. Antes de crear un campo, buscar en `shared/models/` un tipo
  equivalente; si no existe y el concepto es transversal, crearlo ahí; si es puntual, definirlo inline.
- Los ficheros de `shared/models/` se agrupan por **área conceptual** (una entidad o concepto de
  dominio por fichero), no por pantalla.
- `type` **siempre**, `interface` **nunca** (para datos). `interface` solo para contratos
  (lifecycle hooks de Angular, contratos de servicio).
- `import type { ... }` para imports que son solo tipos.
- Un `types.ts` puede **re-exportar** átomos que sus consumidores necesiten
  (`export type { Token };`) para que el consumidor importe de un solo sitio.

---

## 7. Capa HTTP transversal (interceptor)

Los interceptores son **funcionales** (`HttpInterceptorFn`) y se registran en `app.config.ts`
con `provideHttpClient(withInterceptors([...]), withFetch())`. La idea: **simplificar cada llamada
individual** resolviendo transversalmente lo que de otro modo habría que repetir en cada servicio.

El proyecto tiene un único interceptor, **`customHttpInterceptor`**
(`core/interceptors/http.interceptor.ts`), que concentra toda la lógica transversal:

- **Base URL**: antepone `environment.api` a toda request (por eso los servicios de `core/api/`
  usan URLs relativas, ver §5). Se salta los ficheros de `assets/i18n/`.
- **Auth**: añade `Authorization: Bearer {token}` si hay sesión (`AuthService.userData()`).
- **Loader global**: muestra/oculta el `LoaderService` en cada request, salvo que la llamada
  lleve el header `SHOW_LOADER: 'false'`.
- **Refresh token**: ante un `401` (que no sea de `/login` ni `/refreshToken`) refresca el token
  y reintenta la request; si el refresh falla, expira la sesión (`logout` + aviso).
- **Notificaciones**: convierte en toasts (vía `HttpResponseHandlerService` + ngx-toastr) los
  headers de éxito/warning (ver §5) y los errores HTTP, de forma centralizada. Los componentes
  **no** gestionan notificaciones ni errores HTTP genéricos.

Guards: `AuthGuard` (`core/guards/`) protege las rutas privadas comprobando la sesión.

---

## 8. Fake backend (MSW) — `src/fake-backend/`

Todo endpoint real tiene su **mock espejo** para desarrollo local (activado con `environment.useMSW`).
La estructura replica `core/api/`:

```
fake-backend/
├── index.ts                       ← Entry point: re-exporta worker + handlers
├── browser.ts                     ← setupWorker(...) con los handlers de todas las familias
├── utils/                         ← Utilidades de mock (getWarningHeaders, getDocumentHeaders, generatePDF…)
└── handlers/
    └── {familia}/                 ← Espejo de core/api/{familia}
        ├── handlers.ts            ← Interceptores http.get/post/put/delete de MSW
        ├── mocks.ts               ← Datos mock estáticos
        └── index.ts               ← Re-exporta handlers + mocks
```

Las URLs de los handlers llevan el prefijo del entorno de desarrollo (`/api/{familia}`), porque MSW
intercepta la request **después** de que el interceptor haya antepuesto `environment.api`.

Reglas:

- **mocks.ts**: objetos planos con datos realistas, sin lógica ni anotaciones de tipo (se infieren).
  Solo los campos que la UI necesita.
- **handlers.ts**: lo más simples posible — interceptar y devolver el mock. `await sleep()` en
  escrituras para simular latencia. En updates, devolver `{ ...mock, ...body }` para que la UI
  refleje lo enviado. En deletes, `204` sin body.
- **Orden de registro**: rutas más específicas primero, las base con `/:id` al final
  (MSW machea de arriba a abajo).
- `browser.ts` combina los handlers de todas las familias en un `setupWorker`; el worker solo se
  arranca cuando `environment.useMSW` es `true`.
- **MSW es solo de desarrollo y nunca llega a tst/producción**: en esas configuraciones
  `angular.json` sustituye `enable-mocking.ts` por `enable-mocking.noop.ts` (el código de MSW no
  entra en el bundle) y `mockServiceWorker.js` solo se copia como asset en `development`.
  `main.ts` nunca importa nada de `fake-backend/` salvo `enable-mocking`.

**Flujo al crear un endpoint nuevo** (siempre los 5 pasos):
types → service → mocks → handlers → wiring de los `index.ts`.

---

## 9. Anatomía de un componente

### Decorador

```typescript
@Component({
  selector: 'app-example',
  imports: [/* solo lo que usa el template */],
  templateUrl: './example.component.html',
  styleUrl: './example.component.scss',          // singular, nunca styleUrls
  changeDetection: ChangeDetectionStrategy.OnPush, // SIEMPRE
})
export default class ExampleComponent implements OnInit { ... }
```

- Sin `standalone: true` (es el default).
- Los componentes de página se exportan `default` (facilita el `loadComponent` lazy).
- **Nunca importar en `imports[]` un pipe/componente que el template no use.**

### Orden de secciones — ESTRICTO, con comentarios separadores

```typescript
export class ExampleComponent {
  // Injections
  private fb = inject(FormBuilder);              // inject() SIEMPRE, nunca constructor
  public entityService = inject(EntityService);  // public solo si el template lo usa

  // ViewChilds
  private sectionRef = viewChild<SectionComponent>('sectionRef');

  // Models
  public value = model<string>('');

  // Inputs
  public data = input.required<EntityData>();
  public readonly = input<boolean>(false);

  // Outputs
  public save = output<EntityData>();
  public cancel = output<void>();

  // Data
  public form!: FormGroup;
  public items = signal<Item[]>([]);
  public isLoaded = signal<boolean>(false);

  // Computeds
  public hasItems = computed(() => this.items().length > 0);

  // Effects
  private resetFormOnDataChange = effect(() => { ... }); // siempre private; nombre descriptivo, sin sufijo "effect"

  // Methods
  public ngOnInit(): void { ... }                // lifecycle primero
  private loadData(): Promise<void> { ... }      // privados primero…
  public handleSave(): Promise<void> { ... }     // …luego públicos
}
```

Reglas transversales:

- **Visibilidad explícita** en todos los miembros: `private` por defecto; `public` solo cuando el
  template (u otro componente vía viewChild) lo necesita.
- **Signals para todo estado reactivo.** Nunca mutar el contenido de un signal
  (`items().push(x)` ❌) — siempre `set`/`update` con referencia nueva.
- **`computed` para todo valor derivado** — nunca calcular en el template ni cachear a mano.
- Sin `EventEmitter`/`@Input`/`@Output`/`@ViewChild` (APIs antiguas).
- **Early returns**, cero `if/else` anidados. Llaves siempre en `if`/`for`/`while`.
- No poner `await` en la última llamada de una función `void` (dispararla y salir).
- Booleans con prefijo `is/has/should`; arrays en plural; funciones verbo+sustantivo
  (`loadData`, `handleSave`, `confirmDelete`, `navToDetail`, `navBack`).
- Los handlers de UI se llaman `handle{Acción}`; la navegación `navTo{Destino}` / `navBack`.
- Constantes verdaderas en `ALL_CAPS`; enums en `PascalCase`; nada de magic strings/numbers → enum o constante.
- **Comentarios**: explican el *porqué*, no el qué. En inglés. Se usan para separar bloques lógicos.

### Datos asíncronos en componentes

- Llamadas múltiples independientes → **`Promise.all`** (fail-fast; el caso normal).
  Solo `Promise.allSettled` cuando cada bloque puede fallar por separado y quiere mostrarse parcial.
- Nunca llamadas secuenciales encadenadas si pueden ir en paralelo.
- Patrón carga: signal de datos + signal `isLoaded` separado. En el template se condiciona con
  `@if (isLoaded())`, **nunca** con `@if (data())` (si el backend devuelve `null` legítimo, la
  pantalla no renderizaría jamás).

---

## 10. Formularios

- Reactive forms (`FormBuilder`) construidos en un método privado `buildForm()`; en modo edición,
  `patchValue(...)` en `ngOnInit`.
- Un formulario que se usa en 2+ pantallas (alta + modificación) es **un solo componente**
  parametrizado con `data = input<FormData | null>(null)` + outputs `save`/`cancel`. No llama a la
  API: emite, y la pantalla padre decide POST o PUT.
- Estado de error en template con los pipes compartidos: `[class.is-invalid]="form | isInvalidControl: 'field'"`
  y `{{ form.get('field')! | errorMessage }}` (resuelve los `translationTag` de los validators vía i18n).
- **Flujo de guardado canónico** (ver `pages/login/`):
  1. `markAllControlsAsTouched(form)` (`shared/utils/form.utils.ts`)
  2. Si inválido → `await sleep()` (deja pintar los errores) → `formService.navigateToFormError()`
     (scroll al primer error + toast) → return
  3. Emitir `save` / llamar a la API

---

## 11. Routing

- `app.routes.ts` define un path por dominio con `loadChildren` lazy hacia el `{domain}.routes.ts`
  del dominio; cada pantalla se carga con `loadComponent` lazy. Un dominio de **una sola pantalla**
  (como `login` o `main`) puede cargarse directamente con `loadComponent` desde `app.routes.ts`.
- Rutas privadas con `canActivate: [AuthGuard]`; la ruta comodín `**` redirige siempre a una ruta existente.
- Rutas hijas para variantes de una entidad: `:id` → detalle, `:id/accion-x` → pantallas de acción.
- Estado efímero entre pantallas → `history.state`, no query params.

---

## 12. i18n

- **Cero texto visible hardcodeado** — todo por `| translate` (template) o `translate.instant()` (TS).
- Un único JSON por idioma en `assets/i18n/`.
- **Convención de claves**: `{domain}.{component}.{grupo}.{clave}` en camelCase. Si el dominio tiene
  una sola pantalla, `{domain}.{clave}` (`login.title`); los componentes de `shared/` usan su nombre
  como raíz (`globalLoader.loading`).
  Grupos raíz transversales: `common`, `app`, `httpRequest` (tags de toasts), `form` (errores de validación).
  Grupos semánticos estándar: `tabs`, `columns`, `buttons`, `modal`, `notifications`, `steps`,
  `menu`, `header`, `filters`, `searcher`. Textos únicos sin grupo: `title`, `noResults`.
- **`common.*`** para acciones comunes (`cancel`, `accept`, `logout`…) — nunca duplicar
  "Cancelar" por dominio.
- En template: binding `[placeholder]="'clave' | translate"`, no interpolación `placeholder="{{...}}"` (flicker con OnPush).
- En TS: arrays de configuración (tabs, columnas) se inicializan en el cuerpo de la clase con
  `this.translate.instant()` (funciona porque `inject()` resuelve antes que los inicializadores).
  Si la config de tabla necesita un `TemplateRef` de `viewChild`, entonces es `computed()`.
- `TranslatePipe` en `imports[]` solo si el template lo usa; `TranslateService` inyectado solo si hay `.instant()`.

---

## 13. Estilos (SCSS)

No hay librería de estilos externa: el sistema de estilos es propio y vive en `src/styles/`.
**Guía completa (estructura, variables, `ui/`, `utils/`, cómo estila un componente):**
[`src/styles/README.md`](src/styles/README.md).

Reglas que no se incumplen:

- Estilos **encapsulados por componente** por defecto (`Emulated`, scopa con `:host`); solo sube a
  `src/styles/` lo transversal con un 2º consumidor real. No se usa `ViewEncapsulation.None`.
- Todo SCSS de componente empieza con `@use 'imports' as *;` (la fachada que expone variables y utils;
  funciona por `includePaths: ["src/styles"]` en `angular.json`).
- **Variables y mixins siempre**, nunca valores hardcodeados ni estilos inline:
  `$spacing-md`, `$color-primary-500`, `rem(24)`, `@include breakpoint('tablet')`…
  La única fuente de verdad del diseño es `base/_variables.scss`.
- Las **clases globales de UI** (`grid-template` + `col-*`, `field-group`, `buttons-group`,
  `clamped-text`) se **usan pero jamás se redefinen** en los SCSS de componentes.
- **Stylelint** (`stylelint-config-standard-scss` + prettier) valida todo `.scss`; `npm run format`
  formatea y aplica fixes.


---

## 14. IDs de elementos HTML — OBLIGATORIO

Todo elemento **interactuable** lleva `id` con el patrón:

```
{domain}-{component}-{type}-{element}
```

- `domain` = carpeta bajo `pages/`; `component` = carpeta del componente; `type` = tipo de control
  (`input`, `dropdown`, `datepicker`, `radio`, `checkbox`, `btn`, `accordion`, `tabs`, `table`,
  `searcher`, `textarea`, `stepper`…); `element` = nombre en inglés del campo/acción.
- kebab-case, todo en inglés. Sin `id` en elementos de solo lectura (`<p>`, `<h1>`, contenedores de info).
- Formas cortas: pantalla única de un dominio → `{domain}-{type}-{element}` (`login-input-username`);
  componente de `shared/` → `{component}-{type}-{element}` (`header-btn-logout`).

```html
<input  id="{domain}-{component}-input-fieldName" ... />
<button id="{domain}-form-btn-save" ...></button>
<table  id="{domain}-list-table-results" ...></table>
```

Las claves i18n espejan este mismo patrón (§12). Los `<label for>` apuntan a estos `id`.

---

## 15. Pipes, utils y validators compartidos

- **Pipes** (en `shared/pipes/`): `isInvalidControl` (estado inválido de un control) y
  `errorMessage` (traduce el primer error de un control). Las transformaciones de presentación van
  en pipes — **prohibido crear métodos `xxxText()` en componentes**.
- **Utils puros** (en `shared/utils/` o `{domain}/utils/`): un fichero por tema
  (`dates.utils.ts`, `form.utils.ts`, `objects.utils.ts`, `delay.utils.ts`). Funciones exportadas
  puras y testeables. Cualquier lógica repetida dos veces se extrae aquí.
- **Validators** reutilizables en `shared/validations/` (`common.validators.ts`, `date.validators.ts`):
  `numericValidator`, `exactLengthValidator(n)`, `dateNotAfterTodayValidator`… Devuelven
  `{ translationTag, interpolationParams? }` para que `errorMessage` los traduzca.
- **Servicios compartidos** en `shared/services/`: `FormService` (scroll al primer error).
- **Constantes de opciones estáticas** (radios sí/no, etc.) en `shared/constants/`.

---

## 16. Testing (Jasmine + Karma)

- Specs `.spec.ts` junto al fichero que prueban. **Cobertura mínima 80%** en statements/
  branches/functions/lines, **exigida**: `ng test` corre siempre con cobertura y falla por debajo
  del umbral (`check.global` en `karma.conf.js`; exclusiones en `codeCoverageExclude` de
  `angular.json`: fake-backend, environments, enums y constants).
- **Todo fichero con lógica nace con su spec** (componentes, servicios, guards, interceptores,
  pipes, utils, validators). `npm run test:ci` (una pasada, Chrome headless) antes de subir.
  Specs de referencia: `pages/main/main.component.spec.ts` (componente),
  `core/interceptors/http.interceptor.spec.ts` (HTTP) y `shared/utils/form.utils.spec.ts` (util).
- Setup estándar: `TestBed` con el componente standalone en `imports`, `provideHttpClient() +
  provideHttpClientTesting()`, mocks de servicios vía providers
  (`jasmine.createSpyObj(...)` / `.and.resolveTo(...)`), mock de `ActivatedRoute`/`Router` cuando aplique.
- **Signal inputs**: `fixture.componentRef.setInput('data', mock)` + `detectChanges()` después de
  cada set. Si hay `input.required`, **no** llamar `detectChanges()` en el `beforeEach`.
- Mocks de servicios con signals: usar `signal()` real de Angular en el mock, no propiedades planas.
- Organización estricta de `describe`s: `should create` → `Input Properties` →
  `Computed - {nombre}` (uno por computed) → `Initialization` → `Methods` → `DOM Rendering` → `Buttons`.
- Patrón AAA, un test = una aserción (ideal), nombres descriptivos
  (`'should NOT render X when condition is false'`), restaurar los spies en `afterEach` si se
  espía sobre DOM/globals.
- Utils: tests directos de función pura, incluyendo casos null/undefined y "no lanza".

---

## 17. TODOs con seguimiento

Todo `// TODO` / `<!-- TODO -->` en código **debe registrarse** en un `TODOS.md` en la raíz,
organizado por secciones (pendiente de backend, funcionalidades pendientes, fake backend, otros —
ver skill `@track-todos`). Formato de fila:

```
| ⏳ | [fichero.ts](ruta/relativa#Lnnn) | Descripción literal del TODO |
```

- El fichero solo contiene **pendientes reales**: cuando un TODO se resuelve, la fila **se elimina**
  (no se marca como hecha) junto con el comentario del código.
- Un TODO en SCSS de selector vacío no se registra.

---

## 18. Git y calidad

- **Conventional commits** (`feat:`, `fix:`, `refactor:`, `test:`, `chore:`… con scope opcional),
  **validados** por el hook `commit-msg`.
- Prettier + ESLint + Stylelint obligatorios (`npm run lint` + `npm run format` antes de commitear;
  `npm run check` ejecuta todo lo que hace CI: formato, lint, estilos, tests y build).
- **Hook `pre-commit`** (husky + lint-staged, `npm install` lo activa vía el script `prepare`):
  ejecuta Prettier, ESLint (`--fix`) y Stylelint solo sobre los ficheros staged en cada commit, como
  red de seguridad. No ejecuta tests (serían demasiado lentos para cada commit).
- **Hook `commit-msg`** (husky): rechaza mensajes que no sigan conventional commits.
- **Hook `pre-push`** (husky): ejecuta `npm run lint` y `npm run test:ci` antes de subir; bloquea el
  push si falla el lint, algún test o la cobertura baja del 80%.
- **CI** (`.github/workflows/ci.yml`): en cada push a `main` y en cada PR ejecuta formato, lint,
  estilos, tests, build y `npm audit` de dependencias de producción; sube la cobertura como
  artefacto. Los hooks se pueden saltar con `--no-verify`; CI no.
- **Node**: versión fijada en `.nvmrc` (la usa CI) y `engines` de `package.json` (≥ 20.19, requisito de Angular 20).
- Reglas ESLint activas (`eslint.config.mjs`):
  - Tipos: `type` en vez de `interface`, `import type`, sin `any`, sin valores de enum duplicados.
  - Estilo: llaves siempre (`curly`), `eqeqeq` (permite `== null`), `no-var`, `prefer-const`,
    `no-console` (solo `warn`/`error`; libre en `fake-backend/`), sin variables sin usar
    (prefijo `_` para ignorar).
  - Convenciones: visibilidad explícita en todos los miembros, booleans con prefijo `is/has/should`,
    sin promesas flotantes (`void` explícito si se dispara y se sale), sin `!` (non-null assertion),
    `??` en vez de `||` para nulos, `switch` exhaustivos.
  - Complejidad (refuerza "early returns"): `complexity` ≤ 10, `max-depth` ≤ 3,
    `max-lines-per-function` ≤ 80 (no aplica a specs). Si una función lo supera, se extrae.
  - Angular moderno: `OnPush`, standalone, signals (`input`/`output`/`viewChild`), `inject()`, sin
    `ViewEncapsulation.None`, `providedIn` en servicios, sin APIs legacy, lifecycle ordenado.
  - Selectores: componentes `app-*` en kebab-case y directivas `app*` en camelCase. Para conservar
    el landmark semántico (`<header>`, `<footer>`) se envuelve: `<header><app-header /></header>`.
  - Arquitectura: `subscribe()` prohibido fuera de `core/interceptors/`; `core/` y `shared/` no
    pueden importar de `@pages/`.
  - Specs: `fit`, `fdescribe`, `xit` y `xdescribe` prohibidos (Karma los da por pasados).
  - Templates: `@if`/`@for` (no `*ngIf`/`*ngFor`), sin estilos inline.
- **TypeScript estricto** (`tsconfig.json`): `strict` + `noUnusedLocals`, `noUnusedParameters`,
  `noUncheckedIndexedAccess`, `noImplicitReturns`, `noImplicitOverride`. Los diagnósticos extendidos
  de Angular (`extendedDiagnostics`) están como `error`.
- **Presupuestos de bundle** (`angular.json`, producción): inicial 500 kB aviso / 1 MB error; estilos
  de componente 4 kB aviso / 8 kB error.
- **Accesibilidad** en los templates `.html`: reglas a11y de `@angular-eslint/template` (`alt-text`,
  `button-has-type`, `click-events-have-key-events`, `elements-content`, `interactive-supports-focus`,
  `label-has-associated-control`, `mouse-events-have-key-events`, `no-autofocus`,
  `no-distracting-elements`, `no-positive-tabindex`, `role-has-required-aria`, `table-scope`,
  `valid-aria`). Es un chequeo estático: no valida contraste ni el DOM renderizado.

---

## 19. Checklist rápido (para revisar cualquier PR / generación)

- [ ] Fichero en la carpeta correcta y al nivel más bajo posible; sin prefijos redundantes
- [ ] Orden de secciones del componente + visibilidad explícita (`private` primero)
- [ ] `inject()`, signals, `input()`/`output()`/`viewChild()`; nada de APIs legacy
- [ ] `OnPush` + `styleUrl` singular
- [ ] `type` (no `interface`); átomos de `shared/models/`; `{Method}Request/Response`
- [ ] API: `firstValueFrom` + URL relativa (el interceptor añade `environment.api`); métodos en inglés; mock MSW espejo creado
- [ ] Early returns; llaves siempre; sin `subscribe()`; sin mutar signals
- [ ] Utils/pipes extraídos si la lógica se repite o es transformación de presentación
- [ ] SCSS con `@use 'imports' as *` + `:host`; variables/mixins de `src/styles/`; sin redefinir clases globales
- [ ] `id="{domain}-{component}-{type}-{element}"` en todo elemento interactuable
- [ ] Todo texto visible con `| translate` / `translate.instant()`; claves con la convención
- [ ] Accesibilidad: `type` en `<button>`, `alt` en imágenes, `<label>` asociado, interactivos con teclado
- [ ] Notificación de éxito (headers) en escrituras que la requieran
- [ ] Spec creado/actualizado con la organización estándar; `npm run test:ci` en verde (cobertura ≥ 80%)
- [ ] TODOs registrados en `TODOS.md`; `npm run lint` limpio; commit con conventional commits
