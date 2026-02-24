/**
 * Database Manager
 * Handles SQLite database initialization and connections
 */

import * as SQLite from 'expo-sqlite';
import { DATABASE_NAME } from '@/constants/app';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Get or create database connection
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    await initializeSchema(db);
  }
  return db;
}

/**
 * Initialize database schema
 */
async function initializeSchema(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY NOT NULL,
      username TEXT NOT NULL,
      role TEXT NOT NULL,
      organization TEXT,
      location_opt_in INTEGER NOT NULL DEFAULT 0,
      disclaimer_accepted_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Scans table
    CREATE TABLE IF NOT EXISTS scans (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      rice_type TEXT NOT NULL,
      image_uri TEXT NOT NULL,
      captured_at TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      
      -- Raw model outputs
      count INTEGER NOT NULL,
      broken_count REAL NOT NULL,
      long_count REAL NOT NULL,
      medium_count REAL NOT NULL,
      black_count REAL NOT NULL,
      chalky_count REAL NOT NULL,
      red_count REAL NOT NULL,
      yellow_count REAL NOT NULL,
      green_count REAL NOT NULL,
      wk_length_avg REAL NOT NULL,
      wk_width_avg REAL NOT NULL,
      wk_lw_ratio_avg REAL NOT NULL,
      average_l REAL NOT NULL,
      average_a REAL NOT NULL,
      average_b REAL NOT NULL,
      
      -- Classifications
      milling_grade TEXT NOT NULL,
      grain_shape TEXT NOT NULL,
      length_class TEXT NOT NULL,
      chalkiness_status TEXT NOT NULL,
      warnings_json TEXT NOT NULL,
      
      -- Metadata
      inference_time_ms INTEGER NOT NULL,
      synced_at TEXT,
      
      FOREIGN KEY (user_id) REFERENCES users (id)
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_scans_user_id ON scans (user_id);
    CREATE INDEX IF NOT EXISTS idx_scans_captured_at ON scans (captured_at DESC);

    -- Settings table (key-value store)
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}
