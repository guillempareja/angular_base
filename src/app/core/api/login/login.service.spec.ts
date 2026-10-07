import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { LoginService } from './login.service';

describe('LoginService', () => {
  let service: LoginService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(LoginService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('login should POST the credentials to /login', async () => {
    const credentials = { username: 'user', password: 'pass' };
    const response = { username: 'user', token: 't', refreshToken: 'r' };
    const promise = service.login(credentials);

    const req = httpMock.expectOne('/login');
    req.flush(response);

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(credentials);
    expect(await promise).toEqual(response);
  });
});
