import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { companyId: string } }) {
  const { companyId } = params;

  // Demo fallback data
  const data = {
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

  return NextResponse.json(data);
}
