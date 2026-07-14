import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { companyId: string } }) {
  const { companyId } = params;

  const data = {
    eligible: true,
    eligibilityReason: "Acquisition-ready with Small profile. A tuck-in strategy can accelerate to Mid-Market tier.",
    clientTier: "small",
    clientRevenue: 420000,
    clientEbitda: 185000,
    targetTier: "mid",
    recommendedTargetRevenue: { min: 84000, max: 168000 },
    recommendedTargetEbitda: { min: 8400, max: 42000 },
    targetCount: 4,
    proFormaRevenue: 924000,
    proFormaEbitda: 387500,
    proFormaEbitdaMarginPct: 41.9,
    synergySavingsPct: 15,
    combinedEnterpriseValue: 3681250,
    combinedMultiple: 9.5,
    currentMultiple: 5.0,
    multipleAfterFirstDeal: 7.5,
    multipleAfterRollup: 9.5,
    ceilingAfterRollup: 12,
    multipleTrajectory: [
      { label: "Current Standalone", multiple: 5.0, enterpriseValue: 925000, ebitda: 185000 },
      { label: "After 1 acquisition", multiple: 7.5, enterpriseValue: 2148750, ebitda: 286500 },
      { label: "After 2 acquisitions", multiple: 8.5, enterpriseValue: 3017500, ebitda: 355000 },
      { label: "After 3 acquisitions", multiple: 9.1, enterpriseValue: 3685500, ebitda: 405000 },
      { label: "After 4 acquisitions", multiple: 9.5, enterpriseValue: 3681250, ebitda: 387500 },
    ],
    description: "As a Small company with $420k revenue and $185k EBITDA, by acquiring 4 target(s) in the $84k-$168k revenue range, you can scale to Mid-Market tier and expand your valuation multiple from 5.0x to 12x.",
    risks: [
      "Integration risk — combining operations, systems, and cultures requires dedicated leadership.",
      "Customer retention risk — acquired customers may churn during transition.",
      "Financing risk — acquisitions require capital; structure debt carefully.",
      "Talent retention — key employees at the target may leave post-acquisition.",
    ],
    generatedAt: new Date().toISOString(),
  };

  return NextResponse.json(data);
}
