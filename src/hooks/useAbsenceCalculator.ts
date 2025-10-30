import { useMemo } from 'react';
import { subMonths } from 'date-fns';
import type { TravelRecord, Person, AbsenceStats } from '../types';
import { IMMIGRATION_RULES } from '../types';
import { calculateRolling12Months, calculateTotalDays, formatDate } from '../utils/dateCalculations';
import { calculateRiskLevel } from '../utils/ruleValidation';

/**
 * 自定义 Hook 用于计算离境统计数据
 */
export function useAbsenceCalculator(records: TravelRecord[], person: Person): AbsenceStats {
  return useMemo(() => {
    const today = new Date();
    const rolling12Start = subMonths(today, 12);
    
    // 筛选该人员的记录
    const personRecords = records.filter(r => r.person === person);
    
    // 基础统计
    const sortedRecords = [...personRecords].sort((a, b) => 
      new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime()
    );
    
    const earliestDate = sortedRecords.length > 0 ? sortedRecords[0].departureDate : null;
    const latestRecord = sortedRecords.length > 0 ? sortedRecords[sortedRecords.length - 1] : null;
    
    // 官方计算
    const officialTotalDays = calculateTotalDays(personRecords, person, 'official');
    const officialRolling12 = calculateRolling12Months(personRecords, person, today, 'official');
    const officialRolling12Remaining = Math.max(0, IMMIGRATION_RULES.ROLLING_12_MONTHS.maxDays - officialRolling12);
    const officialFiveYearRemaining = Math.max(0, IMMIGRATION_RULES.FIVE_YEAR_TOTAL.maxDays - officialTotalDays);
    
    // 保守计算
    const conservativeTotalDays = calculateTotalDays(personRecords, person, 'conservative');
    const conservativeRolling12 = calculateRolling12Months(personRecords, person, today, 'conservative');
    const conservativeRolling12Remaining = Math.max(0, IMMIGRATION_RULES.ROLLING_12_MONTHS.maxDays - conservativeRolling12);
    const conservativeFiveYearRemaining = Math.max(0, IMMIGRATION_RULES.FIVE_YEAR_TOTAL.maxDays - conservativeTotalDays);
    
    return {
      earliestDate,
      latestDepartureDate: latestRecord?.departureDate || null,
      latestReturnDate: latestRecord?.returnDate || null,
      tripCount: personRecords.length,
      
      official: {
        totalDays: officialTotalDays,
        rolling12MonthsDays: officialRolling12,
        rolling12MonthsRemaining: officialRolling12Remaining,
        fiveYearTotalDays: officialTotalDays,
        fiveYearRemaining: officialFiveYearRemaining,
        riskLevel: calculateRiskLevel(
          Math.max(officialRolling12, officialTotalDays),
          Math.max(IMMIGRATION_RULES.ROLLING_12_MONTHS.maxDays, IMMIGRATION_RULES.FIVE_YEAR_TOTAL.maxDays)
        )
      },
      
      conservative: {
        totalDays: conservativeTotalDays,
        rolling12MonthsDays: conservativeRolling12,
        rolling12MonthsRemaining: conservativeRolling12Remaining,
        fiveYearTotalDays: conservativeTotalDays,
        fiveYearRemaining: conservativeFiveYearRemaining,
        riskLevel: calculateRiskLevel(
          Math.max(conservativeRolling12, conservativeTotalDays),
          Math.max(IMMIGRATION_RULES.ROLLING_12_MONTHS.maxDays, IMMIGRATION_RULES.FIVE_YEAR_TOTAL.maxDays)
        )
      },
      
      rolling12MonthsStartDate: formatDate(rolling12Start),
      rolling12MonthsEndDate: formatDate(today)
    };
  }, [records, person]);
}
