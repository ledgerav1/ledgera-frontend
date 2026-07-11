"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

type IntegrationStatus = "connected" | "not_connected" | "error" | "demo";

type Integration = {
  provider: string;
  label: string;
  description: string;
  category: string;
  status: IntegrationStatus;
};

const allIntegrations: Integration[] = [
  // Field Service
  { provider: "servicetitan", label: "ServiceTitan", description: "Field service management, job data, and technician scheduling", category: "field-service", status: "not_connected" },
  { provider: "housecall-pro", label: "Housecall Pro", description: "Dispatch, work orders, and customer management", category: "field-service", status: "not_connected" },
  { provider: "jobber", label: "Jobber", description: "Field service operations and client management", category: "field-service", status: "not_connected" },
  // Accounting
  { provider: "quickbooks", label: "QuickBooks Online", description: "General ledger, invoicing, and expense tracking", category: "accounting", status: "not_connected" },
  { provider: "xero", label: "Xero", description: "Cloud accounting and financial reporting", category: "accounting", status: "not_connected" },
  { provider: "netsuite", label: "NetSuite", description: "Enterprise accounting and ERP", category: "accounting", status: "not_connected" },
  // Payroll
  { provider: "gusto", label: "Gusto", description: "Payroll, benefits, and labor cost tracking", category: "payroll", status: "not_connected" },
  { provider: "adp", label: "ADP Workforce Now", description: "Enterprise payroll and HR management", category: "payroll", status: "not_connected" },
  { provider: "paychex", label: "Paychex Flex", description: "Payroll processing and labor data", category: "payroll", status: "not_connected" },
  // Payments
  { provider: "stripe", label: "Stripe", description: "Payment processing, invoice collection, and refunds", category: "payments", status: "demo" },
  { provider: "square", label: "Square", description: "Point of sale and payment processing", category: "payments", status: "not_connected" },
  // Scheduling
  { provider: "calendly", label: "Calendly", description: "Appointment scheduling and booking automation", category: "scheduling", status: "connected" },
  // Communications
  { provider: "twilio", label: "Twilio", description: "SMS, voice, and call tracking", category: "communications", status: "demo" },
  // CRM
  { provider: "hubspot", label: "HubSpot", description: "CRM, pipeline management, and lead scoring", category: "crm", status: "not_connected" },
  // Data Warehouse
  { provider: "bigquery", label: "BigQuery", description: "Data warehouse and analytics infrastructure", category: "data-warehouse", status: "not_connected" },
];

const backendProviders = new Set([
  "servicetitan", "quickbooks", "netsuite", "gusto", "adp", "paychex",
]);

const categoryLabels: Record<string, string> = {
  "field-service": "Field Service Management",
  "accounting": "Accounting & GL",
  "payroll": "Payroll",
  "payments": "Payments",
  "scheduling": "Scheduling & Booking",
  "communications": "Communications",
  "crm": "CRM",
  "data-warehouse": "Data & BI",
};

const statusColors: Record<IntegrationStatus, string> = {
  connected: "bg-emerald-400/10 text-emerald-200 border-emerald-400/20",
  demo: "bg-brand-400/10 text-brand-200 border-brand-400/20",
  not_connected: "bg-slate-800/50 text-slate-400 border-slate-700/30",
  error: "bg-red-400/10 text-red-200 border-red-400/20",
};

const statusLabels: Record<IntegrationStatus, string> = {
  connected: "Connected",
  demo: "Demo Active",
  not_connected: "Not Connected",
  error: "Error",
};

export default function IntegrationsPage() {
  const [scrolled, setScrolled] = useState(false);
  const [liveStatuses, setLiveStatuses] = useState<Record<string, IntegrationStatus> | null>(null);
  const companyId = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("companyId") || "companyA" : "companyA";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    fetch(`/api/integrations?companyId=${companyId}`)
      .then((r) => r.json())
      .then((data: Record<string, string>) => {
        const pruned: Record<string, IntegrationStatus> = {};
        for (const [provider, status] of Object.entries(data)) {
          if (status === "connected" || status === "not_connected" || status === "error") {
            pruned[provider] = status;
          }
        }
        setLiveStatuses(pruned);
      })
      .catch(() => setLiveStatuses({}));
  }, [companyId]);

  const integrations = allIntegrations.map((i) => {
    if (liveStatuses && backendProviders.has(i.provider) && liveStatuses[i.provider] !== undefined) {
      return { ...i, status: liveStatuses[i.provider] };
    }
    return i;
  });

  const connectedCount = integrations.filter((i) => i.status === "connected" || i.status === "demo").length;
  const totalCount = integrations.length;
  const categories = [...new Set(integrations.map((i) => i.category))];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Nav */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-slate-950/90 backdrop-blur-xl border-b border-white/5" : "bg-transparent"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 text-sm font-bold text-slate-950">L</span>
            <span className="text-lg font-semibold text-white">Ledgera</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Dashboard</Link>
            <Link href="/integrations" className="text-sm font-medium text-white transition-colors">Integrations</Link>
          </div>
        </nav>
      </header>

      {/* Main */}
      <div className="pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-6">
              <h1 className="text-3xl font-semibold text-white">Integrations</h1>
              <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-medium text-sky-200">
                {connectedCount}/{totalCount} active
              </span>
            </div>
            <p className="max-w-2xl text-base text-slate-300">
              Connect your existing tools to unlock the full Ledgera intelligence layer.
              Each integration feeds real operational data into our analysis engines.
            </p>
          </div>

          {/* Category sections */}
          <div className="space-y-12">
            {categories.map((category) => {
              const categoryIntegrations = integrations.filter((i) => i.category === category);
              return (
                <section key={category}>
                  <h2 className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                    {categoryLabels[category] || category}
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {categoryIntegrations.map((integration) => (
                      <div
                        key={integration.provider}
                        className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 hover:border-white/20 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <h3 className="text-lg font-semibold text-white">{integration.label}</h3>
                          <span
                            className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${statusColors[integration.status]}`}
                          >
                            {statusLabels[integration.status]}
                          </span>
                        </div>
                        <p className="text-sm leading-6 text-slate-400">{integration.description}</p>
                        <div className="mt-4 flex items-center gap-3">
                          {integration.status === "not_connected" ? (
                            <button
                              onClick={() => {
                                window.location.href = `/api/oauth/connect/${integration.provider}?companyId=${companyId}`;
                              }}
                              className="rounded-full bg-sky-500/90 px-4 py-1.5 text-xs font-medium text-slate-950 transition-all hover:bg-sky-400 hover:scale-[1.02]"
                            >
                              Connect &rarr;
                            </button>
                          ) : integration.status === "demo" ? (
                            <span className="rounded-full border border-sky-400/15 bg-sky-400/5 px-4 py-1.5 text-xs font-medium text-sky-300">
                              Demo data active
                            </span>
                          ) : (
                            <span className="rounded-full border border-emerald-400/15 bg-emerald-400/5 px-4 py-1.5 text-xs font-medium text-emerald-300">
                              Live connection
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
