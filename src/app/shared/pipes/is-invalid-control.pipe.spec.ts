import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IsInvalidControlPipe } from './is-invalid-control.pipe';

describe('IsInvalidControlPipe', () => {
  const pipe = new IsInvalidControlPipe();
  let form: FormGroup;

  beforeEach(() => {
    form = new FormGroup({
      name: new FormControl('', Validators.required),
    });
  });

  it('should be false for an untouched invalid control', () => {
    expect(pipe.transform(form, 'name')).toBeFalse();
  });

  it('should be true for a touched invalid control', () => {
    form.get('name')!.markAsTouched();

    expect(pipe.transform(form, 'name')).toBeTrue();
  });

  it('should be true for a dirty invalid control when checkDirty is set', () => {
    form.get('name')!.markAsDirty();

    expect(pipe.transform(form, 'name', undefined, true)).toBeTrue();
  });

  it('should check a specific error when errorName is given', () => {
    form.get('name')!.markAsTouched();

    expect(pipe.transform(form, 'name', 'maxlength')).toBeFalse();
  });

  it('should evaluate the form itself when no field is given', () => {
    form.markAsTouched();

    expect(pipe.transform(form)).toBeTrue();
  });

  it('should be false when the field does not exist', () => {
    expect(pipe.transform(form, 'unknown')).toBeFalse();
  });
});
