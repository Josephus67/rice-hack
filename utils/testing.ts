/**
 * Testing Utilities
 * Sprint 3: S3-017 to S3-022 - Integration test helpers
 * 
 * These utilities help with manual and automated testing of the app.
 */

import type { ScanResult, UserProfile, RiceType, RawModelOutput } from '@/types';
import { applyClassifications } from './quality-rules';
import { generateUUID } from './uuid';

/**
 * Generate mock user profile for testing
 */
export function createMockUser(overrides?: Partial<UserProfile>): UserProfile {
  return {
    id: generateUUID(),
    username: 'Test User',
    role: 'Quality Assessor',
    organization: 'Test Organization',
    locationOptIn: false,
    disclaimerAcceptedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Generate mock raw model output for testing
 */
export function createMockRawOutput(overrides?: Partial<RawModelOutput>): RawModelOutput {
  const count = overrides?.count ?? Math.floor(Math.random() * 300) + 100;
  const brokenCount = overrides?.broken_count ?? Math.floor(count * (Math.random() * 0.2));
  const longCount = overrides?.long_count ?? Math.floor(count * 0.7);
  
  return {
    count,
    broken_count: brokenCount,
    long_count: longCount,
    medium_count: count - longCount,
    black_count: Math.floor(count * Math.random() * 0.05),
    chalky_count: Math.floor(count * Math.random() * 0.15),
    red_count: Math.floor(count * Math.random() * 0.03),
    yellow_count: Math.floor(count * Math.random() * 0.02),
    green_count: Math.floor(count * Math.random() * 0.02),
    wk_length_avg: 5.5 + Math.random() * 2,
    wk_width_avg: 1.8 + Math.random() * 0.8,
    wk_lw_ratio_avg: 2.5 + Math.random() * 1,
    average_l: 70 + Math.random() * 15,
    average_a: -0.5 + Math.random() * 2,
    average_b: 12 + Math.random() * 10,
    ...overrides,
  };
}

/**
 * Generate mock scan result for testing
 */
export function createMockScan(overrides?: {
  riceType?: RiceType;
  rawOutput?: Partial<RawModelOutput>;
  userId?: string;
}): ScanResult {
  const rawOutput = createMockRawOutput(overrides?.rawOutput);
  const classifications = applyClassifications(rawOutput);
  
  return {
    id: generateUUID(),
    userId: overrides?.userId ?? generateUUID(),
    riceType: overrides?.riceType ?? 'White',
    imageUri: 'mock://test-image.jpg',
    capturedAt: new Date(),
    rawOutput,
    classifications,
    inferenceTimeMs: Math.floor(Math.random() * 3000) + 500,
  };
}

/**
 * Test scenarios for quality grades
 */
export const TestScenarios = {
  premiumGrade: () => createMockScan({
    rawOutput: {
      count: 400,
      broken_count: 16, // 4% - Premium
      chalky_count: 20,
      black_count: 2,
      green_count: 1,
    },
  }),
  
  grade1: () => createMockScan({
    rawOutput: {
      count: 350,
      broken_count: 28, // 8% - Grade 1
      chalky_count: 35,
      black_count: 5,
    },
  }),
  
  grade2: () => createMockScan({
    rawOutput: {
      count: 300,
      broken_count: 36, // 12% - Grade 2
      chalky_count: 45,
      black_count: 8,
    },
  }),
  
  grade3: () => createMockScan({
    rawOutput: {
      count: 280,
      broken_count: 50, // ~18% - Grade 3
      chalky_count: 60,
      black_count: 15,
    },
  }),
  
  belowGrade: () => createMockScan({
    rawOutput: {
      count: 250,
      broken_count: 75, // 30% - Below Grade
      chalky_count: 80,
      black_count: 30,
      yellow_count: 25,
    },
  }),
  
  withWarnings: () => createMockScan({
    rawOutput: {
      count: 300,
      broken_count: 24,
      black_count: 40, // High black - warning
      green_count: 35, // High green - warning
      yellow_count: 32, // High yellow - warning
    },
  }),
  
  paddyRice: () => createMockScan({
    riceType: 'Paddy',
    rawOutput: {
      count: 200,
      broken_count: 15,
    },
  }),
  
  brownRice: () => createMockScan({
    riceType: 'Brown',
    rawOutput: {
      count: 280,
      broken_count: 22,
    },
  }),
};

/**
 * Test checklist for manual QA
 */
export const IntegrationTestChecklist = {
  signupFlow: [
    'App launches without crash',
    'Welcome screen shows correctly',
    'Disclaimer modal appears',
    'Accept disclaimer navigates to profile setup',
    'Profile form accepts all inputs',
    'Role dropdown works',
    'Submit creates user and navigates to home',
  ],
  
  captureFlow: [
    'Camera permission request appears',
    'Camera preview shows correctly',
    'Rice type dropdown works',
    'Capture button takes photo',
    'Preview screen shows captured image',
    'Validation feedback displays',
    'Analyze button starts inference',
    'Loading overlay appears during inference',
    'Results screen shows after completion',
  ],
  
  resultsFlow: [
    'Grade indicator shows correctly',
    'Statistics display accurately',
    'Warnings appear when applicable',
    'Detailed metrics accessible',
    'Export button works',
    'Share functionality works',
    'Navigation back works',
  ],
  
  historyFlow: [
    'History screen loads past scans',
    'Scan cards display correctly',
    'Tap to view details works',
    'Swipe to delete works',
    'Empty state shows when no scans',
    'Pagination loads more items',
  ],
  
  offlineMode: [
    'Offline indicator appears when disconnected',
    'Camera still works offline',
    'Inference runs offline (mock mode)',
    'Results save locally offline',
    'History accessible offline',
    'App does not crash offline',
  ],
};

/**
 * Performance benchmarks
 */
export const PerformanceBenchmarks = {
  // Maximum acceptable times in milliseconds
  appStartup: 3000,
  cameraReady: 1500,
  imageCapture: 500,
  imageValidation: 1000,
  inference: 5000,
  resultsRender: 500,
  historyLoad: 1000,
  csvExport: 2000,
};

/**
 * Device test matrix
 */
export const DeviceTestMatrix = {
  target: [
    { name: 'Samsung Galaxy A14', os: 'Android 13', ram: '4GB' },
    { name: 'Tecno Spark 10', os: 'Android 13', ram: '4GB' },
    { name: 'Huawei Y9 Prime', os: 'Android 9', ram: '4GB' },
  ],
  minimum: {
    os: 'Android 9 (API 28)',
    ram: '3GB',
    storage: '100MB free',
  },
};
