/**
 * Jest Setup File
 * Purpose: Configure global test environment and utilities
 * Features: DOM mocking, audio context mocking, animation mocking
 */

// Mock Audio Context for testing audio functionality
global.AudioContext = class MockAudioContext {
  constructor() {
    this.currentTime = 0;
    this.destination = { connect: jest.fn() };
  }
  
  createOscillator() {
    return {
      frequency: { value: 0 },
      type: 'sine',
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn()
    };
  }
  
  createGain() {
    return {
      gain: { 
        value: 0,
        exponentialRampToValueAtTime: jest.fn()
      },
      connect: jest.fn()
    };
  }
};

global.webkitAudioContext = global.AudioContext;

// Mock window.confirm for user interaction testing
global.confirm = jest.fn(() => true);

// Mock window.history for navigation testing
global.history = {
  back: jest.fn()
};

// Mock requestAnimationFrame for animation testing
global.requestAnimationFrame = (callback) => {
  setTimeout(callback, 16);
};

// Mock performance.now for timing tests
global.performance = {
  now: jest.fn(() => Date.now())
};

// Mock localStorage for future user preference testing
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

// Utility function for creating DOM elements in tests
global.createMockElement = (id, tagName = 'div') => {
  const element = document.createElement(tagName);
  element.id = id;
  document.body.appendChild(element);
  return element;
};

// Utility for cleaning up DOM after tests
global.cleanupDOM = () => {
  document.body.innerHTML = '';
};

// Mock console methods to reduce noise in tests
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Setup and teardown for each test
beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Clean up DOM after each test
  global.cleanupDOM();
});