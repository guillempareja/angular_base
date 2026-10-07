import { Pipe, type PipeTransform } from '@angular/core';
import { type AbstractControl } from '@angular/forms';

@Pipe({
  name: 'isInvalidControl',
  standalone: true,
  pure: false,
})
export class IsInvalidControlPipe implements PipeTransform {
  /**
   * Determines if a form control is invalid and has been interacted with.
   * @param form - The form group or form control.
   * @param field - The name of the form control within the form group (optional).
   * @param errorName - Specific error to check for (optional).
   * @param checkDirty - Flag to check for 'dirty' state in addition to 'touched' (default: false).
   * @returns True if the control is invalid and has been interacted with; otherwise, false.
   */
  transform(
    form: AbstractControl,
    field?: string,
    errorName?: string,
    checkDirty = false,
  ): boolean {
    // Retrieve the control; if 'field' is provided, get it from the form group
    const control = field ? form.get(field) : form;

    // If control is not found, return false
    if (!control) {
      return false;
    }

    // Determine if the control has the specified error or is invalid
    const hasError = errorName ? control.hasError(errorName) : control.invalid;

    // Check if the control has been interacted with based on 'touched' and optionally 'dirty' states
    const isInteracted = checkDirty
      ? control.touched || control.dirty
      : control.touched;

    // Return true if the control is invalid and has been interacted with
    return hasError && isInteracted;
  }
}
