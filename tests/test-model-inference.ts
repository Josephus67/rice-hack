/**
 * Test Suite: Model Inference
 * Tests TFLite integration and model loading
 */

import { 
  initializeModel, 
  isModelAvailable, 
  runInference 
} from '@/services/inference/model-inference';

import {
  getModelInfo,
  isTFLiteAvailable,
  warmUpModel,
} from '@/services/inference/tflite-inference';

export async function testModelInference() {
  console.log('\n🧪 Testing Model Inference');
  console.log('=' .repeat(50));

  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
  };

  // Test 1: Model Initialization
  console.log('\n1️⃣ Testing model initialization...');
  try {
    const initialized = await initializeModel();
    const available = isModelAvailable();
    const tfLiteAvailable = isTFLiteAvailable();
    const modelInfo = getModelInfo();

    console.log(`   - initializeModel(): ${initialized}`);
    console.log(`   - isModelAvailable(): ${available}`);
    console.log(`   - isTFLiteAvailable(): ${tfLiteAvailable}`);
    console.log(`   - Model info:`, modelInfo);

    if (!initialized || !available) {
      console.log('   ⚠️  Model not loaded (expected if not converted yet)');
      console.log('   ℹ️  This is OK - will use mock predictions as fallback');
      results.warnings++;
    } else {
      console.log('   ✅ Model loaded successfully');
      results.passed++;
    }
  } catch (error) {
    console.log('   ❌ Model initialization failed:', error);
    results.failed++;
  }

  // Test 2: Mock Inference (should always work)
  console.log('\n2️⃣ Testing inference with mock data...');
  try {
    // Create a dummy image URI (won't actually process it in mock mode)
    const dummyImageUri = 'file:///test/image.jpg';
    const riceTypes: Array<'Paddy' | 'Brown' | 'White'> = ['Paddy', 'Brown', 'White'];

    for (const riceType of riceTypes) {
      const result = await runInference(dummyImageUri, riceType);
      
      if (result.success && result.output) {
        console.log(`   ✅ ${riceType}: Count=${result.output.count}, Time=${result.inferenceTimeMs}ms`);
        results.passed++;
      } else {
        console.log(`   ❌ ${riceType}: Failed - ${result.error}`);
        results.failed++;
      }
    }
  } catch (error) {
    console.log('   ❌ Inference failed:', error);
    results.failed++;
  }

  // Test 3: Model Warm-up (if model is loaded)
  if (isTFLiteAvailable()) {
    console.log('\n3️⃣ Testing model warm-up...');
    try {
      await warmUpModel();
      console.log('   ✅ Model warmed up successfully');
      results.passed++;
    } catch (error) {
      console.log('   ❌ Model warm-up failed:', error);
      results.failed++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Model Inference Test Results:');
  console.log(`   ✅ Passed: ${results.passed}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  console.log(`   ⚠️  Warnings: ${results.warnings}`);
  
  if (results.warnings > 0) {
    console.log('\n💡 Note: Warnings are expected if model files are not yet converted.');
    console.log('   Run: cd ../UNIDO_FINAL && python convert_model.py');
  }

  return results;
}

// Export for use in main test runner
export default testModelInference;
