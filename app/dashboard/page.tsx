import ActionPanel from "../../components/ActionPanel";
import DashboardKpis from "../../components/DashboardKpis";
import InsightPanel from "../../components/InsightPanel";
import JobsTable from "../../components/JobsTable";
import LeadList from "../../components/LeadList";
import PipelineBar from "../../components/PipelineBar";
import ProfitLeakageFeed from "../../components/ProfitLeakageFeed";
import TechnicianPerformance from "../../components/TechnicianPerformance";

export default function Dashboard() {
  // MVP: keep owner experience consistent even before LeadList selection wiring exists.
  // (LossSpotlight already uses "companyA" demo behavior.)
  const companyId = "companyA";

  return (
    <div className="grid min-h-screen grid-cols-1 bg-slate-950 text-slate-100 lg:grid-cols-4">
      <aside className="border-b border-slate-800 bg-slate-900/70 p-4 lg:col-span-1 lg:border-b-0 lg:border-r">
        <LeadList />
      </aside>

      <main className="flex min-w-0 flex-col gap-6 p-6 lg:col-span-2">
        <DashboardKpis companyId={companyId} />
        <InsightPanel lead={{ companyId, company: "Apex HVAC" }} />
        <ProfitLeakageFeed companyId={companyId} />
        <JobsTable companyId={companyId} />
        <TechnicianPerformance companyId={companyId} />
      </main>

      <aside className="border-t border-slate-800 bg-slate-900/70 p-4 lg:col-span-1 lg:border-t-0 lg:border-l">
        <ActionPanel />
      </aside>

      <div className="border-t border-slate-800 bg-slate-900/80 px-4 py-3 lg:col-span-4">
        <PipelineBar />
      </div>
    </div>
  );
}
