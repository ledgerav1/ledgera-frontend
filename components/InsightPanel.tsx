import CashFlowCard from "./CashFlowCard";
import LossSpotlight from "./LossSpotlight";

type InsightLead = {
  companyId: string;
  company: string;
  aiReport?: string;
  score?: number;
};

type InsightPanelProps = {
  lead?: InsightLead;
};

function defaultAiReport(company: string) {
  return `This HVAC company (${company}) likely loses margin due to delayed invoicing and dispatch blind spots—now you can see exactly what to fix first.`;
}

export default function InsightPanel({ lead }: InsightPanelProps) {
  const company = lead?.company ?? "Apex HVAC";
  const companyId = lead?.companyId ?? "companyA";
  const aiReport = lead?.aiReport ?? defaultAiReport(company);

  return (
    <section>
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">AI Insight</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">{company}</h2>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
        <p className="text-xs uppercase tracking-[0.20em] text-slate-400">Owner takeaway</p>
        <blockquote className="mt-3 border-l-2 border-sky-500 pl-4 text-base leading-7 text-slate-200">
          “This makes the loss obvious—and tells me the first move to recover it.”
        </blockquote>

        <p className="mt-5 text-base leading-7 text-slate-200">{aiReport}</p>
      </div>

      <div className="mt-6">
        <LossSpotlight companyId={companyId} companyLabel={company} />
      </div>

      <div className="mt-6">
        <CashFlowCard companyId={companyId} companyLabel={company} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
            Detected Risks
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-200">
            <li>Cash flow delay</li>
            <li>Dispatch inefficiency</li>
            <li>Profit leakage</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
            Suggested Positioning
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-200">
            Show the owner where money is leaking and connect those losses to a structured recovery path.
          </p>
        </div>
      </div>
    </section>
  );
}
