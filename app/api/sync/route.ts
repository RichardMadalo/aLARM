import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Called by the MT5 EA every ~10s.
// Body: live account state. Response: the settings the EA should enforce.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { pairingKey } = body;
  if (!pairingKey) return NextResponse.json({ error: "missing pairingKey" }, { status: 400 });

  const existing = await prisma.riskAccount.findUnique({ where: { pairingKey } });
  if (!existing) return NextResponse.json({ error: "unknown pairingKey" }, { status: 404 });

  const account = await prisma.riskAccount.update({
    where: { pairingKey },
    data: {
      balance: body.balance ?? existing.balance,
      equity: body.equity ?? existing.equity,
      dailyPL: body.dailyPL ?? existing.dailyPL,
      weeklyPL: body.weeklyPL ?? existing.weeklyPL,
      dailyLocked: body.dailyLocked ?? existing.dailyLocked,
      weeklyLocked: body.weeklyLocked ?? existing.weeklyLocked,
      lockReason: body.lockReason ?? existing.lockReason,
      accountLogin: body.accountLogin ?? existing.accountLogin,
      broker: body.broker ?? existing.broker,
      currency: body.currency ?? existing.currency,
      lastSyncAt: new Date(),
    },
  });

  // Everything the EA needs to enforce limits, in one response.
  return NextResponse.json({
    dailyLimitType: account.dailyLimitType,
    dailyLossLimit: account.dailyLossLimit,
    dailyProfitTarget: account.dailyProfitTarget,
    weeklyLimitType: account.weeklyLimitType,
    weeklyLossLimit: account.weeklyLossLimit,
    weeklyProfitTarget: account.weeklyProfitTarget,
    autoCloseOnBreach: account.autoCloseOnBreach,
    blockNewTrades: account.blockNewTrades,
    manualLock: account.manualLock,
  });
}
