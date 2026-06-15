"use client";
import { useEffect, useMemo, useState } from "react";

type DashboardMetrics = {
  windowDays: number;
  totalRevenue: number;
  totalProfit: number;
  avgMarginPct: number;
  moneyLeakedThisWeek: number;
};

type DashboardKpisProps = {
  companyId: string;
};

const demoMetrics: DashboardMetrics = {
  windowDays: 30,
  totalRevenue: 125000,
  totalProfit: 31250,
  avgMarginPct: 25.0,
  moneyLeakedThisWeek: 12000,
};

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

export default function DashboardKpis({ companyId }: DashboardKpisProps) {
  if (companyId === "companyA") {
    const data = demoMetrics;
    const marginIsGood = (data?.avgMarginPct ?? 0) >= 25;

    return (
      <section>
        <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Dashboard</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Your Money-Maker</h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-black/20">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Total Revenue</p>
            <p className="mt-2 text-2xl font-semibold text-white">{formatMoney(data.totalRevenue)}</p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-black/20">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Total Profit</p>
            <p
              className={[
                "mt-2 text-2xl font-semibold",
                data.totalProfit < 0 ? "text-red-300" : "text-emerald-300",
              ].join(" ")}
            >
              {formatMoney(data.totalProfit)}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-black/20">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Avg Margin</p>
            <p
              className={[
                "mt-2 text-2xl font-semibold",
                marginIsGood ? "text-emerald-300" : "text-amber-200",
              ].join(" ")}
            >
              {formatPct(data.avgMarginPct)}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-black/20">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Money Leaked This Week</p>
            <p className="mt-2 text-2xl font-semibold text-red-200">
              {formatMoney(data.moneyLeakedThisWeek)}
            </p>
            <p className="mt-1 text-sm text-slate-400">Estimated from low-profit job patterns.</p>
          </div>
        </div>
      </section>
    );
  }

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardMetrics | null>(null);

  const url = useMemo(
    () => `/api/dashboard-metrics/${encodeURIComponent(companyId)}`,
    [companyId]
  );

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);
      setData(null);

      try {
        const res = await fetch(url, {
          method: "GET",
          signal: controller.signal,
          headers: { "content-type": "application/json" },
          cache: "no-store",
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`Failed to load dashboard metrics (${res.status}) ${text}`.trim());
        }

        const json = (await res.json()) as DashboardMetrics;
        if (!cancelled) setData(json);
      } catch (e) {
        if (cancelled) return;

        if (companyId === "companyA") {
          setData(demoMetrics);
          setError(null);
          return;
        }

        setError(e instanceof Error ? e.message : "Failed to load dashboard metrics");
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

  const marginIsGood = (data?.avgMarginPct ?? 0) >= 25;

  return (
    <section>
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Dashboard</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Your Money-Maker</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-black/20">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
            Total Revenue
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {loading ? "—" : data ? formatMoney(data.totalRevenue) : "—"}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-black/20">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
            Total Profit
          </p>
          <p
            className={[
              "mt-2 text-2xl font-semibold",
              loading
                ? "text-slate-100"
                : data && data.totalProfit < 0
                  ? "text-red-300"
                  : "text-emerald-300",
            ].join(" ")}
          >
            {loading ? "—" : data ? formatMoney(data.totalProfit) : "—"}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-black/20">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Avg Margin</p>
          <p
            className={[
              "mt-2 text-2xl font-semibold",
              loading ? "text-slate-100" : marginIsGood ? "text-emerald-300" : "text-amber-200",
            ].join(" ")}
          >
            {loading ? "—" : data ? formatPct(data.avgMarginPct) : "—"}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-black/20">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
            Money Leaked This Week
          </p>
          <p className="mt-2 text-2xl font-semibold text-red-200">
            {loading ? "—" : data ? formatMoney(data.moneyLeakedThisWeek) : "—"}
          </p>
          <p className="mt-1 text-sm text-slate-400">Estimated from low-profit job patterns.</p>
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      ) : null}
    </section>
  );
}
