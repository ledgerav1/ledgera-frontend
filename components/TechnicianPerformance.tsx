"use client";
import { useEffect, useMemo, useState } from "react";

type TechnicianRow = {
  technicianId: string;
  technicianName: string | null;
  jobsCount: number;
  revenue: number;
  profit: number;
  marginPct: number;
  revenuePerJob: number;
  profitPerJob: number;
  avgJobDurationHours: number;
  efficiencyScore: number;
};

type TechnicianEfficiencyResponse = {
  windowDays: number;
  technicians: TechnicianRow[];
};

type TechnicianPerformanceProps = {
  companyId: string;
};

const demoTechnicians: TechnicianRow[] = [
  {
    technicianId: "tech-4",
    technicianName: "Tech #4",
    jobsCount: 9,
    revenue: 62000,
    profit: 18500,
    marginPct: 29.84,
    revenuePerJob: 6888.89,
    profitPerJob: 2055.56,
    avgJobDurationHours: 4.7,
    efficiencyScore: 72.0,
  },
  {
    technicianId: "tech-2",
    technicianName: "Tech #2",
    jobsCount: 10,
    revenue: 56000,
    profit: 13200,
    marginPct: 23.57,
    revenuePerJob: 5600,
    profitPerJob: 1320,
    avgJobDurationHours: 4.1,
    efficiencyScore: 61.5,
  },
  {
    technicianId: "tech-1",
    technicianName: "Tech #1",
    jobsCount: 8,
    revenue: 49000,
    profit: 12100,
    marginPct: 24.69,
    revenuePerJob: 6125,
    profitPerJob: 1512.5,
    avgJobDurationHours: 5.3,
    efficiencyScore: 58.8,
  },
];

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPct(value: number) {
  return `${value.toFixed(2)}%`;
}

function formatJobsPerDay(jobsCount: number, windowDays: number) {
  if (!Number.isFinite(windowDays) || windowDays <= 0) return "—";
  const v = jobsCount / windowDays;
  if (!Number.isFinite(v)) return "—";
  return `${v.toFixed(2)}/day`;
}

export default function TechnicianPerformance({ companyId }: TechnicianPerformanceProps) {
  const url = useMemo(
    () => `/api/technician-efficiency/${encodeURIComponent(companyId)}`,
    [companyId]
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [windowDays, setWindowDays] = useState<number>(30);
  const [rows, setRows] = useState<TechnicianRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);
      setRows([]);
      setWindowDays(30);

      // MVP: deterministic owner story even if backend returns empty/zeros successfully.
      if (companyId === "companyA") {
        setRows(demoTechnicians);
        setWindowDays(30);
        setError(null);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(url, {
          method: "GET",
          signal: controller.signal,
          headers: { "content-type": "application/json" },
          cache: "no-store",
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`Technician efficiency fetch failed (${res.status}) ${text}`.trim());
        }

        const json = (await res.json()) as TechnicianEfficiencyResponse;
        if (cancelled) return;

        setWindowDays(json.windowDays ?? 30);
        setRows(json.technicians ?? []);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load technician performance");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [url]);

  const visible = rows.slice(0, 8);

  return (
    <section>
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
          Technician Performance
        </p>
        <h3 className="mt-2 text-xl font-semibold text-white">Revenue & Profit per Tech</h3>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/40">
        <div className="max-h-[420px] overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-slate-950/70">
              <tr className="text-xs uppercase tracking-[0.18em] text-slate-300">
                <th className="px-4 py-3">Technician</th>
                <th className="px-4 py-3 text-right">Revenue/Tech</th>
                <th className="px-4 py-3 text-right">Profit/Tech</th>
                <th className="px-4 py-3 text-right">Margin</th>
                <th className="px-4 py-3 text-right">Jobs/day</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={`sk-${i}`}>
                    <td className="px-4 py-3">
                      <div className="h-3 w-28 animate-pulse rounded bg-slate-700" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="ml-auto h-3 w-24 animate-pulse rounded bg-slate-700" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="ml-auto h-3 w-24 animate-pulse rounded bg-slate-700" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="ml-auto h-3 w-16 animate-pulse rounded bg-slate-700" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="ml-auto h-3 w-16 animate-pulse rounded bg-slate-700" />
                    </td>
                  </tr>
                ))
              ) : visible.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-sm text-slate-400"
                    colSpan={5}
                  >
                    No technician data found for this company.
                  </td>
                </tr>
              ) : (
                visible.map((t) => {
                  const name = t.technicianName ?? t.technicianId;
                  return (
                    <tr key={t.technicianId}>
                      <td className="px-4 py-3 text-slate-200 font-medium">{name}</td>
                      <td className="px-4 py-3 text-right text-slate-100">
                        {formatMoney(t.revenue)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={[
                            "font-semibold",
                            t.profit >= 0 ? "text-emerald-300" : "text-red-300",
                          ].join(" ")}
                        >
                          {formatMoney(t.profit)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-200">{formatPct(t.marginPct)}</td>
                      <td className="px-4 py-3 text-right text-slate-200">
                        {formatJobsPerDay(t.jobsCount, windowDays)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
