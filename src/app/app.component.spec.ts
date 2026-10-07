import { signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { AuthService } from '@core/services/auth.service';
import { LoaderService } from '@core/services/loader.service';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let loaderService: LoaderService;
  const authServiceMock = {
    userData: signal(null),
    loadSession: jasmine.createSpy('loadSession'),
    logout: jasmine.createSpy('logout'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        provideTranslateService(),
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    loaderService = TestBed.inject(LoaderService);
    fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should restore the stored session', () => {
      expect(authServiceMock.loadSession).toHaveBeenCalled();
    });
  });

  describe('DOM Rendering', () => {
    it('should NOT render the global loader when idle', () => {
      expect(fixture.nativeElement.querySelector('global-loader')).toBeNull();
    });

    it('should render the global loader while loading', () => {
      loaderService.show();
      fixture.detectChanges();

      expect(
        fixture.nativeElement.querySelector('global-loader'),
      ).not.toBeNull();
      loaderService.hide();
      fixture.detectChanges();
    });
  });
});
