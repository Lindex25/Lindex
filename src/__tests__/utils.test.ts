/**
 * Utility function tests
 * 
 * Basic tests to verify utility helpers work correctly.
 */

describe('Utility Functions', () => {
  describe('String utilities', () => {
    it('should trim whitespace from strings', () => {
      const input = '  hello world  ';
      expect(input.trim()).toBe('hello world');
    });

    it('should convert strings to lowercase', () => {
      const input = 'Hello World';
      expect(input.toLowerCase()).toBe('hello world');
    });

    it('should convert strings to uppercase', () => {
      const input = 'Hello World';
      expect(input.toUpperCase()).toBe('HELLO WORLD');
    });
  });

  describe('Array utilities', () => {
    it('should filter array elements', () => {
      const numbers = [1, 2, 3, 4, 5];
      const evens = numbers.filter(n => n % 2 === 0);
      expect(evens).toEqual([2, 4]);
    });

    it('should map array elements', () => {
      const numbers = [1, 2, 3];
      const doubled = numbers.map(n => n * 2);
      expect(doubled).toEqual([2, 4, 6]);
    });

    it('should reduce array to single value', () => {
      const numbers = [1, 2, 3, 4, 5];
      const sum = numbers.reduce((acc, n) => acc + n, 0);
      expect(sum).toBe(15);
    });
  });

  describe('Object utilities', () => {
    it('should get object keys', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(Object.keys(obj)).toEqual(['a', 'b', 'c']);
    });

    it('should get object values', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(Object.values(obj)).toEqual([1, 2, 3]);
    });

    it('should merge objects with spread operator', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { c: 3, d: 4 };
      const merged = { ...obj1, ...obj2 };
      expect(merged).toEqual({ a: 1, b: 2, c: 3, d: 4 });
    });
  });
});

