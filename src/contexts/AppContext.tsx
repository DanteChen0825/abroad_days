import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import type { TravelRecord, Person } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface AppContextType {
  records: TravelRecord[];
  selectedPerson: Person;
  setSelectedPerson: (person: Person) => void;
  addRecord: (record: TravelRecord) => void;
  updateRecord: (id: string, record: TravelRecord) => void;
  deleteRecord: (id: string) => void;
  loadSampleData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [records, setRecords] = useState<TravelRecord[]>([]);
  const [selectedPerson, setSelectedPerson] = useLocalStorage<Person>('selectedPerson', 'self');

  // 每次页面加载时都从 JSON 文件读取数据
  useEffect(() => {
    const loadDataFromJson = async () => {
      try {
        const response = await fetch('/data/sample-data.json');
        if (response.ok) {
          const data = await response.json();
          if (data.records && Array.isArray(data.records)) {
            setRecords(data.records);
            console.log('✅ 已从 JSON 文件加载数据');
          }
        }
      } catch (error) {
        console.error('❌ 加载数据失败:', error);
        setRecords([]);
      }
    };

    loadDataFromJson();
  }, []); // 空依赖数组，仅在组件挂载时执行一次

  // 手动加载示例数据的函数
  const loadSampleData = async () => {
    try {
      const response = await fetch('/data/sample-data.json');
      if (response.ok) {
        const data = await response.json();
        if (data.records && Array.isArray(data.records)) {
          setRecords(data.records);
          alert('✅ 示例数据已加载！');
        }
      }
    } catch (error) {
      alert('❌ 加载示例数据失败');
    }
  };

  const addRecord = (record: TravelRecord) => {
    const newRecords = [...records, record];
    setRecords(newRecords);
    console.log('⚠️ 注意：新添加的记录不会保存，刷新后会重置为 JSON 文件内容');
  };

  const updateRecord = (id: string, updatedRecord: TravelRecord) => {
    const newRecords = records.map(r => r.id === id ? updatedRecord : r);
    setRecords(newRecords);
    console.log('⚠️ 注意：修改的记录不会保存，刷新后会重置为 JSON 文件内容');
  };

  const deleteRecord = (id: string) => {
    const newRecords = records.filter(r => r.id !== id);
    setRecords(newRecords);
    console.log('⚠️ 注意：删除操作不会保存，刷新后会重置为 JSON 文件内容');
  };

  const value: AppContextType = {
    records,
    selectedPerson,
    setSelectedPerson,
    addRecord,
    updateRecord,
    deleteRecord,
    loadSampleData
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
