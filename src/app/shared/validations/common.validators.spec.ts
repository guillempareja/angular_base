import { FormControl } from '@angular/forms';
import {
  exactLengthValidator,
  maxLengthValidator,
  minLengthValidator,
  numericValidator,
} from './common.validators';

describe('common.validators', () => {
  describe('numericValidator', () => {
    const validator = numericValidator();

    it('should accept empty values', () => {
      expect(validator(new FormControl(''))).toBeNull();
    });

    it('should accept numbers', () => {
      expect(validator(new FormControl('12.5'))).toBeNull();
    });

    it('should reject non numeric values', () => {
      expect(validator(new FormControl('12abc'))).toEqual({
        numeric: { translationTag: 'form.numericError' },
      });
    });
  });

  describe('exactLengthValidator', () => {
    const validator = exactLengthValidator(3);

    it('should accept empty values', () => {
      expect(validator(new FormControl(null))).toBeNull();
    });

    it('should accept the exact length', () => {
      expect(validator(new FormControl('abc'))).toBeNull();
    });

    it('should reject other lengths', () => {
      expect(validator(new FormControl('ab'))).toEqual({
        exactLength: {
          translationTag: 'form.exactLengthError',
          interpolationParams: { length: 3 },
        },
      });
    });
  });

  describe('maxLengthValidator', () => {
    const validator = maxLengthValidator(3);

    it('should accept empty values', () => {
      expect(validator(new FormControl(' '))).toBeNull();
    });

    it('should accept values up to the limit', () => {
      expect(validator(new FormControl('abc'))).toBeNull();
    });

    it('should reject longer values', () => {
      expect(validator(new FormControl('abcd'))).toEqual({
        maxLength: {
          translationTag: 'form.maxLengthError',
          interpolationParams: { max: 3 },
        },
      });
    });
  });

  describe('minLengthValidator', () => {
    const validator = minLengthValidator(3);

    it('should accept empty values', () => {
      expect(validator(new FormControl(''))).toBeNull();
    });

    it('should accept values from the limit', () => {
      expect(validator(new FormControl('abc'))).toBeNull();
    });

    it('should reject shorter values', () => {
      expect(validator(new FormControl('ab'))).toEqual({
        minLength: {
          translationTag: 'form.minLengthError',
          interpolationParams: { min: 3 },
        },
      });
    });
  });
});
