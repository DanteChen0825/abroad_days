import type { AbsenceStats } from '../types';
import { calculatePercentage, getRiskMessage } from '../utils/ruleValidation';
import { IMMIGRATION_RULES } from '../types';

interface StatisticsPanelProps {
  stats: AbsenceStats;
  personName: string;
}

export function StatisticsPanel({ stats, personName }: StatisticsPanelProps) {
  return (
    <div className="statistics-panel">
      <h2>{personName}的统计数据</h2>
      
      <div className="stats-grid">
        {/* 基础信息 */}
        <div className="stat-card">
          <h3>基础信息</h3>
          <div className="stat-item">
            <span className="label">出入境次数：</span>
            <span className="value">{stats.tripCount} 次</span>
          </div>
          {stats.earliestDate && (
            <div className="stat-item">
              <span className="label">最早记录：</span>
              <span className="value">{stats.earliestDate}</span>
            </div>
          )}
          {stats.latestDepartureDate && (
            <div className="stat-item">
              <span className="label">最近出境：</span>
              <span className="value">{stats.latestDepartureDate}</span>
            </div>
          )}
        </div>

        {/* 官方计算 */}
        <div className="stat-card">
          <h3>官方计算（出入境当天都不算）</h3>
          
          <div className="rule-section">
            <h4>📅 滚动12个月限制（180天）</h4>
            <div className="stat-item">
              <span className="label">已用天数：</span>
              <span className="value">{stats.official.rolling12MonthsDays} 天</span>
            </div>
            <div className="stat-item">
              <span className="label">剩余天数：</span>
              <span className={`value risk-${stats.official.riskLevel}`}>
                {stats.official.rolling12MonthsRemaining} 天
              </span>
            </div>
            <div className="progress-bar">
              <div 
                className={`progress-fill risk-${stats.official.riskLevel}`}
                style={{ 
                  width: `${calculatePercentage(
                    stats.official.rolling12MonthsDays, 
                    IMMIGRATION_RULES.ROLLING_12_MONTHS.maxDays
                  )}%` 
                }}
              />
            </div>
            <p className={`risk-message risk-${stats.official.riskLevel}`}>
              {getRiskMessage(stats.official.riskLevel)}
            </p>
          </div>

          <div className="rule-section">
            <h4>📆 5年总时长限制（450天）</h4>
            <div className="stat-item">
              <span className="label">已用天数：</span>
              <span className="value">{stats.official.fiveYearTotalDays} 天</span>
            </div>
            <div className="stat-item">
              <span className="label">剩余天数：</span>
              <span className={`value risk-${stats.official.riskLevel}`}>
                {stats.official.fiveYearRemaining} 天
              </span>
            </div>
            <div className="progress-bar">
              <div 
                className={`progress-fill risk-${stats.official.riskLevel}`}
                style={{ 
                  width: `${calculatePercentage(
                    stats.official.fiveYearTotalDays, 
                    IMMIGRATION_RULES.FIVE_YEAR_TOTAL.maxDays
                  )}%` 
                }}
              />
            </div>
          </div>
        </div>

        {/* 保守计算 */}
        <div className="stat-card">
          <h3>保守计算（算其中一天）</h3>
          
          <div className="rule-section">
            <h4>📅 滚动12个月限制（180天）</h4>
            <div className="stat-item">
              <span className="label">已用天数：</span>
              <span className="value">{stats.conservative.rolling12MonthsDays} 天</span>
            </div>
            <div className="stat-item">
              <span className="label">剩余天数：</span>
              <span className={`value risk-${stats.conservative.riskLevel}`}>
                {stats.conservative.rolling12MonthsRemaining} 天
              </span>
            </div>
            <div className="progress-bar">
              <div 
                className={`progress-fill risk-${stats.conservative.riskLevel}`}
                style={{ 
                  width: `${calculatePercentage(
                    stats.conservative.rolling12MonthsDays, 
                    IMMIGRATION_RULES.ROLLING_12_MONTHS.maxDays
                  )}%` 
                }}
              />
            </div>
            <p className={`risk-message risk-${stats.conservative.riskLevel}`}>
              {getRiskMessage(stats.conservative.riskLevel)}
            </p>
          </div>

          <div className="rule-section">
            <h4>📆 5年总时长限制（450天）</h4>
            <div className="stat-item">
              <span className="label">已用天数：</span>
              <span className="value">{stats.conservative.fiveYearTotalDays} 天</span>
            </div>
            <div className="stat-item">
              <span className="label">剩余天数：</span>
              <span className={`value risk-${stats.conservative.riskLevel}`}>
                {stats.conservative.fiveYearRemaining} 天
              </span>
            </div>
            <div className="progress-bar">
              <div 
                className={`progress-fill risk-${stats.conservative.riskLevel}`}
                style={{ 
                  width: `${calculatePercentage(
                    stats.conservative.fiveYearTotalDays, 
                    IMMIGRATION_RULES.FIVE_YEAR_TOTAL.maxDays
                  )}%` 
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="date-range-info">
        <p>滚动12个月计算期间：{stats.rolling12MonthsStartDate} 至 {stats.rolling12MonthsEndDate}</p>
      </div>
    </div>
  );
}
