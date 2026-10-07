import { FormControl, FormGroup } from '@angular/forms';
import { markAllControlsAsTouched } from './form.utils';

describe('markAllControlsAsTouched', () => {
  it('should mark a single control as touched', () => {
    const control = new FormControl('');

    markAllControlsAsTouched(control);

    expect(control.touched).toBeTrue();
  });

  it('should mark nested controls as touched', () => {
    const form = new FormGroup({
      name: new FormControl(''),
      address: new FormGroup({ city: new FormControl('') }),
    });

    markAllControlsAsTouched(form);

    expect(form.get('address.city')?.touched).toBeTrue();
  });
});
