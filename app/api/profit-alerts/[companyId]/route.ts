import fs from "node:fs";
import jwt from "jsonwebtoken";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

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

function parseEnvFile(filePath: string): Record<string, string> {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const out: Record<string, string> = {};
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      const value = trimmed.slice(idx + 1).trim();
      out[key] = value.replace(/^"(.*)"$/, "$1");
    }
    return out;
  } catch {
    return {};
  }
}

function getJwtSecret(): string | null {
  const direct = process.env.JWT_SECRET;
  if (direct && typeof direct === "string" && direct.length > 0) return direct;

  const candidates = [
    path.resolve(process.cwd(), "ledgera-backend", ".env"),
    path.resolve(process.cwd(), "..", "ledgera-backend", ".env"),
    path.resolve(process.cwd(), "..", "..", "ledgera-backend", ".env"),
  ];

  for (const candidate of candidates) {
    const env = parseEnvFile(candidate);
    const jwtSecret = env.JWT_SECRET;
    if (jwtSecret && typeof jwtSecret === "string" && jwtSecret.length > 0) return jwtSecret;
  }

  return null;
}

export async function GET(
  req: NextRequest,
  context: { params: { companyId: string } }
) {
  const companyId = context.params.companyId;

  const jwtSecret = getJwtSecret();
  if (!jwtSecret) {
    return NextResponse.json(
      { error: "Missing JWT_SECRET. Provide it to the Next app runtime." },
      { status: 500 }
    );
  }

  const backendUrl =
    process.env.LEDGERA_BACKEND_URL && process.env.LEDGERA_BACKEND_URL.length > 0
      ? process.env.LEDGERA_BACKEND_URL
      : "http://localhost:4000";

  const token = jwt.sign(
    { sub: companyId, email: "ui@ledgera.local", role: "user" },
    jwtSecret,
    { algorithm: "HS256" }
  );

  const url = `${backendUrl}/analytics/${companyId}/profit-alerts?windowDays=30`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return NextResponse.json(
      {
        error: "Backend profit-alerts fetch failed",
        status: res.status,
        detail: text,
      },
      { status: res.status }
    );
  }

  const data = (await res.json()) as ProfitAlertsResponse;
  return NextResponse.json(data, { status: 200 });
}
