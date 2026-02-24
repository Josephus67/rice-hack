/**
 * Application constants
 */

// App version (sync with app.json)
export const APP_VERSION = '1.0.0';
export const MODEL_VERSION = '1.0.0';

// Database
export const DATABASE_NAME = 'RiceQualityDB.db';
export const DATABASE_VERSION = 1;
export const SCAN_HISTORY_LIMIT = 100; // Maximum number of scans to keep

// Image capture settings
export const CAPTURE_CONFIG = {
  imageWidth: 1920,
  imageHeight: 1080,
  quality: 0.9,
  base64: false,
} as const;

// Model inference settings
export const MODEL_CONFIG = {
  INPUT_SIZE: 384,
  inputSize: 384,
  inputChannels: 3,
  quantization: 'fp16' as const,
  // ImageNet normalization
  mean: [0.485, 0.456, 0.406] as [number, number, number],
  std: [0.229, 0.224, 0.225] as [number, number, number],
} as const;

// Image validation thresholds
export const VALIDATION_THRESHOLDS = {
  MIN_BRIGHTNESS: 0.2,
  MAX_BRIGHTNESS: 0.85,
  BLUR_THRESHOLD: 15, // variance score
  MIN_RESOLUTION: 384,
  BLUE_BACKGROUND_RATIO: 0.4, // At least 40% blue pixels for background check
} as const;

// Rice type comment indices (for model input)
export const RICE_TYPE_INDEX = {
  Paddy: 0,
  Brown: 1,
  White: 2,
} as const;

// Quality classification thresholds
export const QUALITY_THRESHOLDS = {
  milling: {
    premium: 5,   // < 5% broken
    grade1: 10,   // < 10% broken
    grade2: 15,   // < 15% broken
    grade3: 20,   // < 20% broken
  },
  shape: {
    bold: 2.1,    // L/W ratio < 2.1
    medium: 2.9,  // L/W ratio <= 2.9
    // > 2.9 = slender
  },
  chalkiness: {
    notChalky: 20, // < 20% chalky
  },
  defects: {
    warning: 5,   // > 5% triggers low warning
    caution: 10,  // > 10% triggers medium warning
    critical: 20, // > 20% triggers high warning
  },
} as const;

// API configuration
export const API_CONFIG = {
  baseUrl: __DEV__ ? 'http://localhost:8000' : 'https://api.riceanalyzer.app',
  timeout: 30000,
  version: 'v1',
} as const;

// Storage keys
export const STORAGE_KEYS = {
  USER_PROFILE: 'user_profile',
  SETTINGS: 'app_settings',
  DISCLAIMER_ACCEPTED: 'disclaimer_accepted',
  LAST_SYNC_TIME: 'last_sync_time',
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

// Disclaimer text
export const DISCLAIMER_TEXT = `DISCLAIMER

This application provides INDICATIVE, FIELD-LEVEL quality assessment of rice samples using AI-powered image analysis.

IMPORTANT:
• Results are estimates based on visual analysis only
• This tool does NOT replace laboratory analysis
• This tool does NOT provide food safety certification
• Results should be used for preliminary assessment purposes only

By using this application, you acknowledge that UNIDO and AfricaRice are not liable for decisions made based on these assessments.` as const;
