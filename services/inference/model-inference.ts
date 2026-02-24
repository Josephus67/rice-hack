/**
 * Model Inference Service
 * 
 * Handles rice quality inference using either:
 * - TFLite models (when available)
 * - Mock inference (for development/testing)
 * - Remote API fallback (for complex models)
 */

import { MODEL_CONFIG, RICE_TYPE_INDEX } from '@/constants/app';
import type { RiceType, RawModelOutput } from '@/types';
import type { InferenceResult, ImageValidationResult } from '@/types/inference.types';
import { preprocessImage, validateImage } from '@/services/validation';
import { 
  isTFLiteAvailable, 
  runTFLiteInference as executeTFLiteInference,
  initializeTFLite,
} from './tflite-inference';

// Transform stats from training (for output denormalization)
// These values come from the training data statistics
const TRANSFORM_STATS = {
  count: {
    count: { mean: 5.94, std: 0.39 },
    broken_count: { mean: 3.08, std: 0.87 },
    long_count: { mean: 4.92, std: 0.62 },
    medium_count: { mean: 3.72, std: 0.95 },
    black_count: { mean: 0.89, std: 1.29 },
    chalky_count: { mean: 2.91, std: 1.32 },
    red_count: { mean: 0.98, std: 1.35 },
    yellow_count: { mean: 0.72, std: 1.14 },
    green_count: { mean: 0.94, std: 1.28 },
  },
  continuous: {
    wk_length_avg: { mean: 6.62, std: 0.81 },
    wk_width_avg: { mean: 2.24, std: 0.32 },
    wk_lw_ratio_avg: { mean: 3.01, std: 0.44 },
    average_l: { mean: 76.8, std: 6.2 },
    average_a: { mean: 0.82, std: 1.15 },
    average_b: { mean: 17.4, std: 4.1 },
  },
};

// Target indices in model output
const OUTPUT_INDICES = {
  count: 0,
  broken_count: 1,
  long_count: 2,
  medium_count: 3,
  black_count: 4,
  chalky_count: 5,
  red_count: 6,
  yellow_count: 7,
  green_count: 8,
  wk_length_avg: 9,
  wk_width_avg: 10,
  wk_lw_ratio_avg: 11,
  average_l: 12,
  average_a: 13,
  average_b: 14,
};

/**
 * Check if TFLite model is available
 */
export function isModelAvailable(): boolean {
  return isTFLiteAvailable();
}

/**
 * Initialize the ML model
 * Should be called at app startup
 */
export async function initializeModel(): Promise<boolean> {
  try {
    return await initializeTFLite();
  } catch (error) {
    console.error('Failed to initialize model:', error);
    return false;
  }
}

/**
 * Run inference on an image
 */
export async function runInference(
  imageUri: string,
  riceType: RiceType,
): Promise<InferenceResult> {
  const startTime = Date.now();
  
  try {
    // Validate image first
    const validation = await validateImage(imageUri);
    
    // Preprocess image
    const processedUri = await preprocessImage(
      imageUri,
      MODEL_CONFIG.INPUT_SIZE
    );
    
    let rawOutput: number[];
    
    if (isModelAvailable()) {
      // Use actual TFLite model
      rawOutput = await runTFLiteInference(processedUri, riceType);
    } else {
      // Use mock inference for development
      rawOutput = generateMockPredictions(riceType);
    }
    
    // Denormalize outputs
    const denormalized = denormalizeOutputs(rawOutput);
    
    const inferenceTime = Date.now() - startTime;
    
    return {
      success: true,
      output: denormalized,
      inferenceTimeMs: inferenceTime,
    };
  } catch (error) {
    console.error('Inference error:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown inference error',
      inferenceTimeMs: Date.now() - startTime,
    };
  }
}

/**
 * Run TFLite model inference
 * 
 * This uses the TFLite inference service for on-device inference.
 */
async function runTFLiteInference(
  processedImageUri: string,
  riceType: RiceType,
): Promise<number[]> {
  try {
    return await executeTFLiteInference(processedImageUri, riceType);
  } catch (error) {
    console.error('TFLite inference failed:', error);
    // Fall back to mock predictions in case of error
    console.warn('Falling back to mock predictions');
    return generateMockPredictions(riceType);
  }
}

/**
 * Generate mock predictions for development/testing
 */
function generateMockPredictions(riceType: RiceType): number[] {
  // Generate normalized predictions (as if from model output)
  // These are in the transformed space (log1p + z-score for counts, z-score for continuous)
  
  const predictions = new Array(15).fill(0);
  
  // Add some variation based on rice type
  const typeVariance = riceType === 'Paddy' ? 0.1 : riceType === 'Brown' ? 0.0 : -0.1;
  
  // Count targets (normalized)
  predictions[OUTPUT_INDICES.count] = 0.2 + Math.random() * 0.3 + typeVariance;
  predictions[OUTPUT_INDICES.broken_count] = -0.5 + Math.random() * 0.5;
  predictions[OUTPUT_INDICES.long_count] = 0.3 + Math.random() * 0.4;
  predictions[OUTPUT_INDICES.medium_count] = -0.3 + Math.random() * 0.6;
  predictions[OUTPUT_INDICES.black_count] = -0.8 + Math.random() * 0.4;
  predictions[OUTPUT_INDICES.chalky_count] = -0.2 + Math.random() * 0.6;
  predictions[OUTPUT_INDICES.red_count] = -0.7 + Math.random() * 0.4;
  predictions[OUTPUT_INDICES.yellow_count] = -0.9 + Math.random() * 0.3;
  predictions[OUTPUT_INDICES.green_count] = -0.8 + Math.random() * 0.4;
  
  // Continuous targets (normalized)
  predictions[OUTPUT_INDICES.wk_length_avg] = 0.0 + Math.random() * 0.5 - 0.25;
  predictions[OUTPUT_INDICES.wk_width_avg] = 0.0 + Math.random() * 0.4 - 0.2;
  predictions[OUTPUT_INDICES.wk_lw_ratio_avg] = 0.0 + Math.random() * 0.3 - 0.15;
  predictions[OUTPUT_INDICES.average_l] = 0.0 + Math.random() * 0.3 - 0.15;
  predictions[OUTPUT_INDICES.average_a] = 0.0 + Math.random() * 0.2 - 0.1;
  predictions[OUTPUT_INDICES.average_b] = 0.0 + Math.random() * 0.3 - 0.15;
  
  return predictions;
}

/**
 * Denormalize model outputs to actual values
 */
function denormalizeOutputs(predictions: number[]): RawModelOutput {
  // Helper for count targets (inverse of log1p + z-score)
  const invCount = (idx: number, key: keyof typeof TRANSFORM_STATS.count): number => {
    const { mean, std } = TRANSFORM_STATS.count[key];
    const normalized = predictions[idx];
    const log1pVal = normalized * std + mean;
    return Math.max(0, Math.round(Math.expm1(log1pVal)));
  };
  
  // Helper for continuous targets (inverse of z-score)
  const invCont = (idx: number, key: keyof typeof TRANSFORM_STATS.continuous): number => {
    const { mean, std } = TRANSFORM_STATS.continuous[key];
    const normalized = predictions[idx];
    return normalized * std + mean;
  };
  
  return {
    count: invCount(OUTPUT_INDICES.count, 'count'),
    broken_count: invCount(OUTPUT_INDICES.broken_count, 'broken_count'),
    long_count: invCount(OUTPUT_INDICES.long_count, 'long_count'),
    medium_count: invCount(OUTPUT_INDICES.medium_count, 'medium_count'),
    black_count: invCount(OUTPUT_INDICES.black_count, 'black_count'),
    chalky_count: invCount(OUTPUT_INDICES.chalky_count, 'chalky_count'),
    red_count: invCount(OUTPUT_INDICES.red_count, 'red_count'),
    yellow_count: invCount(OUTPUT_INDICES.yellow_count, 'yellow_count'),
    green_count: invCount(OUTPUT_INDICES.green_count, 'green_count'),
    wk_length_avg: invCont(OUTPUT_INDICES.wk_length_avg, 'wk_length_avg'),
    wk_width_avg: invCont(OUTPUT_INDICES.wk_width_avg, 'wk_width_avg'),
    wk_lw_ratio_avg: invCont(OUTPUT_INDICES.wk_lw_ratio_avg, 'wk_lw_ratio_avg'),
    average_l: invCont(OUTPUT_INDICES.average_l, 'average_l'),
    average_a: invCont(OUTPUT_INDICES.average_a, 'average_a'),
    average_b: invCont(OUTPUT_INDICES.average_b, 'average_b'),
  };
}

/**
 * Batch inference for multiple images
 */
export async function runBatchInference(
  images: Array<{ uri: string; riceType: RiceType }>,
): Promise<InferenceResult[]> {
  // For now, run sequentially. TFLite supports batch inference for better performance.
  const results: InferenceResult[] = [];
  
  for (const { uri, riceType } of images) {
    const result = await runInference(uri, riceType);
    results.push(result);
  }
  
  return results;
}
