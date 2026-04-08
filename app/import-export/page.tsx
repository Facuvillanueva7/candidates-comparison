'use client';

import Link from 'next/link';
import { ChangeEvent, useState } from 'react';
import { useComparisonState } from '@/hooks/useComparisonState';
import { downloadTextFile } from '@/lib/storage/local-storage';
import { toComparisonCsv } from '@/lib/utils/csv';

export default function ImportExportPage() {
  const state = useComparisonState();
  const [status, setStatus] = useState('');

  function exportJson() {
    downloadTextFile(
      'comparison-session.json',
      JSON.stringify(
        {
          roles: state.roles,
          candidates: state.candidates,
          presets: state.presets,
          session: state.session
        },
        null,
        2
      ),
      'application/json'
    );
    setStatus('Exported JSON successfully.');
  }

  function exportCsv() {
    downloadTextFile('comparison-summary.csv', toComparisonCsv(state.rankedCandidates), 'text/csv');
    setStatus('Exported CSV successfully.');
  }

  function onImport(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        state.applyImportedState(parsed);
        setStatus('Imported session successfully.');
      } catch {
        setStatus('Invalid JSON structure.');
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-xl font-semibold">Import / Export Tools</h1>
      <p className="mt-2 text-sm text-slate-700">Save, restore, and share deterministic comparison sessions.</p>
      <div className="mt-4 space-y-3 rounded-xl border bg-white p-4">
        <button className="rounded-md border px-3 py-2 text-sm" onClick={exportJson}>Export Full Session JSON</button>
        <button className="ml-2 rounded-md border px-3 py-2 text-sm" onClick={exportCsv}>Export Comparison CSV</button>
        <div>
          <label className="block text-sm font-medium">Import Session JSON</label>
          <input type="file" accept="application/json" onChange={onImport} className="mt-1" />
        </div>
        <p className="text-sm text-sky-700">{status}</p>
      </div>
      <Link className="mt-4 inline-block rounded-md border px-3 py-2 text-sm" href="/workspace">Back to workspace</Link>
    </div>
  );
}
