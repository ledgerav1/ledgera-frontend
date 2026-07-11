import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.LEDGERA_BACKEND_URL || "http://localhost:4000";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  // Proxy the callback to the backend
  const backendUrl = new URL(`${BACKEND_URL}/oauth/gusto/callback`);
  if (code) backendUrl.searchParams.set("code", code);
  if (state) backendUrl.searchParams.set("state", state);

  try {
    const response = await fetch(backendUrl.toString(), {
      method: "GET",
      redirect: "manual",
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (location) {
        return NextResponse.redirect(location);
      }
    }

    const text = await response.text();
    if (response.ok) {
      return NextResponse.redirect(new URL("/integrations?connected=gusto", request.url).toString());
    }

    console.error("[gusto/callback] Backend error:", response.status, text);
    return NextResponse.redirect(
      new URL("/integrations?error=gusto_connect_failed", request.url).toString()
    );
  } catch (err) {
    console.error("[gusto/callback] Failed to proxy to backend:", err);
    return NextResponse.redirect(
      new URL("/integrations?error=gusto_connect_failed", request.url).toString()
    );
  }
}
