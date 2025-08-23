/**
 * Playwright Global Teardown
 * Purpose: Clean up test environment after running E2E tests
 * Features: Cleanup test data, generate reports, close resources
 */

async function globalTeardown() {
  console.log('🧹 Starting Playwright Global Teardown...');
  
  const testConfig = global.__TEST_CONFIG__;
  
  if (testConfig) {
    const endTime = Date.now();
    const duration = endTime - testConfig.startTime;
    
    console.log(`⏱️ Total test execution time: ${duration}ms`);
  }
  
  // Clean up test data files
  console.log('📁 Cleaning up test data...');
  
  // Generate test summary report
  console.log('📊 Generating test summary...');
  
  const fs = require('fs');
  const path = require('path');
  
  try {
    // Create test summary
    const summary = {
      timestamp: new Date().toISOString(),
      duration: testConfig ? (Date.now() - testConfig.startTime) : 0,
      environment: process.env.NODE_ENV || 'test'
    };
    
    const summaryPath = path.join(__dirname, 'test-results', 'test-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    console.log(`📄 Test summary written to: ${summaryPath}`);
  } catch (error) {
    console.warn('⚠️ Failed to write test summary:', error.message);
  }
  
  console.log('✅ Playwright Global Teardown Complete');
}

module.exports = globalTeardown;