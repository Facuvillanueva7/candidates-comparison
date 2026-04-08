export type AppMode = 'recruiter' | 'manager';

export type EnglishLevel = 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface Role {
  id: string;
  title: string;
  department: string;
  seniority: string;
  mustHaves: string[];
  niceToHaves: string[];
  budgetMin: number;
  budgetMax: number;
  targetEnglishLevel: EnglishLevel;
  notes: string;
}

export interface EvaluationScores {
  technicalFit: number;
  softSkills: number;
  stability: number;
  salaryFit: number;
  englishFit: number;
  ownershipAutonomy: number;
  clientReadiness: number;
  aiFluency: number;
}

export interface EvidenceMetadata {
  evidenceQuality: number;
  missingCriticalEvidence: boolean;
  contradictorySignals: boolean;
  hardDisqualifiers: string[];
}

export interface Candidate {
  id: string;
  roleId: string;
  fullName: string;
  currentTitle: string;
  location: string;
  salaryExpectation: number;
  englishLevel: EnglishLevel;
  noticePeriod: string;
  overallSummary: string;
  strengths: string[];
  risks: string[];
  sourceCoverage: number;
  redFlags: string[];
  tags: string[];
  evaluation: EvaluationScores;
  evidence: EvidenceMetadata;
  notes?: string;
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  weights: EvaluationScores;
}

export interface ComparisonSession {
  roleId: string;
  candidateIds: string[];
  selectedPresetId: string;
  customWeights: EvaluationScores;
  mode: AppMode;
  timestamp: string;
}

export type Recommendation = 'Recommended' | 'Consider' | 'Discard' | 'Insufficient Evidence';

export interface DecisionExplanation {
  finalScore: number;
  confidenceScore: number;
  recommendation: Recommendation;
  topStrengths: string[];
  mainRisks: string[];
  blockers: string[];
  whyThisResult: string;
  whatCouldImproveDecision: string;
  bestFitPresetComment: string;
}

export interface ScoredCandidate {
  candidate: Candidate;
  weightedScore: number;
  finalScore: number;
  confidenceScore: number;
  recommendation: Recommendation;
  explanation: DecisionExplanation;
  blockers: string[];
}
