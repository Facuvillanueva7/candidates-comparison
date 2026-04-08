import {
  Candidate,
  DecisionExplanation,
  EvaluationScores,
  Preset,
  Recommendation,
  Role,
  ScoredCandidate
} from '@/lib/types/domain';
import { clampScore, normalizeWeights } from '@/lib/scoring/weights';

const englishRank = { A2: 1, B1: 2, B2: 3, C1: 4, C2: 5 } as const;

export interface DecisionThresholds {
  discardSalaryOverBudgetPct: number;
  minEnglishGapAllowed: number;
  minMustHaveFitScore: number;
  severeRiskKeywords: string[];
  weakEvidenceThreshold: number;
  weakCoverageThreshold: number;
  recommendedMin: number;
  considerMin: number;
}

export const defaultThresholds: DecisionThresholds = {
  discardSalaryOverBudgetPct: 0.12,
  minEnglishGapAllowed: 0,
  minMustHaveFitScore: 60,
  severeRiskKeywords: ['integrity', 'termination', 'fraud', 'harassment', 'compliance'],
  weakEvidenceThreshold: 55,
  weakCoverageThreshold: 50,
  recommendedMin: 78,
  considerMin: 62
};

function calculateWeightedScore(scores: EvaluationScores, weights: EvaluationScores): number {
  const normalized = normalizeWeights(weights);
  return clampScore(
    (scores.technicalFit * normalized.technicalFit +
      scores.softSkills * normalized.softSkills +
      scores.stability * normalized.stability +
      scores.salaryFit * normalized.salaryFit +
      scores.englishFit * normalized.englishFit +
      scores.ownershipAutonomy * normalized.ownershipAutonomy +
      scores.clientReadiness * normalized.clientReadiness +
      scores.aiFluency * normalized.aiFluency) /
      100
  );
}

function checkHardBlockers(candidate: Candidate, role: Role, thresholds: DecisionThresholds): string[] {
  const blockers: string[] = [];
  const budgetLimit = role.budgetMax * (1 + thresholds.discardSalaryOverBudgetPct);
  if (candidate.salaryExpectation > budgetLimit) {
    blockers.push('Salary expectation materially exceeds role budget cap.');
  }

  const englishGap = englishRank[role.targetEnglishLevel] - englishRank[candidate.englishLevel];
  if (englishGap > thresholds.minEnglishGapAllowed) {
    blockers.push('English level does not meet target requirement.');
  }

  if (candidate.evaluation.technicalFit < thresholds.minMustHaveFitScore) {
    blockers.push('Technical fit is below minimum must-have threshold.');
  }

  if (candidate.evidence.hardDisqualifiers.length > 0) {
    blockers.push(`Explicit disqualifier present: ${candidate.evidence.hardDisqualifiers[0]}.`);
  }

  const severeRisk = [...candidate.redFlags, ...candidate.risks].some((risk) =>
    thresholds.severeRiskKeywords.some((keyword) => risk.toLowerCase().includes(keyword))
  );
  if (severeRisk) {
    blockers.push('Severe risk signal requires immediate discard.');
  }

  return blockers;
}

function computeConfidence(candidate: Candidate): number {
  let confidence = (candidate.evidence.evidenceQuality * 0.65 + candidate.sourceCoverage * 0.35);
  if (candidate.evidence.missingCriticalEvidence) confidence -= 15;
  if (candidate.evidence.contradictorySignals) confidence -= 10;
  return clampScore(confidence);
}

function getRecommendation(
  weightedScore: number,
  confidence: number,
  blockers: string[],
  thresholds: DecisionThresholds
): Recommendation {
  if (blockers.length > 0) return 'Discard';
  if (
    confidence < thresholds.weakEvidenceThreshold ||
    weightedScore < thresholds.considerMin ||
    confidence < thresholds.weakCoverageThreshold
  ) {
    if (confidence < thresholds.weakEvidenceThreshold) return 'Insufficient Evidence';
  }
  if (weightedScore >= thresholds.recommendedMin && confidence >= thresholds.weakEvidenceThreshold + 10) {
    return 'Recommended';
  }
  if (weightedScore >= thresholds.considerMin) {
    return 'Consider';
  }
  return 'Discard';
}

function explanationFrom(
  candidate: Candidate,
  finalScore: number,
  confidenceScore: number,
  recommendation: Recommendation,
  blockers: string[],
  preset: Preset
): DecisionExplanation {
  const topStrengths = candidate.strengths.slice(0, 3);
  const mainRisks = [...candidate.risks, ...candidate.redFlags].slice(0, 3);
  const needsEvidence = candidate.evidence.missingCriticalEvidence || confidenceScore < 60;

  return {
    finalScore,
    confidenceScore,
    recommendation,
    topStrengths,
    mainRisks,
    blockers,
    whyThisResult:
      recommendation === 'Recommended'
        ? 'Strong weighted performance with sufficient confidence and no hard blockers.'
        : recommendation === 'Consider'
          ? 'Profile is viable but has trade-offs requiring hiring-team alignment.'
          : recommendation === 'Insufficient Evidence'
            ? 'Current data quality is too weak for a defensible hiring decision.'
            : 'One or more hard blocker rules triggered discard logic.',
    whatCouldImproveDecision: needsEvidence
      ? 'Collect deeper technical evidence, references, and scenario-based communication validation.'
      : 'Run final panel calibration on role-specific must-haves and salary alignment.',
    bestFitPresetComment: `${candidate.fullName} under ${preset.name} emphasizes ${preset.description.toLowerCase()}`
  };
}

export function rankCandidates(params: {
  role: Role;
  candidates: Candidate[];
  preset: Preset;
  weights: EvaluationScores;
  thresholds?: DecisionThresholds;
}): ScoredCandidate[] {
  const { role, candidates, preset, weights, thresholds = defaultThresholds } = params;

  return candidates
    .map((candidate) => {
      const blockers = checkHardBlockers(candidate, role, thresholds);
      const weightedScore = calculateWeightedScore(candidate.evaluation, weights);
      const confidenceScore = computeConfidence(candidate);
      const recommendation = getRecommendation(weightedScore, confidenceScore, blockers, thresholds);
      const confidenceAdjustment = confidenceScore < 65 ? -6 : confidenceScore > 85 ? 3 : 0;
      const finalScore = clampScore(weightedScore + confidenceAdjustment);

      return {
        candidate,
        weightedScore,
        finalScore,
        confidenceScore,
        recommendation,
        blockers,
        explanation: explanationFrom(
          candidate,
          finalScore,
          confidenceScore,
          recommendation,
          blockers,
          preset
        )
      };
    })
    .sort((a, b) => b.finalScore - a.finalScore);
}
