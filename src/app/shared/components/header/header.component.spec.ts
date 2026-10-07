import { signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { AuthService } from '@core/services/auth.service';
import type { LoginResponse } from '@core/api/login/login.types';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  const authServiceMock = {
    userData: signal<LoginResponse | null>(null),
    logout: jasmine.createSpy('logout'),
  };

  beforeEach(async () => {
    authServiceMock.userData.set(null);
    authServiceMock.logout.calls.reset();

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideTranslateService(),
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should expose its height as the --header-height CSS variable', () => {
      const value =
        document.documentElement.style.getPropertyValue('--header-height');

      expect(value).toMatch(/^\d+px$/);
    });
  });

  describe('DOM Rendering', () => {
    it('should NOT render the user block without session', () => {
      expect(
        fixture.nativeElement.querySelector('#header-btn-logout'),
      ).toBeNull();
    });

    it('should render the capitalized username with session', () => {
      authServiceMock.userData.set({
        username: 'john',
        token: 't',
        refreshToken: 'r',
      });
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('span').textContent).toContain(
        'John',
      );
    });
  });

  describe('Buttons', () => {
    it('should logout when clicking the logout button', () => {
      authServiceMock.userData.set({
        username: 'john',
        token: 't',
        refreshToken: 'r',
      });
      fixture.detectChanges();

      fixture.nativeElement.querySelector('#header-btn-logout').click();

      expect(authServiceMock.logout).toHaveBeenCalled();
    });
  });
});
