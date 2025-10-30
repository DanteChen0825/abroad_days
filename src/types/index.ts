// 人员类型
export type Person = 'self' | 'spouse';

// 出入境记录
export interface TravelRecord {
  id: string;
  person: Person;
  departureDate: string;      // YYYY-MM-DD 格式
  returnDate: string;         // YYYY-MM-DD 格式
  daysOfficial: number;       // 官方计算：出入境当天都不算
  daysConservative: number;   // 保守计算：算其中一天
  notes?: string;
  createdAt: number;          // 时间戳
  isPlanned?: boolean;        // 是否是未来计划（根据日期自动判断）
}

// 人员信息
export interface PersonInfo {
  id: Person;
  name: string;
}

// 统计结果类型
export interface AbsenceStats {
  // 基础信息
  earliestDate: string | null;
  latestDepartureDate: string | null;
  latestReturnDate: string | null;
  tripCount: number;
  
  // 官方计算（出入境当天都不算）
  official: {
    totalDays: number;
    rolling12MonthsDays: number;
    rolling12MonthsRemaining: number;
    fiveYearTotalDays: number;
    fiveYearRemaining: number;
    riskLevel: 'safe' | 'warning' | 'danger';
  };
  
  // 保守计算（算其中一天）
  conservative: {
    totalDays: number;
    rolling12MonthsDays: number;
    rolling12MonthsRemaining: number;
    fiveYearTotalDays: number;
    fiveYearRemaining: number;
    riskLevel: 'safe' | 'warning' | 'danger';
  };
  
  // 共用信息
  rolling12MonthsStartDate: string;
  rolling12MonthsEndDate: string;
}

// 移民规则常量
export const IMMIGRATION_RULES = {
  ROLLING_12_MONTHS: {
    name: '滚动12个月限制',
    maxDays: 180,
    periodMonths: 12,
    description: '任何滚动的12个月内，离境天数不得超过180天'
  },
  FIVE_YEAR_TOTAL: {
    name: '5年总时长限制',
    maxDays: 450,
    periodMonths: 60,
    description: '整个5年居住期间，总离境天数不得超过450天'
  }
} as const;

// 计算模式
export type CalculationMode = 'official' | 'conservative';
