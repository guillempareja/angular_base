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

  private findFirstError(
    controls: AbstractControl[],
  ): { key: string; value: unknown } | null {
    for (const control of controls) {
      const errors = control.errors;
      const key = errors ? Object.keys(errors)[0] : undefined;
      if (errors && key) {
        return { key, value: errors[key] };
      }
    }

    return null;
  }

  private resolveErrorValue(errorValue: unknown): string {
    // Plain string: custom message from parent
    if (typeof errorValue === 'string') {
      return errorValue;
    }

    // Custom validators: object with translationTag and optional interpolationParams
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
  public transform(
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

    const firstError = this.findFirstError(list);
    if (!firstError) {
      return '';
    }

    // Custom error message override
    const customMessage = errorMessages[firstError.key];
    if (customMessage) {
      return customMessage;
    }

    // Angular native validators (translate from i18n)
    const nativeTag = this.ANGULAR_NATIVE_VALIDATORS[firstError.key];
    if (nativeTag) {
      return this.translate.instant(nativeTag);
    }

    return this.resolveErrorValue(firstError.value);
  }
}
