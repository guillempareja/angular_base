import { FormControl } from '@angular/forms';
import { addDays, subDays } from 'date-fns';
import {
  dateNotAfterOrEqualTodayValidator,
  dateNotAfterTodayValidator,
  dateNotBeforeOrEqualTodayValidator,
  dateNotBeforeTodayValidator,
} from './date.validators';

describe('date.validators', () => {
  const today = new Date();
  const yesterday = subDays(today, 1);
  const tomorrow = addDays(today, 1);

  describe('dateNotBeforeTodayValidator', () => {
    const validator = dateNotBeforeTodayValidator();

    it('should accept empty values', () => {
      expect(validator(new FormControl(null))).toBeNull();
    });

    it('should ignore invalid dates', () => {
      expect(validator(new FormControl('not a date'))).toBeNull();
    });

    it('should accept today', () => {
      expect(validator(new FormControl(today))).toBeNull();
    });

    it('should reject past dates', () => {
      expect(validator(new FormControl(yesterday))).toEqual({
        dateNotBeforeToday: { translationTag: 'form.dateNotBeforeTodayError' },
      });
    });
  });

  describe('dateNotBeforeOrEqualTodayValidator', () => {
    const validator = dateNotBeforeOrEqualTodayValidator();

    it('should accept empty values', () => {
      expect(validator(new FormControl(null))).toBeNull();
    });

    it('should accept future dates', () => {
      expect(validator(new FormControl(tomorrow))).toBeNull();
    });

    it('should reject today', () => {
      expect(validator(new FormControl(today))).toEqual({
        dateNotBeforeOrEqualToday: {
          translationTag: 'form.dateNotBeforeOrEqualTodayError',
        },
      });
    });
  });

  describe('dateNotAfterTodayValidator', () => {
    const validator = dateNotAfterTodayValidator();

    it('should accept empty values', () => {
      expect(validator(new FormControl(null))).toBeNull();
    });

    it('should accept today', () => {
      expect(validator(new FormControl(today))).toBeNull();
    });

    it('should reject future dates', () => {
      expect(validator(new FormControl(tomorrow))).toEqual({
        dateNotAfterToday: { translationTag: 'form.dateNotAfterTodayError' },
      });
    });
  });

  describe('dateNotAfterOrEqualTodayValidator', () => {
    const validator = dateNotAfterOrEqualTodayValidator();

    it('should accept empty values', () => {
      expect(validator(new FormControl(null))).toBeNull();
    });

    it('should accept past dates', () => {
      expect(validator(new FormControl(yesterday))).toBeNull();
    });

    it('should reject today', () => {
      expect(validator(new FormControl(today))).toEqual({
        dateNotAfterOrEqualToday: {
          translationTag: 'form.dateNotAfterOrEqualTodayError',
        },
      });
    });
  });
});
