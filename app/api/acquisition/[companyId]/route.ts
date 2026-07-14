import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { companyId: string } }) {
  const data = {
    score: 72,
    recommendation: "Strong acquisition candidate — healthy margins with moderate operational risk.",
    signals: [
      "Revenue growth above industry median",
      "Technician utilization at 82%",
      "AR aging below 30 days for 78% of outstanding",
      "EBITDA margin above 15% threshold",
    ],
  };
  return NextResponse.json(data);
}
