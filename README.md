# Recruitment Decision Engine MVP

Production-ready MVP for an internal recruiter/hiring-manager decision support workflow.

## Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Browser `localStorage` persistence
- Static JSON sample data

## Local setup
```bash
npm install
npm run dev
```
Open `http://localhost:3000`.

## Deploy to Vercel
1. Push this repo to GitHub.
2. Import project in Vercel.
3. Framework preset: **Next.js**.
4. Build command: `npm run build`.
5. Output: default `.next`.
6. Deploy (no env vars required for MVP).

## Routes
- `/` → redirects to `/workspace`
- `/workspace` → main comparison workspace
- `/workspace/[roleId]` → role-specific workspace
- `/import-export` → JSON/CSV tools
- `/about` → deterministic decision logic summary

## App structure
- `app/` routes and pages
- `components/` workspace UI + badges
- `hooks/useComparisonState.ts` state orchestration + local persistence
- `lib/types/domain.ts` explicit domain model
- `lib/sample-data/*.json` seed roles/candidates/presets
- `lib/recommendations/engine.ts` pure deterministic recommendation engine
- `lib/scoring/weights.ts` weight normalization utilities
- `lib/storage/local-storage.ts` persistence and download helpers
- `lib/utils/csv.ts` CSV export utility

## Where to tweak behavior
- **Thresholds / recommendation rules**: `lib/recommendations/engine.ts` (`defaultThresholds`)
- **Preset definitions**: `lib/sample-data/presets.json`
- **Sample roles**: `lib/sample-data/roles.json`
- **Sample candidates**: `lib/sample-data/candidates.json`

## MVP behavior implemented
- Compare 4 candidates per role across 2 roles.
- Select preset and override all criterion weights.
- Deterministic recommendations with explanations:
  - Recommended
  - Consider
  - Discard
  - Insufficient Evidence
- Recruiter mode: editable operational fields (salary and evidence quality) + full controls.
- Manager mode: simplified non-editing decision view.
- Automatic local persistence and reset-to-sample-data action.
- Export/import full session JSON.
- Export ranking summary CSV.
