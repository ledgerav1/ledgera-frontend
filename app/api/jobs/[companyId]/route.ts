import fs from "node:fs";
import jwt from "jsonwebtoken";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

type Technician = {
  id: string;
  name: string;
} | null;

type ServiceType = {
  name: string;
} | null;

type JobRowFromBackend = {
  id: string;
  invoicedAmount: number;
  cashCollected: number;
  laborCost: number;
  materialCost: number;

  technicianId: string | null;
  technician: Technician;

  serviceTypeId: string | null;
  serviceType: ServiceType;

  startedAt: string | null; // Date serialized by fetch/JSON
  completedAt: string;

  createdAt: string;
};

type JobRowForTable = {
  jobId: string;
  revenue: number; // using cashCollected as "Revenue"
  cost: number; // labor + material
  profit: number;
  technician: string;
  durationHours: number | null;
  durationText: string | null;
};

type JobsResponse = {
  jobs: JobRowForTable[];
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

function formatDurationHours(hours: number): string {
  // Keep it simple for MVP: "Xh Ym"
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 60) return `${h + 1}h 0m`;
  return `${h}h ${m}m`;
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

  const url = `${backendUrl}/jobs`;

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
        error: "Backend jobs fetch failed",
        status: res.status,
        detail: text,
      },
      { status: res.status }
    );
  }

  const jobs = (await res.json()) as JobRowFromBackend[];

  const mapped: JobRowForTable[] = jobs.map((job) => {
    const revenue = typeof job.cashCollected === "number" ? job.cashCollected : 0;
    const labor = typeof job.laborCost === "number" ? job.laborCost : 0;
    const material = typeof job.materialCost === "number" ? job.materialCost : 0;
    const cost = labor + material;
    const profit = revenue - cost;

    const technician = job.technician?.name ?? "Unassigned";

    const startedAtMs = job.startedAt ? new Date(job.startedAt).getTime() : null;
    const completedAtMs = job.completedAt ? new Date(job.completedAt).getTime() : null;

    let durationHours: number | null = null;
    let durationText: string | null = null;

    if (startedAtMs && completedAtMs && Number.isFinite(startedAtMs) && Number.isFinite(completedAtMs)) {
      const ms = completedAtMs - startedAtMs;
      if (Number.isFinite(ms) && ms > 0) {
        const hours = ms / (1000 * 60 * 60);
        durationHours = Number(hours.toFixed(2));
        durationText = formatDurationHours(durationHours);
      }
    }

    return {
      jobId: job.id,
      revenue,
      cost,
      profit,
      technician,
      durationHours,
      durationText,
    };
  });

  return NextResponse.json({ jobs: mapped } satisfies JobsResponse, { status: 200 });
}
