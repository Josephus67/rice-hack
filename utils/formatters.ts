/**
 * Formatting utilities
 */

/**
 * Format a number as percentage
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format a number with thousands separator
 */
export function formatNumber(value: number): string {
  return value.toLocaleString();
}

/**
 * Format a date for display
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a date with time
 */
export function formatDateTime(date: Date): string {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format a time duration in ms to human readable
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Format millimeters measurement
 */
export function formatMm(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}mm`;
}

/**
 * Format L/W ratio
 */
export function formatRatio(value: number): string {
  return value.toFixed(2);
}

/**
 * Format count with optional total for percentage
 */
export function formatCount(count: number, total?: number): string {
  if (total !== undefined && total > 0) {
    const percent = (count / total) * 100;
    return `${count} (${percent.toFixed(1)}%)`;
  }
  return count.toString();
}

/**
 * Format CIELAB color value
 */
export function formatLabValue(value: number, component: 'L' | 'a' | 'b'): string {
  if (component === 'L') {
    return value.toFixed(1);
  }
  // a* and b* can be negative
  return value >= 0 ? `+${value.toFixed(1)}` : value.toFixed(1);
}
