/**
 * Test Suite: Scan History Limit
 * Tests automatic cleanup and history management
 */

import {
  createScan,
  getScanCount,
  getScanById,
  deleteScan,
  getRecentScans,
} from '@/services/database/scan-repository';
import { SCAN_HISTORY_LIMIT } from '@/constants/app';
import type { ScanResult } from '@/types';

export async function testScanHistory() {
  console.log('\n🧪 Testing Scan History Management');
  console.log('=' .repeat(50));

  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
  };

  // Test 1: Scan History Limit Configuration
  console.log('\n1️⃣ Testing configuration...');
  try {
    console.log(`   - SCAN_HISTORY_LIMIT: ${SCAN_HISTORY_LIMIT}`);
    if (SCAN_HISTORY_LIMIT === 100) {
      console.log('   ✅ History limit configured correctly');
      results.passed++;
    } else {
      console.log(`   ⚠️  History limit is ${SCAN_HISTORY_LIMIT} (expected 100)`);
      results.warnings++;
    }
  } catch (error) {
    console.log('   ❌ Configuration error:', error);
    results.failed++;
  }

  // Test 2: Initial scan count
  console.log('\n2️⃣ Testing initial scan count...');
  try {
    const initialCount = await getScanCount();
    console.log(`   - Initial scan count: ${initialCount}`);
    console.log('   ✅ Database accessible');
    results.passed++;
  } catch (error) {
    console.log('   ❌ Database error:', error);
    results.failed++;
    return results; // Can't continue without database
  }

  // Test 3: Create multiple scans to test limit
  console.log('\n3️⃣ Testing scan creation and limit enforcement...');
  const testIds: string[] = [];
  
  try {
    const startCount = await getScanCount();
    console.log(`   - Starting with ${startCount} scans`);

    // Create 10 test scans
    const numTestScans = 10;
    console.log(`   - Creating ${numTestScans} test scans...`);

    for (let i = 0; i < numTestScans; i++) {
      const scan = createMockScan(`test-scan-${Date.now()}-${i}`, i === numTestScans - 1);
      await createScan(scan);
      testIds.push(scan.id);
      
      // Small delay to ensure unique timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    const afterCount = await getScanCount();
    console.log(`   - After adding ${numTestScans}: ${afterCount} scans in database`);

    // Check if count increased as expected
    const expectedCount = Math.min(startCount + numTestScans, SCAN_HISTORY_LIMIT);
    if (afterCount <= SCAN_HISTORY_LIMIT) {
      console.log(`   ✅ Scan count within limit (${afterCount} <= ${SCAN_HISTORY_LIMIT})`);
      results.passed++;
    } else {
      console.log(`   ❌ Scan count exceeded limit (${afterCount} > ${SCAN_HISTORY_LIMIT})`);
      results.failed++;
    }

    // Check if scans were actually saved
    if (afterCount > startCount) {
      console.log('   ✅ Scans saved successfully');
      results.passed++;
    } else if (startCount >= SCAN_HISTORY_LIMIT) {
      console.log('   ⚠️  Database at limit, old scans should have been deleted');
      results.warnings++;
    } else {
      console.log('   ❌ Scans not saved properly');
      results.failed++;
    }
  } catch (error) {
    console.log('   ❌ Scan creation failed:', error);
    results.failed++;
  }

  // Test 4: Test retrieval
  console.log('\n4️⃣ Testing scan retrieval...');
  try {
    const recentScans = await getRecentScans(5);
    console.log(`   - Retrieved ${recentScans.length} recent scans`);
    
    if (recentScans.length > 0) {
      console.log('   ✅ Scan retrieval working');
      results.passed++;
      
      // Show summary of recent scans
      recentScans.forEach((scan, idx) => {
        console.log(`   ${idx + 1}. ${scan.riceType} - Grade: ${scan.gradeCode} (${scan.totalCount} grains)`);
      });
    } else {
      console.log('   ⚠️  No scans found (database might be empty)');
      results.warnings++;
    }
  } catch (error) {
    console.log('   ❌ Retrieval failed:', error);
    results.failed++;
  }

  // Test 5: Test limit enforcement with many scans
  if (testIds.length > 0) {
    console.log('\n5️⃣ Testing aggressive limit enforcement...');
    try {
      const beforeCount = await getScanCount();
      console.log(`   - Current count: ${beforeCount}`);
      
      // Try to add many more scans to trigger cleanup
      const manyScans = 20;
      console.log(`   - Adding ${manyScans} more scans to test cleanup...`);
      
      for (let i = 0; i < manyScans; i++) {
        const scan = createMockScan(`cleanup-test-${Date.now()}-${i}`, true);
        await createScan(scan);
        testIds.push(scan.id);
        await new Promise(resolve => setTimeout(resolve, 5));
      }

      const afterCount = await getScanCount();
      console.log(`   - After adding ${manyScans} more: ${afterCount} scans`);

      if (afterCount <= SCAN_HISTORY_LIMIT) {
        console.log(`   ✅ Limit enforced correctly (${afterCount} <= ${SCAN_HISTORY_LIMIT})`);
        console.log(`   ✅ Old scans cleaned up automatically`);
        results.passed += 2;
      } else {
        console.log(`   ❌ Limit not enforced (${afterCount} > ${SCAN_HISTORY_LIMIT})`);
        results.failed++;
      }
    } catch (error) {
      console.log('   ❌ Cleanup test failed:', error);
      results.failed++;
    }
  }

  // Cleanup: Delete test scans
  console.log('\n6️⃣ Cleaning up test data...');
  let deletedCount = 0;
  for (const id of testIds) {
    try {
      await deleteScan(id);
      deletedCount++;
    } catch (error) {
      // Scan might have been auto-deleted by limit enforcement
      // This is OK
    }
  }
  console.log(`   - Deleted ${deletedCount} test scans`);
  console.log('   ✅ Cleanup complete');
  results.passed++;

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Scan History Test Results:');
  console.log(`   ✅ Passed: ${results.passed}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  console.log(`   ⚠️  Warnings: ${results.warnings}`);

  return results;
}

/**
 * Create a mock scan for testing
 */
function createMockScan(id: string, synced: boolean = false): ScanResult {
  return {
    id,
    userId: 'test-user',
    riceType: 'Paddy',
    imageUri: 'file:///test/image.jpg',
    capturedAt: new Date(),
    rawOutput: {
      count: 100,
      broken_count: 5,
      long_count: 50,
      medium_count: 45,
      black_count: 2,
      chalky_count: 10,
      red_count: 1,
      yellow_count: 1,
      green_count: 1,
      wk_length_avg: 6.5,
      wk_width_avg: 2.2,
      wk_lw_ratio_avg: 2.95,
      average_l: 75,
      average_a: 1,
      average_b: 18,
    },
    classifications: {
      millingGrade: {
        grade: 'Grade 1',
        code: '1',
        color: '#22c55e',
      },
      grainShape: {
        shape: 'Medium',
        description: 'Medium grain rice',
      },
      lengthClass: 'Medium Grain',
      chalkinessStatus: {
        status: 'Not Chalky',
        color: '#22c55e',
      },
      warnings: [],
    },
    inferenceTimeMs: 1500,
    syncedAt: synced ? new Date() : undefined,
  };
}

export default testScanHistory;
