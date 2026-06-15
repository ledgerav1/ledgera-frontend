"use client";

export type Lead = {
  companyId: string;
  company: string;
  revenue: string;
  techs: number;
  score: number;
  tier: "HOT" | "WARM" | "COLD";
};

function tierStyles(tier: Lead["tier"]) {
  switch (tier) {
    case "HOT":
      return "bg-red-500/20 text-red-300 border-red-500/30";
    case "WARM":
      return "bg-amber-500/20 text-amber-300 border-amber-500/30";
    default:
      return "bg-slate-500/20 text-slate-300 border-slate-500/30";
  }
}

function scoreFillClass(score: Lead["score"]) {
  switch (score) {
    case 82:
      return "lead-score-fill-82";
    case 61:
      return "lead-score-fill-61";
    case 33:
      return "lead-score-fill-33";
    default:
      return "";
  }
}

export type LeadListProps = {
  leads?: Lead[];
  selectedCompanyId?: string;
  onSelect?: (companyId: string) => void;
};

export default function LeadList({
  leads = [],
  selectedCompanyId = "",
  onSelect = () => {},
}: LeadListProps) {
  return (
    <div>
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Booked Leads</p>
        <h2 className="mt-2 text-xl font-semibold text-white">Control Center</h2>
      </div>

      <div className="space-y-3">
        {leads.map((lead) => {
          const isSelected = lead.companyId === selectedCompanyId;

          return (
            <button
              key={lead.companyId}
              type="button"
              onClick={() => onSelect(lead.companyId)}
              className={[
                "w-full rounded-2xl border p-4 text-left transition hover:border-slate-600 hover:bg-slate-900",
                isSelected
                  ? "border-cyan-500/40 bg-cyan-500/10"
                  : "border-slate-800 bg-slate-950/70",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-white">{lead.company}</h3>
                  <p className="text-sm text-slate-400">{lead.revenue}</p>
                  <p className="text-sm text-slate-300">{lead.techs} techs</p>
                </div>

                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${tierStyles(
                    lead.tier
                  )}`}
                >
                  {lead.tier}
                </span>
              </div>

              <div className="mt-3 h-2 w-full rounded-full bg-slate-800">
                <div
                  className={`h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 ${scoreFillClass(
                    lead.score
                  )}`}
                />
              </div>

              <p className="mt-2 text-xs text-slate-500">Close probability {lead.score}%</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
