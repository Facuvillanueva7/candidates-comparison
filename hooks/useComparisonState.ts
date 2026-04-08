'use client';

import { useEffect, useMemo, useState } from 'react';
import { sampleCandidates, samplePresets, sampleRoles } from '@/lib/sample-data';
import { rankCandidates } from '@/lib/recommendations/engine';
import { clearState, loadState, PersistedState, saveState } from '@/lib/storage/local-storage';
import { AppMode, Candidate, ComparisonSession, EvaluationScores } from '@/lib/types/domain';

function buildDefaultSession(roleId: string): ComparisonSession {
  return {
    roleId,
    candidateIds: sampleCandidates.filter((c) => c.roleId === roleId).map((c) => c.id),
    selectedPresetId: samplePresets[0].id,
    customWeights: samplePresets[0].weights,
    mode: 'recruiter',
    timestamp: new Date().toISOString()
  };
}

export function useComparisonState() {
  const [roles, setRoles] = useState(sampleRoles);
  const [candidates, setCandidates] = useState<Candidate[]>(sampleCandidates);
  const [presets, setPresets] = useState(samplePresets);
  const [session, setSession] = useState<ComparisonSession>(() => buildDefaultSession(sampleRoles[0].id));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const persisted = loadState();
    if (persisted) {
      setRoles(persisted.roles);
      setCandidates(persisted.candidates);
      setPresets(persisted.presets);
      setSession(persisted.session);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveState({ roles, candidates, presets, session });
  }, [roles, candidates, presets, session, hydrated]);

  const selectedRole = roles.find((r) => r.id === session.roleId) ?? roles[0];
  const selectedPreset = presets.find((p) => p.id === session.selectedPresetId) ?? presets[0];

  const roleCandidates = useMemo(
    () => candidates.filter((candidate) => candidate.roleId === selectedRole.id),
    [candidates, selectedRole.id]
  );

  const rankedCandidates = useMemo(
    () =>
      rankCandidates({
        role: selectedRole,
        candidates: roleCandidates,
        preset: selectedPreset,
        weights: session.customWeights
      }),
    [selectedRole, roleCandidates, selectedPreset, session.customWeights]
  );

  function setRole(roleId: string) {
    const firstPreset = presets[0];
    setSession((prev) => ({
      ...prev,
      roleId,
      candidateIds: candidates.filter((c) => c.roleId === roleId).map((c) => c.id),
      selectedPresetId: firstPreset.id,
      customWeights: firstPreset.weights,
      timestamp: new Date().toISOString()
    }));
  }

  function setPreset(presetId: string) {
    const preset = presets.find((item) => item.id === presetId);
    if (!preset) return;
    setSession((prev) => ({ ...prev, selectedPresetId: presetId, customWeights: preset.weights }));
  }

  function setMode(mode: AppMode) {
    setSession((prev) => ({ ...prev, mode }));
  }

  function updateWeight(key: keyof EvaluationScores, value: number) {
    setSession((prev) => ({
      ...prev,
      customWeights: { ...prev.customWeights, [key]: Math.max(0, Math.min(100, value)) }
    }));
  }

  function resetWeights() {
    setSession((prev) => ({ ...prev, customWeights: selectedPreset.weights }));
  }

  function updateCandidate(candidateId: string, patch: Partial<Candidate>) {
    setCandidates((prev) => prev.map((c) => (c.id === candidateId ? { ...c, ...patch } : c)));
  }

  function resetToSampleData() {
    clearState();
    setRoles(sampleRoles);
    setCandidates(sampleCandidates);
    setPresets(samplePresets);
    setSession(buildDefaultSession(sampleRoles[0].id));
  }

  function applyImportedState(state: PersistedState) {
    setRoles(state.roles);
    setCandidates(state.candidates);
    setPresets(state.presets);
    setSession(state.session);
  }

  return {
    roles,
    candidates,
    presets,
    session,
    hydrated,
    selectedRole,
    selectedPreset,
    rankedCandidates,
    setRole,
    setPreset,
    setMode,
    updateWeight,
    resetWeights,
    updateCandidate,
    resetToSampleData,
    applyImportedState
  };
}
