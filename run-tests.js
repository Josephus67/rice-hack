#!/usr/bin/env node

/**
 * Command-line test runner
 * Run with: node run-tests.js
 */

console.log('\n🌾 Rice Quality Analyzer - Test Suite');
console.log('=' .repeat(70));
console.log('\n⚠️  Note: Full tests require running app environment.');
console.log('For comprehensive testing, use the Test Screen in the app.\n');

console.log('Quick Checks:');
console.log('='.repeat(70));

let passed = 0;
let failed = 0;

// Check 1: TypeScript compilation
console.log('\n1️⃣ Checking TypeScript compilation...');
const { execSync } = require('child_process');
try {
  execSync('npx tsc --noEmit', { cwd: __dirname, stdio: 'pipe' });
  console.log('   ✅ TypeScript compiles without errors');
  passed++;
} catch (error) {
  console.log('   ❌ TypeScript compilation failed');
  console.log('   Run: npx tsc --noEmit for details');
  failed++;
}

// Check 2: Verify files exist
console.log('\n2️⃣ Checking implementation files...');
const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'services/inference/tflite-inference.ts',
  'services/inference/model-inference.ts',
  'services/validation/image-validator.ts',
  'services/database/scan-repository.ts',
  'constants/app.ts',
  'tests/test-model-inference.ts',
  'tests/test-image-validation.ts',
  'tests/test-scan-history.ts',
  'tests/run-all-tests.ts',
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

if (allFilesExist) {
  console.log('   ✅ All implementation files present');
  passed++;
} else {
  console.log('   ❌ Some files missing');
  failed++;
}

// Check 3: Verify constants
console.log('\n3️⃣ Checking configuration constants...');
try {
  const constantsPath = path.join(__dirname, 'constants/app.ts');
  const constantsContent = fs.readFileSync(constantsPath, 'utf8');
  
  if (constantsContent.includes('BLUE_BACKGROUND_RATIO')) {
    console.log('   ✅ BLUE_BACKGROUND_RATIO configured');
    passed++;
  } else {
    console.log('   ❌ BLUE_BACKGROUND_RATIO missing');
    failed++;
  }
  
  if (constantsContent.includes('SCAN_HISTORY_LIMIT')) {
    console.log('   ✅ SCAN_HISTORY_LIMIT configured');
    passed++;
  } else {
    console.log('   ❌ SCAN_HISTORY_LIMIT missing');
    failed++;
  }
} catch (error) {
  console.log('   ❌ Could not read constants file');
  failed++;
}

// Check 4: Documentation
console.log('\n4️⃣ Checking documentation...');
const docs = [
  '../IMPLEMENTATION_SUMMARY.md',
  '../QUICK_REFERENCE.md',
  '../READY_TO_GO.md',
  'ml/MODEL_CONVERSION.md',
];

let allDocsExist = true;
docs.forEach(doc => {
  const docPath = path.join(__dirname, doc);
  if (fs.existsSync(docPath)) {
    console.log(`   ✅ ${doc}`);
  } else {
    console.log(`   ❌ ${doc} - MISSING`);
    allDocsExist = false;
  }
});

if (allDocsExist) {
  passed++;
}

// Check 5: Dependencies check
console.log('\n5️⃣ Checking required packages...');
try {
  const packageJson = require('./package.json');
  const hasTFJS = packageJson.dependencies['@tensorflow/tfjs'];
  const hasTFJSRN = packageJson.dependencies['@tensorflow/tfjs-react-native'];
  
  if (hasTFJS && hasTFJSRN) {
    console.log('   ✅ TensorFlow.js packages installed');
    passed++;
  } else {
    console.log('   ⚠️  TensorFlow.js packages not installed');
    console.log('   Run: ./setup.sh or npm install @tensorflow/tfjs @tensorflow/tfjs-react-native');
    failed++;
  }
} catch (error) {
  console.log('   ⚠️  Could not verify dependencies');
  failed++;
}

// Summary
console.log('\n' + '='.repeat(70));
console.log('📊 Test Results:');
console.log(`   ✅ Passed: ${passed}`);
console.log(`   ❌ Failed: ${failed}`);
console.log('='.repeat(70));

if (failed === 0) {
  console.log('\n🎉 All basic checks passed!');
  console.log('\n📋 Next Steps:');
  console.log('   1. Install dependencies: ./setup.sh');
  console.log('   2. Convert model: cd ../UNIDO_FINAL && python convert_model.py');
  console.log('   3. Run app: npx expo start');
  console.log('   4. Navigate to Test Screen for full test suite');
} else {
  console.log(`\n⚠️  ${failed} check(s) failed. Review output above.`);
}

console.log('\n💡 For comprehensive testing, run the app and use the Test Screen.');
console.log('   The Test Screen provides detailed validation of all features.\n');

process.exit(failed > 0 ? 1 : 0);
