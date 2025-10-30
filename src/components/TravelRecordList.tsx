import type { Person, TravelRecord } from '../types';
import { useApp } from '../contexts/AppContext';

interface TravelRecordListProps {
  person: Person;
}

export function TravelRecordList({ person }: TravelRecordListProps) {
  const { records, deleteRecord } = useApp();
  
  const today = new Date();
  
  const personRecords = records
    .filter(r => r.person === person)
    .sort((a, b) => {
      // 按照入境日期（returnDate）从最近到最远排序
      const dateA = new Date(a.returnDate).getTime();
      const dateB = new Date(b.returnDate).getTime();
      return dateB - dateA;
    });
  
  // 判断记录是否是未来计划
  const isPlanned = (record: TravelRecord) => {
    return new Date(record.departureDate) > today;
  };
  
  // 提取备注中的emoji
  const extractEmoji = (notes?: string) => {
    if (!notes) return { emoji: '', remainingText: '' };
    
    // 匹配emoji的正则表达式（更全面的匹配）
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F1E6}-\u{1F1FF}]{2}/gu;
    const matches = notes.match(emojiRegex);
    
    if (matches && matches.length > 0) {
      const emoji = matches.join(' '); // 如果有多个emoji，用空格连接
      const remainingText = notes.replace(emojiRegex, '').trim();
      return { emoji, remainingText };
    }
    
    return { emoji: '', remainingText: notes };
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这条记录吗？')) {
      deleteRecord(id);
    }
  };

  if (personRecords.length === 0) {
    return (
      <div className="travel-record-list">
        <h3>出入境记录</h3>
        <p className="no-records">暂无记录</p>
      </div>
    );
  }
  
  // 分离历史记录和计划记录
  const historicalRecords = personRecords.filter(r => !isPlanned(r));
  const plannedRecords = personRecords.filter(r => isPlanned(r));

  return (
    <div className="travel-record-list">
      <h3>出入境记录 ({personRecords.length} 条)</h3>
      
      {plannedRecords.length > 0 && (
        <div className="records-section">
          <h4 className="section-header">📅 计划出入境 ({plannedRecords.length})</h4>
          <div className="records-container">
            {plannedRecords.map(record => {
              const { emoji, remainingText } = extractEmoji(record.notes);
              return (
              <div key={record.id} className="record-card planned-record">
                <div className="record-header">
                  <div className="record-date-container">
                    <span className="record-date">
                      <span className="planned-badge">「计划」</span>{' '}
                      {record.departureDate} → {record.returnDate}
                    </span>
                    {emoji && <div className="record-emoji">{emoji}</div>}
                  </div>
                  <button 
                    onClick={() => handleDelete(record.id)} 
                    className="btn-delete"
                    aria-label="删除记录"
                  >
                    ×
                  </button>
                </div>
                <div className="record-details">
                  <div className="days-info">
                    <div className="days-item">
                      <span className="label">官方计算：</span>
                      <span className="value">{record.daysOfficial} 天</span>
                    </div>
                    <div className="days-item">
                      <span className="label">保守计算：</span>
                      <span className="value">{record.daysConservative} 天</span>
                    </div>
                  </div>
                  {remainingText && (
                    <div className="record-notes">
                      <span className="label">备注：</span>
                      <span>{remainingText}</span>
                    </div>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        </div>
      )}
      
      {historicalRecords.length > 0 && (
        <div className="records-section">
          <h4 className="section-header">📝 历史记录 ({historicalRecords.length})</h4>
          <div className="records-container">
            {historicalRecords.map(record => {
              const { emoji, remainingText } = extractEmoji(record.notes);
              return (
              <div key={record.id} className="record-card">
                <div className="record-header">
                  <div className="record-date-container">
                    <span className="record-date">{record.departureDate} → {record.returnDate}</span>
                    {emoji && <div className="record-emoji">{emoji}</div>}
                  </div>
                  <button 
                    onClick={() => handleDelete(record.id)} 
                    className="btn-delete"
                    aria-label="删除记录"
                  >
                    ×
                  </button>
                </div>
                <div className="record-details">
                  <div className="days-info">
                    <div className="days-item">
                      <span className="label">官方计算：</span>
                      <span className="value">{record.daysOfficial} 天</span>
                    </div>
                    <div className="days-item">
                      <span className="label">保守计算：</span>
                      <span className="value">{record.daysConservative} 天</span>
                    </div>
                  </div>
                  {remainingText && (
                    <div className="record-notes">
                      <span className="label">备注：</span>
                      <span>{remainingText}</span>
                    </div>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
