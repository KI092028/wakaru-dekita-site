/**
 * ProblemGenerator Unit Tests
 * Purpose: Test math problem generation logic across difficulty levels
 * Coverage Target: 85% - Core educational logic component
 * Impact: Ensures appropriate difficulty progression and learning curve
 * Future: Ready for adaptive difficulty and AI-powered personalized problems
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';

// Mock GameState for dependency injection
class MockGameState {
  constructor() {
    this.difficulty = 'easy';
    this.currentProblem = {};
    this.DIFFICULTY_RANGES = {
      easy: { min: 1, max: 10 },
      medium: { min: 1, max: 20 },
      hard: { min: 1, max: 50 }
    };
  }
}

// ProblemGenerator class simulation
class ProblemGenerator {
  constructor(gameState) {
    this.gameState = gameState;
  }

  generateProblem() {
    const range = this.gameState.DIFFICULTY_RANGES[this.gameState.difficulty];
    
    const num1 = Math.floor(Math.random() * range.max) + range.min;
    const num2 = Math.floor(Math.random() * range.max) + range.min;
    
    this.gameState.currentProblem = {
      num1: num1,
      num2: num2,
      answer: num1 + num2
    };

    return this.gameState.currentProblem;
  }

  // Future method for adaptive difficulty
  generateAdaptiveProblem(userPerformanceData) {
    // Placeholder for AI-powered adaptive problem generation
    const baseRange = this.gameState.DIFFICULTY_RANGES[this.gameState.difficulty];
    
    // Simulate adaptive adjustment based on performance
    const adjustmentFactor = userPerformanceData?.accuracy >= 0.8 ? 1.2 : 0.8;
    const adjustedMax = Math.min(baseRange.max * adjustmentFactor, 100);
    
    const num1 = Math.floor(Math.random() * adjustedMax) + baseRange.min;
    const num2 = Math.floor(Math.random() * adjustedMax) + baseRange.min;
    
    this.gameState.currentProblem = {
      num1: num1,
      num2: num2,
      answer: num1 + num2,
      adaptiveLevel: adjustmentFactor
    };

    return this.gameState.currentProblem;
  }
}

describe('ProblemGenerator', () => {
  let gameState;
  let generator;

  beforeEach(() => {
    gameState = new MockGameState();
    generator = new ProblemGenerator(gameState);
    
    // Reset Math.random to a predictable state for some tests
    jest.spyOn(Math, 'random');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Basic Problem Generation', () => {
    test('should generate a problem with num1, num2, and answer', () => {
      const problem = generator.generateProblem();
      
      expect(problem).toHaveProperty('num1');
      expect(problem).toHaveProperty('num2');
      expect(problem).toHaveProperty('answer');
      expect(typeof problem.num1).toBe('number');
      expect(typeof problem.num2).toBe('number');
      expect(typeof problem.answer).toBe('number');
    });

    test('should calculate correct addition answer', () => {
      const problem = generator.generateProblem();
      
      expect(problem.answer).toBe(problem.num1 + problem.num2);
    });

    test('should update gameState.currentProblem', () => {
      const problem = generator.generateProblem();
      
      expect(gameState.currentProblem).toEqual(problem);
      expect(gameState.currentProblem.num1).toBe(problem.num1);
      expect(gameState.currentProblem.num2).toBe(problem.num2);
      expect(gameState.currentProblem.answer).toBe(problem.answer);
    });
  });

  describe('Difficulty Level Testing', () => {
    describe('Easy Difficulty', () => {
      beforeEach(() => {
        gameState.difficulty = 'easy';
      });

      test('should generate numbers within easy range (1-10)', () => {
        // Test multiple generations to ensure consistency
        for (let i = 0; i < 100; i++) {
          const problem = generator.generateProblem();
          
          expect(problem.num1).toBeGreaterThanOrEqual(1);
          expect(problem.num1).toBeLessThanOrEqual(10);
          expect(problem.num2).toBeGreaterThanOrEqual(1);
          expect(problem.num2).toBeLessThanOrEqual(10);
        }
      });

      test('should generate answers within expected range (2-20)', () => {
        for (let i = 0; i < 50; i++) {
          const problem = generator.generateProblem();
          
          expect(problem.answer).toBeGreaterThanOrEqual(2); // min: 1+1
          expect(problem.answer).toBeLessThanOrEqual(20);   // max: 10+10
        }
      });
    });

    describe('Medium Difficulty', () => {
      beforeEach(() => {
        gameState.difficulty = 'medium';
      });

      test('should generate numbers within medium range (1-20)', () => {
        for (let i = 0; i < 50; i++) {
          const problem = generator.generateProblem();
          
          expect(problem.num1).toBeGreaterThanOrEqual(1);
          expect(problem.num1).toBeLessThanOrEqual(20);
          expect(problem.num2).toBeGreaterThanOrEqual(1);
          expect(problem.num2).toBeLessThanOrEqual(20);
        }
      });

      test('should generate answers within expected range (2-40)', () => {
        for (let i = 0; i < 30; i++) {
          const problem = generator.generateProblem();
          
          expect(problem.answer).toBeGreaterThanOrEqual(2); // min: 1+1
          expect(problem.answer).toBeLessThanOrEqual(40);   // max: 20+20
        }
      });
    });

    describe('Hard Difficulty', () => {
      beforeEach(() => {
        gameState.difficulty = 'hard';
      });

      test('should generate numbers within hard range (1-50)', () => {
        for (let i = 0; i < 30; i++) {
          const problem = generator.generateProblem();
          
          expect(problem.num1).toBeGreaterThanOrEqual(1);
          expect(problem.num1).toBeLessThanOrEqual(50);
          expect(problem.num2).toBeGreaterThanOrEqual(1);
          expect(problem.num2).toBeLessThanOrEqual(50);
        }
      });

      test('should generate answers within expected range (2-100)', () => {
        for (let i = 0; i < 20; i++) {
          const problem = generator.generateProblem();
          
          expect(problem.answer).toBeGreaterThanOrEqual(2); // min: 1+1
          expect(problem.answer).toBeLessThanOrEqual(100);  // max: 50+50
        }
      });
    });
  });

  describe('Random Distribution Testing', () => {
    test('should generate varied problems (not always the same)', () => {
      const problems = [];
      
      for (let i = 0; i < 20; i++) {
        problems.push(generator.generateProblem());
      }
      
      // Check that we have some variation in num1
      const uniqueNum1Values = new Set(problems.map(p => p.num1));
      expect(uniqueNum1Values.size).toBeGreaterThan(1);
      
      // Check that we have some variation in num2
      const uniqueNum2Values = new Set(problems.map(p => p.num2));
      expect(uniqueNum2Values.size).toBeGreaterThan(1);
    });

    test('should have reasonable distribution across range', () => {
      gameState.difficulty = 'easy';
      const problems = [];
      
      for (let i = 0; i < 1000; i++) {
        problems.push(generator.generateProblem());
      }
      
      // Check that we're getting numbers from across the range
      const num1Values = problems.map(p => p.num1);
      const minNum1 = Math.min(...num1Values);
      const maxNum1 = Math.max(...num1Values);
      
      expect(minNum1).toBeLessThanOrEqual(3); // Should get some low numbers
      expect(maxNum1).toBeGreaterThanOrEqual(8); // Should get some high numbers
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle invalid difficulty gracefully', () => {
      gameState.difficulty = 'invalid';
      
      expect(() => {
        generator.generateProblem();
      }).toThrow();
    });

    test('should handle undefined difficulty ranges', () => {
      gameState.DIFFICULTY_RANGES = {};
      
      expect(() => {
        generator.generateProblem();
      }).toThrow();
    });

    test('should handle malformed difficulty ranges', () => {
      gameState.DIFFICULTY_RANGES.easy = { min: 10, max: 5 }; // Invalid range
      
      const problem = generator.generateProblem();
      
      // Should still generate a problem, but numbers might be unexpected
      expect(problem).toHaveProperty('num1');
      expect(problem).toHaveProperty('num2');
      expect(problem).toHaveProperty('answer');
    });
  });

  describe('Deterministic Testing with Mocked Random', () => {
    test('should generate predictable results with mocked random', () => {
      Math.random
        .mockReturnValueOnce(0.5)  // First call for num1
        .mockReturnValueOnce(0.8); // Second call for num2
      
      gameState.difficulty = 'easy';
      const problem = generator.generateProblem();
      
      // With easy range (1-10): 
      // num1 = Math.floor(0.5 * 10) + 1 = 5 + 1 = 6
      // num2 = Math.floor(0.8 * 10) + 1 = 8 + 1 = 9
      expect(problem.num1).toBe(6);
      expect(problem.num2).toBe(9);
      expect(problem.answer).toBe(15);
    });

    test('should handle edge random values (0 and 0.999)', () => {
      Math.random
        .mockReturnValueOnce(0)       // Minimum random value
        .mockReturnValueOnce(0.999);  // Maximum random value
      
      gameState.difficulty = 'easy';
      const problem = generator.generateProblem();
      
      // num1 = Math.floor(0 * 10) + 1 = 0 + 1 = 1
      // num2 = Math.floor(0.999 * 10) + 1 = 9 + 1 = 10
      expect(problem.num1).toBe(1);
      expect(problem.num2).toBe(10);
      expect(problem.answer).toBe(11);
    });
  });

  describe('Performance Testing', () => {
    test('should generate problems efficiently', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        generator.generateProblem();
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Should generate 1000 problems in less than 10ms
      expect(executionTime).toBeLessThan(10);
    });

    test('should not cause memory leaks with repeated generation', () => {
      const memoryBefore = process.memoryUsage?.().heapUsed || 0;
      
      for (let i = 0; i < 10000; i++) {
        generator.generateProblem();
      }
      
      if (global.gc) {
        global.gc();
      }
      
      const memoryAfter = process.memoryUsage?.().heapUsed || 0;
      const memoryIncrease = memoryAfter - memoryBefore;
      
      // Memory increase should be minimal
      expect(memoryIncrease).toBeLessThan(1024 * 1024); // Less than 1MB
    });
  });

  describe('Future AI Integration - Adaptive Problem Generation', () => {
    test('should support adaptive difficulty based on performance data', () => {
      const highPerformanceData = { accuracy: 0.9, averageTime: 3000 };
      const problem = generator.generateAdaptiveProblem(highPerformanceData);
      
      expect(problem).toHaveProperty('adaptiveLevel');
      expect(problem.adaptiveLevel).toBeGreaterThan(1); // Should increase difficulty
    });

    test('should reduce difficulty for struggling students', () => {
      const lowPerformanceData = { accuracy: 0.5, averageTime: 8000 };
      const problem = generator.generateAdaptiveProblem(lowPerformanceData);
      
      expect(problem).toHaveProperty('adaptiveLevel');
      expect(problem.adaptiveLevel).toBeLessThan(1); // Should decrease difficulty
    });

    test('should handle missing performance data gracefully', () => {
      const problem = generator.generateAdaptiveProblem(null);
      
      expect(problem).toHaveProperty('num1');
      expect(problem).toHaveProperty('num2');
      expect(problem).toHaveProperty('answer');
    });

    test('should provide structured output for ML pipeline integration', () => {
      const performanceData = { accuracy: 0.8, averageTime: 4000 };
      const problem = generator.generateAdaptiveProblem(performanceData);
      
      // Verify structure is suitable for ML processing
      expect(problem).toHaveProperty('num1');
      expect(problem).toHaveProperty('num2');
      expect(problem).toHaveProperty('answer');
      expect(problem).toHaveProperty('adaptiveLevel');
      
      expect(typeof problem.num1).toBe('number');
      expect(typeof problem.num2).toBe('number');
      expect(typeof problem.answer).toBe('number');
      expect(typeof problem.adaptiveLevel).toBe('number');
    });
  });
});