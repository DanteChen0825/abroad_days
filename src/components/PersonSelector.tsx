import type { Person } from '../types';
import { useApp } from '../contexts/AppContext';

export function PersonSelector() {
  const { selectedPerson, setSelectedPerson } = useApp();

  return (
    <div className="person-selector">
      <label htmlFor="person-select">选择人员：</label>
      <select
        id="person-select"
        value={selectedPerson}
        onChange={(e) => setSelectedPerson(e.target.value as Person)}
        className="person-select"
      >
        <option value="self">我</option>
        <option value="spouse">太太</option>
      </select>
    </div>
  );
}
