/**
 * Image Validation Service
 * Validates image quality before ML inference
 */

import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import { VALIDATION_THRESHOLDS } from '@/constants/app';
import type { ImageValidationResult } from '@/types/inference.types';

// Simple pixel analysis types
interface PixelStats {
  brightness: number;
  contrast: number;
  variance: number;
  blueHueRatio: number; // Proportion of pixels with blue hue
  dominantHue: number; // Dominant hue in degrees (0-360)
}

/**
 * Validate an image for ML processing
 */
export async function validateImage(
  imageUri: string
): Promise<ImageValidationResult> {
  const checks: ImageValidationResult['checks'] = [];
  let isValid = true;

  try {
    // 1. Check file exists and get info
    const fileInfo = await FileSystem.getInfoAsync(imageUri);
    if (!fileInfo.exists) {
      return {
        isValid: false,
        checks: [
          {
            name: 'File Exists',
            passed: false,
            value: 0,
            threshold: 1,
            message: 'Image file not found',
          },
        ],
      };
    }

    // 2. Check resolution
    const resized = await ImageManipulator.manipulateAsync(
      imageUri,
      [],
      { format: ImageManipulator.SaveFormat.JPEG }
    );

    // Get image dimensions by manipulating to known size and checking ratio
    const smallVersion = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 100 } }],
      { format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );

    // Estimate original resolution from file size (rough heuristic)
    const fileSizeKB = (fileInfo.size || 0) / 1024;
    const estimatedMegapixels = fileSizeKB / 150; // ~150KB per megapixel for JPEG
    const estimatedResolution = Math.sqrt(estimatedMegapixels * 1000000);

    const resolutionPassed = estimatedResolution >= VALIDATION_THRESHOLDS.MIN_RESOLUTION;
    checks.push({
      name: 'Resolution',
      passed: resolutionPassed,
      value: Math.round(estimatedResolution),
      threshold: VALIDATION_THRESHOLDS.MIN_RESOLUTION,
      message: resolutionPassed
        ? `Resolution OK (~${Math.round(estimatedResolution)}px)`
        : `Low resolution (need ${VALIDATION_THRESHOLDS.MIN_RESOLUTION}px+)`,
    });
    if (!resolutionPassed) isValid = false;

    // 3. Analyze image brightness and blur via base64 sampling
    if (smallVersion.base64) {
      const stats = analyzePixelStats(smallVersion.base64);

      // Brightness check
      const brightnessPassed =
        stats.brightness >= VALIDATION_THRESHOLDS.MIN_BRIGHTNESS &&
        stats.brightness <= VALIDATION_THRESHOLDS.MAX_BRIGHTNESS;
      checks.push({
        name: 'Brightness',
        passed: brightnessPassed,
        value: Math.round(stats.brightness * 100),
        threshold: Math.round(VALIDATION_THRESHOLDS.MIN_BRIGHTNESS * 100),
        message: brightnessPassed
          ? 'Good lighting'
          : stats.brightness < VALIDATION_THRESHOLDS.MIN_BRIGHTNESS
          ? 'Image too dark'
          : 'Image too bright',
      });
      if (!brightnessPassed) isValid = false;

      // Blur check (using variance as proxy for sharpness)
      const blurScore = stats.variance * 100;
      const blurThreshold = VALIDATION_THRESHOLDS.BLUR_THRESHOLD;
      const sharpnessPassed = blurScore >= blurThreshold;
      checks.push({
        name: 'Sharpness',
        passed: sharpnessPassed,
        value: Math.round(blurScore),
        threshold: blurThreshold,
        message: sharpnessPassed ? 'Image is sharp' : 'Image appears blurry',
      });
      if (!sharpnessPassed) isValid = false;

      // Contrast check
      const contrastPassed = stats.contrast >= 0.15;
      checks.push({
        name: 'Contrast',
        passed: contrastPassed,
        value: Math.round(stats.contrast * 100),
        threshold: 15,
        message: contrastPassed ? 'Good contrast' : 'Low contrast',
      });
      if (!contrastPassed) isValid = false;

      // Blue background check
      // Blue hue is typically 180-270 degrees (cyan to blue to violet)
      // We check if the dominant color is in the blue range
      const blueBackgroundPassed = stats.blueHueRatio >= 0.4; // At least 40% blue pixels
      checks.push({
        name: 'Blue Background',
        passed: blueBackgroundPassed,
        value: Math.round(stats.blueHueRatio * 100),
        threshold: 40,
        message: blueBackgroundPassed
          ? 'Blue background detected'
          : `Background should be blue (detected ${getColorName(stats.dominantHue)})`,
      });
      // Don't mark as invalid for background - just warn
      // if (!blueBackgroundPassed) isValid = false;
    }

    // 4. File size check (ensure not too small or corrupted)
    const fileSizePassed = fileSizeKB >= 50;
    checks.push({
      name: 'File Size',
      passed: fileSizePassed,
      value: Math.round(fileSizeKB),
      threshold: 50,
      message: fileSizePassed
        ? `File size OK (${Math.round(fileSizeKB)}KB)`
        : 'File too small or corrupted',
    });
    if (!fileSizePassed) isValid = false;

    return { isValid, checks };
  } catch (error) {
    console.error('Image validation error:', error);
    return {
      isValid: false,
      checks: [
        {
          name: 'Validation Error',
          passed: false,
          value: 0,
          threshold: 0,
          message: 'Failed to validate image',
        },
      ],
    };
  }
}

/**
 * Analyze pixel statistics from base64 image
 * Includes color histogram analysis for blue background detection
 */
function analyzePixelStats(base64Data: string): PixelStats {
  // Decode a portion of base64 to estimate brightness and color
  // Note: This is a simplified implementation. Production might use native image processing.
  const bytes = atob(base64Data.slice(0, 3000)); // Sample larger portion for color analysis
  
  let sum = 0;
  let min = 255;
  let max = 0;
  let sumSq = 0;
  let count = 0;

  // Color histogram buckets (simplified HSV analysis)
  let redCount = 0;
  let greenCount = 0;
  let blueCount = 0;
  let blueHueCount = 0;
  
  // Skip JPEG header and sample pixel bytes (assume RGB triplets)
  const startOffset = 100;
  for (let i = startOffset; i < bytes.length - 2; i += 3) {
    const r = bytes.charCodeAt(i);
    const g = bytes.charCodeAt(i + 1);
    const b = bytes.charCodeAt(i + 2);
    
    // Grayscale stats
    const gray = (r + g + b) / 3;
    sum += gray;
    sumSq += gray * gray;
    min = Math.min(min, gray);
    max = Math.max(max, gray);
    count++;

    // Simple color detection
    // Blue pixels have: high B, low R, moderate-to-high G
    redCount += r;
    greenCount += g;
    blueCount += b;

    // Detect blue hue: B > R && B > G (simplified)
    // More sophisticated: calculate HSV hue and check if in range 180-270
    const maxChannel = Math.max(r, g, b);
    const minChannel = Math.min(r, g, b);
    const delta = maxChannel - minChannel;
    
    if (delta > 20) { // Only consider saturated pixels
      let hue = 0;
      if (maxChannel === r) {
        hue = ((g - b) / delta) % 6;
      } else if (maxChannel === g) {
        hue = (b - r) / delta + 2;
      } else {
        hue = (r - g) / delta + 4;
      }
      hue = (hue * 60 + 360) % 360;
      
      // Blue hue range: 180-270 degrees
      if (hue >= 180 && hue <= 270) {
        blueHueCount++;
      }
    }
  }

  const pixelCount = count;
  const mean = pixelCount > 0 ? sum / pixelCount : 128;
  const brightness = mean / 255;
  const contrast = (max - min) / 255;
  const variance = pixelCount > 0 ? (sumSq / pixelCount - mean * mean) / (255 * 255) : 0;
  const blueHueRatio = pixelCount > 0 ? blueHueCount / pixelCount : 0;
  
  // Calculate dominant hue (simplified: based on color channel dominance)
  const totalColor = redCount + greenCount + blueCount;
  let dominantHue = 0;
  if (totalColor > 0) {
    const rRatio = redCount / totalColor;
    const gRatio = greenCount / totalColor;
    const bRatio = blueCount / totalColor;
    
    if (bRatio > rRatio && bRatio > gRatio) {
      dominantHue = 240; // Blue
    } else if (gRatio > rRatio) {
      dominantHue = 120; // Green
    } else {
      dominantHue = 0; // Red
    }
  }

  return {
    brightness: Math.max(0, Math.min(1, brightness)),
    contrast: Math.max(0, Math.min(1, contrast)),
    variance: Math.max(0, variance),
    blueHueRatio,
    dominantHue,
  };
}

/**
 * Get color name from hue value (in degrees)
 */
function getColorName(hue: number): string {
  if (hue >= 0 && hue < 30) return 'red';
  if (hue >= 30 && hue < 90) return 'yellow';
  if (hue >= 90 && hue < 150) return 'green';
  if (hue >= 150 && hue < 210) return 'cyan';
  if (hue >= 210 && hue < 270) return 'blue';
  if (hue >= 270 && hue < 330) return 'magenta';
  return 'red';
}

/**
 * Preprocess image for ML inference
 * Resizes and normalizes image to model input requirements
 */
export async function preprocessImage(
  imageUri: string,
  targetSize: number = 384
): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    imageUri,
    [
      { resize: { width: targetSize, height: targetSize } },
    ],
    {
      format: ImageManipulator.SaveFormat.PNG,
      compress: 1,
    }
  );

  return result.uri;
}

/**
 * Get image dimensions
 */
export async function getImageDimensions(
  imageUri: string
): Promise<{ width: number; height: number }> {
  // Use ImageManipulator to get dimensions
  const result = await ImageManipulator.manipulateAsync(
    imageUri,
    [],
    { format: ImageManipulator.SaveFormat.JPEG }
  );

  // Parse from URI or estimate from file
  // Note: expo-image-manipulator doesn't directly return dimensions
  // This would need expo-image or a native module in production
  return { width: 0, height: 0 };
}
