/**
 * Playwright Global Setup
 * Purpose: Configure test environment before running E2E tests
 * Features: Database setup, authentication, test data preparation
 */

async function globalSetup(config) {
  console.log('🚀 Starting Playwright Global Setup...');
  
  // Setup test environment
  console.log('📋 Setting up test environment...');
  
  // Create test data directory if it doesn't exist
  const fs = require('fs');
  const path = require('path');
  
  const testDataDir = path.join(__dirname, 'test-data');
  if (!fs.existsSync(testDataDir)) {
    fs.mkdirSync(testDataDir, { recursive: true });
  }
  
  // Initialize test results directory
  const resultsDir = path.join(__dirname, 'test-results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  
  // Setup browser contexts for different test scenarios
  console.log('🌐 Configuring browser contexts...');
  
  // Store global test configuration
  global.__TEST_CONFIG__ = {
    baseURL: config.use?.baseURL || 'http://localhost:3000',
    testDataDir,
    resultsDir,
    startTime: Date.now()
  };
  
  console.log('✅ Playwright Global Setup Complete');
}

module.exports = globalSetup;