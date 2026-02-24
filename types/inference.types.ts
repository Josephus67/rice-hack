/**
 * Inference-related type definitions
 */

import type { RiceType, RawModelOutput } from './scan.types';

export interface ModelConfig {
  name: string;
  version: string;
  inputSize: {
    width: number;
    height: number;
  };
  inputChannels: number;
  numOutputs: number;
  quantization: 'fp32' | 'fp16' | 'int8';
}

export interface PreprocessingConfig {
  mean: [number, number, number]; // ImageNet mean
  std: [number, number, number];  // ImageNet std
  inputFormat: 'NCHW' | 'NHWC';
}

export interface TargetTransformStats {
  countMean: number;
  countStd: number;
  brokenCountMean: number;
  brokenCountStd: number;
  // Add other target statistics
}

export interface InferenceInput {
  imageUri: string;
  riceType: RiceType;
}

export interface InferenceResult {
  success: boolean;
  output?: RawModelOutput;
  error?: string;
  inferenceTimeMs: number;
}

export interface ImageValidationResult {
  isValid: boolean;
  checks: ImageValidationCheck[];
}

export interface ImageValidationCheck {
  name: string;
  passed: boolean;
  value: number;
  threshold: number;
  message: string;
}
