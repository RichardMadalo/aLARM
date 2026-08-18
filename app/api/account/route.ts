import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Fetch current state + settings for the logged-in user's account
export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const account = await prisma.riskAccount.findUnique({ where: { userId } });
  if (!account) return NextResponse.json({ error: "not found" }, { status: 404 });

  return NextResponse.json(account);
}

// Update settings from the dashboard (limits, toggles, manual lock)
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json();

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
  for (const k of allowed) if (k in body) data[k] = body[k];

  const account = await prisma.riskAccount.update({
    where: { userId },
    data,
  });
  return NextResponse.json(account);
}
