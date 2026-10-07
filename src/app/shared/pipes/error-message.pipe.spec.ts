import { TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { provideTranslateService } from '@ngx-translate/core';
import { ErrorMessagePipe } from './error-message.pipe';

describe('ErrorMessagePipe', () => {
  let pipe: ErrorMessagePipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideTranslateService()],
    });

    pipe = TestBed.runInInjectionContext(() => new ErrorMessagePipe());
  });

  it('should return an empty string without controls', () => {
    expect(pipe.transform(null as unknown as FormControl)).toBe('');
  });

  it('should return an empty string when there are no errors', () => {
    expect(pipe.transform(new FormControl('value'))).toBe('');
  });

  it('should translate Angular native validators', () => {
    const control = new FormControl('', Validators.required);

    expect(pipe.transform(control)).toBe('form.requiredError');
  });

  it('should prefer the custom message override', () => {
    const control = new FormControl('', Validators.required);

    expect(pipe.transform(control, { required: 'Custom' })).toBe('Custom');
  });

  it('should return plain string errors as they are', () => {
    const control = new FormControl('');
    control.setErrors({ custom: 'Plain message' });

    expect(pipe.transform(control)).toBe('Plain message');
  });

  it('should translate custom validator tags', () => {
    const control = new FormControl('');
    control.setErrors({ custom: { translationTag: 'form.numericError' } });

    expect(pipe.transform(control)).toBe('form.numericError');
  });

  it('should fall back to the generic message for unknown errors', () => {
    const control = new FormControl('');
    control.setErrors({ custom: true });

    expect(pipe.transform(control)).toBe('form.invalidFieldError');
  });

  it('should use the first control with errors from a list', () => {
    const valid = new FormControl('value');
    const invalid = new FormControl('', Validators.required);

    expect(pipe.transform([valid, invalid])).toBe('form.requiredError');
  });
});
