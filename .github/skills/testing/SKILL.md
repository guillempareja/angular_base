---
name: testing
description: >
  Use when writing or updating unit tests in this Angular project — component specs, service specs,
  pipe or util specs with Jasmine + Karma (ng test). Also use when the user asks in Spanish to
  crear tests, añadir tests, testear un componente, testear un servicio, cobertura, specs,
  or any task involving unit testing. Covers TestBed setup for standalone components,
  provideHttpClientTesting, service mocks with jasmine spies, signal inputs with setInput,
  describe organization, AAA pattern, and the 80% minimum coverage rule.
user-invocable: true
---

# Skill: Tests unitarios (Jasmine + Karma)

## 1. Reglas generales

- Specs `.spec.ts` junto al fichero que prueban. Se ejecutan con `ng test` (watch) o
  `npm run test:ci` (una pasada, Chrome headless).
- **Cobertura mínima 80%** en statements/branches/functions/lines, **exigida**: los tests corren
  siempre con cobertura y fallan por debajo del umbral (`check.global` en `karma.conf.js`).
  Excluidos en `angular.json` (`codeCoverageExclude`): fake-backend, environments, enums y constants.
- **Todo fichero nuevo con lógica lleva su spec en el mismo cambio** — no se deja para después.
  Tras crear o modificar código, ejecutar `npm run test:ci` y no dar la tarea por terminada si falla.
- Patrón **AAA** (Arrange, Act, Assert). Un test = una aserción (ideal).
- Nombres descriptivos: `'should NOT render X when condition is false'`.

## 2. Setup estándar de componente

Referencia viva: [`main.component.spec.ts`](../../../src/app/pages/main/main.component.spec.ts)
(componente), [`http.interceptor.spec.ts`](../../../src/app/core/interceptors/http.interceptor.spec.ts)
(HTTP con `HttpTestingController`) y [`form.utils.spec.ts`](../../../src/app/shared/utils/form.utils.spec.ts) (util).

```typescript
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { ExampleService } from '@core/api/example/example.service';
import MainComponent from './main.component';

describe('MainComponent', () => {
  let component: MainComponent;
  let fixture: ComponentFixture<MainComponent>;
  let exampleServiceSpy: jasmine.SpyObj<ExampleService>;

  beforeEach(async () => {
    exampleServiceSpy = jasmine.createSpyObj('ExampleService', ['getExample']);
    exampleServiceSpy.getExample.and.resolveTo({ example: 'mock' });

    await TestBed.configureTestingModule({
      imports: [MainComponent],
      providers: [
        provideTranslateService(),
        { provide: ExampleService, useValue: exampleServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

- El componente standalone va en `imports` (no en `declarations`).
- `provideTranslateService()` para que el `TranslatePipe` funcione (devuelve la clave tal cual).
- Si el componente usa `HttpClient` real (no mockeado): `provideHttpClient()` + `provideHttpClientTesting()`.
- Datos async de `ngOnInit`: `await fixture.whenStable()` + `fixture.detectChanges()` antes de asertar el DOM.
- Mock de `ActivatedRoute`/`Router` vía providers cuando aplique
  (`{ provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) }`).

## 3. Signal inputs y mocks con signals

- **Signal inputs**: `fixture.componentRef.setInput('data', mock)` + `fixture.detectChanges()`
  después de cada set.
- Si el componente tiene `input.required`, **no** llamar a `detectChanges()` en el `beforeEach`
  (fallaría antes de setear el input).
- Mocks de servicios que exponen signals: usar `signal()` real de Angular en el mock, no
  propiedades planas:

```typescript
const authServiceMock = {
  userData: signal<LoginResponse | null>(null),
  logout: jasmine.createSpy('logout'),
};
```

## 4. Organización estricta de describes

```
describe('ExampleComponent')
├── it('should create')
├── describe('Input Properties')
├── describe('Computed - {nombre}')     ← uno por computed
├── describe('Initialization')          ← ngOnInit, carga de datos
├── describe('Methods')                 ← un describe anidado por método
├── describe('DOM Rendering')
└── describe('Buttons')
```

## 5. Async y spies

- Métodos async: `await component.handleSave()` en el test (el test es `async`).
- Promesas de servicios: `.and.resolveTo(mock)` / `.and.rejectWith(error)`.
- Spies sobre DOM/globals (`window.scrollTo`, `localStorage`): crear con
  `spyOn(...)` y restaurar en `afterEach`.
- Utils puros: tests directos de función, incluyendo casos `null`/`undefined` y "no lanza".

## Checklist

- [ ] Spec junto al fichero probado
- [ ] TestBed con componente standalone en `imports` + `provideHttpClient()` / `provideHttpClientTesting()`
- [ ] Servicios mockeados con `jasmine.createSpyObj` (+ `signal()` real si exponen signals)
- [ ] Signal inputs via `setInput` + `detectChanges` (sin `detectChanges` en `beforeEach` si hay `input.required`)
- [ ] Describes con la organización estándar; patrón AAA
- [ ] Cobertura ≥ 80%
