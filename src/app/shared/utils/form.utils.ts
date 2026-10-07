import { FormGroup, type AbstractControl } from '@angular/forms';

/**
 * Marca todos los controles y subcontroles de un formulario como 'touched'.
 *
 * @param {AbstractControl} control - El control de formulario principal que se desea marcar.
 */
export function markAllControlsAsTouched(control: AbstractControl): void {
  if (control instanceof FormGroup) {
    Object.values(control.controls).forEach((ctrl) => {
      markAllControlsAsTouched(ctrl);
    });
  }
  control.markAsTouched();
}
