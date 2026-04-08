import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-xl font-semibold">MVP Decision Logic</h1>
      <ol className="mt-3 list-decimal space-y-2 pl-6 text-sm text-slate-700">
        <li>Hard blockers evaluate salary ceiling, English gap, must-have floor, and explicit disqualifiers.</li>
        <li>Weighted score is computed from normalized preset/custom weights across 8 evaluation dimensions.</li>
        <li>Confidence score combines evidence quality and source coverage, penalized by missing/contradictory evidence.</li>
        <li>Final recommendation label is deterministic: Recommended, Consider, Discard, or Insufficient Evidence.</li>
        <li>Explanation objects are generated from rule outcomes and rendered in the workspace side panel.</li>
      </ol>
      <Link className="mt-4 inline-block rounded-md border px-3 py-2 text-sm" href="/workspace">Back to workspace</Link>
    </div>
  );
}
