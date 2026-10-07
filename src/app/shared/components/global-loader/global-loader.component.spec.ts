import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { GlobalLoaderComponent } from './global-loader.component';

describe('GlobalLoaderComponent', () => {
  let fixture: ComponentFixture<GlobalLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalLoaderComponent],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(GlobalLoaderComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  describe('Initialization', () => {
    it('should block the page behind the overlay', () => {
      expect(document.body.inert).toBeTrue();
      expect(document.documentElement.style.overflow).toBe('hidden');
    });
  });

  describe('Methods', () => {
    it('should release the page on destroy', () => {
      fixture.destroy();

      expect(document.body.inert).toBeFalse();
      expect(document.documentElement.style.overflow).toBe('');
    });
  });
});
