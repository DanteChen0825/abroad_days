import React from 'react';
import type { TravelRecord, Person } from '../types';
import { IMMIGRATION_RULES } from '../types';
import { calculateRolling12Months, calculateDaysInPeriod, isRecordOverlapping } from '../utils/dateCalculations';
import { calculatePercentage } from '../utils/ruleValidation';
import { subMonths, addMonths, addDays } from 'date-fns';

interface FuturePlanningProps {
  records: TravelRecord[];
  person: Person;
  personName: string;
}

export function FuturePlanning({ records, person, personName }: FuturePlanningProps) {
  const today = new Date();
  const oneYearLater = addMonths(today, 12);
  const [hoveredPoint, setHoveredPoint] = React.useState<{ date: Date; remaining: number; used: number; x: number; y: number } | null>(null);
  
  // 分离已完成和计划中的记录
  const completedRecords = records.filter(r => r.person === person && new Date(r.returnDate) <= today);
  const plannedRecords = records.filter(r => r.person === person && new Date(r.departureDate) > today);
  
  // 计算当前滚动12个月的离境天数（保守计算）
  const currentRolling12 = calculateRolling12Months(completedRecords, person, today, 'conservative');
  
  // 计算未来计划的总天数（保守计算）
  const plannedDays = plannedRecords.reduce((sum, record) => sum + record.daysConservative, 0);
  
  // 生成未来12个月的预测数据（逐月月末）
  const monthlyPredictions = [];
  for (let i = 0; i < 12; i++) {
    // 获取本月及未来月份的月末最后一天
    const futureMonthStart = addMonths(today, i);
    const futureMonthEnd = new Date(futureMonthStart.getFullYear(), futureMonthStart.getMonth() + 1, 0);
    
    // 从月末往回推12个月
    const rolling12Start = subMonths(futureMonthEnd, 12);
    
    // 计算该时间点的滚动12个月天数（所有记录，包括历史和计划）
    const allRecords = [...completedRecords, ...plannedRecords];
    const totalDays = allRecords
      .filter(r => isRecordOverlapping(r, rolling12Start, futureMonthEnd))
      .reduce((sum, r) => {
        // 计算该记录在这个滚动12个月窗口内贡献的天数
        return sum + calculateDaysInPeriod(r, rolling12Start, futureMonthEnd, 'conservative');
      }, 0);
    
    const remaining = IMMIGRATION_RULES.ROLLING_12_MONTHS.maxDays - totalDays;
    
    monthlyPredictions.push({
      month: futureMonthEnd.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short' }),
      used: totalDays,
      remaining: Math.max(0, remaining),
      percentage: calculatePercentage(totalDays, IMMIGRATION_RULES.ROLLING_12_MONTHS.maxDays)
    });
  }
  
  // 生成每日趋势数据（未来365天，每7天取样一次）
  const dailyPredictions = [];
  const allRecords = [...completedRecords, ...plannedRecords];
  
  for (let i = 0; i <= 365; i += 7) {
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + i);
    
    const rolling12Start = subMonths(futureDate, 12);
    
    const totalDays = allRecords
      .filter(r => isRecordOverlapping(r, rolling12Start, futureDate))
      .reduce((sum, r) => {
        return sum + calculateDaysInPeriod(r, rolling12Start, futureDate, 'conservative');
      }, 0);
    
    const remaining = IMMIGRATION_RULES.ROLLING_12_MONTHS.maxDays - totalDays;
    
    dailyPredictions.push({
      date: futureDate,
      remaining: Math.max(0, remaining),
      used: totalDays
    });
  }
  
  // 当前剩余天数
  const currentRemaining = IMMIGRATION_RULES.ROLLING_12_MONTHS.maxDays - currentRolling12;
  
  // 考虑计划后的剩余天数
  const afterPlannedRemaining = currentRemaining - plannedDays;
  
  // 计算5年期限的离境天数（2025-10-15 到 2030-10-15）
  const fiveYearStart = new Date(2025, 9, 15); // 月份从0开始，9代表10月
  const fiveYearEnd = new Date(2030, 9, 15);
  const fiveYearDays = allRecords
    .filter(r => isRecordOverlapping(r, fiveYearStart, fiveYearEnd))
    .reduce((sum, r) => {
      return sum + calculateDaysInPeriod(r, fiveYearStart, fiveYearEnd, 'conservative');
    }, 0);
  const fiveYearRemaining = IMMIGRATION_RULES.FIVE_YEAR_TOTAL.maxDays - fiveYearDays;
  const fiveYearPercentage = calculatePercentage(fiveYearDays, IMMIGRATION_RULES.FIVE_YEAR_TOTAL.maxDays);
  
  // 计算5年周期已经度过的时间比例
  const fiveYearTotalDays = Math.floor((fiveYearEnd.getTime() - fiveYearStart.getTime()) / (1000 * 60 * 60 * 24));
  
  // 如果有计划的记录，找到最后一次计划返回日期
  const lastPlannedReturn = plannedRecords.length > 0 
    ? new Date(Math.max(...plannedRecords.map(r => new Date(r.returnDate).getTime())))
    : today;
  
  // 使用最后计划返回日期或今天（取较晚的）来计算时间进度
  const effectiveDate = lastPlannedReturn > today ? lastPlannedReturn : today;
  const fiveYearElapsedDays = Math.floor((effectiveDate.getTime() - fiveYearStart.getTime()) / (1000 * 60 * 60 * 24));
  const fiveYearTimePercentage = Math.min(100, Math.max(0, (fiveYearElapsedDays / fiveYearTotalDays) * 100));
  const fiveYearUsagePercentage = fiveYearPercentage;
  
  // 判断时间进度是否包含未来计划
  const isTimeProgressIncludingPlanned = lastPlannedReturn > today;
  
  // 风险等级
  const getRiskLevel = (percentage: number) => {
    if (percentage < 70) return 'safe';
    if (percentage < 90) return 'warning';
    return 'danger';
  };
  
  const currentPercentage = calculatePercentage(currentRolling12, IMMIGRATION_RULES.ROLLING_12_MONTHS.maxDays);
  const afterPlannedPercentage = calculatePercentage(
    currentRolling12 + plannedDays,
    IMMIGRATION_RULES.ROLLING_12_MONTHS.maxDays
  );

  return (
    <div className="future-planning">
      <h3>📅 出境规划 - {personName}</h3>
      
      <div className="planning-summary">
        <div className="summary-card">
          <div className="summary-label">当前滚动12个月已用</div>
          <div className={`summary-value risk-${getRiskLevel(currentPercentage)}`}>
            {currentRolling12} / 180天
          </div>
          <div className="summary-note">剩余 {currentRemaining} 天</div>
        </div>
        
        {plannedRecords.length > 0 && (
          <>
            <div className="summary-card">
              <div className="summary-label">计划出境天数</div>
              <div className="summary-value" style={{ color: '#f59e0b' }}>
                {plannedDays}天
              </div>
              <div className="summary-note">{plannedRecords.length} 个计划</div>
            </div>
            
            <div className="summary-card">
              <div className="summary-label">执行计划后预计剩余</div>
              <div className={`summary-value risk-${getRiskLevel(afterPlannedPercentage)}`}>
                {Math.max(0, afterPlannedRemaining)}天
              </div>
              <div className="summary-note">
                {afterPlannedRemaining < 0 ? '⚠️ 超出限制' : '✓ 安全范围'}
              </div>
            </div>
          </>
        )}
      </div>
      
      <div className="planning-summary">
        <div className="summary-card">
          <div className="summary-label">5年期限已用天数{isTimeProgressIncludingPlanned ? '*' : ''}</div>
          <div className={`summary-value risk-${getRiskLevel(fiveYearPercentage)}`}>
            {fiveYearDays} / 450天
          </div>
          {isTimeProgressIncludingPlanned && (
              <div className="summary-note">
                * 含未来计划
              </div>
            )}
        </div>
        
        <div className="summary-card">
          <div className="summary-label">5年期限剩余天数</div>
          <div className={`summary-value risk-${getRiskLevel(fiveYearPercentage)}`}>
            {fiveYearRemaining}天
          </div>
          <div className="summary-note">
            可用额度剩余
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-label">时间进度 vs 使用进度</div>
          <div className="summary-value" style={{ fontSize: '1.2rem' }}>
            {fiveYearTimePercentage.toFixed(1)}% / {fiveYearUsagePercentage.toFixed(1)}%
          </div>
          <div className="summary-note">
            {fiveYearUsagePercentage > fiveYearTimePercentage 
              ? `⚠️ 使用速度过快 (+${(fiveYearUsagePercentage - fiveYearTimePercentage).toFixed(1)}%)` 
              : `✓ 使用合理 (-${(fiveYearTimePercentage - fiveYearUsagePercentage).toFixed(1)}%)`}
          </div>
        </div>
      </div>
      
      {plannedRecords.length === 0 && (
        <div className="no-plans">
          暂无未来出境计划
        </div>
      )}
      
      {plannedRecords.length > 0 && (
        <>
          <div className="future-timeline">
            <h4>未来剩余出境（保守计算）</h4>
            <div className="timeline-chart">
              {monthlyPredictions.map((pred, index) => (
                <div key={index} className="timeline-bar">
                  <div className="bar-value">{pred.remaining}天</div>
                  <div className="bar-container">
                    <div
                      className={`bar-fill risk-${getRiskLevel(pred.percentage)}`}
                      style={{ height: `${(pred.remaining / 180) * 100}%` }}
                      title={`剩余 ${pred.remaining} 天 (已用 ${pred.used} / 180 天)`}
                    />
                  </div>
                  <div className="bar-label">{pred.month}</div>
                </div>
              ))}
            </div>
            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-color risk-safe"></span> 安全 (&lt;70%)
              </div>
              <div className="legend-item">
                <span className="legend-color risk-warning"></span> 注意 (70-90%)
              </div>
              <div className="legend-item">
                <span className="legend-color risk-danger"></span> 危险 (&gt;90%)
              </div>
            </div>
          </div>

          <div className="future-timeline">
            <h4>未来剩余出境（保守计算）</h4>
            <div className="line-chart" style={{ position: 'relative' }}>
              {hoveredPoint && (
                <div 
                  className="chart-tooltip-float"
                  style={{
                    position: 'absolute',
                    left: `${hoveredPoint.x}px`,
                    top: `${hoveredPoint.y}px`,
                    transform: 'translate(-50%, -120%)',
                    pointerEvents: 'none',
                    zIndex: 1000
                  }}
                >
                  📅 {hoveredPoint.date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
                  <br />
                  剩余：<strong>{hoveredPoint.remaining}天</strong> | 已用：{hoveredPoint.used}/180天
                </div>
              )}
              <svg viewBox="0 0 800 300" className="line-chart-svg">
                {/* 背景网格线 */}
                <line x1="50" y1="250" x2="780" y2="250" stroke="#e5e7eb" strokeWidth="2" />
                <line x1="50" y1="187.5" x2="780" y2="187.5" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" />
                <line x1="50" y1="125" x2="780" y2="125" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" />
                <line x1="50" y1="62.5" x2="780" y2="62.5" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5" />
                <line x1="50" y1="0" x2="780" y2="0" stroke="#e5e7eb" strokeWidth="2" />
                
                {/* Y轴刻度 */}
                <text x="40" y="255" fontSize="12" fill="#6b7280" textAnchor="end">0</text>
                <text x="40" y="192.5" fontSize="12" fill="#6b7280" textAnchor="end">60</text>
                <text x="40" y="130" fontSize="12" fill="#6b7280" textAnchor="end">120</text>
                <text x="40" y="67.5" fontSize="12" fill="#6b7280" textAnchor="end">180</text>
                
                {/* 折线路径 */}
                <path
                  d={dailyPredictions.map((point, index) => {
                    const x = 50 + (index / (dailyPredictions.length - 1)) * 730;
                    const y = 250 - (point.remaining / 180) * 250;
                    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#667eea"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                
                {/* 数据点 */}
                {dailyPredictions.map((point, index) => {
                  const x = 50 + (index / (dailyPredictions.length - 1)) * 730;
                  const y = 250 - (point.remaining / 180) * 250;
                  const usagePercentage = (point.used / 180) * 100;
                  const color = usagePercentage < 70 ? '#10b981' : usagePercentage < 90 ? '#f59e0b' : '#ef4444';
                  
                  return (
                    <circle
                      key={index}
                      cx={x}
                      cy={y}
                      r="4"
                      fill={color}
                      stroke="white"
                      strokeWidth="2"
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={(e) => {
                        const svgRect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
                        if (svgRect) {
                          const svgX = (x / 800) * svgRect.width;
                          const svgY = (y / 300) * svgRect.height;
                          setHoveredPoint({ ...point, x: svgX, y: svgY });
                        }
                      }}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  );
                })}
                
                {/* X轴月份标签 */}
                {Array.from({ length: 13 }, (_, i) => i).map(monthOffset => {
                  const x = 50 + (monthOffset / 12) * 730;
                  const futureDate = addMonths(today, monthOffset);
                  const label = futureDate.toLocaleDateString('zh-CN', { month: 'short' });
                  return (
                    <text key={monthOffset} x={x} y="275" fontSize="11" fill="#6b7280" textAnchor="middle">
                      {label}
                    </text>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="future-timeline">
            <h4>5年期限剩余情况（2025-10-15 至 2030-10-15）</h4>
            <div className="donut-chart-container">
              <svg viewBox="0 0 600 240" className="donut-chart-svg">
                <defs>
                  <linearGradient id="remainingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#34d399', stopOpacity: 1 }} />
                  </linearGradient>
                  <linearGradient id="usedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#667eea', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#764ba2', stopOpacity: 1 }} />
                  </linearGradient>
                  <filter id="shadow">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2"/>
                  </filter>
                </defs>
                
                {/* 空心圆环 */}
                <g transform="translate(140, 120)">
                  {/* 背景圆环（灰色） */}
                  <circle cx="0" cy="0" r="80" fill="none" stroke="#e5e7eb" strokeWidth="25"/>
                  
                  {/* 剩余天数圆环（绿色渐变） */}
                  {(() => {
                    const remainingPercentage = (fiveYearRemaining / 450) * 100;
                    const angle = (remainingPercentage / 100) * 360;
                    const radius = 80;
                    const strokeWidth = 25;
                    
                    const startAngle = -90;
                    const endAngle = startAngle + angle;
                    
                    const startRad = (startAngle * Math.PI) / 180;
                    const endRad = (endAngle * Math.PI) / 180;
                    
                    const x1 = radius * Math.cos(startRad);
                    const y1 = radius * Math.sin(startRad);
                    const x2 = radius * Math.cos(endRad);
                    const y2 = radius * Math.sin(endRad);
                    
                    const largeArcFlag = angle > 180 ? 1 : 0;
                    
                    const pathData = angle >= 360 
                      ? `M 0,${-radius} A ${radius},${radius} 0 1,1 0,${radius} A ${radius},${radius} 0 1,1 0,${-radius}`
                      : `M ${x1},${y1} A ${radius},${radius} 0 ${largeArcFlag},1 ${x2},${y2}`;
                    
                    return (
                      <path
                        d={pathData}
                        fill="none"
                        stroke="url(#remainingGradient)"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        filter="url(#shadow)"
                      />
                    );
                  })()}
                  
                  {/* 中心文字 */}
                  <text x="0" y="-10" textAnchor="middle" fontSize="36" fontWeight="bold" fill="#10b981">
                    {((fiveYearRemaining / 450) * 100).toFixed(1)}%
                  </text>
                  <text x="0" y="12" textAnchor="middle" fontSize="13" fill="#6b7280">
                    剩余可用
                  </text>
                  <text x="0" y="32" textAnchor="middle" fontSize="16" fontWeight="600" fill="#1f2937">
                    {fiveYearRemaining} / 450 天
                  </text>
                </g>
                
                {/* 数据卡片 */}
                <g transform="translate(310, 60)">
                  {/* 已用天数卡片 */}
                  <rect x="0" y="0" width="130" height="50" fill="url(#usedGradient)" rx="6" filter="url(#shadow)"/>
                  <text x="65" y="20" textAnchor="middle" fontSize="11" fill="white" opacity="0.9">
                    已用天数
                  </text>
                  <text x="65" y="40" textAnchor="middle" fontSize="20" fontWeight="bold" fill="white">
                    {fiveYearDays}
                  </text>
                  
                  {/* 剩余天数卡片 */}
                  <rect x="145" y="0" width="130" height="50" fill="url(#remainingGradient)" rx="6" filter="url(#shadow)"/>
                  <text x="210" y="20" textAnchor="middle" fontSize="11" fill="white" opacity="0.9">
                    剩余天数
                  </text>
                  <text x="210" y="40" textAnchor="middle" fontSize="20" fontWeight="bold" fill="white">
                    {fiveYearRemaining}
                  </text>
                  
                  {/* 已使用比例卡片 */}
                  <rect x="0" y="60" width="130" height="50" fill="#fef3c7" rx="6" filter="url(#shadow)"/>
                  <text x="65" y="80" textAnchor="middle" fontSize="11" fill="#92400e">
                    已使用比例
                  </text>
                  <text x="65" y="100" textAnchor="middle" fontSize="18" fontWeight="600" fill="#b45309">
                    {fiveYearPercentage.toFixed(1)}%
                  </text>
                  
                  {/* 时间进度指示 */}
                  <rect x="145" y="60" width="130" height="50" fill="#f3f4f6" rx="6" filter="url(#shadow)"/>
                  <text x="210" y="80" textAnchor="middle" fontSize="11" fill="#6b7280">
                    {isTimeProgressIncludingPlanned ? '时间已过*' : '时间已过'}
                  </text>
                  <text x="210" y="100" textAnchor="middle" fontSize="18" fontWeight="600" fill="#374151">
                    {fiveYearTimePercentage.toFixed(1)}%
                  </text>
                  
                  {/* 说明文字 */}
                  {isTimeProgressIncludingPlanned && (
                    <text x="137.5" y="130" textAnchor="middle" fontSize="9" fill="#6b7280">
                      * 时间进度已计算至最后计划返回日期
                    </text>
                  )}
                  {isTimeProgressIncludingPlanned && (
                    <text x="137.5" y="142" textAnchor="middle" fontSize="9" fill="#6b7280">
                      ({lastPlannedReturn.toLocaleDateString('zh-CN')})
                    </text>
                  )}
                </g>
              </svg>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
