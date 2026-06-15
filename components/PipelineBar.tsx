const stages = ["Booked", "Qualified", "Demo", "Proposal", "Closed"] as const;

export default function PipelineBar() {
  return (
    <nav aria-label="Pipeline stages" className="flex flex-wrap items-center justify-between gap-3">
      {stages.map((stage, index) => (
        <div key={stage} className="flex items-center gap-3">
          <div className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-sm font-semibold text-slate-100">
            {stage}
          </div>
          {index < stages.length - 1 ? <span className="text-slate-600">→</span> : null}
        </div>
      ))}
    </nav>
  );
}
