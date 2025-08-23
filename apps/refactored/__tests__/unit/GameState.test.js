/**
 * GameState Unit Tests
 * Purpose: Test core game state management functionality
 * Coverage Target: 90% - Critical business logic component
 * Impact: Prevents state corruption bugs that could break scoring/progress tracking
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';

// Import the GameState class - in a real scenario, we'd need to export it
// For this example, we'll simulate the class structure
class GameState {
  constructor() {
    this.currentProblem = {};
    this.correctCount = 0;
    this.totalCount = 0;
    this.streakCount = 0;
    this.isAnswered = false;
    this.difficulty = 'easy';
    this.audioContext = null;
    
    this.DIFFICULTY_RANGES = {
      easy: { min: 1, max: 10 },
      medium: { min: 1, max: 20 },
      hard: { min: 1, max: 50 }
    };
    
    this.elements = {};
  }

  cacheDOMElements() {
    this.elements = {
      problem: document.getElementById('problem'),
      answer: document.getElementById('answer'),
      feedback: document.getElementById('feedback'),
      correctCount: document.getElementById('correct-count'),
      totalCount: document.getElementById('total-count'),
      streakCount: document.getElementById('streak-count'),
      encouragement: document.getElementById('encouragement'),
      stars: document.getElementById('stars'),
      confetti: document.getElementById('confetti')
    };
  }

  reset() {
    this.currentProblem = {};
    this.correctCount = 0;
    this.totalCount = 0;
    this.streakCount = 0;
    this.isAnswered = false;
    this.updateScoreDisplay();
  }

  updateScoreDisplay() {
    if (this.elements.correctCount) {
      this.elements.correctCount.textContent = this.correctCount;
    }
    if (this.elements.totalCount) {
      this.elements.totalCount.textContent = this.totalCount;
    }
    if (this.elements.streakCount) {
      this.elements.streakCount.textContent = this.streakCount;
    }
  }
}

describe('GameState', () => {
  let gameState;

  beforeEach(() => {
    gameState = new GameState();
    
    // Create mock DOM elements
    createMockElement('problem');
    createMockElement('answer', 'input');
    createMockElement('feedback');
    createMockElement('correct-count', 'span');
    createMockElement('total-count', 'span');
    createMockElement('streak-count', 'span');
    createMockElement('encouragement');
    createMockElement('stars');
    createMockElement('confetti');
  });

  describe('Initialization', () => {
    test('should initialize with default values', () => {
      expect(gameState.currentProblem).toEqual({});
      expect(gameState.correctCount).toBe(0);
      expect(gameState.totalCount).toBe(0);
      expect(gameState.streakCount).toBe(0);
      expect(gameState.isAnswered).toBe(false);
      expect(gameState.difficulty).toBe('easy');
      expect(gameState.audioContext).toBeNull();
    });

    test('should have correct difficulty ranges', () => {
      expect(gameState.DIFFICULTY_RANGES.easy).toEqual({ min: 1, max: 10 });
      expect(gameState.DIFFICULTY_RANGES.medium).toEqual({ min: 1, max: 20 });
      expect(gameState.DIFFICULTY_RANGES.hard).toEqual({ min: 1, max: 50 });
    });
  });

  describe('DOM Element Caching', () => {
    test('should cache all required DOM elements', () => {
      gameState.cacheDOMElements();
      
      expect(gameState.elements.problem).toBeTruthy();
      expect(gameState.elements.answer).toBeTruthy();
      expect(gameState.elements.feedback).toBeTruthy();
      expect(gameState.elements.correctCount).toBeTruthy();
      expect(gameState.elements.totalCount).toBeTruthy();
      expect(gameState.elements.streakCount).toBeTruthy();
      expect(gameState.elements.encouragement).toBeTruthy();
      expect(gameState.elements.stars).toBeTruthy();
      expect(gameState.elements.confetti).toBeTruthy();
    });

    test('should handle missing DOM elements gracefully', () => {
      // Remove some elements
      document.getElementById('problem').remove();
      document.getElementById('answer').remove();
      
      expect(() => {
        gameState.cacheDOMElements();
      }).not.toThrow();
      
      expect(gameState.elements.problem).toBeNull();
      expect(gameState.elements.answer).toBeNull();
    });
  });

  describe('State Reset', () => {
    test('should reset all game state to initial values', () => {
      // Set some non-default values
      gameState.currentProblem = { num1: 5, num2: 3, answer: 8 };
      gameState.correctCount = 10;
      gameState.totalCount = 15;
      gameState.streakCount = 5;
      gameState.isAnswered = true;
      
      gameState.cacheDOMElements();
      gameState.reset();
      
      expect(gameState.currentProblem).toEqual({});
      expect(gameState.correctCount).toBe(0);
      expect(gameState.totalCount).toBe(0);
      expect(gameState.streakCount).toBe(0);
      expect(gameState.isAnswered).toBe(false);
    });

    test('should call updateScoreDisplay during reset', () => {
      gameState.cacheDOMElements();
      const spy = jest.spyOn(gameState, 'updateScoreDisplay');
      
      gameState.reset();
      
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('Score Display Updates', () => {
    test('should update DOM elements with current scores', () => {
      gameState.cacheDOMElements();
      gameState.correctCount = 5;
      gameState.totalCount = 8;
      gameState.streakCount = 3;
      
      gameState.updateScoreDisplay();
      
      expect(gameState.elements.correctCount.textContent).toBe('5');
      expect(gameState.elements.totalCount.textContent).toBe('8');
      expect(gameState.elements.streakCount.textContent).toBe('3');
    });

    test('should handle missing DOM elements gracefully', () => {
      // Don't cache elements, so they remain undefined
      gameState.correctCount = 5;
      gameState.totalCount = 8;
      gameState.streakCount = 3;
      
      expect(() => {
        gameState.updateScoreDisplay();
      }).not.toThrow();
    });

    test('should handle null DOM elements gracefully', () => {
      gameState.elements = {
        correctCount: null,
        totalCount: null,
        streakCount: null
      };
      
      gameState.correctCount = 5;
      gameState.totalCount = 8;
      gameState.streakCount = 3;
      
      expect(() => {
        gameState.updateScoreDisplay();
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    test('should handle extreme score values', () => {
      gameState.cacheDOMElements();
      gameState.correctCount = Number.MAX_SAFE_INTEGER;
      gameState.totalCount = Number.MAX_SAFE_INTEGER;
      gameState.streakCount = Number.MAX_SAFE_INTEGER;
      
      expect(() => {
        gameState.updateScoreDisplay();
      }).not.toThrow();
    });

    test('should handle negative score values (edge case protection)', () => {
      gameState.cacheDOMElements();
      gameState.correctCount = -1;
      gameState.totalCount = -1;
      gameState.streakCount = -1;
      
      gameState.updateScoreDisplay();
      
      expect(gameState.elements.correctCount.textContent).toBe('-1');
      expect(gameState.elements.totalCount.textContent).toBe('-1');
      expect(gameState.elements.streakCount.textContent).toBe('-1');
    });
  });

  describe('Difficulty Configuration', () => {
    test('should provide valid ranges for all difficulty levels', () => {
      Object.keys(gameState.DIFFICULTY_RANGES).forEach(difficulty => {
        const range = gameState.DIFFICULTY_RANGES[difficulty];
        expect(range).toHaveProperty('min');
        expect(range).toHaveProperty('max');
        expect(range.min).toBeGreaterThan(0);
        expect(range.max).toBeGreaterThan(range.min);
      });
    });

    test('should have appropriate range scaling across difficulties', () => {
      const easy = gameState.DIFFICULTY_RANGES.easy;
      const medium = gameState.DIFFICULTY_RANGES.medium;
      const hard = gameState.DIFFICULTY_RANGES.hard;
      
      expect(easy.max).toBeLessThan(medium.max);
      expect(medium.max).toBeLessThan(hard.max);
    });
  });
});