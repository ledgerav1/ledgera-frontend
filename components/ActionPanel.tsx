type ActionPanelProps = {
  lead?: {
    score: number;
    zoomLink?: string;
  };
};

export default function ActionPanel({ lead }: ActionPanelProps) {
  const score = lead?.score ?? 82;
  const zoomLink = lead?.zoomLink ?? "#";

  return (
    <section>
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Sales Control</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Live Call Assist</h2>
      </div>

      <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
        <a
          href={zoomLink}
          className="block rounded-2xl bg-cyan-500 px-4 py-3 text-center font-semibold text-slate-950 transition hover:bg-cyan-400"
        >
          Join Zoom
        </a>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
            Suggested Move
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-200">
            Ask about AR delays and unpaid invoices.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
            Close Probability
          </h3>
          <p className="mt-3 text-3xl font-semibold text-white">{score}%</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
            Objection Response
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-200">
            We can quantify the leak first, then show the owner the ROI of fixing it.
          </p>
        </div>
      </div>
    </section>
  );
}
