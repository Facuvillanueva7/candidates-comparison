import { Candidate, ComparisonSession, Preset, Role } from '@/lib/types/domain';

export interface PersistedState {
  roles: Role[];
  candidates: Candidate[];
  presets: Preset[];
  session: ComparisonSession;
}

const STORAGE_KEY = 'recruitment_decision_engine_state_v1';

export function saveState(data: PersistedState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadState(): PersistedState | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

export function clearState() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function downloadTextFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
