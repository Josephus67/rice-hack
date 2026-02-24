/**
 * Performance Monitoring Utilities
 * Sprint 3: S3-001 to S3-006 - Performance profiling and optimization
 */

import { InteractionManager } from 'react-native';

// Performance metrics storage
interface PerformanceMetrics {
  inferenceTime: number[];
  preprocessingTime: number[];
  totalProcessingTime: number[];
  memoryUsage: number[];
}

const metrics: PerformanceMetrics = {
  inferenceTime: [],
  preprocessingTime: [],
  totalProcessingTime: [],
  memoryUsage: [],
};

/**
 * Performance timer utility
 */
export class PerfTimer {
  private startTime: number = 0;
  private name: string;

  constructor(name: string) {
    this.name = name;
    this.start();
  }

  start(): void {
    this.startTime = performance.now();
  }

  stop(): number {
    const elapsed = performance.now() - this.startTime;
    if (__DEV__) {
      console.log(`[Perf] ${this.name}: ${elapsed.toFixed(2)}ms`);
    }
    return elapsed;
  }
}

/**
 * Record inference timing
 */
export function recordInferenceTime(timeMs: number): void {
  metrics.inferenceTime.push(timeMs);
  // Keep last 100 measurements
  if (metrics.inferenceTime.length > 100) {
    metrics.inferenceTime.shift();
  }
}

/**
 * Record preprocessing timing
 */
export function recordPreprocessingTime(timeMs: number): void {
  metrics.preprocessingTime.push(timeMs);
  if (metrics.preprocessingTime.length > 100) {
    metrics.preprocessingTime.shift();
  }
}

/**
 * Get average inference time
 */
export function getAverageInferenceTime(): number {
  if (metrics.inferenceTime.length === 0) return 0;
  const sum = metrics.inferenceTime.reduce((a, b) => a + b, 0);
  return sum / metrics.inferenceTime.length;
}

/**
 * Get performance report
 */
export function getPerformanceReport(): {
  avgInferenceTime: number;
  avgPreprocessingTime: number;
  sampleCount: number;
  p95InferenceTime: number;
} {
  const sortedInference = [...metrics.inferenceTime].sort((a, b) => a - b);
  const p95Index = Math.floor(sortedInference.length * 0.95);

  return {
    avgInferenceTime: getAverageInferenceTime(),
    avgPreprocessingTime: 
      metrics.preprocessingTime.length > 0
        ? metrics.preprocessingTime.reduce((a, b) => a + b, 0) / metrics.preprocessingTime.length
        : 0,
    sampleCount: metrics.inferenceTime.length,
    p95InferenceTime: sortedInference[p95Index] || 0,
  };
}

/**
 * Clear performance metrics
 */
export function clearMetrics(): void {
  metrics.inferenceTime = [];
  metrics.preprocessingTime = [];
  metrics.totalProcessingTime = [];
  metrics.memoryUsage = [];
}

/**
 * Defer heavy operations until interactions complete
 */
export function runAfterInteractions<T>(operation: () => Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    InteractionManager.runAfterInteractions(() => {
      operation().then(resolve).catch(reject);
    });
  });
}

/**
 * Image cache manager for memory optimization
 */
class ImageCacheManager {
  private cache: Map<string, { uri: string; timestamp: number }> = new Map();
  private maxCacheSize = 20;
  private maxAge = 5 * 60 * 1000; // 5 minutes

  /**
   * Add image to cache
   */
  set(key: string, uri: string): void {
    // Clean old entries if at max size
    if (this.cache.size >= this.maxCacheSize) {
      this.cleanup();
    }
    this.cache.set(key, { uri, timestamp: Date.now() });
  }

  /**
   * Get image from cache
   */
  get(key: string): string | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.uri;
  }

  /**
   * Clean up old entries
   */
  cleanup(): void {
    const now = Date.now();
    const toDelete: string[] = [];
    
    this.cache.forEach((value, key) => {
      if (now - value.timestamp > this.maxAge) {
        toDelete.push(key);
      }
    });
    
    toDelete.forEach(key => this.cache.delete(key));
    
    // If still too large, remove oldest entries
    if (this.cache.size >= this.maxCacheSize) {
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const removeCount = Math.ceil(this.cache.size / 2);
      entries.slice(0, removeCount).forEach(([key]) => {
        this.cache.delete(key);
      });
    }
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  get size(): number {
    return this.cache.size;
  }
}

export const imageCache = new ImageCacheManager();

/**
 * Memory optimization: Force garbage collection hint (when available)
 */
export function suggestGC(): void {
  // Clear image cache
  imageCache.cleanup();
  
  // In development, log memory status
  if (__DEV__) {
    console.log('[Memory] Cache size:', imageCache.size);
  }
}
