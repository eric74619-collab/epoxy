
export interface Resin {
  id: number;
  eew: number;
  nv: number;
  weightPercentage: number;
  eewType: 'solid' | 'solution';
}

export interface Hardener {
  id: number;
  ahew: number;
  concentration: number;
  weightPercentage: number;
}

export interface CalculationResults {
  totalResinWeight: number;
  totalHardenerWeight: number;
  resinBreakdown: string[];
  hardenerBreakdown: string[];
  resinSumOfEquivalents: number;
  hardenerSumOfEquivalents: number;
  mixtureEew: number;
  mixtureAhew: number;
  areWeightsValid: boolean;
  theoreticalPhr: number;
  finalPhr: number;
  ratioA: number;
}
