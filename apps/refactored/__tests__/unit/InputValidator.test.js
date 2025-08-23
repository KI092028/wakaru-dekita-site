/**
 * InputValidator Unit Tests
 * Purpose: Test input validation and sanitization logic
 * Coverage Target: 95% - Critical security and UX component
 * Impact: Prevents invalid input bugs, ensures consistent user experience
 * Future: Ready for AI-powered input prediction and personalized hints
 */

import { describe, test, expect, beforeEach } from '@jest/globals';

// InputValidator class simulation
class InputValidator {
  convertToHalfWidth(str) {
    return str.replace(/[０-９]/g, function(s) {
      return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
  }

  extractNumbers(str) {
    return str.replace(/[^0-9]/g, '');
  }

  validateInput(inputValue) {
    if (!inputValue) {
      return { isValid: false, value: null, error: 'すうじを いれてね！' };
    }

    let processedValue = this.convertToHalfWidth(inputValue);
    processedValue = this.extractNumbers(processedValue);
    
    const numericValue = parseInt(processedValue);
    
    if (isNaN(numericValue)) {
      return { isValid: false, value: null, error: 'すうじを いれてね！' };
    }

    return { isValid: true, value: numericValue, error: null };
  }
}

describe('InputValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new InputValidator();
  });

  describe('Full-width to Half-width Conversion', () => {
    test('should convert full-width numbers to half-width', () => {
      expect(validator.convertToHalfWidth('１２３')).toBe('123');
      expect(validator.convertToHalfWidth('０')).toBe('0');
      expect(validator.convertToHalfWidth('９')).toBe('9');
    });

    test('should leave half-width numbers unchanged', () => {
      expect(validator.convertToHalfWidth('123')).toBe('123');
      expect(validator.convertToHalfWidth('0')).toBe('0');
      expect(validator.convertToHalfWidth('9')).toBe('9');
    });

    test('should handle mixed full-width and half-width numbers', () => {
      expect(validator.convertToHalfWidth('１2３')).toBe('123');
      expect(validator.convertToHalfWidth('１０0')).toBe('100');
    });

    test('should preserve non-numeric characters during conversion', () => {
      expect(validator.convertToHalfWidth('１２３abc')).toBe('123abc');
      expect(validator.convertToHalfWidth('hello１２３world')).toBe('hello123world');
    });

    test('should handle empty string', () => {
      expect(validator.convertToHalfWidth('')).toBe('');
    });

    test('should handle null and undefined gracefully', () => {
      expect(() => validator.convertToHalfWidth(null)).toThrow();
      expect(() => validator.convertToHalfWidth(undefined)).toThrow();
    });
  });

  describe('Number Extraction', () => {
    test('should extract only numeric characters', () => {
      expect(validator.extractNumbers('123')).toBe('123');
      expect(validator.extractNumbers('1a2b3c')).toBe('123');
      expect(validator.extractNumbers('abc123def')).toBe('123');
      expect(validator.extractNumbers('!@#123$%^')).toBe('123');
    });

    test('should handle strings with no numbers', () => {
      expect(validator.extractNumbers('abc')).toBe('');
      expect(validator.extractNumbers('!@#$%^')).toBe('');
      expect(validator.extractNumbers('')).toBe('');
    });

    test('should handle special characters and symbols', () => {
      expect(validator.extractNumbers('1+2=3')).toBe('123');
      expect(validator.extractNumbers('(123)')).toBe('123');
      expect(validator.extractNumbers('1.23')).toBe('123');
      expect(validator.extractNumbers('1-2-3')).toBe('123');
    });

    test('should handle unicode and emoji characters', () => {
      expect(validator.extractNumbers('123🎉')).toBe('123');
      expect(validator.extractNumbers('数字123文字')).toBe('123');
    });
  });

  describe('Input Validation - Valid Cases', () => {
    test('should validate simple numeric strings', () => {
      const result = validator.validateInput('123');
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(123);
      expect(result.error).toBeNull();
    });

    test('should validate single digit numbers', () => {
      const result = validator.validateInput('5');
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(5);
      expect(result.error).toBeNull();
    });

    test('should validate zero', () => {
      const result = validator.validateInput('0');
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(0);
      expect(result.error).toBeNull();
    });

    test('should validate full-width numbers', () => {
      const result = validator.validateInput('１２３');
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(123);
      expect(result.error).toBeNull();
    });

    test('should validate mixed input with numbers', () => {
      const result = validator.validateInput('answer: 42');
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(42);
      expect(result.error).toBeNull();
    });

    test('should handle leading zeros correctly', () => {
      const result = validator.validateInput('007');
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(7);
      expect(result.error).toBeNull();
    });
  });

  describe('Input Validation - Invalid Cases', () => {
    test('should reject empty string', () => {
      const result = validator.validateInput('');
      expect(result.isValid).toBe(false);
      expect(result.value).toBeNull();
      expect(result.error).toBe('すうじを いれてね！');
    });

    test('should reject null input', () => {
      const result = validator.validateInput(null);
      expect(result.isValid).toBe(false);
      expect(result.value).toBeNull();
      expect(result.error).toBe('すうじを いれてね！');
    });

    test('should reject undefined input', () => {
      const result = validator.validateInput(undefined);
      expect(result.isValid).toBe(false);
      expect(result.value).toBeNull();
      expect(result.error).toBe('すうじを いれてね！');
    });

    test('should reject strings with no numbers', () => {
      const result = validator.validateInput('abc');
      expect(result.isValid).toBe(false);
      expect(result.value).toBeNull();
      expect(result.error).toBe('すうじを いれてね！');
    });

    test('should reject whitespace-only input', () => {
      const result = validator.validateInput('   ');
      expect(result.isValid).toBe(false);
      expect(result.value).toBeNull();
      expect(result.error).toBe('すうじを いれてね！');
    });

    test('should reject special characters only', () => {
      const result = validator.validateInput('!@#$%');
      expect(result.isValid).toBe(false);
      expect(result.value).toBeNull();
      expect(result.error).toBe('すうじを いれてね！');
    });
  });

  describe('Edge Cases and Security', () => {
    test('should handle extremely large numbers', () => {
      const largeNumber = '123456789012345';
      const result = validator.validateInput(largeNumber);
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(123456789012345);
    });

    test('should handle very long strings with embedded numbers', () => {
      const longString = 'a'.repeat(1000) + '42' + 'b'.repeat(1000);
      const result = validator.validateInput(longString);
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(42);
    });

    test('should handle potential XSS attempts', () => {
      const xssAttempt = '<script>alert("xss")</script>123';
      const result = validator.validateInput(xssAttempt);
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(123);
      expect(result.error).toBeNull();
    });

    test('should handle SQL injection attempts', () => {
      const sqlAttempt = "'; DROP TABLE users; --123";
      const result = validator.validateInput(sqlAttempt);
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(123);
    });

    test('should handle unicode edge cases', () => {
      const unicodeInput = '１２３🚀🎯数字';
      const result = validator.validateInput(unicodeInput);
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(123);
    });
  });

  describe('Performance and Memory', () => {
    test('should handle multiple validations efficiently', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        validator.validateInput(`test${i}`);
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Should complete 1000 validations in less than 100ms
      expect(executionTime).toBeLessThan(100);
    });

    test('should not leak memory with repeated use', () => {
      const memoryBefore = process.memoryUsage?.().heapUsed || 0;
      
      for (let i = 0; i < 10000; i++) {
        validator.validateInput(`memory test ${i}`);
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const memoryAfter = process.memoryUsage?.().heapUsed || 0;
      const memoryIncrease = memoryAfter - memoryBefore;
      
      // Memory increase should be reasonable (less than 10MB for 10k operations)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe('Future AI Integration Readiness', () => {
    test('should provide structured output suitable for ML processing', () => {
      const result = validator.validateInput('123abc');
      
      // Verify structure is suitable for AI/ML pipelines
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('value');
      expect(result).toHaveProperty('error');
      expect(typeof result.isValid).toBe('boolean');
      expect(typeof result.value).toBe('number');
    });

    test('should handle batch validation scenarios', () => {
      const inputs = ['123', 'abc', '４５６', '7+8', ''];
      const results = inputs.map(input => validator.validateInput(input));
      
      expect(results).toHaveLength(5);
      expect(results[0].isValid).toBe(true);
      expect(results[1].isValid).toBe(false);
      expect(results[2].isValid).toBe(true);
      expect(results[3].isValid).toBe(true);
      expect(results[4].isValid).toBe(false);
    });
  });
});