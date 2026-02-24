/**
 * TensorFlow Lite Inference Service
 * 
 * Handles on-device model inference using TFLite
 * This implementation uses @tensorflow/tfjs with the React Native bundle
 * 
 * NOTE: Requires @tensorflow/tfjs and @tensorflow/tfjs-react-native packages
 * Install: npm install @tensorflow/tfjs @tensorflow/tfjs-react-native
 *          npx expo install expo-gl expo-gl-cpp
 */

// @ts-ignore - Package may not be installed yet
import * as tf from '@tensorflow/tfjs';
// @ts-ignore - Package may not be installed yet
import '@tensorflow/tfjs-react-native';
// @ts-ignore - Package may not be installed yet
import { decodeJpeg } from '@tensorflow/tfjs-react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { Asset } from 'expo-asset';
import { MODEL_CONFIG, RICE_TYPE_INDEX } from '@/constants/app';
import type { RiceType } from '@/types';

// Model cache
let model: tf.GraphModel | null = null;
let isInitialized = false;

/**
 * Initialize TensorFlow and load the model
 * Call this once at app startup or before first inference
 */
export async function initializeTFLite(): Promise<boolean> {
  if (isInitialized && model) {
    return true;
  }

  try {
    // Initialize TensorFlow.js for React Native
    await tf.ready();
    console.log('TensorFlow.js initialized');

    // Load the model from assets
    // The model should be in assets/models/ folder
    // Can be either:
    // 1. TFLite model (model.tflite)
    // 2. TFJS model (model.json + shard files)
    
    const modelAsset = Asset.fromModule(
      require('@/assets/models/rice_quality_model.json')
    );
    
    await modelAsset.downloadAsync();
    
    if (!modelAsset.localUri) {
      throw new Error('Failed to load model asset');
    }

    // Load the graph model
    model = await tf.loadGraphModel(modelAsset.localUri);
    
    console.log('Model loaded successfully');
    console.log('Input shape:', model.inputs[0].shape);
    console.log('Output shape:', model.outputs[0].shape);

    isInitialized = true;
    return true;
  } catch (error) {
    console.error('Failed to initialize TFLite:', error);
    isInitialized = false;
    return false;
  }
}

/**
 * Check if the model is available and initialized
 */
export function isTFLiteAvailable(): boolean {
  return isInitialized && model !== null;
}

/**
 * Run TFLite model inference on an image
 * 
 * @param imageUri - Local URI of the preprocessed image (384x384)
 * @param riceType - Type of rice (Paddy, Brown, White)
 * @returns Array of 15 predictions (normalized)
 */
export async function runTFLiteInference(
  imageUri: string,
  riceType: RiceType,
): Promise<number[]> {
  if (!isTFLiteAvailable()) {
    throw new Error('TFLite model not initialized. Call initializeTFLite() first.');
  }

  if (!model) {
    throw new Error('Model is null');
  }

  let imageTensor: tf.Tensor3D | null = null;
  let normalizedTensor: tf.Tensor4D | null = null;
  let commentTensor: tf.Tensor | null = null;
  let outputTensor: tf.Tensor | null = null;

  try {
    // Read image file as base64
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: 'base64' as any, // FileSystem.EncodingType.Base64 in newer Expo versions
    });

    // Decode JPEG to tensor
    const imageBuffer = tf.util.encodeString(base64, 'base64');
    imageTensor = decodeJpeg(new Uint8Array(imageBuffer.buffer));

    // Ensure correct shape [height, width, 3]
    if (imageTensor.shape[2] !== 3) {
      throw new Error(`Expected 3 channels, got ${imageTensor.shape[2]}`);
    }

    // Normalize image (ImageNet normalization)
    // 1. Convert to float [0, 1]
    // 2. Subtract mean
    // 3. Divide by std
    // 4. Add batch dimension
    normalizedTensor = tf.tidy(() => {
      const floatImage = imageTensor!.toFloat().div(255.0);
      
      // ImageNet normalization
      const mean = tf.tensor1d(MODEL_CONFIG.mean);
      const std = tf.tensor1d(MODEL_CONFIG.std);
      
      const normalized = floatImage.sub(mean).div(std);
      
      // Add batch dimension [1, height, width, 3]
      return normalized.expandDims(0) as tf.Tensor4D;
    });

    // Create comment input (rice type index)
    commentTensor = tf.tensor1d([RICE_TYPE_INDEX[riceType]], 'int32');

    // Run inference
    // Model expects two inputs: [image_tensor, comment_tensor]
    const modelInputs: { [key: string]: tf.Tensor } = {
      image_input: normalizedTensor,
      comment_input: commentTensor,
    };

    outputTensor = model.execute(modelInputs) as tf.Tensor;

    // Get predictions as array
    const predictions = await outputTensor.data();

    // Verify output shape (should be 15 targets)
    if (predictions.length !== 15) {
      throw new Error(`Expected 15 outputs, got ${predictions.length}`);
    }

    return Array.from(predictions);
  } catch (error) {
    console.error('TFLite inference error:', error);
    throw error;
  } finally {
    // Clean up tensors to prevent memory leaks
    if (imageTensor) imageTensor.dispose();
    if (normalizedTensor) normalizedTensor.dispose();
    if (commentTensor) commentTensor.dispose();
    if (outputTensor && typeof outputTensor.dispose === 'function') {
      outputTensor.dispose();
    }
  }
}

/**
 * Get model info for debugging
 */
export function getModelInfo(): {
  initialized: boolean;
  inputShape: number[] | null;
  outputShape: number[] | null;
} {
  if (!model) {
    return {
      initialized: false,
      inputShape: null,
      outputShape: null,
    };
  }

  return {
    initialized: isInitialized,
    inputShape: model.inputs[0]?.shape || null,
    outputShape: model.outputs[0]?.shape || null,
  };
}

/**
 * Dispose of the model and free memory
 */
export async function disposeTFLite(): Promise<void> {
  if (model) {
    model.dispose();
    model = null;
  }
  isInitialized = false;
  console.log('TFLite model disposed');
}

/**
 * Warm up the model by running a dummy inference
 * This helps reduce latency on the first real inference
 */
export async function warmUpModel(): Promise<void> {
  if (!isTFLiteAvailable() || !model) {
    return;
  }

  try {
    await tf.tidy(() => {
      // Create dummy inputs
      const dummyImage = tf.zeros([1, MODEL_CONFIG.INPUT_SIZE, MODEL_CONFIG.INPUT_SIZE, 3]);
      const dummyComment = tf.tensor1d([0], 'int32');

      const modelInputs: { [key: string]: tf.Tensor } = {
        image_input: dummyImage,
        comment_input: dummyComment,
      };

      // Run inference (result is disposed by tf.tidy)
      model!.execute(modelInputs);
    });

    console.log('Model warmed up successfully');
  } catch (error) {
    console.error('Model warm-up failed:', error);
  }
}
