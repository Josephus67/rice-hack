/**
 * Scan-related type definitions
 */

export type RiceType = 'Paddy' | 'Brown' | 'White';

export type MillingGradeCode = 'P' | '1' | '2' | '3' | 'BG';

export type GrainShape = 'Bold' | 'Medium' | 'Slender';

export type LengthClass = 'Long Grain' | 'Medium Grain' | 'Short Grain' | 'Mixed';

export type ChalkinessStatus = 'Not Chalky' | 'Chalky';

export type WarningSeverity = 'low' | 'medium' | 'high';

export interface ScanMetadata {
  id: string;
  userId: string;
  imageUri: string;
  riceType: RiceType;
  capturedAt: Date;
  latitude?: number;
  longitude?: number;
  syncedAt?: Date;
}

export interface RawModelOutput {
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
}

export interface MillingGrade {
  grade: string;
  code: MillingGradeCode;
  color: string;
}

export interface GrainShapeInfo {
  shape: GrainShape;
  description: string;
}

export interface ChalkinessInfo {
  status: ChalkinessStatus;
  color: string;
}

export interface DefectWarning {
  type: 'black' | 'green' | 'red' | 'yellow' | 'chalky';
  message: string;
  severity: WarningSeverity;
  percentage: number;
}

export interface QualityClassifications {
  millingGrade: MillingGrade;
  grainShape: GrainShapeInfo;
  lengthClass: LengthClass;
  chalkinessStatus: ChalkinessInfo;
  warnings: DefectWarning[];
}

export interface ScanResult extends ScanMetadata {
  rawOutput: RawModelOutput;
  classifications: QualityClassifications;
  inferenceTimeMs: number;
}

export interface ScanSummary {
  id: string;
  riceType: RiceType;
  capturedAt: Date;
  gradeCode: MillingGradeCode;
  totalCount: number;
  brokenPercent: number;
}
