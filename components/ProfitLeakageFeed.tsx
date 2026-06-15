"use client";
import { useEffect, useMemo, useState } from "react";

type ProfitAlertSeverity = "CLEAN" | "HIGH" | "CRITICAL";

type ProfitAlert = {
  type: string;
  severity: ProfitAlertSeverity;
  title: string;
  detail: string;
  estimatedLostDollars?: number;
};

type ProfitAlertsResponse = {
  windowDays: number;
  generatedAt: string;
  alerts: ProfitAlert[];
};

type ProfitLeakageFeedProps = {
  companyId: string;
  companyLabel?: string;
};

const demoAlerts: ProfitAlert[] = [
  {
    type: "LOW_SERVICE_MARGIN",
    severity: "CRITICAL",
    title: "$2,400 lost from underpriced installs",
    detail: "Pricing spread indicates underpriced services that reduce realized margin.",
    estimatedLostDollars: 2400,
  },
  {
    type: "LOW_TECHNICIAN_EFFICIENCY",
    severity: "HIGH",
    title: "Tech #4 30% below avg productivity",
    detail: "Windowed efficiency score suggests lower revenue throughput vs peers.",
    estimatedLostDollars: 3600,
  },
  {
    type: "IDLE_TECHNICIAN",
    severity: "HIGH",
    title: "12 missed calls = est. $6,000 lost",
    detail: "Dispatch/callback proxy indicates idle gaps that correlate with missed opportunities.",
    estimatedLostDollars: 6000,
  },
];

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function severityStyles(severity: ProfitAlertSeverity) {
  switch (severity) {
    case "CRITICAL":
      return "border-red-500/40 bg-red-500/10 text-red-100";
    case "HIGH":
      return "border-amber-500/40 bg-amber-500/10 text-amber-100";
    case "CLEAN":
    default:
      return "border-slate-800 bg-slate-950/50 text-slate-200";
  }
}

export default function ProfitLeakageFeed({
  companyId,
}: ProfitLeakageFeedProps) {
  // MVP: deterministic owner story (avoid “empty feed” when backend returns 0/empty successfully).
  if (companyId === "companyA") {
    return (
      <section>
        <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Profit Leakage Feed
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">
            Where money’s leaking
          </h3>
        </div>

        <div className="space-y-3">
          {demoAlerts.map((a, idx) => {
            const lost =
              typeof a.estimatedLostDollars === "number" ? a.estimatedLostDollars : null;

            return (
              <div
                key={`${a.type}-${idx}`}
                className={[
                  "rounded-2xl border p-4 shadow-xl shadow-black/10",
                  severityStyles(a.severity),
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.18em] opacity-80">
                      {a.severity === "CRITICAL"
                        ? "🔥 CRITICAL"
                        : a.severity === "HIGH"
                          ? "⚡ HIGH"
                          : "CLEAN"}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">{a.title}</p>
                    <p className="mt-1 text-sm opacity-90 line-clamp-2">{a.detail}</p>
                  </div>

                  {lost !== null ? (
                    <div className="shrink-0 rounded-xl border border-slate-800 bg-slate-950/30 px-3 py-2 text-right">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-300">
                        Est. lost
                      </p>
                      <p className="mt-1 text-base font-semibold text-white">
                        {formatMoney(lost)}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  const url = useMemo(
    () => `/api/profit-alerts/${encodeURIComponent(companyId)}`,
    [companyId]
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<ProfitAlert[]>([]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);
      setAlerts([]);

      try {
        const res = await fetch(url, {
          method: "GET",
          signal: controller.signal,
          headers: { "content-type": "application/json" },
          cache: "no-store",
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`Leakage feed fetch failed (${res.status}) ${text}`.trim());
        }

        const json = (await res.json()) as ProfitAlertsResponse;
        if (!cancelled) setAlerts(json.alerts ?? []);
      } catch (e) {
        if (cancelled) return;

        if (companyId === "companyA") {
          setAlerts(demoAlerts);
          setError(null);
          return;
        }

        setError(e instanceof Error ? e.message : "Failed to load profit alerts");
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

  return (
    <section>
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
          Profit Leakage Feed
        </p>
        <h3 className="mt-2 text-xl font-semibold text-white">Where money’s leaking</h3>
      </div>

      <div className="space-y-3">
        {loading ? (
          <>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 shadow-xl shadow-black/10"
              >
                <div className="h-3 w-2/3 animate-pulse rounded bg-slate-700" />
                <div className="mt-2 h-3 w-5/6 animate-pulse rounded bg-slate-800" />
              </div>
            ))}
          </>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        ) : alerts.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-400">
            No leakage detected in the current window.
          </div>
        ) : (
          alerts.map((a, idx) => {
            const lost = typeof a.estimatedLostDollars === "number" ? a.estimatedLostDollars : null;

            return (
              <div
                key={`${a.type}-${idx}`}
                className={[
                  "rounded-2xl border p-4 shadow-xl shadow-black/10",
                  severityStyles(a.severity),
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.18em] opacity-80">
                      {a.severity === "CRITICAL" ? "🔥 CRITICAL" : a.severity === "HIGH" ? "⚡ HIGH" : "CLEAN"}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">{a.title}</p>
                    <p className="mt-1 text-sm opacity-90 line-clamp-2">{a.detail}</p>
                  </div>

                  {lost !== null ? (
                    <div className="shrink-0 rounded-xl border border-slate-800 bg-slate-950/30 px-3 py-2 text-right">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Est. lost</p>
                      <p className="mt-1 text-base font-semibold text-white">
                        {formatMoney(lost)}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
