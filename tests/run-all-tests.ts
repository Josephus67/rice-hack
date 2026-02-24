/**
 * Test Runner - Executes all test suites
 * 
 * Usage:
 *   Import and call from a React component or script
 *   import { runAllTests } from './tests/run-all-tests';
 *   await runAllTests();
 */

import testModelInference from './test-model-inference';
import testImageValidation from './test-image-validation';
import testScanHistory from './test-scan-history';

export async function runAllTests() {
  console.log('\n');
  console.log('🌾 RICE QUALITY ANALYZER - COMPREHENSIVE TEST SUITE');
  console.log('='.repeat(70));
  console.log('Testing all critical features implementation\n');

  const startTime = Date.now();
  const allResults = {
    passed: 0,
    failed: 0,
    warnings: 0,
    suites: [] as Array<{ name: string; results: any }>,
  };

  // Test Suite 1: Model Inference
  try {
    const results = await testModelInference();
    allResults.passed += results.passed;
    allResults.failed += results.failed;
    allResults.warnings += results.warnings;
    allResults.suites.push({ name: 'Model Inference', results });
  } catch (error) {
    console.error('❌ Model Inference test suite crashed:', error);
    allResults.failed += 1;
  }

  // Test Suite 2: Image Validation
  try {
    const results = await testImageValidation();
    allResults.passed += results.passed;
    allResults.failed += results.failed;
    allResults.warnings += results.warnings;
    allResults.suites.push({ name: 'Image Validation', results });
  } catch (error) {
    console.error('❌ Image Validation test suite crashed:', error);
    allResults.failed += 1;
  }

  // Test Suite 3: Scan History
  try {
    const results = await testScanHistory();
    allResults.passed += results.passed;
    allResults.failed += results.failed;
    allResults.warnings += results.warnings;
    allResults.suites.push({ name: 'Scan History', results });
  } catch (error) {
    console.error('❌ Scan History test suite crashed:', error);
    allResults.failed += 1;
  }

  // Final Summary
  const totalTime = Date.now() - startTime;
  
  console.log('\n');
  console.log('='.repeat(70));
  console.log('📊 FINAL TEST SUMMARY');
  console.log('='.repeat(70));
  
  allResults.suites.forEach(suite => {
    const { name, results } = suite;
    const total = results.passed + results.failed;
    const successRate = total > 0 ? ((results.passed / total) * 100).toFixed(1) : '0.0';
    
    console.log(`\n${name}:`);
    console.log(`  ✅ Passed: ${results.passed}`);
    console.log(`  ❌ Failed: ${results.failed}`);
    console.log(`  ⚠️  Warnings: ${results.warnings}`);
    console.log(`  📈 Success Rate: ${successRate}%`);
  });

  console.log('\n' + '='.repeat(70));
  console.log('OVERALL RESULTS:');
  console.log(`  ✅ Total Passed: ${allResults.passed}`);
  console.log(`  ❌ Total Failed: ${allResults.failed}`);
  console.log(`  ⚠️  Total Warnings: ${allResults.warnings}`);
  console.log(`  ⏱️  Total Time: ${(totalTime / 1000).toFixed(2)}s`);
  
  const totalTests = allResults.passed + allResults.failed;
  if (totalTests > 0) {
    const overallSuccess = ((allResults.passed / totalTests) * 100).toFixed(1);
    console.log(`  📈 Overall Success Rate: ${overallSuccess}%`);
  }

  console.log('='.repeat(70));

  // Status message
  if (allResults.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Implementation is solid.');
  } else {
    console.log(`\n⚠️  ${allResults.failed} test(s) failed. Review output above for details.`);
  }

  if (allResults.warnings > 0) {
    console.log(`\n💡 ${allResults.warnings} warning(s) - check if expected (e.g., model not converted yet)`);
  }

  console.log('\n📚 Next Steps:');
  console.log('  1. Fix any failed tests');
  console.log('  2. Install TensorFlow.js: cd rice-hack && ./setup.sh');
  console.log('  3. Convert model: cd ../UNIDO_FINAL && python convert_model.py');
  console.log('  4. Re-run tests to verify model loading');
  console.log('  5. Test on physical device for full validation');
  console.log('\n');

  return allResults;
}

/**
 * Quick test - runs a subset of critical tests
 */
export async function runQuickTests() {
  console.log('\n🚀 Running Quick Tests (critical checks only)\n');
  
  const results = {
    passed: 0,
    failed: 0,
  };

  // Quick check: Can we import everything?
  try {
    await import('@/services/inference/model-inference');
    await import('@/services/inference/tflite-inference');
    await import('@/services/validation/image-validator');
    await import('@/services/database/scan-repository');
    await import('@/constants/app');
    
    console.log('✅ All modules import successfully');
    results.passed++;
  } catch (error) {
    console.log('❌ Module import failed:', error);
    results.failed++;
  }

  // Quick check: Constants configured
  try {
    const { VALIDATION_THRESHOLDS, SCAN_HISTORY_LIMIT } = await import('@/constants/app');
    
    if (VALIDATION_THRESHOLDS.BLUE_BACKGROUND_RATIO !== undefined) {
      console.log('✅ Blue background threshold configured');
      results.passed++;
    } else {
      console.log('❌ Blue background threshold missing');
      results.failed++;
    }

    if (SCAN_HISTORY_LIMIT === 100) {
      console.log('✅ Scan history limit configured (100)');
      results.passed++;
    } else {
      console.log(`⚠️  Scan history limit is ${SCAN_HISTORY_LIMIT} (expected 100)`);
      results.failed++;
    }
  } catch (error) {
    console.log('❌ Constants check failed:', error);
    results.failed++;
  }

  console.log(`\n📊 Quick Test Results: ${results.passed} passed, ${results.failed} failed\n`);
  
  return results;
}

export default runAllTests;
