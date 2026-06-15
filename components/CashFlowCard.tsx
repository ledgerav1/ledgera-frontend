"use client";
import { useEffect, useState } from "react";

export type CashFlowResponse = {
  cashIn: number;
  cashOut: number;
  realCashFlow: number;
};

type CashFlowCardProps = {
  companyId: string;
  companyLabel?: string;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CashFlowCard({ companyId, companyLabel }: CashFlowCardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CashFlowResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);
      setData(null);

      try {
        const res = await fetch(`/api/cash-flow/${encodeURIComponent(companyId)}`, {
          method: "GET",
          signal: controller.signal,
          headers: { "content-type": "application/json" },
          cache: "no-store",
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`Cash flow fetch failed (${res.status}) ${text}`.trim());
        }

        const json = (await res.json()) as CashFlowResponse;

        if (!cancelled) setData(json);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load cash flow");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [companyId]);

  const netIsNegative = (data?.realCashFlow ?? 0) < 0;

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Cash Flow</p>
          <h3 className="mt-2 text-lg font-semibold text-white">
            {companyLabel ?? "Selected Company"}
          </h3>
          <p className="mt-1 text-sm text-slate-400">Collections vs cash out (MVP)</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-2">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Real Cash Flow</p>
          <p
            className={[
              "mt-1 text-2xl font-semibold",
              netIsNegative ? "text-red-300" : "text-emerald-300",
            ].join(" ")}
          >
            {loading ? "—" : data ? formatMoney(data.realCashFlow) : "—"}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Cash In</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {loading ? "—" : data ? formatMoney(data.cashIn) : "—"}
          </p>
          <p className="mt-1 text-sm text-slate-400">Recovered payments</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Cash Out</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {loading ? "—" : data ? formatMoney(data.cashOut) : "—"}
          </p>
          <p className="mt-1 text-sm text-slate-400">Payroll + job + QB non-payroll</p>
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
          <p className="font-semibold">Couldn’t load cash flow</p>
          <p className="mt-1 break-words">{error}</p>
        </div>
      ) : null}
    </div>
  );
}
