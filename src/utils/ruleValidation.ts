import type { TravelRecord, AbsenceStats } from '../types';
import { IMMIGRATION_RULES } from '../types';

/**
 * 计算风险等级
 * 绿色：安全范围（< 70%）
 * 黄色：需要注意（70-90%）
 * 红色：接近上限（> 90%）
 */
export const calculateRiskLevel = (
  usedDays: number,
  maxDays: number
): 'safe' | 'warning' | 'danger' => {
  const percentage = (usedDays / maxDays) * 100;
  
  if (percentage < 70) return 'safe';
  if (percentage < 90) return 'warning';
  return 'danger';
};

/**
 * 验证出入境记录是否有效
 */
export const validateTravelRecord = (record: Partial<TravelRecord>): string[] => {
  const errors: string[] = [];
  
  if (!record.person) {
    errors.push('请选择人员');
  }
  
  if (!record.departureDate) {
    errors.push('请选择出境日期');
  }
  
  if (!record.returnDate) {
    errors.push('请选择入境日期');
  }
  
  if (record.departureDate && record.returnDate) {
    const departure = new Date(record.departureDate);
    const returnDate = new Date(record.returnDate);
    
    if (returnDate < departure) {
      errors.push('入境日期不能早于出境日期');
    }
  }
  
  return errors;
};

/**
 * 检查是否超出滚动12个月限制
 */
export const isExceeding12MonthLimit = (stats: AbsenceStats, mode: 'official' | 'conservative'): boolean => {
  const data = mode === 'official' ? stats.official : stats.conservative;
  return data.rolling12MonthsDays > IMMIGRATION_RULES.ROLLING_12_MONTHS.maxDays;
};

/**
 * 检查是否超出5年总时长限制
 */
export const isExceeding5YearLimit = (stats: AbsenceStats, mode: 'official' | 'conservative'): boolean => {
  const data = mode === 'official' ? stats.official : stats.conservative;
  return data.fiveYearTotalDays > IMMIGRATION_RULES.FIVE_YEAR_TOTAL.maxDays;
};

/**
 * 获取风险提示信息
 */
export const getRiskMessage = (
  riskLevel: 'safe' | 'warning' | 'danger'
): string => {
  switch (riskLevel) {
    case 'safe':
      return '安全范围';
    case 'warning':
      return '需要注意';
    case 'danger':
      return '接近上限';
  }
};

/**
 * 计算进度百分比
 */
export const calculatePercentage = (used: number, total: number): number => {
  if (total === 0) return 0;
  return Math.min(100, Math.round((used / total) * 100));
};
