"use client";
import { useEffect, useMemo, useState } from "react";

type CashFlowResponse = {
  cashIn: number;
  cashOut: number;
  realCashFlow: number;
};

type LeakageScoreResponse = {
  score: number;
  signal: string;
  totalLeakage: number;
  breakdown: {
    uncollectedRevenue: number;
    underpricedServices: number;
    laborInefficiency: number;
  };
};

type LossSpotlightProps = {
  companyId: string;
  companyLabel?: string;
  lossThresholdDollars?: number; // default: 10_000
  countdownSeconds?: number; // default: 60
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function LossSpotlight({
  companyId,
  companyLabel,
  lossThresholdDollars = 10_000,
  countdownSeconds = 60,
}: LossSpotlightProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [cashFlow, setCashFlow] = useState<CashFlowResponse | null>(null);
  const [leakage, setLeakage] = useState<LeakageScoreResponse | null>(null);

  const [triggered, setTriggered] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(countdownSeconds);

  const netLossDollars = useMemo(() => {
    const n = cashFlow?.realCashFlow ?? 0;
    return n < 0 ? Math.abs(n) : 0;
  }, [cashFlow]);

  const isLossOverThreshold =
    (cashFlow?.realCashFlow ?? 0) <= -Math.abs(lossThresholdDollars);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const fetchTimeoutMs = 2500;

    async function fetchJsonWithTimeout(url: string): Promise<{
      ok: boolean;
      status: number;
      json?: unknown;
    }> {
      const timeoutController = new AbortController();
      const timeout = setTimeout(() => timeoutController.abort(), fetchTimeoutMs);

      try {
        const res = await fetch(url, {
          method: "GET",
          signal: timeoutController.signal,
          headers: { "content-type": "application/json" },
          cache: "no-store",
        });

        const text = await res.text().catch(() => "");
        let parsed: unknown = undefined;
        if (text) {
          try {
            parsed = JSON.parse(text);
          } catch {
            // ignore parse failures; just keep undefined
          }
        }

        return { ok: res.ok, status: res.status, json: parsed };
      } finally {
        clearTimeout(timeout);
      }
    }

    const demoCashFlow: CashFlowResponse = {
      cashIn: 120000,
      cashOut: 132000,
      realCashFlow: -12000,
    };

    const demoLeakage: LeakageScoreResponse = {
      score: 33,
      signal: "HIGH",
      totalLeakage: 25000,
      breakdown: {
        uncollectedRevenue: 14000,
        underpricedServices: 6000,
        laborInefficiency: 5000,
      },
    };

    async function load() {
      setLoading(true);
      setError(null);
      setCashFlow(null);
      setLeakage(null);

      const cashUrl = `/api/cash-flow/${encodeURIComponent(companyId)}`;
      const leakageUrl = `/api/leakage-score/${encodeURIComponent(companyId)}`;

      try {
        const [cashResult, leakageResult] = await Promise.allSettled([
          fetchJsonWithTimeout(cashUrl),
          fetchJsonWithTimeout(leakageUrl),
        ]);

        if (cancelled) return;

        const cashOk =
          cashResult.status === "fulfilled" &&
          cashResult.value.ok &&
          cashResult.value.json &&
          typeof (cashResult.value.json as CashFlowResponse).realCashFlow === "number";

        const leakageOk =
          leakageResult.status === "fulfilled" &&
          leakageResult.value.ok &&
          leakageResult.value.json &&
          typeof (leakageResult.value.json as LeakageScoreResponse).totalLeakage === "number";

        if (cashOk) {
          setCashFlow(cashResult.value.json as CashFlowResponse);
        } else if (companyId === "companyA") {
          // Demo fallback so the contractor story always shows up ~60s
          setCashFlow(demoCashFlow);
          setError(null);
        } else {
          setError("Couldn’t load cash-flow data for this company (backend may be unavailable).");
        }

        if (leakageOk) {
          setLeakage(leakageResult.value.json as LeakageScoreResponse);
        } else if (companyId === "companyA") {
          setLeakage(demoLeakage);
        }
      } catch (e) {
        if (cancelled) return;
        if (companyId === "companyA") {
          setCashFlow(demoCashFlow);
          setLeakage(demoLeakage);
          setError(null);
          return;
        }
        setError(e instanceof Error ? e.message : "Failed to load loss spotlight");
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

  useEffect(() => {
    if (loading) return;

    if (!isLossOverThreshold) {
      setTriggered(false);
      setSecondsLeft(countdownSeconds);
      return;
    }

    setTriggered(true);
    setSecondsLeft(countdownSeconds);

    const startAt = Date.now();

    const tick = () => {
      const elapsedSeconds = Math.floor((Date.now() - startAt) / 1000);
      const next = Math.max(0, countdownSeconds - elapsedSeconds);
      setSecondsLeft(next);
    };

    tick();
    const interval = setInterval(tick, 250);

    return () => clearInterval(interval);
  }, [loading, isLossOverThreshold, countdownSeconds]);

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
          Contractor Spotlight
        </p>
        <p className="mt-2 text-sm text-slate-300">Analyzing loss signals…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-500/40 bg-red-500/10 p-6 shadow-xl shadow-black/20">
        <p className="text-xs uppercase tracking-[0.24em] text-red-200">
          Contractor Spotlight
        </p>
        <p className="mt-2 text-sm text-red-200">{error}</p>
      </div>
    );
  }

  if (!isLossOverThreshold) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
          Contractor Spotlight
        </p>
        <h3 className="mt-2 text-lg font-semibold text-white">
          No ≥ {formatMoney(lossThresholdDollars)} loss detected
        </h3>
        <p className="mt-2 text-sm text-slate-400">
          Net cash flow: {cashFlow ? formatMoney(cashFlow.realCashFlow) : "—"}
        </p>
      </div>
    );
  }

  const showDetail = triggered && secondsLeft === 0;

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Contractor Spotlight
          </p>
          <h3 className="mt-2 text-lg font-semibold text-white">
            {companyLabel ?? "Selected Company"} is losing {formatMoney(netLossDollars)}+
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            Detected loss signals from cash-flow + leakage model.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-2">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Countdown</p>
          <p className="mt-1 text-2xl font-semibold text-red-200">
            {showDetail ? "Now" : `${secondsLeft}s`}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Uncollected revenue</p>
          <p className="mt-2 text-xl font-semibold text-white">
            {leakage ? formatMoney(leakage.breakdown.uncollectedRevenue) : "—"}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            {showDetail ? "Collections lag" : "Loading details…"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
            Underpriced services
          </p>
          <p className="mt-2 text-xl font-semibold text-white">
            {leakage ? formatMoney(leakage.breakdown.underpricedServices) : "—"}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            {showDetail ? "Margin leakage" : "Loading details…"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Labor inefficiency</p>
          <p className="mt-2 text-xl font-semibold text-white">
            {leakage ? formatMoney(leakage.breakdown.laborInefficiency) : "—"}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            {showDetail ? "Negative profit jobs" : "Loading details…"}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
        <p className="text-sm text-slate-300">
          Leakage model signal:{" "}
          <span className="font-semibold text-slate-100">{leakage?.signal ?? "—"}</span>
          {leakage ? ` (score ${leakage.score})` : ""}
        </p>

        <div className="mt-3 h-px w-full bg-slate-800" />

        <p className="mt-3 text-sm text-slate-400 leading-6">
          {showDetail
            ? "In under a minute, hand your contractor these three levers: collections, pricing, and labor efficiency—then route each lever into a recovery action."
            : "Preparing the contractor handoff… details will appear when the countdown finishes."}
        </p>
      </div>
    </div>
  );
}
