import { ScoredCandidate } from '@/lib/types/domain';

export function toComparisonCsv(rows: ScoredCandidate[]) {
  const header = [
    'Rank',
    'Candidate',
    'Recommendation',
    'FinalScore',
    'ConfidenceScore',
    'SalaryExpectation',
    'EnglishLevel',
    'TopStrengths',
    'MainRisks'
  ];

  const body = rows.map((row, idx) => [
    String(idx + 1),
    row.candidate.fullName,
    row.recommendation,
    row.finalScore.toFixed(1),
    row.confidenceScore.toFixed(1),
    String(row.candidate.salaryExpectation),
    row.candidate.englishLevel,
    row.explanation.topStrengths.join(' | '),
    row.explanation.mainRisks.join(' | ')
  ]);

  return [header, ...body]
    .map((line) => line.map((item) => `"${item.replaceAll('"', '""')}"`).join(','))
    .join('\n');
}
