import { Recommendation } from '@/lib/types/domain';

const styles: Record<Recommendation, string> = {
  Recommended: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Consider: 'bg-amber-100 text-amber-800 border-amber-200',
  Discard: 'bg-rose-100 text-rose-800 border-rose-200',
  'Insufficient Evidence': 'bg-slate-200 text-slate-700 border-slate-300'
};

export function RecommendationBadge({ value }: { value: Recommendation }) {
  return <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${styles[value]}`}>{value}</span>;
}
