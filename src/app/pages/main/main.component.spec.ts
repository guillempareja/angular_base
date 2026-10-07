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

  describe('Initialization', () => {
    it('should load the example on init', () => {
      expect(exampleServiceSpy.getExample).toHaveBeenCalledTimes(1);
    });

    it('should store the response in the example signal', async () => {
      await fixture.whenStable();

      expect(component.example()).toEqual({ example: 'mock' });
    });
  });

  describe('DOM Rendering', () => {
    it('should render the example data', async () => {
      await fixture.whenStable();
      fixture.detectChanges();

      const paragraph: HTMLElement = fixture.nativeElement.querySelector('p');
      expect(paragraph.textContent).toContain('mock');
    });
  });
});
