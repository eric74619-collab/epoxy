
import React from 'react';
import { CalculationResults, Resin, Hardener } from '../types';

interface ResultsProps {
    calculations: CalculationResults;
    resins: Resin[];
    hardeners: Hardener[];
    stoichiometry: number;
}

const generateExpertAdvice = (calculations: CalculationResults, resins: Resin[], hardeners: Hardener[], stoichiometry: number): string => {
    const { areWeightsValid, mixtureEew, mixtureAhew } = calculations;
    if (!areWeightsValid || !mixtureEew || !mixtureAhew) {
        return `
            <h3 class="text-lg font-bold text-sky-900 mb-2">專家建議</h3>
            <p class="text-sm text-sky-800">請輸入有效的配方以進行分析。確保 A 劑和 B 劑的總重量百分比均為 100%。</p>`;
    }

    const weightedAvgSolidEew = resins.reduce((acc, r) => {
        const weight = r.weightPercentage || 0;
        const solidEew = r.eewType === 'solid' ? (r.eew || 0) : (r.eew || 0) * ((r.nv || 100) / 100);
        return acc + solidEew * weight;
    }, 0) / 100;
    
    let resinAnalysis = '';
    if (weightedAvgSolidEew > 0) {
        if (weightedAvgSolidEew < 300) resinAnalysis = `<p>⚠️ <strong>高交聯密度 (Liquid Rich):</strong> 環氧當量低，反應點密集。優點是<strong>硬度極高、防腐性佳</strong>；缺點是<strong>乾燥慢 (無物理快乾)</strong>、<strong>打磨困難</strong>、<strong>柔韌性差</strong>。</p>`;
        else if (weightedAvgSolidEew >= 450 && weightedAvgSolidEew <= 600) resinAnalysis = `<p>✅ <strong>標準底漆型 (Solid Type 1):</strong> 環氧當量適中。具備<strong>物理快乾性 (指觸乾燥快)</strong>，有利於<strong>打磨施工</strong>。硬度與柔韌性平衡佳。</p>`;
        else if (weightedAvgSolidEew > 700) resinAnalysis = `<p>ℹ️ <strong>高分子量型:</strong> 環氧當量高，反應點少。優點是<strong>乾燥極快、柔韌性優異</strong>；缺點是<strong>耐溶劑性較差、交聯密度低</strong>。</p>`;
    }

    const weightedAvgAhew = hardeners.reduce((acc, h) => acc + (h.ahew || 0) * (h.weightPercentage || 0), 0) / 100;
    let hardenerAnalysis = '';
    if (weightedAvgAhew > 0) {
        if (weightedAvgAhew < 100) hardenerAnalysis = `<p>⚠️ <strong>高活性硬化劑:</strong> 活潑氫當量低。<strong>反應速度極快，活化期 (Pot Life) 短</strong>，需注意操作時間。漆膜硬脆。</p>`;
        else if (weightedAvgAhew >= 100 && weightedAvgAhew <= 250) hardenerAnalysis = `<p>✅ <strong>標準型硬化劑:</strong> 常見於聚醯胺 (Polyamide)。<strong>活化期適中 (3-6hr)</strong>，對金屬<strong>密著性 (Adhesion)</strong> 佳，適合噴塗操作。</p>`;
    }

    let stoicAnalysis = '';
    if (stoichiometry > 1.05) stoicAnalysis = `<p>📈 <strong>化學計量 (胺過量):</strong> B劑過量可<strong>加快乾燥</strong>並提升對潮濕底材的附著力，但可能導致<strong>胺浮出 (Amine Blush)</strong> 或黃變。</p>`;
    else if (stoichiometry < 0.95) stoicAnalysis = `<p>📉 <strong>化學計量 (樹脂過量):</strong> A劑過量會減慢反應，漆膜<strong>較軟韌、有光澤</strong>，但可能導致硬化不完全與耐化性下降。</p>`;
    else stoicAnalysis = `<p>⚖️ <strong>化學計量 (平衡):</strong> 1:1 的反應比例可提供<strong>最佳的總體性能</strong>，包括耐化學性和物理強度。</p>`;

    return `
        <h3 class="text-lg font-bold text-sky-900 mb-2">當前配方特性分析</h3>
        <div class="space-y-2 text-sm text-sky-800">
            ${resinAnalysis}
            ${hardenerAnalysis}
            ${stoicAnalysis}
        </div>
        <h3 class="text-lg font-bold text-sky-900 mt-4 mb-2">化學參數小教室</h3>
        <div class="space-y-2 text-sm text-sky-800">
            <p><strong>關於 EEW (環氧當量):</strong> 數值越<strong>小</strong> = 單位重量內的反應基團越<strong>多</strong> = 交聯越緻密 (硬度高、更脆)。</p>
            <p><strong>關於 AHEW (活潑氫當量):</strong> 數值越<strong>小</strong> = 胺基濃度越<strong>高</strong> = 反應速度越<strong>快</strong> (活化期變短)。</p>
        </div>
    `;
};


const Results: React.FC<ResultsProps> = ({ calculations, resins, hardeners, stoichiometry }) => {
  const { 
    areWeightsValid, 
    mixtureEew, 
    mixtureAhew,
    finalPhr, 
    ratioA,
    resinBreakdown,
    hardenerBreakdown,
    resinSumOfEquivalents,
    hardenerSumOfEquivalents,
    theoreticalPhr
} = calculations;
  
  const expertAdviceHTML = generateExpertAdvice(calculations, resins, hardeners, stoichiometry);

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-lg shadow-gray-200/50">
        <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-gray-700">計算結果</h2>
        <div id="results-container" className="text-center py-10 px-4 bg-gray-50 rounded-lg">
          {areWeightsValid && mixtureEew > 0 && mixtureAhew > 0 ? (
             <div className="p-6 text-center bg-indigo-50 rounded-lg">
                <p className="text-sm font-medium text-indigo-700">建議配比 (PHR)</p>
                <p className="text-4xl font-extrabold text-indigo-900 tracking-tight my-2">100 : {finalPhr.toFixed(1)}</p>
                <p className="text-lg font-medium text-gray-600">現場施工比例: {ratioA.toFixed(2)} : 1</p>
            </div>
          ) : (
            <p className="text-gray-500">請輸入有效的數值以計算結果。</p>
          )}
        </div>
      </div>
      
      <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
        <h3 className="text-lg font-semibold mb-4 text-gray-600 border-b pb-2">詳細分解</h3>
        <div id="calculation-breakdown" className="text-sm text-gray-700 space-y-2">
            {areWeightsValid && mixtureEew > 0 && mixtureAhew > 0 ? (
                <>
                    <div className="space-y-2">
                        <div className="font-bold text-gray-800">A劑計算:</div>
                        {resinBreakdown.map((line, i) => <div key={`a-${i}`} dangerouslySetInnerHTML={{__html: line}} />)}
                        <div className="pt-1 border-t border-gray-200">A劑總當量數 = {resinSumOfEquivalents.toFixed(4)}</div>
                        <div>A劑混合 EEW = 100 ÷ {resinSumOfEquivalents.toFixed(4)} = <strong>{mixtureEew.toFixed(2)}</strong></div>
                    </div>
                    <hr className="my-3"/>
                    <div className="space-y-2">
                        <div className="font-bold text-gray-800">B劑計算:</div>
                        {hardenerBreakdown.map((line, i) => <div key={`b-${i}`} dangerouslySetInnerHTML={{__html: line}} />)}
                        <div className="pt-1 border-t border-gray-200">B劑總當量數 = {hardenerSumOfEquivalents.toFixed(4)}</div>
                        <div>B劑混合 AHEW = 100 ÷ {hardenerSumOfEquivalents.toFixed(4)} = <strong>{mixtureAhew.toFixed(2)}</strong></div>
                    </div>
                    <hr className="my-3"/>
                     <div className="space-y-2">
                        <div className="font-bold text-gray-800">最終比例:</div>
                        <div>理論 PHR = ({mixtureAhew.toFixed(2)} ÷ {mixtureEew.toFixed(2)}) × 100 = {theoreticalPhr.toFixed(2)}</div>
                        <div className="font-bold">修正後 PHR = {theoreticalPhr.toFixed(2)} × {stoichiometry.toFixed(2)} = {finalPhr.toFixed(2)}</div>
                    </div>
                </>
            ) : (
                <p>等待輸入...</p>
            )}
        </div>
      </div>

      <div className="bg-sky-50 border-l-4 border-sky-400 p-5 rounded-r-lg shadow">
        <div id="expert-advice" dangerouslySetInnerHTML={{ __html: expertAdviceHTML }} />
      </div>
    </>
  );
};

export default Results;
