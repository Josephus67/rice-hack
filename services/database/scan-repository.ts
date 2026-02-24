/**
 * Scan Repository
 * CRUD operations for scan data
 */

import { getDatabase } from './database-manager';
import { SCAN_HISTORY_LIMIT } from '@/constants/app';
import type { ScanResult, ScanSummary, RawModelOutput, QualityClassifications } from '@/types';

interface ScanRow {
  id: string;
  user_id: string;
  rice_type: string;
  image_uri: string;
  captured_at: string;
  latitude: number | null;
  longitude: number | null;
  count: number;
  broken_count: number;
  long_count: number;
  medium_count: number;
  black_count: number;
  chalky_count: number;
  red_count: number;
  yellow_count: number;
  green_count: number;
  wk_length_avg: number;
  wk_width_avg: number;
  wk_lw_ratio_avg: number;
  average_l: number;
  average_a: number;
  average_b: number;
  milling_grade: string;
  grain_shape: string;
  length_class: string;
  chalkiness_status: string;
  warnings_json: string;
  inference_time_ms: number;
  synced_at: string | null;
}

/**
 * Create a new scan
 * Automatically maintains scan history limit of 100 scans
 */
export async function createScan(scan: ScanResult): Promise<void> {
  const db = await getDatabase();

  // Start a transaction for atomic operations
  await db.execAsync('BEGIN TRANSACTION');

  try {
    // Check current scan count
    const countResult = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM scans'
    );
    const currentCount = countResult?.count ?? 0;

    // If we're at or over the limit, delete oldest scans
    if (currentCount >= SCAN_HISTORY_LIMIT) {
      const toDelete = currentCount - SCAN_HISTORY_LIMIT + 1; // +1 to make room for new scan
      
      // Delete oldest scans (by captured_at)
      // Only delete synced scans to avoid data loss
      await db.runAsync(
        `DELETE FROM scans 
         WHERE id IN (
           SELECT id FROM scans 
           WHERE synced_at IS NOT NULL 
           ORDER BY captured_at ASC 
           LIMIT ?
         )`,
        [toDelete]
      );

      console.log(`Deleted ${toDelete} old scans to maintain history limit`);
    }

    // Insert the new scan
    await db.runAsync(
      `INSERT INTO scans (
        id, user_id, rice_type, image_uri, captured_at, latitude, longitude,
        count, broken_count, long_count, medium_count, black_count,
        chalky_count, red_count, yellow_count, green_count,
        wk_length_avg, wk_width_avg, wk_lw_ratio_avg,
        average_l, average_a, average_b,
        milling_grade, grain_shape, length_class, chalkiness_status, warnings_json,
        inference_time_ms, synced_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        scan.id,
        scan.userId,
        scan.riceType,
        scan.imageUri,
        scan.capturedAt.toISOString(),
        scan.latitude ?? null,
        scan.longitude ?? null,
        scan.rawOutput.count,
        scan.rawOutput.broken_count,
        scan.rawOutput.long_count,
        scan.rawOutput.medium_count,
        scan.rawOutput.black_count,
        scan.rawOutput.chalky_count,
        scan.rawOutput.red_count,
        scan.rawOutput.yellow_count,
        scan.rawOutput.green_count,
        scan.rawOutput.wk_length_avg,
        scan.rawOutput.wk_width_avg,
        scan.rawOutput.wk_lw_ratio_avg,
        scan.rawOutput.average_l,
        scan.rawOutput.average_a,
        scan.rawOutput.average_b,
        JSON.stringify(scan.classifications.millingGrade),
        JSON.stringify(scan.classifications.grainShape),
        scan.classifications.lengthClass,
        JSON.stringify(scan.classifications.chalkinessStatus),
        JSON.stringify(scan.classifications.warnings),
        scan.inferenceTimeMs,
        scan.syncedAt?.toISOString() ?? null,
      ]
    );

    // Commit transaction
    await db.execAsync('COMMIT');
  } catch (error) {
    // Rollback on error
    await db.execAsync('ROLLBACK');
    console.error('Failed to create scan:', error);
    throw error;
  }
}

/**
 * Get scan by ID
 */
export async function getScanById(id: string): Promise<ScanResult | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<ScanRow>(
    'SELECT * FROM scans WHERE id = ?',
    [id]
  );

  if (!row) return null;
  return rowToScanResult(row);
}

/**
 * Get recent scans (summaries) with pagination
 */
export async function getRecentScans(
  limit = 20,
  offset = 0
): Promise<ScanSummary[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ScanRow>(
    'SELECT * FROM scans ORDER BY captured_at DESC LIMIT ? OFFSET ?',
    [limit, offset]
  );

  return rows.map(rowToScanSummary);
}

/**
 * Get paginated scans with total count
 */
export async function getPaginatedScans(
  page = 1,
  pageSize = 20
): Promise<{ scans: ScanSummary[]; total: number; hasMore: boolean }> {
  const db = await getDatabase();
  const offset = (page - 1) * pageSize;
  
  const [rows, countResult] = await Promise.all([
    db.getAllAsync<ScanRow>(
      'SELECT * FROM scans ORDER BY captured_at DESC LIMIT ? OFFSET ?',
      [pageSize, offset]
    ),
    db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM scans'),
  ]);
  
  const total = countResult?.count ?? 0;
  const scans = rows.map(rowToScanSummary);
  
  return {
    scans,
    total,
    hasMore: offset + scans.length < total,
  };
}

/**
 * Get scans by user ID
 */
export async function getScansByUserId(
  userId: string,
  limit = 50
): Promise<ScanResult[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ScanRow>(
    'SELECT * FROM scans WHERE user_id = ? ORDER BY captured_at DESC LIMIT ?',
    [userId, limit]
  );

  return rows.map(rowToScanResult);
}

/**
 * Get unsynced scans
 */
export async function getUnsyncedScans(): Promise<ScanResult[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ScanRow>(
    'SELECT * FROM scans WHERE synced_at IS NULL ORDER BY captured_at ASC'
  );

  return rows.map(rowToScanResult);
}

/**
 * Mark scan as synced
 */
export async function markScanSynced(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE scans SET synced_at = ? WHERE id = ?',
    [new Date().toISOString(), id]
  );
}

/**
 * Delete scan
 */
export async function deleteScan(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM scans WHERE id = ?', [id]);
}

/**
 * Get scan count
 */
export async function getScanCount(): Promise<number> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM scans'
  );
  return result?.count ?? 0;
}

// Helper functions

function rowToScanResult(row: ScanRow): ScanResult {
  const rawOutput: RawModelOutput = {
    count: row.count,
    broken_count: row.broken_count,
    long_count: row.long_count,
    medium_count: row.medium_count,
    black_count: row.black_count,
    chalky_count: row.chalky_count,
    red_count: row.red_count,
    yellow_count: row.yellow_count,
    green_count: row.green_count,
    wk_length_avg: row.wk_length_avg,
    wk_width_avg: row.wk_width_avg,
    wk_lw_ratio_avg: row.wk_lw_ratio_avg,
    average_l: row.average_l,
    average_a: row.average_a,
    average_b: row.average_b,
  };

  const classifications: QualityClassifications = {
    millingGrade: JSON.parse(row.milling_grade),
    grainShape: JSON.parse(row.grain_shape),
    lengthClass: row.length_class as QualityClassifications['lengthClass'],
    chalkinessStatus: JSON.parse(row.chalkiness_status),
    warnings: JSON.parse(row.warnings_json),
  };

  return {
    id: row.id,
    userId: row.user_id,
    riceType: row.rice_type as ScanResult['riceType'],
    imageUri: row.image_uri,
    capturedAt: new Date(row.captured_at),
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
    rawOutput,
    classifications,
    inferenceTimeMs: row.inference_time_ms,
    syncedAt: row.synced_at ? new Date(row.synced_at) : undefined,
  };
}

function rowToScanSummary(row: ScanRow): ScanSummary {
  const millingGrade = JSON.parse(row.milling_grade);
  return {
    id: row.id,
    riceType: row.rice_type as ScanSummary['riceType'],
    capturedAt: new Date(row.captured_at),
    gradeCode: millingGrade.code,
    totalCount: row.count,
    brokenPercent: row.count > 0 ? (row.broken_count / row.count) * 100 : 0,
  };
}
