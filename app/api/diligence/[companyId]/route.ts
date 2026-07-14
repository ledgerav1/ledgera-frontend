import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { companyId: string } }) {
  const { companyId } = params;
  const data = {
    companyId: companyId,
    generatedAt: new Date().toISOString(),
    summary: "Operational due diligence indicates moderate risk concentration in labor efficiency and AR aging.",
    sections: [
      { title: "Financial Health", findings: ["Revenue trending up 18% YoY", "Net margin at 22%, above industry benchmark of 15%", "EBITDA margin stable at 16%"], riskLevel: "LOW" },
      { title: "Operations", findings: ["Technician utilization at 74% — below 85% target", "Average job duration 3.2 hours vs 2.8 benchmark", "Dispatch inefficiency detected in 12% of jobs"], riskLevel: "MODERATE" },
      { title: "Accounts Receivable", findings: ["22% of AR is beyond 60 days", "No automated collection process", "Concentration risk: top 3 customers = 45% of outstanding"], riskLevel: "HIGH" },
      { title: "Compliance & Contracts", findings: ["All vendor agreements current", "Worker classification reviewed — no red flags", "Insurance coverage adequate for operational scale"], riskLevel: "LOW" },
    ],
  };
  return NextResponse.json(data);
}
