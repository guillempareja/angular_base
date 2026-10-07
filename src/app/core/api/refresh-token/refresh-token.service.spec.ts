import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { RefreshTokenService } from './refresh-token.service';

describe('RefreshTokenService', () => {
  let service: RefreshTokenService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(RefreshTokenService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('refreshToken should POST the refresh token to /refreshToken', async () => {
    const response = { token: 'new', refreshToken: 'newRefresh' };
    const promise = firstValueFrom(service.refreshToken('oldRefresh'));

    const req = httpMock.expectOne('/refreshToken');
    req.flush(response);

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ refreshToken: 'oldRefresh' });
    expect(await promise).toEqual(response);
  });
});
