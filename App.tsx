
import React, { useState, useMemo } from 'react';
import { Resin, Hardener } from './types';
import PartA from './components/PartA';
import PartB from './components/PartB';
import Results from './components/Results';

const App: React.FC = () => {
  const [resins, setResins] = useState<Resin[]>([
    { id: Date.now(), eew: 475, nv: 75, weightPercentage: 100, eewType: 'solid' },
  ]);
  const [hardeners, setHardeners] = useState<Hardener[]>([
    { id: Date.now(), ahew: 105, concentration: 100, weightPercentage: 100 },
  ]);
  const [stoichiometry, setStoichiometry] = useState<number>(1.0);

  const calculations = useMemo(() => {
    // Part A Calculation
    const resinBreakdown: string[] = [];
    let totalResinWeight = 0;
    const resinSumOfEquivalents = resins.reduce((sum, resin, index) => {
        totalResinWeight += resin.weightPercentage;
        
        const inputEew = resin.eew > 0 ? resin.eew : 0;
        const nv = resin.nv > 0 ? resin.nv : 0;
        const weight = resin.weightPercentage > 0 ? resin.weightPercentage : 0;
        
        // --- CRITICAL BUG FIX: Implementing specified EEW conversion logic ---
        let effectiveEew;
        if (resin.eewType === 'solid') {
            // For solid resin, calculate the EEW of the solution based on solid content (NV)
            effectiveEew = (nv > 0) ? (inputEew / (nv / 100)) : 0;
        } else {
            // For "as supplied" solution resin, use the EEW directly
            effectiveEew = inputEew;
        }
        // --- END OF FIX ---

        const equivalent = effectiveEew > 0 ? (weight / effectiveEew) : 0;
        
        const eewDisplay = effectiveEew > 0 ? effectiveEew.toFixed(2) : 'N/A';
        resinBreakdown.push(`樹脂 ${index + 1}: ${weight.toFixed(1)}% ÷ ${eewDisplay} = ${equivalent.toFixed(4)}`);
        
        return sum + equivalent;
    }, 0);
    const mixtureEew = resinSumOfEquivalents > 0 ? 100 / resinSumOfEquivalents : 0;

    // Part B Calculation
    const hardenerBreakdown: string[] = [];
    let totalHardenerWeight = 0;
    const hardenerSumOfEquivalents = hardeners.reduce((sum, hardener, index) => {
        totalHardenerWeight += hardener.weightPercentage;
        const ahew = hardener.ahew > 0 ? hardener.ahew : 0;
        const conc = hardener.concentration > 0 ? hardener.concentration : 100;
        const weight = hardener.weightPercentage > 0 ? hardener.weightPercentage : 0;
        
        let effectiveAhew = ahew;
        if (conc > 0 && conc < 100) {
            effectiveAhew = ahew / (conc / 100);
        }
        
        const equivalent = effectiveAhew > 0 ? (weight / effectiveAhew) : 0;
        hardenerBreakdown.push(`硬化劑 ${index + 1}: ${weight.toFixed(1)}% ÷ ${effectiveAhew.toFixed(2)} = ${equivalent.toFixed(4)}`);
        return sum + equivalent;
    }, 0);
    const mixtureAhew = hardenerSumOfEquivalents > 0 ? 100 / hardenerSumOfEquivalents : 0;
    
    const areWeightsValid = Math.round(totalResinWeight) === 100 && Math.round(totalHardenerWeight) === 100;
    
    let theoreticalPhr = 0;
    let finalPhr = 0;
    let ratioA = 0;

    if (areWeightsValid && mixtureEew > 0 && mixtureAhew > 0) {
        theoreticalPhr = (mixtureAhew * 100) / mixtureEew;
        finalPhr = theoreticalPhr * stoichiometry;
        ratioA = 100 / finalPhr;
    }

    return {
      totalResinWeight,
      totalHardenerWeight,
      resinBreakdown,
      hardenerBreakdown,
      resinSumOfEquivalents,
      hardenerSumOfEquivalents,
      mixtureEew,
      mixtureAhew,
      areWeightsValid,
      theoreticalPhr,
      finalPhr,
      ratioA,
    };
  }, [resins, hardeners, stoichiometry]);

  return (
    <>
      <header className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">高級 2K 環氧樹脂配方計算機</h1>
        <p className="text-gray-600 mt-2">Advanced 2K Epoxy Formulation Calculator</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <PartA resins={resins} setResins={setResins} totalWeight={calculations.totalResinWeight} />
          <PartB hardeners={hardeners} setHardeners={setHardeners} totalWeight={calculations.totalHardenerWeight} />
        </div>

        <div className="space-y-6 lg:sticky lg:top-8 self-start">
          <div className="bg-white p-6 rounded-lg shadow-lg shadow-gray-200/50">
            <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-gray-700">最終比例調整</h2>
            <div>
              <label htmlFor="stoichiometry" className="block text-sm font-medium text-gray-600">化學計量比 (Stoichiometry)</label>
              <input
                type="number"
                id="stoichiometry"
                value={stoichiometry}
                onChange={(e) => setStoichiometry(parseFloat(e.target.value) || 1.0)}
                step="0.05"
                className="form-input"
              />
              <p className="text-xs text-gray-500 mt-1">標準為 1.0。 >1.0 為胺(B劑)過量，&lt;1.0 為環氧(A劑)過量。</p>
            </div>
          </div>
          <Results calculations={calculations} resins={resins} hardeners={hardeners} stoichiometry={stoichiometry} />
        </div>
      </div>
      
      <footer className="text-center mt-12 text-sm text-gray-500">
        <p>由 Gemini Pro 驅動的配方工具。僅供參考。</p>
      </footer>
    </>
  );
};

export default App;
