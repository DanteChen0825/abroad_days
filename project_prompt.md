# UK Absence Days Tracker - 项目提示词

## 项目概述
创建一个简单的 React 前端应用，用于追踪和计算我和太太在英国的离境天数，帮助我们遵守英国移民局的居住要求。所有数据存储在代码本地。

## 核心功能需求

### 1. 人员管理
- 支持两个人：我和太太
- 每个人的出入境记录独立管理
- 每个人的计算结果独立显示

### 2. 出入境记录管理
- **添加记录功能**：
  - 选择人员（我/太太）
  - 出境日期（离开英国）
  - 入境日期（返回英国）
  - 可选备注（如：旅行目的地）
  - 自动计算单次离境天数（两种计算方式）

- **记录列表显示**：
  - 按时间倒序显示所有记录
  - 显示：人员、出境日期、入境日期、离境天数（官方/保守）、备注
  - 支持编辑和删除记录
  - 按人员筛选记录

### 3. 移民规则（固定）
系统内置两条固定的移民规则，不可修改：
- **规则1：滚动12个月限制**
  - 任何滚动的12个月内，离境天数不得超过 180 天
  
- **规则2：5年总时长限制**
  - 整个5年居住期间，总离境天数不得超过 450 天

### 4. 计算与分析功能
为每个人分别显示，**同时提供两种计算模式的结果**：

**计算模式说明**：
- **官方计算（Official）**：按移民局规定，出境当天和入境当天都不算离境天数
  - 例如：12月1日出境，12月5日入境 = 3天（12月2、3、4日）
  - 公式：`max(0, differenceInDays(returnDate, departureDate) - 1)`
  
- **保守计算（Conservative）**：更保守的计算方式，出境和入境当天算其中一天为离境天数
  - 例如：12月1日出境，12月5日入境 = 4天（12月2、3、4、5日 或 12月1、2、3、4日）
  - 公式：`differenceInDays(returnDate, departureDate)`

每个统计面板都应该并排显示这两种计算结果，让用户可以同时参考。

- **累计统计**（两种模式）：
  - 总离境天数（官方/保守）
  - 最早记录日期
  - 最近一次离境/入境日期
  - 出入境次数

- **滚动12个月分析**（两种模式）：
  - 当前滚动12个月的离境天数（官方/保守）
  - 距离180天上限还剩多少天（官方/保守）
  - 预警提示（如接近上限）
  - 显示计算的时间范围（从哪天到哪天）

- **5年总时长分析**（两种模式）：
  - 从第一次记录到现在的总离境天数（官方/保守）
  - 距离450天上限还剩多少天（官方/保守）
  - 进度条可视化（两种模式分别显示）

- **风险提示**：
  - 绿色：安全范围（< 70%）
  - 黄色：需要注意（70-90%）
  - 红色：接近上限（> 90%）

### 5. 数据可视化
- **时间轴视图**：显示出入境记录的时间线
- **月度统计图表**：每月离境天数的柱状图或折线图
- **规则遵守进度条**：直观显示已用配额百分比

## 技术要求

### 技术栈
- **语言**：TypeScript 5+
- **框架**：React 18+ (使用函数组件和Hooks)
- **状态管理**：React Context API 或 useState
- **样式**：CSS Modules 或 Styled Components 或 Tailwind CSS
- **日期处理**：date-fns 或 dayjs（需要类型定义）
- **图表**：recharts 或 chart.js（可选，需要类型定义）
- **数据存储**：LocalStorage
- **构建工具**：Vite（推荐） + TypeScript 配置

### 项目结构
```
src/
├── types/
│   ├── index.ts                 # 全局类型定义
│   └── TravelRecord.ts          # 出入境记录类型
├── components/
│   ├── PersonSelector.tsx       # 人员选择器
│   ├── TravelRecordForm.tsx     # 出入境记录表单
│   ├── TravelRecordList.tsx     # 记录列表
│   ├── StatisticsPanel.tsx      # 统计面板
│   ├── RollingCalculator.tsx    # 滚动12个月计算
│   └── WarningIndicator.tsx     # 预警指示器
├── hooks/
│   ├── useLocalStorage.ts       # LocalStorage Hook
│   └── useAbsenceCalculator.ts  # 离境天数计算逻辑
├── utils/
│   ├── dateCalculations.ts      # 日期计算工具函数
│   └── ruleValidation.ts        # 规则验证逻辑
├── contexts/
│   └── AppContext.tsx           # 全局状态管理
├── App.tsx
├── main.tsx
└── vite-env.d.ts
```

## 数据结构设计

### 出入境记录 (TravelRecord)
```typescript
interface TravelRecord {
  id: string;
  person: 'self' | 'spouse';  // 我 或 太太
  departureDate: string;      // YYYY-MM-DD 格式
  returnDate: string;         // YYYY-MM-DD 格式
  daysOfficial: number;       // 官方计算：出入境当天都不算
  daysConservative: number;   // 保守计算：算其中一天
  notes?: string;             // 可选备注
  createdAt: number;          // 时间戳
}
```

### 移民规则常量
```typescript
// 固定的移民规则常量
const IMMIGRATION_RULES = {
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
```

### 人员类型
```typescript
type Person = 'self' | 'spouse';

interface PersonInfo {
  id: Person;
  name: string;  // 显示名称，如 "我" 或 "太太"
}
```

### 统计结果类型
```typescript
interface AbsenceStats {
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
```

### LocalStorage 键值
- `travelRecords`: 所有出入境记录数组
- `appSettings`: 应用设置（如显示语言等）

## UI/UX 要求

### 布局
- **顶部导航栏**：应用标题、人员切换
- **主体区域分为两列或多个标签页**：
  1. 添加记录 + 记录列表
  2. 统计与计算结果

### 交互细节
- 日期选择器：友好的日期输入界面
- 表单验证：确保入境日期晚于或等于出境日期
- 实时显示两种计算结果：添加记录时同时显示官方和保守计算的天数
- 确认对话框：删除记录前确认
- Toast 提示：操作成功/失败反馈
- 响应式设计：支持移动端访问
- **计算模式切换**：在统计面板顶部提供切换按钮或并排显示两种计算结果

### 多语言支持（可选）
- 中文界面
- 英文界面
- 可切换

## 核心计算逻辑

### 两种计算模式

#### 模式1：官方计算（Official Calculation）
按照移民局官方规定，出境当天和入境当天都**不算**离境天数。

```typescript
// 官方计算：出入境当天都不算
export const calculateDaysOfficial = (
  departureDate: string, 
  returnDate: string
): number => {
  const start = parseISO(departureDate);
  const end = parseISO(returnDate);
  const days = differenceInDays(end, start) - 1;
  return Math.max(0, days); // 至少为0，同一天出入境算0天
};
```

**示例**：
- 12月1日出境，12月5日入境 = 3天（仅12月2、3、4日）
- 12月1日出境，12月2日入境 = 0天
- 12月1日出境，12月3日入境 = 1天（仅12月2日）

#### 模式2：保守计算（Conservative Calculation）
更保守的计算方式，出境和入境当天算**其中一天**为离境天数。

```typescript
// 保守计算：算其中一天
export const calculateDaysConservative = (
  departureDate: string, 
  returnDate: string
): number => {
  const start = parseISO(departureDate);
  const end = parseISO(returnDate);
  return differenceInDays(end, start);
};
```

**示例**：
- 12月1日出境，12月5日入境 = 4天（12月2、3、4、5日 或 1、2、3、4日）
- 12月1日出境，12月2日入境 = 1天
- 12月1日出境，12月3日入境 = 2天

### 滚动12个月计算
```typescript
// 类型定义示例
function calculateRolling12Months(
  records: TravelRecord[], 
  person: Person, 
  today: Date,
  mode: 'official' | 'conservative'
): number {
  const startDate = subMonths(today, 12);
  
  const relevantRecords = records
    .filter(r => r.person === person)
    .filter(r => {
      const departure = parseISO(r.departureDate);
      const returnDate = parseISO(r.returnDate);
      return (departure >= startDate && departure <= today) ||
             (returnDate >= startDate && returnDate <= today) ||
             (departure <= startDate && returnDate >= today);
    });
  
  return sumDaysInPeriod(relevantRecords, startDate, today, mode);
}
```

### TypeScript 工具函数示例
```typescript
// 计算两个日期之间的天数（两种模式）
export const calculateDays = (
  departureDate: string, 
  returnDate: string,
  mode: 'official' | 'conservative' = 'official'
): number => {
  if (mode === 'official') {
    return calculateDaysOfficial(departureDate, returnDate);
  } else {
    return calculateDaysConservative(departureDate, returnDate);
  }
};

// 验证日期范围
export const isValidDateRange = (
  departureDate: string, 
  returnDate: string
): boolean => {
  const start = parseISO(departureDate);
  const end = parseISO(returnDate);
  return isBefore(start, end) || isEqual(start, end);
};
```

## 附加功能（优先级较低）

1. **数据导出/导入**：
   - 导出为 JSON 文件
   - 从 JSON 文件导入

2. **未来预测**：
   - 输入计划的出境日期和天数
   - 预测是否会超标

3. **提醒功能**：
   - 显示"安全日期"：何时可以再次出境
   - 显示"最长可出境天数"

4. **打印报告**：
   - 生成 PDF 格式的统计报告

## 开发步骤建议

### Phase 1: 基础功能
1. 使用 Vite 搭建 React + TypeScript 项目
2. 配置 tsconfig.json（严格模式）
3. 定义所有 TypeScript 类型和接口
4. 实现 LocalStorage 数据持久化（带类型安全）
5. 创建出入境记录的增删改查
6. 基础的天数计算逻辑

### Phase 2: 规则与计算
1. 实现固定规则的统计界面
2. 实现滚动12个月计算（类型安全）
3. 实现5年总时长计算
4. 添加风险预警
5. 创建自定义 Hooks（useLocalStorage, useAbsenceCalculator）

### Phase 3: 优化与完善
1. 添加数据可视化图表（使用 recharts + @types/recharts）
2. 优化 UI/UX
3. 添加数据导出功能（类型安全的 JSON）
4. 移动端适配
5. 单元测试（使用 Vitest + @testing-library/react）

## 示例场景

### 用例1：添加记录
- 用户选择"我"
- 输入出境日期：2024-10-01
- 输入入境日期：2024-10-15
- 备注：日本旅游
- 系统自动计算并显示：
  - 官方计算：13天
  - 保守计算：14天
- 保存后更新统计数据（两种模式）

### 用例2：查看统计
- 切换到"太太"
- 看到她的统计（并排显示）：
  - **官方计算**：
    - 累计离境天数：42天
    - 滚动12个月：28天/180天（剩余152天）
    - 5年总计：42天/450天（剩余408天）
    - 进度条显示：15.6%（绿色安全）
  - **保守计算**：
    - 累计离境天数：48天
    - 滚动12个月：32天/180天（剩余148天）
    - 5年总计：48天/450天（剩余402天）
    - 进度条显示：17.8%（绿色安全）

## 注意事项

1. **数据准确性**：确保两种计算模式的逻辑都正确实现
2. **计算模式对比**：在UI中清晰标注官方计算和保守计算的区别
3. **边界情况**：处理同一天出入境的情况（官方=0天，保守=0天）
4. **性能**：大量记录时的计算性能
5. **数据备份**：提醒用户定期导出数据
6. **隐私**：所有数据仅存储在本地
7. **用户教育**：在界面上解释两种计算方式的差异和使用场景

## 成功标准

- ✅ 能准确记录和管理两个人的出入境记录
- ✅ 两种计算模式都准确实现：
  - 官方计算：出入境当天都不算离境天数
  - 保守计算：算其中一天为离境天数
- ✅ 滚动12个月计算准确无误（180天上限，两种模式）
- ✅ 5年总时长计算准确无误（450天上限，两种模式）
- ✅ 界面清晰直观，两种计算结果并排显示
- ✅ 数据持久化，刷新后不丢失
- ✅ 风险预警及时准确（基于两种计算模式）

---

## TypeScript 配置要求

### tsconfig.json 建议配置
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 必要的依赖包
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.0",
    "vite": "^4.4.0"
  }
}
```

### 代码质量要求
- 所有函数和组件必须有明确的类型注解
- Props 接口必须导出并命名清晰（如 `TravelRecordFormProps`）
- 避免使用 `any` 类型，必要时使用 `unknown`
- 使用 TypeScript 的联合类型和类型守卫
- 为事件处理器使用正确的 React 事件类型（如 `React.ChangeEvent<HTMLInputElement>`）

---

**请根据此提示词实现一个完整的 TypeScript + React 应用，代码要清晰、类型安全、注释完整、易于维护。**
