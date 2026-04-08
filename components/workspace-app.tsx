'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useComparisonState } from '@/hooks/useComparisonState';
import { downloadTextFile } from '@/lib/storage/local-storage';
import { EvaluationScores, ScoredCandidate } from '@/lib/types/domain';
import { toComparisonCsv } from '@/lib/utils/csv';
import { RecommendationBadge } from '@/components/recommendation-badge';

const weightKeys: (keyof EvaluationScores)[] = [
  'technicalFit',
  'softSkills',
  'stability',
  'salaryFit',
  'englishFit',
  'ownershipAutonomy',
  'clientReadiness',
  'aiFluency'
];

export function WorkspaceApp({ initialRoleId }: { initialRoleId?: string }) {
  const state = useComparisonState();
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');

  const selectedCandidate = useMemo(
    () => state.rankedCandidates.find((c) => c.candidate.id === selectedCandidateId) ?? state.rankedCandidates[0],
    [state.rankedCandidates, selectedCandidateId]
  );

  if (!state.hydrated) return <div className="p-8 text-sm text-slate-500">Loading workspace…</div>;

  if (initialRoleId && initialRoleId !== state.session.roleId) {
    state.setRole(initialRoleId);
  }

  const isRecruiter = state.session.mode === 'recruiter';

  function exportJson() {
    const payload = {
      roles: state.roles,
      candidates: state.candidates,
      presets: state.presets,
      session: state.session
    };
    downloadTextFile('comparison-session.json', JSON.stringify(payload, null, 2), 'application/json');
  }

  function exportCsv() {
    const csv = toComparisonCsv(state.rankedCandidates);
    downloadTextFile('comparison-summary.csv', csv, 'text/csv');
  }

  return (
    <div className="min-h-screen p-4">
      <div className="mb-4 rounded-xl border bg-white p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="mr-4 text-lg font-semibold">Recruitment Decision Engine</h1>
          <select value={state.session.roleId} onChange={(e) => state.setRole(e.target.value)}>
            {state.roles.map((role) => (
              <option key={role.id} value={role.id}>{role.title}</option>
            ))}
          </select>
          <select value={state.session.selectedPresetId} onChange={(e) => state.setPreset(e.target.value)}>
            {state.presets.map((preset) => (
              <option key={preset.id} value={preset.id}>{preset.name}</option>
            ))}
          </select>
          <button className="rounded-md border px-3 py-1 text-sm" onClick={() => state.setMode(isRecruiter ? 'manager' : 'recruiter')}>
            Mode: {isRecruiter ? 'Recruiter' : 'Manager'}
          </button>
          <button className="rounded-md border px-3 py-1 text-sm" onClick={exportJson}>Export JSON</button>
          <button className="rounded-md border px-3 py-1 text-sm" onClick={exportCsv}>Export CSV</button>
          <Link className="rounded-md border px-3 py-1 text-sm" href="/import-export">Import/Export</Link>
          <Link className="rounded-md border px-3 py-1 text-sm" href="/about">About Logic</Link>
          <button className="ml-auto rounded-md border px-3 py-1 text-sm text-rose-700" onClick={state.resetToSampleData}>Reset Sample Data</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <aside className="space-y-4 xl:col-span-3">
          <div className="rounded-xl border bg-white p-4">
            <h2 className="text-sm font-semibold">Role Summary</h2>
            <p className="text-sm">{state.selectedRole.title} · {state.selectedRole.seniority}</p>
            <p className="mt-1 text-xs text-slate-600">Budget: ${state.selectedRole.budgetMin} - ${state.selectedRole.budgetMax}</p>
            <p className="text-xs text-slate-600">Target English: {state.selectedRole.targetEnglishLevel}</p>
            <p className="mt-2 text-xs text-slate-700">{state.selectedRole.notes}</p>
          </div>

          <div className="rounded-xl border bg-white p-4">
            <h2 className="text-sm font-semibold">Preset: {state.selectedPreset.name}</h2>
            <p className="mb-3 text-xs text-slate-600">{state.selectedPreset.description}</p>
            {weightKeys.map((key) => (
              <label key={key} className="mb-2 block text-xs">
                <div className="mb-1 flex justify-between"><span>{key}</span><span>{state.session.customWeights[key].toFixed(0)}</span></div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={state.session.customWeights[key]}
                  onChange={(e) => state.updateWeight(key, Number(e.target.value))}
                  disabled={!isRecruiter}
                  className="w-full"
                />
              </label>
            ))}
            <button className="mt-2 rounded-md border px-3 py-1 text-xs" onClick={state.resetWeights}>Reset weights</button>
          </div>
        </aside>

        <main className="xl:col-span-6">
          <div className="rounded-xl border bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold">Candidate Comparison</h2>
            <div className="space-y-3">
              {state.rankedCandidates.map((entry, idx) => (
                <CandidateRow
                  key={entry.candidate.id}
                  index={idx + 1}
                  entry={entry}
                  mode={state.session.mode}
                  isSelected={selectedCandidate?.candidate.id === entry.candidate.id}
                  onSelect={() => setSelectedCandidateId(entry.candidate.id)}
                  onUpdate={(patch) => state.updateCandidate(entry.candidate.id, patch)}
                />
              ))}
            </div>
          </div>
        </main>

        <aside className="xl:col-span-3">
          {selectedCandidate ? (
            <div className="rounded-xl border bg-white p-4">
              <h2 className="text-sm font-semibold">Decision Explanation</h2>
              <p className="text-sm font-medium">{selectedCandidate.candidate.fullName}</p>
              <div className="mt-2 flex items-center gap-2">
                <RecommendationBadge value={selectedCandidate.recommendation} />
                <span className="text-xs">Final score: {selectedCandidate.finalScore.toFixed(1)}</span>
                <span className="text-xs">Confidence: {selectedCandidate.confidenceScore.toFixed(1)}</span>
              </div>
              <Detail title="Why this result" text={selectedCandidate.explanation.whyThisResult} />
              <Detail title="Blockers" text={selectedCandidate.explanation.blockers.join(' • ') || 'None'} />
              <Detail title="Strengths" text={selectedCandidate.explanation.topStrengths.join(' • ')} />
              <Detail title="Risks" text={selectedCandidate.explanation.mainRisks.join(' • ') || 'None'} />
              <Detail title="Improve decision" text={selectedCandidate.explanation.whatCouldImproveDecision} />
              <Detail title="Preset comment" text={selectedCandidate.explanation.bestFitPresetComment} />
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function Detail({ title, text }: { title: string; text: string }) {
  return (
    <div className="mt-3 rounded-md bg-slate-50 p-2">
      <p className="text-xs font-semibold">{title}</p>
      <p className="text-xs text-slate-700">{text}</p>
    </div>
  );
}

function CandidateRow({
  index,
  entry,
  isSelected,
  onSelect,
  onUpdate,
  mode
}: {
  index: number;
  entry: ScoredCandidate;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (patch: Record<string, unknown>) => void;
  mode: 'recruiter' | 'manager';
}) {
  const c = entry.candidate;
  return (
    <button
      className={`w-full rounded-lg border p-3 text-left ${isSelected ? 'border-sky-500 bg-sky-50' : 'bg-white'}`}
      onClick={onSelect}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold">#{index}</span>
        <p className="text-sm font-semibold">{c.fullName}</p>
        <RecommendationBadge value={entry.recommendation} />
        <span className="text-xs">Score {entry.finalScore.toFixed(1)}</span>
      </div>
      <p className="text-xs text-slate-600">{c.currentTitle} · {c.location} · Salary ${c.salaryExpectation}</p>
      <p className="mt-1 text-xs text-slate-700">{c.overallSummary}</p>
      <div className="mt-2 text-xs text-slate-700">Strengths: {c.strengths.slice(0, 3).join(' • ')}</div>
      <div className="text-xs text-slate-700">Risks: {c.risks.slice(0, 2).join(' • ') || 'None'}</div>
      {mode === 'recruiter' ? (
        <div className="mt-2 grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
          <label className="text-xs">Salary
            <input type="number" value={c.salaryExpectation} onChange={(e) => onUpdate({ salaryExpectation: Number(e.target.value) })} className="mt-1 w-full" />
          </label>
          <label className="text-xs">Evidence quality
            <input
              type="number"
              min={0}
              max={100}
              value={c.evidence.evidenceQuality}
              onChange={(e) => onUpdate({ evidence: { ...c.evidence, evidenceQuality: Number(e.target.value) } })}
              className="mt-1 w-full"
            />
          </label>
        </div>
      ) : null}
    </button>
  );
}
