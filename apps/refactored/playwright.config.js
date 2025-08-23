/**
 * Playwright Configuration for Math Learning App E2E Tests
 * Purpose: Configure end-to-end testing environment for cross-browser testing
 * Features: Multiple browsers, responsive testing, accessibility checks
 * Target: 95% E2E coverage of critical user paths
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Test directory
  testDir: './__tests__/e2e',
  
  // Global test timeout
  timeout: 30 * 1000,
  
  // Expect timeout for assertions
  expect: {
    timeout: 5 * 1000
  },
  
  // Fail the build on CI if tests are flaky
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-results.json' }],
    ['junit', { outputFile: 'playwright-junit.xml' }],
    // Add line reporter for CI environments
    process.env.CI ? ['line'] : ['list']
  ],
  
  // Global test setup
  use: {
    // Base URL for all tests
    baseURL: 'http://localhost:3000',
    
    // Collect trace on failure for debugging
    trace: 'on-first-retry',
    
    // Take screenshots on failure
    screenshot: 'only-on-failure',
    
    // Record video on failure
    video: 'retain-on-failure',
    
    // Default timeout for actions
    actionTimeout: 10 * 1000,
    
    // Default navigation timeout
    navigationTimeout: 30 * 1000,
  },

  // Test projects for different browsers and viewports
  projects: [
    // Desktop Chrome
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Override for larger desktop testing
        viewport: { width: 1200, height: 800 }
      },
    },

    // Desktop Firefox
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    // Desktop Safari
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile Chrome
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },

    // Mobile Safari
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    // Tablet testing
    {
      name: 'iPad',
      use: { ...devices['iPad Pro'] },
    },

    // High contrast testing for accessibility
    {
      name: 'High Contrast',
      use: {
        ...devices['Desktop Chrome'],
        colorScheme: 'dark',
        forcedColors: 'active',
      },
    },

    // Reduced motion testing for accessibility
    {
      name: 'Reduced Motion',
      use: {
        ...devices['Desktop Chrome'],
        reducedMotion: 'reduce',
      },
    },

    // Slow network simulation
    {
      name: 'Slow 3G',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--simulate-slow-connection']
        }
      },
    }
  ],

  // Local dev server setup
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  // Global setup and teardown
  globalSetup: './playwright.global-setup.js',
  globalTeardown: './playwright.global-teardown.js',
});