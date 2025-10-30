import { parseISO, differenceInDays, isBefore, isEqual, subMonths, format } from 'date-fns';
import type { TravelRecord, Person, CalculationMode } from '../types';

/**
 * 官方计算：出境当天和入境当天都不算离境天数
 * 例如：12月1日出境，12月5日入境 = 3天（仅12月2、3、4日）
 */
export const calculateDaysOfficial = (
  departureDate: string, 
  returnDate: string
): number => {
  const start = parseISO(departureDate);
  const end = parseISO(returnDate);
  const days = differenceInDays(end, start) - 1;
  return Math.max(0, days); // 至少为0，同一天出入境算0天
};

/**
 * 保守计算：出境和入境当天算其中一天为离境天数
 * 例如：12月1日出境，12月5日入境 = 4天
 */
export const calculateDaysConservative = (
  departureDate: string, 
  returnDate: string
): number => {
  const start = parseISO(departureDate);
  const end = parseISO(returnDate);
  return Math.max(0, differenceInDays(end, start));
};

/**
 * 根据计算模式计算天数
 */
export const calculateDays = (
  departureDate: string, 
  returnDate: string,
  mode: CalculationMode = 'official'
): number => {
  if (mode === 'official') {
    return calculateDaysOfficial(departureDate, returnDate);
  } else {
    return calculateDaysConservative(departureDate, returnDate);
  }
};

/**
 * 验证日期范围是否有效
 */
export const isValidDateRange = (
  departureDate: string, 
  returnDate: string
): boolean => {
  const start = parseISO(departureDate);
  const end = parseISO(returnDate);
  return isBefore(start, end) || isEqual(start, end);
};

/**
 * 检查记录是否与时间段重叠
 */
export const isRecordOverlapping = (
  record: TravelRecord,
  startDate: Date,
  endDate: Date
): boolean => {
  const departure = parseISO(record.departureDate);
  const returnDate = parseISO(record.returnDate);
  
  return (
    (departure >= startDate && departure <= endDate) ||
    (returnDate >= startDate && returnDate <= endDate) ||
    (departure <= startDate && returnDate >= endDate)
  );
};

/**
 * 计算在特定时间段内的离境天数
 */
export const calculateDaysInPeriod = (
  record: TravelRecord,
  periodStart: Date,
  periodEnd: Date,
  mode: CalculationMode
): number => {
  const departure = parseISO(record.departureDate);
  const returnDate = parseISO(record.returnDate);
  
  // 确定有效的开始和结束日期
  const effectiveStart = isBefore(departure, periodStart) ? periodStart : departure;
  const effectiveEnd = isBefore(periodEnd, returnDate) ? periodEnd : returnDate;
  
  if (mode === 'official') {
    // 官方计算：出入境当天都不算
    const days = differenceInDays(effectiveEnd, effectiveStart) - 1;
    return Math.max(0, days);
  } else {
    // 保守计算
    return Math.max(0, differenceInDays(effectiveEnd, effectiveStart));
  }
};

/**
 * 计算滚动12个月的离境天数
 */
export const calculateRolling12Months = (
  records: TravelRecord[],
  person: Person,
  today: Date,
  mode: CalculationMode
): number => {
  const startDate = subMonths(today, 12);
  
  const relevantRecords = records.filter(
    r => r.person === person && isRecordOverlapping(r, startDate, today)
  );
  
  return relevantRecords.reduce((total, record) => {
    return total + calculateDaysInPeriod(record, startDate, today, mode);
  }, 0);
};

/**
 * 计算总离境天数
 */
export const calculateTotalDays = (
  records: TravelRecord[],
  person: Person,
  mode: CalculationMode
): number => {
  return records
    .filter(r => r.person === person)
    .reduce((total, record) => {
      return total + (mode === 'official' ? record.daysOfficial : record.daysConservative);
    }, 0);
};

/**
 * 格式化日期为 YYYY-MM-DD
 */
export const formatDate = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

/**
 * 获取今天的日期字符串
 */
export const getTodayString = (): string => {
  return formatDate(new Date());
};
