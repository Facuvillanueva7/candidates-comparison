import rolesJson from './roles.json';
import candidatesJson from './candidates.json';
import presetsJson from './presets.json';
import { Candidate, Preset, Role } from '@/lib/types/domain';

export const sampleRoles = rolesJson as Role[];
export const sampleCandidates = candidatesJson as Candidate[];
export const samplePresets = presetsJson as Preset[];

export function getDefaultRoleId() {
  return sampleRoles[0]?.id ?? '';
}
