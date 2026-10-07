import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { FormService } from './form.service';

describe('FormService', () => {
  let service: FormService;
  let toastrSpy: jasmine.SpyObj<ToastrService>;
  let invalidElement: HTMLElement;

  beforeEach(() => {
    toastrSpy = jasmine.createSpyObj('ToastrService', ['error']);

    TestBed.configureTestingModule({
      providers: [
        provideTranslateService(),
        { provide: ToastrService, useValue: toastrSpy },
      ],
    });

    service = TestBed.inject(FormService);
    invalidElement = document.createElement('input');
    invalidElement.classList.add('ng-invalid');
    spyOn(invalidElement, 'scrollIntoView');
  });

  afterEach(() => {
    invalidElement.remove();
  });

  it('should scroll to the first invalid element and show an error', () => {
    document.body.appendChild(invalidElement);

    service.navigateToFormError();

    expect(invalidElement.scrollIntoView).toHaveBeenCalled();
    expect(toastrSpy.error).toHaveBeenCalledWith('form.globalError');
  });

  it('should do nothing when there are no invalid elements', () => {
    service.navigateToFormError();

    expect(toastrSpy.error).not.toHaveBeenCalled();
  });
});
