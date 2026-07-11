import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.LEDGERA_BACKEND_URL || "http://localhost:4000";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;

  // Read companyId from query param (set by the client-side button handler)
  const companyId = request.nextUrl.searchParams.get("companyId") || "companyA";

  // Map friendly names to backend provider IDs
  const providerMap: Record<string, string> = {
    "servicetitan": "servicetitan",
    "quickbooks": "quickbooks",
    "gusto": "gusto",
  };

  const backendProvider = providerMap[provider] || "servicetitan";
  const backendUrl = `${BACKEND_URL}/oauth/${backendProvider}/connect/${companyId}`;

  // Redirect the user to the backend OAuth flow
  return NextResponse.redirect(backendUrl);
}
