/**
 * Jest Configuration for Math Learning App
 * Purpose: Configure unit testing environment with JSDOM for DOM manipulation testing
 * Target: 80% code coverage across all components
 * Features: ES modules support, DOM testing, coverage reporting
 */

export default {
  // Test environment setup
  testEnvironment: 'jsdom',
  
  // Enable ES modules support
  extensionsToTreatAsEsm: ['.js'],
  transform: {},
  
  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],
  
  // Coverage configuration - targeting 80% coverage KPI
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  
  // Coverage thresholds to enforce quality gates
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    // Stricter requirements for core business logic
    './script.js': {
      branches: 85,
      functions: 90,
      lines: 85,
      statements: 85
    }
  },
  
  // Files to collect coverage from
  collectCoverageFrom: [
    'script.js',
    '!node_modules/**',
    '!coverage/**',
    '!**/*.config.js'
  ],
  
  // Setup files for test environment
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Module name mapping for static assets
  moduleNameMapping: {
    '\\.(css|less|scss)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js'
  },
  
  // Global variables available in tests
  globals: {
    'window': {}
  },
  
  // Verbose output for better debugging
  verbose: true,
  
  // Timeout for tests (important for animation testing)
  testTimeout: 10000
};