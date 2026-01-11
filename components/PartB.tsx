
import React from 'react';
import { Hardener } from '../types';
import { AddIcon, RemoveIcon } from './Icons';

interface PartBProps {
  hardeners: Hardener[];
  setHardeners: React.Dispatch<React.SetStateAction<Hardener[]>>;
  totalWeight: number;
}

const PartB: React.FC<PartBProps> = ({ hardeners, setHardeners, totalWeight }) => {
  const handleAdd = () => {
    setHardeners([...hardeners, { id: Date.now(), ahew: 0, concentration: 100, weightPercentage: 0 }]);
  };

  const handleRemove = (id: number) => {
    if (hardeners.length > 1) {
      setHardeners(hardeners.filter(h => h.id !== id));
    }
  };

  const handleChange = (id: number, field: keyof Hardener, value: any) => {
    setHardeners(hardeners.map(h => h.id === id ? { ...h, [field]: value } : h));
  };
  
  const isWeightValid = Math.round(totalWeight) === 100;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg shadow-gray-200/50">
      <div className="flex justify-between items-center border-b pb-2 mb-4">
        <h2 className="text-2xl font-bold text-gray-700">B劑 (硬化劑)</h2>
        <div className={`text-sm font-medium ${isWeightValid ? 'text-green-600' : 'text-red-600'}`}>
          總重量: {totalWeight.toFixed(0)}%
        </div>
      </div>
      <div id="hardener-rows" className="space-y-4">
        {hardeners.map((hardener) => (
          <HardenerRow key={hardener.id} hardener={hardener} onRemove={handleRemove} onChange={handleChange} canRemove={hardeners.length > 1} />
        ))}
      </div>
      <button onClick={handleAdd} className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-100 hover:bg-indigo-200 rounded-md transition-colors">
        <AddIcon />
        <span>新增硬化劑</span>
      </button>
      <p className={`text-xs text-red-500 mt-2 ${isWeightValid ? 'hidden' : ''}`}>
        B劑各組份的總重量百分比必須等於 100%。
      </p>
    </div>
  );
};

// Sub-component for a single hardener row
interface HardenerRowProps {
    hardener: Hardener;
    onRemove: (id: number) => void;
    onChange: (id: number, field: keyof Hardener, value: any) => void;
    canRemove: boolean;
}

const HardenerRow: React.FC<HardenerRowProps> = ({ hardener, onRemove, onChange, canRemove }) => {
    const effectiveAhew = (hardener.concentration > 0 && hardener.concentration < 100)
        ? hardener.ahew / (hardener.concentration / 100)
        : null;

    return (
        <div className="p-4 border border-gray-200 rounded-md bg-gray-50/70 relative">
            {canRemove && (
                 <button onClick={() => onRemove(hardener.id)} className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors" aria-label="移除此硬化劑">
                    <RemoveIcon />
                </button>
            )}
            <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                <div>
                    <label htmlFor={`hardener-${hardener.id}-ahew`} className="block text-sm font-medium text-gray-600">原液 AHEW</label>
                    <input type="number" id={`hardener-${hardener.id}-ahew`} value={hardener.ahew || ''} onChange={(e) => onChange(hardener.id, 'ahew', parseFloat(e.target.value) || 0)} className="form-input" placeholder="Amine H Equivalent Weight" />
                </div>
                <div>
                    <label htmlFor={`hardener-${hardener.id}-concentration`} className="block text-sm font-medium text-gray-600">目標濃度 (%)</label>
                    <input type="number" id={`hardener-${hardener.id}-concentration`} value={hardener.concentration || ''} onChange={(e) => onChange(hardener.id, 'concentration', parseFloat(e.target.value) || 0)} className="form-input" placeholder="Target Concentration" />
                </div>
                <div className="col-span-2">
                    <label htmlFor={`hardener-${hardener.id}-weightPercentage`} className="block text-sm font-medium text-gray-600">重量百分比 (%)</label>
                    <input type="number" id={`hardener-${hardener.id}-weightPercentage`} value={hardener.weightPercentage || ''} onChange={(e) => onChange(hardener.id, 'weightPercentage', parseFloat(e.target.value) || 0)} className="form-input" placeholder="Weight Percentage" />
                </div>
                {effectiveAhew && effectiveAhew.toFixed(1) !== (hardener.ahew || 0).toFixed(1) && (
                    <div className="col-span-2 text-sm text-indigo-600 font-semibold">→ 換算有效 AHEW: {effectiveAhew.toFixed(1)}</div>
                )}
            </div>
        </div>
    );
};

export default PartB;
