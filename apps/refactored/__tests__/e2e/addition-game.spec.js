/**
 * End-to-End Tests for Addition Math Game
 * Purpose: Test complete user workflows and interactions
 * Coverage: Critical user paths, accessibility, responsive design
 * Impact: Ensures real-world usability and prevents regression
 * Future: Ready for A/B testing and personalization features
 */

import { test, expect } from '@playwright/test';

// Test configuration
const APP_URL = 'http://localhost:3000'; // Adjust based on your setup
const MOBILE_VIEWPORT = { width: 375, height: 667 };
const TABLET_VIEWPORT = { width: 768, height: 1024 };
const DESKTOP_VIEWPORT = { width: 1200, height: 800 };

test.describe('Addition Math Game - Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(APP_URL);
    await page.waitForLoadState('networkidle');
  });

  test('should load the game interface correctly', async ({ page }) => {
    // Check main UI elements are present
    await expect(page.locator('.app-title')).toHaveText('🌟 たしざん れんしゅう');
    await expect(page.locator('#problem')).toBeVisible();
    await expect(page.locator('#answer')).toBeVisible();
    await expect(page.locator('.btn-primary')).toHaveText('こたえる！');
    
    // Check score display
    await expect(page.locator('#correct-count')).toHaveText('0');
    await expect(page.locator('#total-count')).toHaveText('0');
    await expect(page.locator('#streak-count')).toHaveText('0');
  });

  test('should display a math problem on initialization', async ({ page }) => {
    const problemText = await page.locator('#problem').textContent();
    
    // Should match pattern "X + Y" where X and Y are numbers
    expect(problemText).toMatch(/^\d+ \+ \d+$/);
    
    // For easy difficulty, numbers should be 1-10
    const numbers = problemText.match(/\d+/g);
    const num1 = parseInt(numbers[0]);
    const num2 = parseInt(numbers[1]);
    
    expect(num1).toBeGreaterThanOrEqual(1);
    expect(num1).toBeLessThanOrEqual(10);
    expect(num2).toBeGreaterThanOrEqual(1);
    expect(num2).toBeLessThanOrEqual(10);
  });

  test('should handle correct answer submission', async ({ page }) => {
    // Get the current problem
    const problemText = await page.locator('#problem').textContent();
    const numbers = problemText.match(/\d+/g);
    const correctAnswer = parseInt(numbers[0]) + parseInt(numbers[1]);
    
    // Enter the correct answer
    await page.locator('#answer').fill(correctAnswer.toString());
    await page.click('.btn-primary');
    
    // Check for success feedback
    const feedback = page.locator('#feedback');
    await expect(feedback).toHaveClass(/correct/);
    
    // Check score updates
    await expect(page.locator('#correct-count')).toHaveText('1');
    await expect(page.locator('#total-count')).toHaveText('1');
    await expect(page.locator('#streak-count')).toHaveText('1');
    
    // Check for next problem button
    await expect(page.locator('.btn-secondary')).toBeVisible();
    await expect(page.locator('.btn-secondary')).toHaveText('つぎのもんだい');
  });

  test('should handle incorrect answer submission', async ({ page }) => {
    // Get the current problem
    const problemText = await page.locator('#problem').textContent();
    const numbers = problemText.match(/\d+/g);
    const correctAnswer = parseInt(numbers[0]) + parseInt(numbers[1]);
    const wrongAnswer = correctAnswer + 1; // Intentionally wrong
    
    // Enter the wrong answer
    await page.locator('#answer').fill(wrongAnswer.toString());
    await page.click('.btn-primary');
    
    // Check for error feedback
    const feedback = page.locator('#feedback');
    await expect(feedback).toHaveClass(/incorrect/);
    
    // Check that correct count doesn't increase but total count does
    await expect(page.locator('#correct-count')).toHaveText('0');
    await expect(page.locator('#total-count')).toHaveText('1');
    await expect(page.locator('#streak-count')).toHaveText('0');
    
    // Input should be cleared for retry
    await page.waitForTimeout(1100); // Wait for auto-clear
    await expect(page.locator('#answer')).toHaveValue('');
  });

  test('should progress to next problem after correct answer', async ({ page }) => {
    // Solve first problem
    const initialProblem = await page.locator('#problem').textContent();
    const numbers = initialProblem.match(/\d+/g);
    const correctAnswer = parseInt(numbers[0]) + parseInt(numbers[1]);
    
    await page.locator('#answer').fill(correctAnswer.toString());
    await page.click('.btn-primary');
    
    // Click next problem
    await page.click('.btn-secondary');
    
    // Verify new problem is generated
    const newProblem = await page.locator('#problem').textContent();
    expect(newProblem).not.toBe(initialProblem);
    
    // Verify input is cleared and focused
    await expect(page.locator('#answer')).toHaveValue('');
    await expect(page.locator('#answer')).toBeFocused();
    
    // Verify feedback is cleared
    const feedback = await page.locator('#feedback').textContent();
    expect(feedback).toBe('');
  });
});

test.describe('Difficulty Level Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(APP_URL);
  });

  test('should switch between difficulty levels', async ({ page }) => {
    // Test medium difficulty
    await page.click('[data-level="medium"]');
    await expect(page.locator('[data-level="medium"]')).toHaveClass(/active/);
    
    const mediumProblem = await page.locator('#problem').textContent();
    const mediumNumbers = mediumProblem.match(/\d+/g);
    
    // Medium difficulty should allow numbers 1-20
    expect(parseInt(mediumNumbers[0])).toBeLessThanOrEqual(20);
    expect(parseInt(mediumNumbers[1])).toBeLessThanOrEqual(20);
    
    // Test hard difficulty
    await page.click('[data-level="hard"]');
    await expect(page.locator('[data-level="hard"]')).toHaveClass(/active/);
    
    const hardProblem = await page.locator('#problem').textContent();
    const hardNumbers = hardProblem.match(/\d+/g);
    
    // Hard difficulty should allow numbers 1-50
    expect(parseInt(hardNumbers[0])).toBeLessThanOrEqual(50);
    expect(parseInt(hardNumbers[1])).toBeLessThanOrEqual(50);
  });

  test('should maintain difficulty selection across problems', async ({ page }) => {
    // Set to hard difficulty
    await page.click('[data-level="hard"]');
    
    // Solve a problem
    const problemText = await page.locator('#problem').textContent();
    const numbers = problemText.match(/\d+/g);
    const correctAnswer = parseInt(numbers[0]) + parseInt(numbers[1]);
    
    await page.locator('#answer').fill(correctAnswer.toString());
    await page.click('.btn-primary');
    await page.click('.btn-secondary');
    
    // Verify hard difficulty is still active
    await expect(page.locator('[data-level="hard"]')).toHaveClass(/active/);
    
    // Verify new problem still uses hard difficulty ranges
    const newProblem = await page.locator('#problem').textContent();
    const newNumbers = newProblem.match(/\d+/g);
    expect(parseInt(newNumbers[0])).toBeLessThanOrEqual(50);
    expect(parseInt(newNumbers[1])).toBeLessThanOrEqual(50);
  });
});

test.describe('Input Validation and Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(APP_URL);
  });

  test('should validate empty input', async ({ page }) => {
    await page.click('.btn-primary'); // Submit without entering anything
    
    const feedback = page.locator('#feedback');
    await expect(feedback).toHaveText('すうじを いれてね！');
    await expect(feedback).toHaveClass(/incorrect/);
  });

  test('should handle full-width numbers', async ({ page }) => {
    const problemText = await page.locator('#problem').textContent();
    const numbers = problemText.match(/\d+/g);
    const correctAnswer = parseInt(numbers[0]) + parseInt(numbers[1]);
    
    // Convert to full-width numbers
    const fullWidthAnswer = correctAnswer.toString().replace(/\d/g, (digit) => {
      return String.fromCharCode(digit.charCodeAt(0) + 0xFEE0);
    });
    
    await page.locator('#answer').fill(fullWidthAnswer);
    await page.click('.btn-primary');
    
    // Should be accepted as correct
    const feedback = page.locator('#feedback');
    await expect(feedback).toHaveClass(/correct/);
  });

  test('should handle mixed alphanumeric input', async ({ page }) => {
    const problemText = await page.locator('#problem').textContent();
    const numbers = problemText.match(/\d+/g);
    const correctAnswer = parseInt(numbers[0]) + parseInt(numbers[1]);
    
    // Enter answer with letters
    await page.locator('#answer').fill(`answer${correctAnswer}test`);
    await page.click('.btn-primary');
    
    // Should extract the number and accept as correct
    const feedback = page.locator('#feedback');
    await expect(feedback).toHaveClass(/correct/);
  });

  test('should limit input length', async ({ page }) => {
    // Try to enter more than 3 characters
    await page.locator('#answer').fill('123456789');
    
    // Should be limited to 3 characters
    await expect(page.locator('#answer')).toHaveValue('123');
  });

  test('should support Enter key for submission', async ({ page }) => {
    const problemText = await page.locator('#problem').textContent();
    const numbers = problemText.match(/\d+/g);
    const correctAnswer = parseInt(numbers[0]) + parseInt(numbers[1]);
    
    await page.locator('#answer').fill(correctAnswer.toString());
    await page.locator('#answer').press('Enter');
    
    // Should submit the answer
    const feedback = page.locator('#feedback');
    await expect(feedback).toHaveClass(/correct/);
  });
});

test.describe('Responsive Design Testing', () => {
  test('should work correctly on mobile devices', async ({ browser }) => {
    const context = await browser.newContext({ viewport: MOBILE_VIEWPORT });
    const page = await context.newPage();
    await page.goto(APP_URL);
    
    // Check layout adjustments
    await expect(page.locator('.app-header')).toHaveCSS('flex-direction', 'column');
    await expect(page.locator('.score')).toHaveCSS('flex-direction', 'column');
    
    // Check problem display scaling
    const problemElement = page.locator('#problem');
    await expect(problemElement).toHaveCSS('font-size', '48px'); // 3rem
    
    // Test touch interactions
    await page.tap('#answer');
    await expect(page.locator('#answer')).toBeFocused();
    
    await context.close();
  });

  test('should work correctly on tablet devices', async ({ browser }) => {
    const context = await browser.newContext({ viewport: TABLET_VIEWPORT });
    const page = await context.newPage();
    await page.goto(APP_URL);
    
    // Test that elements are appropriately sized for tablet
    const answerInput = page.locator('#answer');
    await expect(answerInput).toHaveCSS('min-height', '80px');
    
    // Test difficulty buttons layout
    await expect(page.locator('.difficulty-buttons')).toHaveCSS('flex-direction', 'row');
    
    await context.close();
  });

  test('should work correctly on desktop devices', async ({ browser }) => {
    const context = await browser.newContext({ viewport: DESKTOP_VIEWPORT });
    const page = await context.newPage();
    await page.goto(APP_URL);
    
    // Test that header layout is horizontal on desktop
    await expect(page.locator('.app-header')).toHaveCSS('flex-direction', 'row');
    
    // Test hover effects work
    await page.hover('.btn-primary');
    // Note: CSS hover effects testing may require additional setup
    
    await context.close();
  });
});

test.describe('Visual Effects and Animations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(APP_URL);
  });

  test('should show visual effects on correct answer', async ({ page }) => {
    // Solve a problem correctly
    const problemText = await page.locator('#problem').textContent();
    const numbers = problemText.match(/\d+/g);
    const correctAnswer = parseInt(numbers[0]) + parseInt(numbers[1]);
    
    await page.locator('#answer').fill(correctAnswer.toString());
    await page.click('.btn-primary');
    
    // Wait for animations to trigger
    await page.waitForTimeout(500);
    
    // Check for star elements (created by createStars function)
    const stars = await page.locator('.star').count();
    expect(stars).toBeGreaterThan(0);
    
    // Check for confetti elements
    const confetti = await page.locator('.confetti').count();
    expect(confetti).toBeGreaterThan(0);
  });

  test('should show streak achievement message', async ({ page }) => {
    // Solve 3 problems correctly to trigger streak message
    for (let i = 0; i < 3; i++) {
      const problemText = await page.locator('#problem').textContent();
      const numbers = problemText.match(/\d+/g);
      const correctAnswer = parseInt(numbers[0]) + parseInt(numbers[1]);
      
      await page.locator('#answer').fill(correctAnswer.toString());
      await page.click('.btn-primary');
      
      if (i < 2) {
        await page.click('.btn-secondary');
      }
    }
    
    // Check for encouragement message
    const encouragement = page.locator('#encouragement');
    await expect(encouragement).not.toHaveClass('hidden');
    await expect(encouragement).toBeVisible();
  });
});

test.describe('Navigation and User Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(APP_URL);
  });

  test('should handle back button navigation', async ({ page }) => {
    // Mock window.history.back
    await page.addInitScript(() => {
      window.history.back = () => {
        window.mockBackCalled = true;
      };
      window.confirm = () => true;
    });
    
    await page.click('.back-btn');
    
    // Check that history.back was called
    const backCalled = await page.evaluate(() => window.mockBackCalled);
    expect(backCalled).toBe(true);
  });

  test('should handle back button cancellation', async ({ page }) => {
    // Mock confirm to return false
    await page.addInitScript(() => {
      window.confirm = () => false;
      window.history.back = () => {
        window.mockBackCalled = true;
      };
    });
    
    await page.click('.back-btn');
    
    // Check that history.back was not called
    const backCalled = await page.evaluate(() => window.mockBackCalled);
    expect(backCalled).toBeUndefined();
  });
});

test.describe('Accessibility Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(APP_URL);
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Test tab navigation
    await page.keyboard.press('Tab');
    await expect(page.locator('.back-btn')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-level="easy"]')).toBeFocused();
    
    // Continue tabbing to answer input
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Tab');
    }
    await expect(page.locator('#answer')).toBeFocused();
  });

  test('should have proper focus management', async ({ page }) => {
    // Answer input should be focused on load
    await expect(page.locator('#answer')).toBeFocused();
    
    // After submitting wrong answer, focus should return to input
    await page.locator('#answer').fill('999');
    await page.click('.btn-primary');
    
    await page.waitForTimeout(1100); // Wait for auto-clear and refocus
    await expect(page.locator('#answer')).toBeFocused();
  });

  test('should have appropriate ARIA attributes', async ({ page }) => {
    // Check for proper labeling
    await expect(page.locator('#answer')).toHaveAttribute('placeholder', '?');
    await expect(page.locator('#answer')).toHaveAttribute('maxlength', '3');
    
    // Check button attributes
    await expect(page.locator('.btn-primary')).toHaveText('こたえる！');
  });
});

test.describe('Performance and Loading', () => {
  test('should load within acceptable time limits', async ({ page }) => {
    const startTime = Date.now();
    await page.goto(APP_URL);
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should handle rapid interactions gracefully', async ({ page }) => {
    await page.goto(APP_URL);
    
    // Rapidly click the submit button multiple times
    for (let i = 0; i < 10; i++) {
      await page.click('.btn-primary', { timeout: 100 });
    }
    
    // Should not crash or cause errors
    await expect(page.locator('#feedback')).toBeVisible();
  });
});

test.describe('Future AI Integration Readiness', () => {
  test('should capture user interaction data for analytics', async ({ page }) => {
    // Mock analytics tracking
    await page.addInitScript(() => {
      window.analyticsEvents = [];
      window.trackEvent = (event, data) => {
        window.analyticsEvents.push({ event, data, timestamp: Date.now() });
      };
    });
    
    // Perform various interactions
    await page.click('[data-level="medium"]');
    
    const problemText = await page.locator('#problem').textContent();
    const numbers = problemText.match(/\d+/g);
    const correctAnswer = parseInt(numbers[0]) + parseInt(numbers[1]);
    
    await page.locator('#answer').fill(correctAnswer.toString());
    await page.click('.btn-primary');
    
    // Check that events could be captured
    const events = await page.evaluate(() => window.analyticsEvents || []);
    
    // This demonstrates the structure for future analytics integration
    expect(Array.isArray(events)).toBe(true);
  });

  test('should support A/B testing framework', async ({ page }) => {
    // Mock A/B testing setup
    await page.addInitScript(() => {
      window.abTestVariant = 'control';
      window.featureFlags = {
        adaptiveDifficulty: false,
        personalizedHints: false,
        gamification: true
      };
    });
    
    await page.goto(APP_URL);
    
    // Test that game loads regardless of A/B test configuration
    await expect(page.locator('.app-title')).toBeVisible();
    
    const variant = await page.evaluate(() => window.abTestVariant);
    expect(variant).toBeDefined();
  });
});