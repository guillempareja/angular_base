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

- Specs `.spec.ts` junto al fichero que prueban. Se ejecutan con `ng test`.
- **Cobertura mínima 80%** en statements/branches/functions/lines
  (enums, constants, environments y fake-backend excluidos).
- Patrón **AAA** (Arrange, Act, Assert). Un test = una aserción (ideal).
- Nombres descriptivos: `'should NOT render X when condition is false'`.

## 2. Setup estándar de componente

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import ExampleComponent from './example.component';
import { ExampleService } from '@core/api/example/example.service';

describe('ExampleComponent', () => {
  let component: ExampleComponent;
  let fixture: ComponentFixture<ExampleComponent>;
  let exampleServiceSpy: jasmine.SpyObj<ExampleService>;

  beforeEach(async () => {
    exampleServiceSpy = jasmine.createSpyObj('ExampleService', ['getExample']);
    exampleServiceSpy.getExample.and.resolveTo({ example: 'mock' });

    await TestBed.configureTestingModule({
      imports: [ExampleComponent, TranslateModule.forRoot()],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ExampleService, useValue: exampleServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

- El componente standalone va en `imports` (no en `declarations`).
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
