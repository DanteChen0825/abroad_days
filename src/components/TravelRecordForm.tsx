import React, { useState } from 'react';
import type { TravelRecord, Person } from '../types';
import { useApp } from '../contexts/AppContext';
import { calculateDaysOfficial, calculateDaysConservative, isValidDateRange } from '../utils/dateCalculations';
import { validateTravelRecord } from '../utils/ruleValidation';

interface TravelRecordFormProps {
  person: Person;
}

export function TravelRecordForm({ person }: TravelRecordFormProps) {
  const { addRecord } = useApp();
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const record: Partial<TravelRecord> = {
      person,
      departureDate,
      returnDate,
      notes
    };
    
    const validationErrors = validateTravelRecord(record);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    if (!isValidDateRange(departureDate, returnDate)) {
      setErrors(['入境日期不能早于出境日期']);
      return;
    }
    
    const newRecord: TravelRecord = {
      id: crypto.randomUUID(),
      person,
      departureDate,
      returnDate,
      daysOfficial: calculateDaysOfficial(departureDate, returnDate),
      daysConservative: calculateDaysConservative(departureDate, returnDate),
      notes,
      createdAt: Date.now()
    };
    
    addRecord(newRecord);
    
    // 清空表单
    setDepartureDate('');
    setReturnDate('');
    setNotes('');
    setErrors([]);
  };
  
  const daysOfficial = departureDate && returnDate && isValidDateRange(departureDate, returnDate)
    ? calculateDaysOfficial(departureDate, returnDate)
    : null;
    
  const daysConservative = departureDate && returnDate && isValidDateRange(departureDate, returnDate)
    ? calculateDaysConservative(departureDate, returnDate)
    : null;

  return (
    <div className="travel-record-form">
      <h3>添加出入境记录</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="departure-date">出境日期：</label>
          <input
            type="date"
            id="departure-date"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="return-date">入境日期：</label>
          <input
            type="date"
            id="return-date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            required
          />
        </div>
        
        {daysOfficial !== null && daysConservative !== null && (
          <div className="days-preview">
            <p><strong>离境天数预览：</strong></p>
            <p>官方计算：{daysOfficial} 天</p>
            <p>保守计算：{daysConservative} 天</p>
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="notes">备注（可选）：</label>
          <input
            type="text"
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="例如：日本旅游"
          />
        </div>
        
        {errors.length > 0 && (
          <div className="errors">
            {errors.map((error, index) => (
              <p key={index} className="error">{error}</p>
            ))}
          </div>
        )}
        
        <button type="submit" className="btn-primary">添加记录</button>
      </form>
    </div>
  );
}
