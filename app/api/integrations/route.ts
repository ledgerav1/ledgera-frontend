import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.LEDGERA_BACKEND_URL || "http://localhost:4000";

/**
 * GET /api/integrations
 *
 * Proxies to the Express backend to get real integration connection statuses
 * for the specified company.
 *
 * Returns a map of provider -> status, e.g.:
 * { "quickbooks": "connected", "servicetitan": "not_connected", ... }
 *
 * Gracefully falls back to empty object if backend is unreachable,
 * allowing the client-side UI to display hardcoded defaults.
 */
export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get("companyId") || "companyA";

  if (!BACKEND_URL) {
    return NextResponse.json({});
  }

  try {
    const response = await fetch(`${BACKEND_URL}/integrations/status/${companyId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.warn(`[integrations/api] Backend returned ${response.status}: ${text}`);
      return NextResponse.json({});
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.warn("[integrations/api] Failed to fetch from backend, returning empty:", err);
    return NextResponse.json({});
  }
}
