import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { AuthService } from '@core/services/auth.service';
import { FormService } from '@shared/services/form.service';
import LoginComponent from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let formServiceSpy: jasmine.SpyObj<FormService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login', 'logout']);
    authServiceSpy.login.and.resolveTo();
    formServiceSpy = jasmine.createSpyObj('FormService', [
      'navigateToFormError',
    ]);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideTranslateService(),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: FormService, useValue: formServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should close any previous session', () => {
      expect(authServiceSpy.logout).toHaveBeenCalled();
    });

    it('should build an empty form', () => {
      expect(component.form.value).toEqual({ username: '', password: '' });
    });
  });

  describe('Methods', () => {
    describe('handleLogin', () => {
      it('should navigate to the first error when the form is invalid', async () => {
        await component.handleLogin();

        expect(formServiceSpy.navigateToFormError).toHaveBeenCalled();
        expect(authServiceSpy.login).not.toHaveBeenCalled();
      });

      it('should login with the form values when the form is valid', async () => {
        const credentials = { username: 'user', password: 'pass' };
        component.form.setValue(credentials);

        await component.handleLogin();

        expect(authServiceSpy.login).toHaveBeenCalledWith(credentials);
      });
    });
  });

  describe('DOM Rendering', () => {
    it('should show the validation errors after submitting an empty form', async () => {
      await component.handleLogin();
      fixture.detectChanges();

      expect(
        fixture.nativeElement.querySelectorAll('.invalid-feedback').length,
      ).toBe(2);
    });
  });
});
