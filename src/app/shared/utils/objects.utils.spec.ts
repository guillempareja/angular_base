import {
  areAllPropsNull,
  getValueByPath,
  removeEmptyProperties,
} from './objects.utils';

describe('objects.utils', () => {
  describe('removeEmptyProperties', () => {
    it('should remove null, undefined, empty strings and empty collections', () => {
      const input = {
        name: 'John',
        empty: '',
        nothing: null,
        missing: undefined,
        list: [],
        nested: { inner: '' },
      };

      expect(removeEmptyProperties(input)).toEqual({ name: 'John' });
    });

    it('should clean arrays recursively', () => {
      expect(removeEmptyProperties(['a', '', null, 'b'])).toEqual(['a', 'b']);
    });

    it('should keep non-plain objects intact', () => {
      const date = new Date();

      expect(removeEmptyProperties({ date })).toEqual({ date });
    });

    it('should return empty base values as they are', () => {
      expect(removeEmptyProperties(null)).toBeNull();
      expect(removeEmptyProperties('')).toBe('');
    });

    it('should return primitives as they are', () => {
      expect(removeEmptyProperties(5)).toBe(5);
    });
  });

  describe('getValueByPath', () => {
    const obj = { user: { address: { city: 'Madrid' } } };

    it('should return the nested value', () => {
      expect(getValueByPath(obj, 'user.address.city')).toBe('Madrid');
    });

    it('should return undefined for a missing path', () => {
      expect(getValueByPath(obj, 'user.phone.number')).toBeUndefined();
    });

    it('should return undefined for a null object', () => {
      expect(getValueByPath(null, 'user')).toBeUndefined();
    });
  });

  describe('areAllPropsNull', () => {
    it('should be true when every property is null', () => {
      expect(areAllPropsNull({ a: null, b: null })).toBeTrue();
    });

    it('should be false when any property has a value', () => {
      expect(areAllPropsNull({ a: null, b: 0 })).toBeFalse();
    });
  });
});
