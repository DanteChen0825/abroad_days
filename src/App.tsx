import { useState } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { TravelRecordForm } from './components/TravelRecordForm';
import { TravelRecordList } from './components/TravelRecordList';
import { FuturePlanning } from './components/FuturePlanning';
import type { Person } from './types';
import './App.css';

function AppContent() {
  const { records, loadSampleData } = useApp();
  const [selectedPerson, setSelectedPerson] = useState<Person>('self');

  return (
    <div className="app">
      <header className="app-header">
        <h1>🇬🇧 英国离境天数追踪器</h1>
        <p className="subtitle">UK Absence Days Tracker</p>
        {records.length === 0 && (
          <button 
            onClick={loadSampleData}
            className="btn-load-sample"
          >
            📥 加载示例数据
          </button>
        )}
      </header>

      {/* 未来出境规划 - 顶部 */}
      <div className="future-planning-container">
        <FuturePlanning records={records} person="self" personName="我" />
        <FuturePlanning records={records} person="spouse" personName="太太" />
      </div>

      {/* 数据输入区域 - 放在底部 */}
      <div className="data-input-section">
        <h2 className="section-title">📝 出入境数据管理</h2>
        
        <div className="person-tabs">
          <button 
            className={`tab-button ${selectedPerson === 'self' ? 'active' : ''}`}
            onClick={() => setSelectedPerson('self')}
          >
            我的记录
          </button>
          <button 
            className={`tab-button ${selectedPerson === 'spouse' ? 'active' : ''}`}
            onClick={() => setSelectedPerson('spouse')}
          >
            太太的记录
          </button>
        </div>

        <div className="input-content">
          <TravelRecordForm person={selectedPerson} />
          <TravelRecordList person={selectedPerson} />
        </div>
      </div>

      <footer className="app-footer">
        <p className="calculation-note">
          <strong>计算说明：</strong><br />
          • 官方计算：按移民局规定，出入境当天都不算离境天数<br />
          • 保守计算：更保守的方式，出入境当天算其中一天<br />
          • 滚动12个月：从今天往前推算12个月内的离境天数
        </p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
