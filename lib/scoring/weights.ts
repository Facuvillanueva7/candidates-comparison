import { EvaluationScores } from '@/lib/types/domain';

const scoreKeys: (keyof EvaluationScores)[] = [
  'technicalFit',
  'softSkills',
  'stability',
  'salaryFit',
  'englishFit',
  'ownershipAutonomy',
  'clientReadiness',
  'aiFluency'
];

export function normalizeWeights(weights: EvaluationScores): EvaluationScores {
  const total = scoreKeys.reduce((sum, key) => sum + Math.max(0, weights[key]), 0);
  if (total === 0) {
    const equal = 100 / scoreKeys.length;
    return scoreKeys.reduce((acc, key) => ({ ...acc, [key]: equal }), {} as EvaluationScores);
  }

  return scoreKeys.reduce(
    (acc, key) => ({ ...acc, [key]: (Math.max(0, weights[key]) / total) * 100 }),
    {} as EvaluationScores
  );
}

export function clampScore(value: number) {
  return Math.max(0, Math.min(100, value));
}
