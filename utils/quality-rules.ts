/**
 * Quality classification rules
 * Based on rice industry standards
 */

import type {
  RawModelOutput,
  QualityClassifications,
  MillingGrade,
  GrainShapeInfo,
  LengthClass,
  ChalkinessInfo,
  DefectWarning,
} from '@/types';
import { QUALITY_THRESHOLDS } from '@/constants/app';
import { GradeColors, SemanticColors } from '@/constants/design-system';

/**
 * Apply all quality classifications to raw model output
 */
export function applyClassifications(results: RawModelOutput): QualityClassifications {
  const brokenPercent = (results.broken_count / results.count) * 100;
  
  return {
    millingGrade: getMillingGrade(brokenPercent),
    grainShape: getGrainShape(results.wk_lw_ratio_avg),
    lengthClass: getLengthClass(
      results.count,
      results.long_count,
      results.medium_count
    ),
    chalkinessStatus: getChalkinessStatus(
      (results.chalky_count / results.count) * 100
    ),
    warnings: getDefectWarnings(results),
  };
}

/**
 * Determine milling grade based on broken grain percentage
 */
export function getMillingGrade(brokenPercent: number): MillingGrade {
  if (brokenPercent < QUALITY_THRESHOLDS.milling.premium) {
    return { grade: 'Premium', code: 'P', color: GradeColors.premium };
  }
  if (brokenPercent < QUALITY_THRESHOLDS.milling.grade1) {
    return { grade: 'Grade 1', code: '1', color: GradeColors.grade1 };
  }
  if (brokenPercent < QUALITY_THRESHOLDS.milling.grade2) {
    return { grade: 'Grade 2', code: '2', color: GradeColors.grade2 };
  }
  if (brokenPercent < QUALITY_THRESHOLDS.milling.grade3) {
    return { grade: 'Grade 3', code: '3', color: GradeColors.grade3 };
  }
  return { grade: 'Below Grade', code: 'BG', color: GradeColors.belowGrade };
}

/**
 * Determine grain shape based on length/width ratio
 */
export function getGrainShape(lwRatio: number): GrainShapeInfo {
  if (lwRatio < QUALITY_THRESHOLDS.shape.bold) {
    return { shape: 'Bold', description: 'Short, round grains' };
  }
  if (lwRatio <= QUALITY_THRESHOLDS.shape.medium) {
    return { shape: 'Medium', description: 'Standard shape' };
  }
  return { shape: 'Slender', description: 'Long, thin grains' };
}

/**
 * Determine grain length class based on count distribution
 */
export function getLengthClass(
  totalCount: number,
  longCount: number,
  mediumCount: number
): LengthClass {
  if (totalCount === 0) return 'Mixed';
  
  const longPercent = (longCount / totalCount) * 100;
  const mediumPercent = (mediumCount / totalCount) * 100;
  const shortPercent = 100 - longPercent - mediumPercent;
  
  if (longPercent > 90) return 'Long Grain';
  if (mediumPercent > 90) return 'Medium Grain';
  if (shortPercent > 90) return 'Short Grain';
  return 'Mixed';
}

/**
 * Determine chalkiness status
 */
export function getChalkinessStatus(chalkyPercent: number): ChalkinessInfo {
  if (chalkyPercent < QUALITY_THRESHOLDS.chalkiness.notChalky) {
    return { status: 'Not Chalky', color: SemanticColors.success };
  }
  return { status: 'Chalky', color: SemanticColors.warning };
}

/**
 * Generate defect warnings based on color counts
 */
export function getDefectWarnings(results: RawModelOutput): DefectWarning[] {
  const warnings: DefectWarning[] = [];
  const total = results.count;
  
  if (total === 0) return warnings;
  
  const defects = [
    {
      type: 'black' as const,
      count: results.black_count,
      message: 'High black/damaged grain content detected',
    },
    {
      type: 'green' as const,
      count: results.green_count,
      message: 'Immature (green) grains detected',
    },
    {
      type: 'red' as const,
      count: results.red_count,
      message: 'Red-striped grains present',
    },
    {
      type: 'yellow' as const,
      count: results.yellow_count,
      message: 'Yellow/fermented grains detected',
    },
    {
      type: 'chalky' as const,
      count: results.chalky_count,
      message: 'High chalky grain content',
    },
  ];
  
  for (const defect of defects) {
    const percentage = (defect.count / total) * 100;
    
    if (percentage >= QUALITY_THRESHOLDS.defects.critical) {
      warnings.push({
        type: defect.type,
        message: defect.message,
        severity: 'high',
        percentage,
      });
    } else if (percentage >= QUALITY_THRESHOLDS.defects.caution) {
      warnings.push({
        type: defect.type,
        message: defect.message,
        severity: 'medium',
        percentage,
      });
    } else if (percentage >= QUALITY_THRESHOLDS.defects.warning) {
      warnings.push({
        type: defect.type,
        message: defect.message,
        severity: 'low',
        percentage,
      });
    }
  }
  
  return warnings;
}
