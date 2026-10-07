import { Pipe, type PipeTransform, inject } from '@angular/core';
import { type AbstractControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

@Pipe({ name: 'errorMessage', standalone: true, pure: false })
export class ErrorMessagePipe implements PipeTransform {
  // Injections
  private translate = inject(TranslateService);

  /**
   * Angular native validators that need translation
   * Add more Angular native validations here (email, min, max, pattern, etc.)
   */
  private readonly ANGULAR_NATIVE_VALIDATORS: Record<string, string> = {
    required: 'form.requiredError',
    // Add more as needed: email, min, max, pattern, minlength, maxlength, etc.
  };

  /**
   * Returns an error message based on the first error found among one or more controls.
   * - Accepts a single AbstractControl or an array of them.
   * - Finds the first control that has an error and retrieves its first error key.
   * - For Angular native validators (like 'required'), translates using i18n.
   * - For custom validators with objects containing 'translationTag', translates them.
   * - If errorValue is a plain string, returns it directly (for custom overrides from parent).
   * - Supports custom error messages passed as parameter that override defaults.
   *
   * @param controls      One control or an array of controls to inspect.
   * @param errorMessages Optional overrides e.g. { required: 'Este campo es obligatorio' }.
   */
  transform(
    controls: AbstractControl | AbstractControl[],
    errorMessages: Record<string, string> = {},
  ): string {
    if (!controls) {
      return '';
    }

    // Normalize to array
    const list: AbstractControl[] = Array.isArray(controls)
      ? controls.filter((item): item is AbstractControl => !!item)
      : [controls];

    // Find first control that has errors
    let errorKey: string | undefined;
    let errorValue: unknown;

    for (const control of list) {
      const keys = control.errors ? Object.keys(control.errors) : [];
      if (keys.length) {
        errorKey = keys[0];
        errorValue = control.errors![errorKey];
        break;
      }
    }

    if (!errorKey) {
      return '';
    }

    // Check if there's a custom error message override
    if (errorMessages[errorKey]) {
      return errorMessages[errorKey];
    }

    // Handle Angular native validators (translate from i18n)
    if (this.ANGULAR_NATIVE_VALIDATORS[errorKey]) {
      return this.translate.instant(this.ANGULAR_NATIVE_VALIDATORS[errorKey]);
    }

    // If errorValue is a plain string, return it directly (custom message from parent)
    if (typeof errorValue === 'string') {
      return errorValue;
    }

    // For custom validators with object containing translationTag and optional interpolationParams
    if (
      typeof errorValue === 'object' &&
      errorValue !== null &&
      'translationTag' in errorValue
    ) {
      const errorObj = errorValue as {
        translationTag: string;
        interpolationParams?: Record<string, unknown>;
      };
      return this.translate.instant(
        errorObj.translationTag,
        errorObj.interpolationParams,
      );
    }

    // Generic fallback message
    return this.translate.instant('form.invalidFieldError');
  }
}
