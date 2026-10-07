import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { HttpCustomHeader } from '@shared/enums/http-custom-headers.enum';
import { ExampleService } from './example.service';

describe('ExampleService', () => {
  let service: ExampleService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ExampleService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Methods', () => {
    it('getExample should GET /example with the custom success tag', async () => {
      const promise = service.getExample();

      const req = httpMock.expectOne('/example');
      req.flush({ example: 'data' });

      expect(req.request.method).toBe('GET');
      expect(
        req.request.headers.get(HttpCustomHeader.CUSTOM_SUCCESS_MESSAGE),
      ).toBe('customSuccess');
      expect(await promise).toEqual({ example: 'data' });
    });

    it('createExample should POST the body to /example', async () => {
      const body = { example: 'new' };
      const promise = service.createExample(body);

      const req = httpMock.expectOne('/example');
      req.flush({ message: 'ok', id: 1 });

      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(body);
      expect(await promise).toEqual({ message: 'ok', id: 1 });
    });

    it('updateExample should PUT the body to /example/:id', async () => {
      const body = { example: 'updated' };
      const promise = service.updateExample(7, body);

      const req = httpMock.expectOne('/example/7');
      req.flush({ message: 'ok', id: 7 });

      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(body);
      expect(await promise).toEqual({ message: 'ok', id: 7 });
    });

    it('getExampleDocument should GET /example/document as blob', async () => {
      const blob = new Blob(['pdf']);
      const promise = service.getExampleDocument();

      const req = httpMock.expectOne('/example/document');
      req.flush(blob);

      expect(req.request.responseType).toBe('blob');
      expect(await promise).toEqual(blob);
    });
  });
});
