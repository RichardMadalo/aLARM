import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Create a new paired account (called once, first time the dashboard is opened)
export async function POST() {
  const account = await prisma.riskAccount.create({ data: {} });
  return NextResponse.json(account);
}

// Fetch current state + settings for the dashboard
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (!key) return NextResponse.json({ error: "missing key" }, { status: 400 });

  const account = await prisma.riskAccount.findUnique({ where: { pairingKey: key } });
  if (!account) return NextResponse.json({ error: "not found" }, { status: 404 });

  return NextResponse.json(account);
}

// Update settings from the dashboard (limits, toggles, manual lock)
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { pairingKey, ...fields } = body;
  if (!pairingKey) return NextResponse.json({ error: "missing pairingKey" }, { status: 400 });

  const allowed = [
    "label",
    "dailyLimitType",
    "dailyLossLimit",
    "dailyProfitTarget",
    "weeklyLimitType",
    "weeklyLossLimit",
    "weeklyProfitTarget",
    "autoCloseOnBreach",
    "blockNewTrades",
    "manualLock",
  ];
  const data: Record<string, unknown> = {};
  for (const k of allowed) if (k in fields) data[k] = fields[k];

  const account = await prisma.riskAccount.update({
    where: { pairingKey },
    data,
  });
  return NextResponse.json(account);
}
