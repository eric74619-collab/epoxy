
import React from 'react';
import { Resin } from '../types';
import { AddIcon, RemoveIcon } from './Icons';

interface PartAProps {
  resins: Resin[];
  setResins: React.Dispatch<React.SetStateAction<Resin[]>>;
  totalWeight: number;
}

const PartA: React.FC<PartAProps> = ({ resins, setResins, totalWeight }) => {
  
  const handleAdd = () => {
    setResins([...resins, { id: Date.now(), eew: 0, nv: 100, weightPercentage: 0, eewType: 'solution' }]);
  };

  const handleRemove = (id: number) => {
    if (resins.length > 1) {
      setResins(resins.filter(r => r.id !== id));
    }
  };

  const handleChange = (id: number, field: keyof Resin, value: any) => {
    setResins(resins.map(r => r.id === id ? { ...r, [field]: value } : r));
  };
  
  const handleToggleType = (id: number) => {
     setResins(resins.map(r => {
        if (r.id === id) {
            return { ...r, eewType: r.eewType === 'solid' ? 'solution' : 'solid' };
        }
        return r;
     }));
  }

  const isWeightValid = Math.round(totalWeight) === 100;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg shadow-gray-200/50">
      <div className="flex justify-between items-center border-b pb-2 mb-4">
        <h2 className="text-2xl font-bold text-gray-700">A劑 (環氧樹脂)</h2>
        <div className={`text-sm font-medium ${isWeightValid ? 'text-green-600' : 'text-red-600'}`}>
          總重量: {totalWeight.toFixed(0)}%
        </div>
      </div>
      <div id="resin-rows" className="space-y-4">
        {resins.map((resin) => (
          <ResinRow key={resin.id} resin={resin} onRemove={handleRemove} onChange={handleChange} onToggleType={handleToggleType} canRemove={resins.length > 1}/>
        ))}
      </div>
      <button onClick={handleAdd} className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-100 hover:bg-indigo-200 rounded-md transition-colors">
        <AddIcon />
        <span>新增樹脂</span>
      </button>
      <p className={`text-xs text-red-500 mt-2 ${isWeightValid ? 'hidden' : ''}`}>
        A劑各組份的總重量百分比必須等於 100%。
      </p>
    </div>
  );
};

// Sub-component for a single resin row
interface ResinRowProps {
    resin: Resin;
    onRemove: (id: number) => void;
    onChange: (id: number, field: keyof Resin, value: any) => void;
    onToggleType: (id: number) => void;
    canRemove: boolean;
}

const ResinRow: React.FC<ResinRowProps> = ({ resin, onRemove, onChange, onToggleType, canRemove }) => {
    const isSolution = resin.eewType === 'solution';
    const effectiveEew = (resin.eewType === 'solid' && resin.nv > 0 && resin.nv < 100)
        ? resin.eew / (resin.nv / 100)
        : null;

    return (
        <div className="p-4 border border-gray-200 rounded-md bg-gray-50/70 relative">
            {canRemove && (
                <button onClick={() => onRemove(resin.id)} className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors" aria-label="移除此樹脂">
                    <RemoveIcon />
                </button>
            )}
            <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-1">EEW 類型</label>
                    <div className="flex rounded-md shadow-sm">
                        <button type="button" onClick={() => onToggleType(resin.id)} className={`flex-1 px-4 py-2 text-sm font-medium rounded-l-md transition-colors ${!isSolution ? 'bg-indigo-600 text-white z-10 ring-2 ring-indigo-500' : 'bg-white text-gray-700 hover:bg-gray-50 ring-1 ring-inset ring-gray-300'}`}>固體</button>
                        <button type="button" onClick={() => onToggleType(resin.id)} className={`-ml-px flex-1 px-4 py-2 text-sm font-medium rounded-r-md transition-colors ${isSolution ? 'bg-indigo-600 text-white z-10 ring-2 ring-indigo-500' : 'bg-white text-gray-700 hover:bg-gray-50 ring-1 ring-inset ring-gray-300'}`}>原液</button>
                    </div>
                </div>
                <div>
                    <label htmlFor={`resin-${resin.id}-eew`} className="block text-sm font-medium text-gray-600">{isSolution ? '原液 EEW' : '固體 EEW'}</label>
                    <input type="number" id={`resin-${resin.id}-eew`} value={resin.eew || ''} onChange={(e) => onChange(resin.id, 'eew', parseFloat(e.target.value) || 0)} className="form-input" placeholder="Epoxy Equivalent Weight"/>
                </div>
                <div>
                    <label htmlFor={`resin-${resin.id}-nv`} className="block text-sm font-medium text-gray-600">固含量 (NV, %)</label>
                    <input type="number" id={`resin-${resin.id}-nv`} value={resin.nv || ''} onChange={(e) => onChange(resin.id, 'nv', parseFloat(e.target.value) || 0)} className={`form-input ${isSolution ? 'bg-gray-200 cursor-not-allowed' : 'bg-white'}`} disabled={isSolution} placeholder="Non-Volatile Content" />
                </div>
                <div className="col-span-2">
                    <label htmlFor={`resin-${resin.id}-weightPercentage`} className="block text-sm font-medium text-gray-600">重量百分比 (%)</label>
                    <input type="number" id={`resin-${resin.id}-weightPercentage`} value={resin.weightPercentage || ''} onChange={(e) => onChange(resin.id, 'weightPercentage', parseFloat(e.target.value) || 0)} className="form-input" placeholder="Weight Percentage" />
                </div>
                {effectiveEew && <div className="col-span-2 text-sm text-indigo-600 font-semibold">→ 換算溶液 EEW: {effectiveEew.toFixed(1)}</div>}
            </div>
        </div>
    );
};


export default PartA;
