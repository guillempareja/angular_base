import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { HttpResponseHandlerService } from './http-response-handler.service';

describe('HttpResponseHandlerService', () => {
  let service: HttpResponseHandlerService;
  let toastrSpy: jasmine.SpyObj<ToastrService>;

  beforeEach(() => {
    toastrSpy = jasmine.createSpyObj('ToastrService', [
      'error',
      'warning',
      'success',
    ]);

    TestBed.configureTestingModule({
      providers: [
        provideTranslateService(),
        { provide: ToastrService, useValue: toastrSpy },
      ],
    });

    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('es', {
      httpRequest: {
        error: { knownError: 'Known error', default: 'Default error' },
        warning: { knownWarning: 'Known warning', default: 'Default warning' },
        success: { default: 'Default success' },
      },
    });
    translate.use('es');

    service = TestBed.inject(HttpResponseHandlerService);
  });

  describe('Methods', () => {
    it('handleHttpError should show the message of the backend tag', () => {
      service.handleHttpError(
        new HttpErrorResponse({ error: { tag: 'knownError' } }),
      );

      expect(toastrSpy.error).toHaveBeenCalledWith('Known error');
    });

    it('handleHttpError should fall back to the default message for unknown tags', () => {
      service.handleHttpError(
        new HttpErrorResponse({ error: { tag: 'unknownError' } }),
      );

      expect(toastrSpy.error).toHaveBeenCalledWith('Default error');
    });

    it('handleHttpError should use the default message when there is no tag', () => {
      service.handleHttpError(new HttpErrorResponse({}));

      expect(toastrSpy.error).toHaveBeenCalledWith('Default error');
    });

    it('handleHttpWarning should show a warning toast', () => {
      service.handleHttpWarning('knownWarning');

      expect(toastrSpy.warning).toHaveBeenCalledWith('Known warning');
    });

    it('handleSuccessResponse should show the default success message', () => {
      service.handleSuccessResponse();

      expect(toastrSpy.success).toHaveBeenCalledWith('Default success');
    });

    it('handleSessionExpired should show the session expired error', () => {
      service.handleSessionExpired();

      expect(toastrSpy.error).toHaveBeenCalledWith(
        'httpRequest.error.sessionExpired',
      );
    });
  });
});
