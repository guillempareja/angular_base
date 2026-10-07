import {
  type AbstractControl,
  type ValidationErrors,
  type ValidatorFn,
} from '@angular/forms';

/**
 * Validates that the value is a valid number
 * Returns error if value is not numeric (e.g., "abc", "12abc", NaN)
 *
 * @returns ValidatorFn
 *
 * Example usage in i18n:
 * "form.numericError": "Debe ser un valor numérico"
 */
export function numericValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value || control.value.toString().trim() === '') {
      return null; // Valid when empty
    }

    const value = control.value.toString().trim();

    // Check if it's a valid number (not NaN and is numeric)
    if (isNaN(Number(value)) || isNaN(parseFloat(value))) {
      return {
        numeric: { translationTag: 'form.numericError' },
      };
    }

    return null;
  };
}

/**
 * Validates exact length
 * Returns error with the exact value for i18n interpolation
 *
 * @param length Exact length required
 * @returns ValidatorFn
 *
 * Example usage in i18n:
 * "form.exactLengthError": "Debe tener exactamente {{length}} caracteres"
 */
export function exactLengthValidator(length: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value || control.value.toString().trim() === '') {
      return null; // Valid when empty
    }

    const value = control.value.toString();

    if (value.length !== length) {
      return {
        exactLength: {
          translationTag: 'form.exactLengthError',
          interpolationParams: { length },
        },
      };
    }

    return null;
  };
}

/**
 * Validates maximum length with dynamic limit
 * Returns error with the max value for i18n interpolation
 *
 * @param max Maximum allowed length
 * @returns ValidatorFn
 *
 * Example usage in i18n:
 * "form.maxLengthError": "Máximo {{max}} caracteres permitidos"
 */
export function maxLengthValidator(max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value || control.value.toString().trim() === '') {
      return null; // Valid when empty
    }

    const value = control.value.toString();

    if (value.length > max) {
      return {
        maxLength: {
          translationTag: 'form.maxLengthError',
          interpolationParams: { max },
        },
      };
    }

    return null;
  };
}

/**
 * Validates minimum length with dynamic limit
 * Returns error with the min value for i18n interpolation
 *
 * @param min Minimum required length
 * @returns ValidatorFn
 *
 * Example usage in i18n:
 * "form.minLengthError": "Mínimo {{min}} caracteres requeridos"
 */
export function minLengthValidator(min: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value || control.value.toString().trim() === '') {
      return null; // Valid when empty
    }

    const value = control.value.toString();

    if (value.length < min) {
      return {
        minLength: {
          translationTag: 'form.minLengthError',
          interpolationParams: { min },
        },
      };
    }

    return null;
  };
}
