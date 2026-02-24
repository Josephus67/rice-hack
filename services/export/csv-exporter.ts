/**
 * CSV Export Service
 * Generates CSV files from scan data for export
 */

import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { format } from 'date-fns';
import type { ScanResult, ScanSummary } from '@/types';

// CSV field headers matching backend format
const CSV_HEADERS = [
  'scan_id',
  'captured_at',
  'rice_type',
  'total_count',
  'broken_count',
  'broken_percent',
  'long_count',
  'medium_count',
  'black_count',
  'chalky_count',
  'red_count',
  'yellow_count',
  'green_count',
  'wk_length_avg',
  'wk_width_avg',
  'wk_lw_ratio',
  'cielab_l',
  'cielab_a',
  'cielab_b',
  'milling_grade',
  'grain_shape',
  'length_class',
  'inference_time_ms',
];

/**
 * Convert a scan to a CSV row
 */
function scanToCSVRow(scan: ScanResult): string[] {
  const raw = scan.rawOutput;
  const brokenPercent = raw.count > 0 
    ? ((raw.broken_count / raw.count) * 100).toFixed(2) 
    : '0.00';

  return [
    scan.id,
    format(new Date(scan.capturedAt), 'yyyy-MM-dd HH:mm:ss'),
    scan.riceType,
    raw.count.toString(),
    raw.broken_count.toFixed(2),
    brokenPercent,
    raw.long_count.toFixed(2),
    raw.medium_count.toFixed(2),
    raw.black_count.toFixed(2),
    raw.chalky_count.toFixed(2),
    raw.red_count.toFixed(2),
    raw.yellow_count.toFixed(2),
    raw.green_count.toFixed(2),
    raw.wk_length_avg.toFixed(2),
    raw.wk_width_avg.toFixed(2),
    raw.wk_lw_ratio_avg.toFixed(2),
    raw.average_l.toFixed(2),
    raw.average_a.toFixed(2),
    raw.average_b.toFixed(2),
    scan.classifications.millingGrade.grade,
    scan.classifications.grainShape.shape,
    scan.classifications.lengthClass,
    scan.inferenceTimeMs.toString(),
  ];
}

/**
 * Escape a value for CSV (handles quotes and commas)
 */
function escapeCSVValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Generate CSV content from an array of scans
 */
export function generateCSVContent(scans: ScanResult[]): string {
  const lines: string[] = [];
  
  // Header row
  lines.push(CSV_HEADERS.join(','));
  
  // Data rows
  for (const scan of scans) {
    const values = scanToCSVRow(scan);
    const escapedValues = values.map(escapeCSVValue);
    lines.push(escapedValues.join(','));
  }
  
  return lines.join('\n');
}

/**
 * Generate a timestamped filename for export
 */
export function generateExportFilename(prefix: string = 'rice_quality_export'): string {
  const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
  return `${prefix}_${timestamp}.csv`;
}

/**
 * Save CSV content to a file in the cache directory
 */
export async function saveCSVToFile(content: string, filename: string): Promise<string> {
  const cacheDir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory ?? '';
  const fileUri = `${cacheDir}${filename}`;
  
  await FileSystem.writeAsStringAsync(fileUri, content, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  
  return fileUri;
}

/**
 * Export scans to CSV and share
 */
export async function exportScansToCSV(scans: ScanResult[]): Promise<void> {
  if (scans.length === 0) {
    throw new Error('No scans to export');
  }

  // Generate CSV content
  const csvContent = generateCSVContent(scans);
  const filename = generateExportFilename();
  
  // Save to file
  const fileUri = await saveCSVToFile(csvContent, filename);
  
  // Check if sharing is available
  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    throw new Error('Sharing is not available on this device');
  }
  
  // Share the file
  await Sharing.shareAsync(fileUri, {
    mimeType: 'text/csv',
    dialogTitle: 'Export Rice Quality Data',
    UTI: 'public.comma-separated-values-text',
  });
}

/**
 * Export a single scan to CSV
 */
export async function exportSingleScan(scan: ScanResult): Promise<void> {
  return exportScansToCSV([scan]);
}

/**
 * Get export statistics
 */
export interface ExportStats {
  totalScans: number;
  dateRange: {
    start: Date;
    end: Date;
  } | null;
  gradeDistribution: Record<string, number>;
}

export function calculateExportStats(scans: ScanResult[]): ExportStats {
  const gradeDistribution: Record<string, number> = {};
  let minDate: Date | null = null;
  let maxDate: Date | null = null;

  for (const scan of scans) {
    // Count grades
    const code = scan.classifications.millingGrade.code;
    gradeDistribution[code] = (gradeDistribution[code] || 0) + 1;
    
    // Track date range
    const date = new Date(scan.capturedAt);
    if (!minDate || date < minDate) minDate = date;
    if (!maxDate || date > maxDate) maxDate = date;
  }

  return {
    totalScans: scans.length,
    dateRange: minDate && maxDate ? { start: minDate, end: maxDate } : null,
    gradeDistribution,
  };
}
