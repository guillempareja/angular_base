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
   prefieren **pipes** (`| formatDate`, `| dropdownText`) sobre métodos helper en el componente.
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
| Caché HTTP | @ngneat/cashew (`withHttpCacheInterceptor()` + `provideHttpCache()`) |
| Notificaciones | ngx-toastr (toasts disparados desde el interceptor HTTP, ver §7) |
| Formato/calidad | Prettier + ESLint + Stylelint (conventional commits como convención) |
| Estilos | SCSS propio en `src/styles/` (variables, mixins, funciones y clases globales, ver §14) |

Scripts estándar en `package.json`: `start`, `start:tst`, `build`, `watch`, `test`, `format`.

---

## 3. Estructura de carpetas

```
src/
├── app/
│   ├── app.component.*            ← Shell de la app
│   ├── app.config.ts              ← Providers (router, http+interceptores, i18n, toastr, caché)
│   ├── app.routes.ts              ← Rutas raíz, lazy loading por dominio
│   ├── core/                      ← Infraestructura Angular (sin UI)
│   │   ├── api/                   ← Servicios HTTP + tipos, por familia de endpoint (ver §5)
│   │   ├── guards/                ← Guards de ruta (AuthGuard)
│   │   ├── interceptors/          ← Interceptores HTTP (ver §7)
│   │   └── services/              ← Servicios de infraestructura (auth, loader, modales genéricos, respuesta HTTP)
│   ├── pages/                     ← Dominios de negocio (vertical slices)
│   │   ├── login/
│   │   └── main/
│   └── shared/                    ← Reutilizables entre 2+ dominios
│       ├── components/            ← Componentes UI compartidos (header, footer, modal, global-loader)
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
├── styles/                        ← Sistema de estilos global SCSS (ver §14)
└── fake-backend/                  ← Mocks MSW (espejo de core/api, ver §8)
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
├── list/                          ← Pantalla de listado
│   ├── list.component.{ts,html,scss}
│   ├── enums/
│   └── services/                  ← ListService (persistencia de estado)
├── registration/                  ← Pantalla de alta
├── management/                    ← Pantalla de gestión/detalle con menú lateral
│   ├── management.component.*
│   ├── enums/                     ← Enum de secciones
│   ├── services/                  ← ManagementService (estado global de la entidad cargada)
│   └── components/                ← Un folder por sección del menú lateral
│       └── section-a/
│           └── components/        ← Sub-pantallas / sub-componentes de la sección
├── components/                    ← Componentes compartidos entre pantallas DEL dominio
│   └── form/                      ← Formulario reutilizado por alta y modificación
│       └── components/            ← Sub-secciones (acordeones) del formulario
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
import type { Token } from '@shared/models/auth.types';

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
- Búsquedas paginadas usan genéricos compartidos:

```typescript
// shared/models/data-query.types.ts
export type DataQueryRequest<Filter> = { page; pageSize; sort?; search?; filter?: Filter };
export type DataQueryResponse<Data> = { content: Data[]; totalPages; totalElements; pageSize; page };

// en el types de la familia search:
export type EntitySearchFilter = { fieldA?: FieldA; dateFrom?: Date };
export type SearchEntityRequest = DataQueryRequest<EntitySearchFilter>;
export type SearchEntityResponse = DataQueryResponse<EntitySearchItem>;
```

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

## 7. Capa HTTP transversal (interceptores + resolvers)

Los interceptores son **funcionales** (`HttpInterceptorFn`) y se registran en `app.config.ts`
con `provideHttpClient(withInterceptors([...]), withFetch())`. La idea: **simplificar cada llamada
individual** resolviendo transversalmente lo que de otro modo habría que repetir en cada servicio.

Cadena de interceptores del proyecto (`app.config.ts`):

1. **`withHttpCacheInterceptor()`** (@ngneat/cashew): caché HTTP para las llamadas que declaren
   `context: withCache()`.
2. **`customHttpInterceptor`** (`core/interceptors/http.interceptor.ts`), que concentra toda la
   lógica transversal:
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
  Para IDs de catálogo, comentario con la etiqueta (`categoryId: '2', // 2 = Active`). Solo los campos que la UI necesita.
- **handlers.ts**: lo más simples posible — interceptar y devolver el mock. `await sleep()` en
  escrituras para simular latencia. En updates, devolver `{ ...mock, ...body }` para que la UI
  refleje lo enviado. En deletes, `204` sin body.
- **Orden de registro**: rutas más específicas primero, las base con `/:id` al final
  (MSW machea de arriba a abajo).
- `browser.ts` combina los handlers de todas las familias en un `setupWorker`; el worker solo se
  arranca cuando `environment.useMSW` es `true`.

**Flujo al crear un endpoint nuevo** (siempre los 5 pasos):
types → service → mocks → handlers → wiring de los `index.ts`.

---

## 9. Catálogos (dropdowns dinámicos)

Los desplegables cuyo contenido viene de backend (listas de referencia/lookup: categorías, estados,
tipos…) se resuelven con **un único servicio de catálogos**, genérico, parametrizado por un **enum**
que mapea nombre ↔ ID de catálogo — nunca un servicio por cada lista:

```typescript
public getCatalog(catalog: Catalog): Promise<GetCatalogResponse> {
  return firstValueFrom(
    this.http
      .get<GetCatalogRawResponse>(`/catalogs/${catalog}/items`, {
        context: withCache(),                    // ← catálogos cacheados en HTTP
      })
      .pipe(map(mapDropdownOptions))             // ← mapeo raw → opciones de dropdown en el servicio
    );
}
```

Convenciones de consumo en componentes:

- Un signal por catálogo con naming `{name}Items = signal<GetCatalogResponse>([])`.
- Un único método privado **siempre llamado `loadDropdowns()`** (aunque cargue un solo catálogo),
  invocado desde `ngOnInit`, que carga **todos los catálogos en paralelo con `Promise.all`**:

```typescript
private async loadDropdowns(): Promise<void> {
  const [categoryAResponse, categoryBResponse] = await Promise.all([
    this.catalogService.getCatalog(Catalog.CATEGORY_A),
    this.catalogService.getCatalog(Catalog.CATEGORY_B),
  ]);

  this.categoryAItems.set(categoryAResponse);
  this.categoryBItems.set(categoryBResponse);
}
```

- Para mostrar la etiqueta de un ID de catálogo: pipe `| dropdownText : items()` en template
  (o util `getDropdownText(items, value)` en mapeos de datos). Nunca métodos helper `xxxText()` en el componente.
- El enum `Catalog` es la **única fuente de verdad** de IDs de catálogo; los IDs pendientes de backend
  se marcan con placeholder + `// TODO` al final del enum.

---

## 10. Anatomía de un componente

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
  public managementService = inject(ManagementService); // public solo si el template lo usa

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
  scrollOnScreenChange = effect(() => { ... });  // effects con nombre descriptivo, sin sufijo "effect"

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

## 11. Patrones de pantalla

Cada tipo de pantalla tiene un patrón canónico. Al crear una pantalla nueva se copia el patrón, no se inventa.

### 11.1 Listado (tabla)

Dos variantes según quién pagina:

| El backend pagina/filtra/ordena | **Tabla remota** — servicio gestor de tabla remota + `ListService` |
| El backend devuelve todo de una vez | **Tabla local** — signal con los datos + sort en un `computed` |

**Tabla remota** — piezas:

- **`ListService`** (`providedIn: 'root'`, en `list/services/`): persiste el estado del listado entre
  navegaciones — signals `currentPage`, `itemsPerPage`, `sortParams`, `appliedSearch`,
  `appliedFilters`, `hasFetchedData` + método `reset()`. Al volver de un detalle, el listado se
  restaura tal cual estaba; la pantalla que quiera limpiar el estado navega con
  `state: { cleanState: true }` y el listado hace `reset()` al detectarlo.
- **Servicio gestor de tabla remota** (shared, **provisto a nivel de componente** en `providers: []`):
  encapsula fetch, paginación, búsqueda, filtros y orden. El componente le pasa en `configure()` la
  `fetchFn` (el método del servicio API), los signals del `ListService` y el signal de filtros.
- Orden de arranque en `ngOnInit`: `restoreState()` → `configureTableManager()` →
  `loadDropdowns().then(() => buildFilterModel())`.
- **Mapeo de datos** para la tabla en un `computed` `mappedData`: cada fila lleva los campos ya
  formateados para pintar (IDs de catálogo → etiqueta, `Date` → texto) **y siempre `data: item`**
  con el objeto original de la API intacto (para acciones y ordenación por valor crudo).
- Los filtros de dropdown en listados son **multi-select** (default `[]`); solo los datepickers usan `null`.

**Tabla local** — sin servicios: `items = signal<T[]>([])` cargado en `ngOnInit`,
`sortParams = signal<SortChangeEvent | null>(null)` alimentado por `(sortChange)`, y un `computed`
`sortedData` que ordena con una util `sortByField`. Las columnas transformadas (fechas) se ordenan
por el valor original vía `data.{campo}` con comparador numérico.

### 11.2 Formulario

Decisión inicial:

| El formulario se usa en 1 sola ruta | **Single-page**: el componente construye el form y llama a la API directamente |
| Se usa en 2+ pantallas (alta + modificación) | **Componentizado**: componente `form/` con `data = input<FormData | null>(null)` + `save`/`cancel` outputs. **No llama a la API**: emite; la pantalla padre decide POST o PUT |
| Lectura y edición alternan en la misma URL | Componentizado + `readonly = input<boolean>()`; el contenedor usa `readonly = signal<boolean>(true)` y alterna con `@if` |

Reglas del formulario:

- Reactive forms (`FormBuilder`) construidos en un método privado `buildForm()`; en modo edición,
  `patchValue(this.data()!)` en `ngOnInit`.
- El formulario se divide en **sub-componentes de sección (acordeones)**, cada uno recibiendo
  `formGroup = input.required<FormGroup>()` (su sub-FormGroup) y exponiendo
  `public open = signal<boolean>(true)` para que el padre pueda forzar su apertura al validar.
- **Flujo de guardado canónico**:
  1. `markAllControlsAsTouched(form)` (util compartida)
  2. Si inválido → abrir todos los acordeones (`viewChild` de cada sección) → `await sleep()` →
     `navigateToFormError()` (scroll al primer error) → return
  3. Si aplica, modal de confirmación (solo en cancelar/eliminar/irreversible — **nunca al guardar normal**)
  4. Emitir `save` / llamar API
- **Cancelar** siempre pide confirmación con un método privado nombrado (`confirmCancel()`) que
  devuelve `Promise<boolean>` desde el servicio de modales.
- **Modo lectura por defecto obligatorio**: toda pantalla de datos que se pueda revisitar tiene
  lectura, y cada campo alterna `@if (!readonly())` control / `@else` contenedor de info de solo
  lectura, resolviendo con pipes (`dropdownText`, `formatDate`, `booleanToYesNo`).
  Excepciones sin `@if/@else`: checkboxes y textareas usan su propiedad `[readonly]`.
- Las **observaciones** siempre son un sub-componente aparte, nunca inline en el grid del formulario.
- **Persistencia y reset (CRÍTICO en lectura/edición sobre la misma URL)**: el FormGroup sobrevive al
  toggle, así que si el usuario edita y cancela vería datos sucios. Patrón: guardar los datos
  originales en un signal + método único `applyFormData()` (patch o reset desde el signal), llamado
  al cargar, al guardar (con la respuesta del backend) y al cancelar. En formularios componentizados,
  un `effect` sobre el input `data` (con guard `isInitialized`) resincroniza automáticamente.

### 11.3 Pantalla de gestión (detalle con menú lateral)

Estructura para "ficha" de una entidad con secciones:

- **`ManagementService`** (root): `entityData = signal<GetEntityResponse | null>(null)` + `reset()`.
  Es el estado compartido que todas las secciones leen — **sin prop drilling**. El componente de
  gestión lo resetea en `ngOnDestroy`.
- El componente de gestión: carga la entidad por el `:id` de la ruta, pinta una **cabecera de info**
  (campos clave, computed que devuelve `'-'` si aún no hay datos) y un **menú lateral** cuyas
  opciones salen de un **enum de secciones** (valores kebab-case porque van a la URL).
- La sección activa se persiste en la URL **sin navegar** con `location.replaceState(...)`
  (así el "atrás" del navegador vuelve al listado, no a la sección anterior).
- El layout se envuelve en `@if (managementService.entityData())` para no renderizar secciones sin datos.
- `loadDropdowns()` se llama **sin await** para que corra en paralelo con la carga de la entidad.
- Cada sección del menú es un componente; si alterna detalle/modificación usa el patrón de
  sub-pantallas (§11.4) o el simplificado con `readonly = signal(true)` cuando el form ya está
  componentizado (preferido — evita sub-carpetas `detail/`+`modification/` innecesarias).
- Tras guardar en una sección: `managementService.entityData.set(response)` para que la cabecera y
  el resto de secciones reflejen el cambio.

### 11.4 Sub-pantallas (cambiar vista sin cambiar URL)

- **Enum de pantallas** + **`ScreenService`** (root) con `currentScreen = signal<...>`, métodos de
  navegación nombrados (`goToDetail()`, `goToModification()`) y `reset()` (siempre vuelve a la inicial).
- **Padre tonto**: solo `@switch (screenService.currentScreen())` en el template, un `effect`
  `scrollOnScreenChange` que hace `window.scrollTo(0, 0)` al cambiar, y `reset()` en `ngOnDestroy`.
  **Cero lógica de los hijos en el padre.**
- Los hijos navegan inyectando el `ScreenService` — el padre nunca se entera.
- Si hay botones comunes a todas las sub-pantallas (guardar/cancelar fijos): `viewChild` por
  sub-componente + `computed activeComponent()` público; el template llama
  `activeComponent().handleSave()` directamente. Todos los hijos exponen el mismo contrato público.
  Sin métodos delegadores en el padre.

### 11.5 Detalle de solo lectura

- Un sub-componente por grupo lógico de campos (acordeón), recibiendo **solo su slice de datos**
  con `data = input.required<GroupData>()`.
- Cada campo es un contenedor de info label+value; IDs de catálogo y fechas se resuelven con pipes.
- Grid de columnas con clases globales (`grid-template` + `col-4`/`col-6`/`col-12`).
- Barra de acciones al pie (`Modificar` como CTA). Acciones destructivas (Eliminar) van en la
  cabecera junto al título, con modal de confirmación.

---

## 12. Routing

- `app.routes.ts` define un path por dominio con `loadChildren` lazy hacia el `{domain}.routes.ts`
  del dominio; cada pantalla se carga con `loadComponent` lazy.
- Rutas hijas para variantes de una entidad: `:id` → gestión, `:id/:section` → gestión con sección,
  `:id/accion-x` → pantallas de acción.
- `data: { breadcrumb: ... }` en cada ruta para las migas.
- Resolver de traducciones en las rutas raíz de dominio.
- Estado efímero entre pantallas → `history.state` (ej. `cleanState`), no query params.

---

## 13. i18n

- **Cero texto visible hardcodeado** — todo por `| translate` (template) o `translate.instant()` (TS).
- Un único JSON por idioma en `assets/i18n/`.
- **Convención de claves**: `{domain}.{component}.{grupo}.{clave}` en camelCase.
  Grupos semánticos estándar: `tabs`, `columns`, `buttons`, `modal`, `notifications`, `steps`,
  `menu`, `header`, `filters`, `searcher`. Textos únicos sin grupo: `title`, `noResults`.
- **`shared.buttons.*`** para acciones comunes (`save`, `cancel`, `back`, `modify`, `delete`,
  `accept`…) — nunca duplicar "Guardar" por dominio.
- En template: binding `[label]="'clave' | translate"`, no interpolación `label="{{...}}"` (flicker con OnPush).
- En TS: arrays de configuración (tabs, columnas) se inicializan en el cuerpo de la clase con
  `this.translate.instant()` (funciona porque `inject()` resuelve antes que los inicializadores).
  Si la config de tabla necesita un `TemplateRef` de `viewChild`, entonces es `computed()`.
- `TranslatePipe` en `imports[]` solo si el template lo usa; `TranslateService` inyectado solo si hay `.instant()`.

---

## 14. Estilos (SCSS)

No hay librería de estilos externa: el sistema de estilos es propio y vive en `src/styles/`.

### Estructura de `src/styles/`

```
styles/
├── app.scss                       ← Entry point global (registrado en angular.json) — solo @use 'base' + @use 'ui'
├── _imports.scss                  ← Fachada para componentes: @forward de variables + utils
├── base/
│   ├── _normalize.scss            ← normalize.css
│   ├── _variables.scss            ← TODAS las variables Sass de diseño (ver abajo)
│   └── _globals.scss              ← Estilos base de elementos (body, h1/h2, img, ul, input…)
├── ui/                            ← Clases globales reutilizables
│   ├── _grid.scss                 ← .grid-template + .col-1…col-12 (+ .new-row, mixins de grid)
│   ├── _layouts.scss              ← .field-group, .buttons-group
│   ├── _texts.scss                ← .clamped-text
│   └── _icons.scss                ← Material Symbols
└── utils/
    ├── _functions.scss            ← rem($px) — px → rem
    └── _mixins.scss               ← breakpoint, flex-center, text-ellipsis, fade-in, line-clamp, flex-wrap, spin
```

### Variables de diseño (`base/_variables.scss`)

**Variables Sass** (no CSS custom properties), organizadas por escala — es la única fuente de verdad:

- **Colores**: paletas `$color-primary-{10..700}`, `$color-secondary-*`, `$color-error-*`,
  `$color-warning-*`, `$color-success-*`, `$color-neutral-*`, `$color-basic-black/white`.
- **Tipografía**: `$font-family`, `$base-font-size`, `$base-line-height`, `$small-font-size`.
- **Espaciados**: escala `$spacing-5xs` (2px) … `$spacing-9xl` (104px), en `rem()`.
- **Bordes**: `$border-radius-xs` … `$border-radius-xxl`.
- **Breakpoints**: mapa `$breakpoints` (phone/tablet/laptop/desktop/wide-screen) consumido por el
  mixin `breakpoint($device)` (media query `max-width`).
- **Otros**: `$page-max-width`, `$transition-speed`.

### Cómo estila un componente

`angular.json` declara `stylePreprocessorOptions.includePaths: ["src/styles"]`, así que todo SCSS
de componente empieza igual:

```scss
@use 'imports' as *;

:host {
  @include flex-center;

  .header-wrapper {
    min-height: rem(100);
    padding: $spacing-xs $spacing-xl;
  }
}
```

Reglas:

- **Encapsulación por defecto** (Emulated) — no se usa `ViewEncapsulation.None`. El SCSS del
  componente scopa con `:host` y anida sus selectores dentro.
- **Variables y mixins siempre**: `$spacing-md`, `$color-primary-500`, `rem(24)`,
  `@include breakpoint('tablet')`… **Nunca** colores/espaciados/tamaños hardcodeados.
  Nunca estilos inline en template.
- Las **clases globales de UI** (`grid-template` + `col-*`, `field-group`, `buttons-group`,
  `clamped-text`) se **usan pero jamás se redefinen** en los SCSS de componentes. Los SCSS de
  componente solo añaden espaciados (`margin-top`) y detalles propios.
- Grid de formularios/detalles: `grid-template` con `col-4` (campo estándar), `col-6`, `col-8`,
  `col-12` (observaciones/textos largos); `.new-row` fuerza salto de fila.
- Si una variable/mixin/clase global nueva es transversal, nace en `src/styles/` (nivel que le
  corresponda); si es puntual de un componente, se queda en su SCSS.
- **Stylelint** (`stylelint-config-standard-scss` + prettier) valida todo `.scss`; `npm run format`
  formatea y aplica fixes.

---

## 15. IDs de elementos HTML — OBLIGATORIO

Todo elemento **interactuable** lleva `id` con el patrón:

```
{domain}-{component}-{type}-{element}
```

- `domain` = carpeta bajo `pages/`; `component` = carpeta del componente; `type` = tipo de control
  (`input`, `dropdown`, `datepicker`, `radio`, `checkbox`, `btn`, `accordion`, `tabs`, `table`,
  `searcher`, `textarea`, `stepper`…); `element` = nombre en inglés del campo/acción.
- kebab-case, todo en inglés. Sin `id` en elementos de solo lectura (`<p>`, `<h1>`, contenedores de info).

```html
<ds-form-input id="{domain}-{component}-input-fieldName" ... />
<ds-button     id="{domain}-form-btn-save" ... />
<ds-table      id="{domain}-list-table-results" ... />
```

Las claves i18n espejan este mismo patrón (§13).

---

## 16. Pipes y utils compartidos

- **Pipes de presentación** (en `shared/pipes/`): `formatDate` (Date → `DD/MM/YYYY`),
  `dropdownText` (ID de catálogo → etiqueta; acepta arrays y los une con coma),
  `booleanToYesNo`, `formatDuration`, etc. Es la vía canónica para pintar valores transformados —
  **prohibido crear métodos `xxxText()` en componentes**.
- **Utils puros** (en `shared/utils/` o `{domain}/utils/`): un fichero por tema
  (`date.utils.ts`, `form.utils.ts`, `object.utils.ts`, `dropdown.utils.ts`…). Funciones exportadas
  puras y testeables. Cualquier lógica repetida dos veces se extrae aquí.
- **Validators** reutilizables en `shared/validations/` (o de la librería de utilidades):
  `dateNotAfterTodayValidator`, `exactLengthValidator(n)`, `numericValidator`…
- **Servicios compartidos** típicos: gestores de tabla (remota/local), navegación, modo foco,
  stepper, operaciones de fichero.
- **Constantes de opciones estáticas** (radios sí/no, etc.) en `shared/constants/`.

---

## 17. Testing (Jasmine + Karma)

- Specs `.spec.ts` junto al fichero que prueban (`ng test`). **Cobertura mínima 80%** en statements/
  branches/functions/lines (enums, constants, environments y fake-backend excluidos).
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

## 18. TODOs con seguimiento

Todo `// TODO` / `<!-- TODO -->` en código **debe registrarse** en un `TODOS.md` en la raíz,
organizado por secciones (gestor documental, librería de componentes, pendiente de backend,
funcionalidades pendientes, fake backend…). Formato de fila:

```
| ⏳ | [fichero.ts](ruta/relativa#Lnnn) | Descripción literal del TODO |
```

- El fichero solo contiene **pendientes reales**: cuando un TODO se resuelve, la fila **se elimina**
  (no se marca como hecha) junto con el comentario del código.
- Un TODO en SCSS de selector vacío no se registra.

---

## 19. Git y calidad

- **Conventional commits** (`feat:`, `fix:`, `refactor:`, `test:`, `chore:`… con scope opcional).
- Prettier + ESLint + Stylelint obligatorios (`npm run format` antes de commitear).
- Reglas ESLint relevantes: prohibido `interface` para datos, imports de tipos con `import type`,
  no `any`, no duplicate enum values (salvo `eslint-disable` justificado en placeholders de catálogo).

---

## 20. Checklist rápido (para revisar cualquier PR / generación)

- [ ] Fichero en la carpeta correcta y al nivel más bajo posible; sin prefijos redundantes
- [ ] Orden de secciones del componente + visibilidad explícita (`private` primero)
- [ ] `inject()`, signals, `input()`/`output()`/`viewChild()`; nada de APIs legacy
- [ ] `OnPush` + `styleUrl` singular
- [ ] `type` (no `interface`); átomos de `shared/models/`; `{Method}Request/Response`
- [ ] API: `firstValueFrom` + URL relativa (el interceptor añade `environment.api`); métodos en inglés; mock MSW espejo creado
- [ ] Catálogos: `loadDropdowns()` + `Promise.all` + `{name}Items`
- [ ] Early returns; llaves siempre; sin `subscribe()`; sin mutar signals
- [ ] Utils/pipes extraídos si la lógica se repite o es transformación de presentación
- [ ] SCSS con `@use 'imports' as *` + `:host`; variables/mixins de `src/styles/`; sin redefinir clases globales
- [ ] `id="{domain}-{component}-{type}-{element}"` en todo elemento interactuable
- [ ] Todo texto visible con `| translate` / `translate.instant()`; claves con la convención
- [ ] Notificación de éxito (headers) en escrituras que la requieran
- [ ] Confirmación modal solo en cancelar/eliminar/irreversible
- [ ] Estado de listado persistido (ListService); reset con `cleanState`
- [ ] Formularios con lectura por defecto y patrón de persistencia/reset si comparten URL
- [ ] Tests con la organización estándar; cobertura ≥ 80%
- [ ] TODOs registrados en `TODOS.md`; commit con conventional commits
