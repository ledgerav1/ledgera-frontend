"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const navLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Integrations", href: "/integrations" },
  { label: "Acquisition", href: "/analytics/acquisition" },
];

function fmt(v: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v); }

function Gauge({ score, size = 140 }: { score: number; size?: number }) {
  const s = 10, r = (size - s) / 2, c = 2 * Math.PI * r, f = (score / 100) * c;
  const color = score >= 70 ? "#22c55e" : score >= 40 ? "#eab308" : "#ef4444";
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e293b" strokeWidth={s}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={s} strokeDasharray={`${f} ${c-f}`} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}/>
      <text x="50%" y="48%" textAnchor="middle" dominantBaseline="central" fill="white" fontSize="32" fontWeight="700">{score}</text>
      <text x="50%" y="64%" textAnchor="middle" dominantBaseline="central" fill="#94a3b8" fontSize="11">/ 100</text>
    </svg>
  );
}

function MultiBar({ val, max }: { val: number; max: number }) {
  const pct = Math.min((val / max) * 100, 100);
  return (
    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
      <div className="h-full rounded-full bg-sky-400 transition-all duration-1000" style={{ width: `${pct}%` }} />
    </div>
  );
}

const riskColors: Record<string, string> = {
  LOW: "bg-emerald-400/10 text-emerald-200 border-emerald-400/20",
  MODERATE: "bg-amber-400/10 text-amber-200 border-amber-400/20",
  HIGH: "bg-red-400/10 text-red-200 border-red-400/20",
  CRITICAL: "bg-rose-400/10 text-rose-200 border-rose-400/20",
};

const DEFAULT_ACQ = {
  score: 72,
  recommendation: "Strong acquisition candidate — healthy margins with moderate operational risk.",
  signals: [
    "Revenue growth above industry median",
    "Technician utilization at 82%",
    "AR aging below 30 days for 78% of outstanding",
    "EBITDA margin above 15% threshold",
  ],
};

const DEFAULT_DILIGENCE = {
  companyId: "companyA",
  generatedAt: new Date().toISOString(),
  summary: "Operational due diligence indicates moderate risk concentration in labor efficiency and AR aging.",
  sections: [
    { title: "Financial Health", findings: ["Revenue trending up 18% YoY", "Net margin at 22%, above industry benchmark of 15%", "EBITDA margin stable at 16%"], riskLevel: "LOW" as const },
    { title: "Operations", findings: ["Technician utilization at 74% — below 85% target", "Average job duration 3.2 hours vs 2.8 benchmark", "Dispatch inefficiency detected in 12% of jobs"], riskLevel: "MODERATE" as const },
    { title: "Accounts Receivable", findings: ["22% of AR is beyond 60 days", "No automated collection process", "Concentration risk: top 3 customers = 45% of outstanding"], riskLevel: "HIGH" as const },
    { title: "Compliance & Contracts", findings: ["All vendor agreements current", "Worker classification reviewed — no red flags", "Insurance coverage adequate for operational scale"], riskLevel: "LOW" as const },
  ],
};

type RollupData = {
  eligible: boolean;
  eligibilityReason: string;
  clientTier: string;
  clientRevenue: number;
  clientEbitda: number;
  targetTier: string;
  recommendedTargetRevenue: { min: number; max: number };
  recommendedTargetEbitda: { min: number; max: number };
  targetCount: number;
  proFormaRevenue: number;
  proFormaEbitda: number;
  proFormaEbitdaMarginPct: number;
  synergySavingsPct: number;
  combinedEnterpriseValue: number;
  combinedMultiple: number;
  currentMultiple: number;
  multipleAfterFirstDeal: number;
  multipleAfterRollup: number;
  ceilingAfterRollup: number;
  multipleTrajectory: { label: string; multiple: number; enterpriseValue: number; ebitda: number }[];
  description: string;
  risks: string[];
  generatedAt: string;
};

const DEFAULT_ROLLUP: RollupData = {
  eligible: true,
  eligibilityReason: "Acquisition-ready with Small profile. A tuck-in strategy can accelerate to Mid-Market tier.",
  clientTier: "small",
  clientRevenue: 420000,
  clientEbitda: 185000,
  targetTier: "mid",
  recommendedTargetRevenue: { min: 84000, max: 168000 },
  recommendedTargetEbitda: { min: 8400, max: 42000 },
  targetCount: 4,
  proFormaRevenue: 924000,
  proFormaEbitda: 387500,
  proFormaEbitdaMarginPct: 41.9,
  synergySavingsPct: 15,
  combinedEnterpriseValue: 3681250,
  combinedMultiple: 9.5,
  currentMultiple: 5.0,
  multipleAfterFirstDeal: 7.5,
  multipleAfterRollup: 9.5,
  ceilingAfterRollup: 12,
  multipleTrajectory: [
    { label: "Current Standalone", multiple: 5.0, enterpriseValue: 925000, ebitda: 185000 },
    { label: "After 1 acquisition", multiple: 7.5, enterpriseValue: 2148750, ebitda: 286500 },
    { label: "After 2 acquisitions", multiple: 8.5, enterpriseValue: 3017500, ebitda: 355000 },
    { label: "After 3 acquisitions", multiple: 9.1, enterpriseValue: 3685500, ebitda: 405000 },
    { label: "After 4 acquisitions", multiple: 9.5, enterpriseValue: 3681250, ebitda: 387500 },
  ],
  description: "As a Small company with $420k revenue and $185k EBITDA, by acquiring 4 target(s) in the $84k-$168k revenue range, you can scale to Mid-Market tier and expand your valuation multiple from 5.0x to 12x.",
  risks: [
    "Integration risk — combining operations, systems, and cultures requires dedicated leadership.",
    "Customer retention risk — acquired customers may churn during transition.",
    "Financing risk — acquisitions require capital; structure debt carefully.",
    "Talent retention — key employees at the target may leave post-acquisition.",
  ],
  generatedAt: new Date().toISOString(),
};

const DEFAULT_VAL = {
  enterpriseValue: 925000,
  ebitda: 185000,
  ebitdaMarginPct: 22.0,
  currentMultiple: 5.0,
  multipleRange: { floor: 2, ceiling: 12 },
  multiplePercentile: 42,
  multipleDrivers: {
    ebitdaMargin: { score: 85, weight: 0.30, contribution: 25.5, detail: "22.0% margin" },
    revenueScale: { score: 50, weight: 0.20, contribution: 10.0, detail: "$420k revenue" },
    arHealth: { score: 60, weight: 0.15, contribution: 9.0, detail: "78.0% current" },
    techUtilization: { score: 60, weight: 0.10, contribution: 6.0, detail: "60.0% utilization" },
    integrationDensity: { score: 40, weight: 0.10, contribution: 4.0, detail: "1 integrations" },
    profitLeakage: { score: 60, weight: 0.15, contribution: 9.0, detail: "22.0% cost ratio" },
  },
  potentialAtMultiple: { "5x": 925000, "8x": 1480000, "10x": 1850000, "12x": 2220000 },
  upsidePotentialPct: 140,
  signals: [
    { type: "positive" as const, metric: "EBITDA Margin", message: "EBITDA margin is 22.0% — above the 15% institutional benchmark.", impact: "raises_multiple" },
    { type: "positive" as const, metric: "Revenue Scale", message: "Annualized revenue of $420k — qualifies for institutional-grade multiples.", impact: "raises_multiple" },
    { type: "negative" as const, metric: "AR Health", message: "78.0% of AR is current — collection risk present.", impact: "lowers_multiple" },
    { type: "info" as const, metric: "Tech Utilization", message: "Technician utilization at 60.0% — room for schedule optimization.", impact: "neutral" },
    { type: "info" as const, metric: "Data Integration", message: "1 data source connected — connect more sources for higher valuation confidence.", impact: "neutral" },
  ],
  generatedAt: new Date().toISOString(),
};

type ValuationData = typeof DEFAULT_VAL;

export default function AcquisitionPage() {
  const [scrolled, setScrolled] = useState(false);
  const [acq, setAcq] = useState<typeof DEFAULT_ACQ>(DEFAULT_ACQ);
  const [dil, setDil] = useState<typeof DEFAULT_DILIGENCE>(DEFAULT_DILIGENCE);
  const [val, setVal] = useState<ValuationData>(DEFAULT_VAL);
  const [rollup, setRollup] = useState<RollupData>(DEFAULT_ROLLUP);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    (async () => {
      const cid = "companyA";
      const [a, d, v, r] = await Promise.all([
        fetch("/api/acquisition/" + cid).then(r => r.json()).catch(() => DEFAULT_ACQ),
        fetch("/api/diligence/" + cid).then(r => r.json()).catch(() => DEFAULT_DILIGENCE),
        fetch("/api/enterprise-valuation/" + cid).then(r => r.json()).catch(() => DEFAULT_VAL),
        fetch("/api/rollup-advisor/" + cid).then(r => r.json()).catch(() => DEFAULT_ROLLUP),
      ]);
      setAcq(a); setDil(d); setVal(v); setRollup(r);
      setLoading(false);
    })();
  }, []);

  function driverColor(score: number) {
    return score >= 70 ? "text-emerald-400" : score >= 40 ? "text-amber-400" : "text-red-400";
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-slate-950/90 backdrop-blur-xl border-b border-white/5" : "bg-transparent"}`}>
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 text-sm font-bold text-slate-950">L</span>
            <span className="text-lg font-semibold text-white">Ledgera</span>
          </Link>
          <div className="flex items-center gap-6">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} className={`text-sm font-medium transition-colors ${link.href === "/analytics/acquisition" ? "text-white" : "text-slate-300 hover:text-white"}`}>{link.label}</Link>
            ))}
          </div>
        </nav>
      </header>

      <div className="pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-10">
            <h1 className="text-3xl font-semibold text-white mb-3">Enterprise Valuation & Acquisition Readiness</h1>
            <p className="max-w-2xl text-base text-slate-300">Real-time enterprise value computed from your connected operational data.</p>
          </div>

          {loading ? (
            <div className="space-y-6">
              {[1,2,3].map(i => (
                <div key={i} className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6 animate-pulse">
                  <div className="h-4 w-1/2 rounded bg-slate-800 mb-4" />
                  <div className="h-24 rounded bg-slate-800" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Enterprise Valuation Hero */}
              {val && (
                <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-sky-500/[0.08] to-white/[0.02] p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white">Live Enterprise Value</h2>
                      <p className="text-sm text-slate-400 mt-1">Updated {new Date(val.generatedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-white">{fmt(val.enterpriseValue)}</div>
                      <div className="text-sm text-slate-400 mt-1">{val.currentMultiple}x EBITDA &middot; {fmt(val.ebitda)} EBITDA</div>
                    </div>
                  </div>

                  {/* Multiple Range Bar */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span>2x ({fmt(val.ebitda * 2)})</span>
                      <span className="text-sky-300 font-semibold">{val.currentMultiple}x &mdash; {val.multiplePercentile}% of ceiling</span>
                      <span>12x ({fmt(val.ebitda * 12)})</span>
                    </div>
                    <div className="relative h-3 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-1000" style={{ width: `${val.multiplePercentile}%` }} />
                    </div>
                  </div>

                  {/* Multiple Drivers */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
                    {Object.entries(val.multipleDrivers).map(([key, driver]) => (
                      <div key={key} className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                          <span className={`text-sm font-bold ${driverColor(driver.score)}`}>{driver.score}/100</span>
                        </div>
                        <MultiBar val={driver.score} max={100} />
                        <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
                          <span>{driver.detail}</span>
                          <span>Weight: {(driver.weight * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Potential at Multiples */}
                  <div className="grid gap-3 sm:grid-cols-4 mb-6">
                    {Object.entries(val.potentialAtMultiple).map(([multiple, value]) => {
                      const isCurrent = parseFloat(multiple) === val.currentMultiple;
                      return (
                        <div key={multiple} className={`rounded-xl border p-4 text-center transition-all ${isCurrent ? "border-sky-400/40 bg-sky-400/10" : "border-white/10 bg-slate-900/30"}`}>
                          <div className="text-xs text-slate-400 mb-1">{isCurrent ? "Current" : "Target"}</div>
                          <div className="text-lg font-bold text-white">{fmt(value)}</div>
                          <div className="text-xs text-slate-500">{multiple}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Valuation Signals */}
                  <div className="rounded-xl border border-white/10 bg-slate-900/30 p-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Valuation Signals</h3>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {val.signals.map((s, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <span className={`mt-1 inline-flex h-2 w-2 shrink-0 rounded-full ${s.type === "positive" ? "bg-emerald-400" : s.type === "negative" ? "bg-red-400" : "bg-amber-400"}`} />
                          <span>{s.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {val.upsidePotentialPct > 0 && (
                    <div className="mt-4 rounded-xl border border-sky-400/20 bg-sky-400/5 p-4 text-center">
                      <span className="text-sm text-slate-300">Upside to top-of-range (12x): <span className="font-bold text-emerald-400">{val.upsidePotentialPct}%</span> &mdash; {fmt(val.ebitda * 12)} potential enterprise value</span>
                    </div>
                  )}
                </div>
              )}

              {/* Roll-Up Acquisition Strategy */}
              {rollup && (
                <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-emerald-500/[0.08] to-white/[0.02] p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white">Roll-Up Acquisition Strategy</h2>
                      <p className="text-sm text-slate-400 mt-1">Target recommendations based on your current profile</p>
                    </div>
                    <div className={`rounded-full border px-3 py-1 text-xs font-medium ${rollup.eligible ? "bg-emerald-400/10 text-emerald-200 border-emerald-400/20" : "bg-amber-400/10 text-amber-200 border-amber-400/20"}`}>
                      {rollup.eligible ? "Acquisition Ready" : "Build Fundamentals First"}
                    </div>
                  </div>

                  {rollup.eligible ? (
                    <>
                      <div className="grid gap-4 sm:grid-cols-3 mb-6">
                        <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4 text-center">
                          <div className="text-xs text-slate-400 mb-1">Client Tier</div>
                          <div className="text-lg font-bold text-white capitalize">{rollup.clientTier}</div>
                          <div className="text-xs text-slate-500">{fmt(rollup.clientRevenue)} revenue</div>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4 text-center">
                          <div className="text-xs text-slate-400 mb-1">Target Tier</div>
                          <div className="text-lg font-bold text-white capitalize">{rollup.targetTier}</div>
                          <div className="text-xs text-slate-500">{rollup.targetCount} acquisition{rollup.targetCount > 1 ? "s" : ""}</div>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4 text-center">
                          <div className="text-xs text-slate-400 mb-1">Target Revenue</div>
                          <div className="text-lg font-bold text-white">{fmt(rollup.recommendedTargetRevenue.min)} &ndash; {fmt(rollup.recommendedTargetRevenue.max)}</div>
                          <div className="text-xs text-slate-500">{rollup.synergySavingsPct}% synergy savings</div>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-4 mb-6">
                        <div className="rounded-xl border border-white/10 bg-slate-900/30 p-4">
                          <div className="text-xs text-slate-400 mb-1">Pro-Forma Revenue</div>
                          <div className="text-lg font-bold text-white">{fmt(rollup.proFormaRevenue)}</div>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-slate-900/30 p-4">
                          <div className="text-xs text-slate-400 mb-1">Pro-Forma EBITDA</div>
                          <div className="text-lg font-bold text-white">{fmt(rollup.proFormaEbitda)}</div>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-slate-900/30 p-4">
                          <div className="text-xs text-slate-400 mb-1">Combined EV</div>
                          <div className="text-lg font-bold text-white">{fmt(rollup.combinedEnterpriseValue)}</div>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-slate-900/30 p-4">
                          <div className="text-xs text-slate-400 mb-1">Combined Multiple</div>
                          <div className="text-lg font-bold text-emerald-400">{rollup.combinedMultiple}x</div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-slate-900/30 p-4 mb-6">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Multiple Expansion Trajectory</h3>
                        <div className="space-y-3">
                          {rollup.multipleTrajectory.map((point, i) => {
                            const pct = ((point.multiple - rollup.currentMultiple) / (rollup.ceilingAfterRollup - rollup.currentMultiple)) * 100;
                            return (
                              <div key={i} className="flex items-center gap-4">
                                <span className="w-40 text-xs text-slate-400 shrink-0">{point.label}</span>
                                <div className="flex-1 h-4 rounded-full bg-slate-800 overflow-hidden relative">
                                  <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all" style={{ width: `${Math.max(2, pct)}%` }} />
                                </div>
                                <span className="w-24 text-right text-sm font-bold text-white">{point.multiple}x</span>
                                <span className="w-28 text-right text-xs text-slate-400">{fmt(point.enterpriseValue)}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="rounded-xl border border-sky-400/20 bg-sky-400/5 p-4 text-center mb-4">
                        <span className="text-sm text-slate-300">Multiple ceiling achievable: <span className="font-bold text-emerald-400">{rollup.ceilingAfterRollup}x</span> &mdash; From {rollup.currentMultiple}x to {rollup.ceilingAfterRollup}x through strategic roll-up</span>
                      </div>

                      <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-300 mb-2">Risks & Considerations</h3>
                        <ul className="space-y-1">
                          {rollup.risks.map((risk, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                              <span className="mt-1.5 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                              {risk}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-xl border border-white/10 bg-slate-900/30 p-6 text-center">
                      <p className="text-sm text-slate-300">{rollup.eligibilityReason}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Bottom row: Acquisition Score + Diligence */}
              <div className="grid gap-8 lg:grid-cols-5">
                <div className="lg:col-span-2 space-y-6">
                  <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold text-white">Acquisition Score</h2>
                      <span className={`rounded-full border px-3 py-1 text-xs font-medium ${acq && acq.score >= 70 ? "bg-emerald-400/10 text-emerald-200 border-emerald-400/20" : "bg-amber-400/10 text-amber-200 border-amber-400/20"}`}>
                        {acq && acq.score >= 70 ? "Investor Ready" : "Needs Improvement"}
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-4">
                      {acq && <Gauge score={acq.score} />}
                      {acq && (
                        <>
                          <p className="text-center text-sm text-slate-300 leading-6">{acq.recommendation}</p>
                          <div className="w-full space-y-3 mt-4">
                            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Supporting Signals</h3>
                            {acq.signals.map((s, i) => (
                              <div key={i} className="flex items-start gap-3 rounded-xl border border-white/5 bg-slate-900/40 p-3">
                                <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-400/10 text-[11px] font-bold text-sky-300">{i + 1}</span>
                                <span className="text-sm text-slate-300">{s}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-3 space-y-6">
                  <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold text-white">Due Diligence Report</h2>
                      {dil && <span className="text-xs text-slate-400">Generated {new Date(dil.generatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>}
                    </div>
                    {dil && (
                      <>
                        <div className="mb-6 rounded-xl border border-white/10 bg-slate-900/40 p-4">
                          <p className="text-sm text-slate-300 leading-6">{dil.summary}</p>
                        </div>
                        <div className="space-y-4">
                          {dil.sections.map((section) => (
                            <div key={section.title} className="rounded-xl border border-white/10 bg-slate-900/30 p-5">
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-white">{section.title}</h3>
                                <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${riskColors[section.riskLevel]}`}>{section.riskLevel}</span>
                              </div>
                              <ul className="space-y-2">
                                {section.findings.map((f, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                    <span className="mt-1.5 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-slate-500" />
                                    {f}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="border-t border-white/5 bg-slate-950/70">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 lg:flex-row lg:px-10">
          <span className="text-sm text-slate-400">&copy; {new Date().getFullYear()} Ledgera Global Inc.</span>
          <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">Landing</Link>
        </div>
      </footer>
    </div>
  );
}
