"use client";

import { useEffect, useState, useCallback } from "react";
import { signOut } from "next-auth/react";

type Account = {
  pairingKey: string;
  label: string;
  dailyLimitType: string;
  dailyLossLimit: number;
  dailyProfitTarget: number;
  weeklyLimitType: string;
  weeklyLossLimit: number;
  weeklyProfitTarget: number;
  autoCloseOnBreach: boolean;
  blockNewTrades: boolean;
  manualLock: boolean;
  balance: number | null;
  equity: number | null;
  dailyPL: number | null;
  weeklyPL: number | null;
  dailyLocked: boolean;
  weeklyLocked: boolean;
  lockReason: string | null;
  accountLogin: string | null;
  broker: string | null;
  currency: string | null;
  lastSyncAt: string | null;
};

const OK = "#28b463";
const WARN = "#f1c40f";
const DANGER = "#e74c3c";
const CARD_BG = "#15161d";
const BORDER = "#232430";

function fmt(n: number | null | undefined) {
  if (n === null || n === undefined) return "—";
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function barColor(frac: number) {
  if (frac >= 1) return DANGER;
  if (frac >= 0.7) return WARN;
  return OK;
}

export default function Dashboard() {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [form, setForm] = useState<Partial<Account>>({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/account");
    if (res.ok) {
      const data = await res.json();
      setAccount(data);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await load();
      setLoading(false);
    })();
  }, [load]);

  // poll every 4s
  useEffect(() => {
    if (!account) return;
    const id = setInterval(() => load(), 4000);
    return () => clearInterval(id);
  }, [account, load]);

  useEffect(() => {
    if (account) setForm(account);
  }, [account?.pairingKey]);

  async function saveSettings() {
    if (!account) return;
    setSaving(true);
    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = await res.json();
      setAccount(data);
      setShowSettings(false);
    }
    setSaving(false);
  }

  async function toggleManualLock() {
    if (!account) return;
    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ manualLock: !account.manualLock }),
    });
    if (res.ok) setAccount(await res.json());
  }

  if (loading) return <Centered>Loading…</Centered>;
  if (!account) return <Centered>Could not load account.</Centered>;

  const locked = account.dailyLocked || account.weeklyLocked || account.manualLock;
  const dPL = account.dailyPL ?? 0;
  const wPL = account.weeklyPL ?? 0;

  const dLoss = account.dailyLimitType === "percent"
    ? (account.balance ?? 0) * account.dailyLossLimit / 100
    : account.dailyLossLimit;
  const dTarget = account.dailyLimitType === "percent"
    ? (account.balance ?? 0) * account.dailyProfitTarget / 100
    : account.dailyProfitTarget;
  const wLoss = account.weeklyLimitType === "percent"
    ? (account.balance ?? 0) * account.weeklyLossLimit / 100
    : account.weeklyLossLimit;
  const wTarget = account.weeklyLimitType === "percent"
    ? (account.balance ?? 0) * account.weeklyProfitTarget / 100
    : account.weeklyProfitTarget;

  const dFrac = dPL < 0 && dLoss > 0 ? Math.abs(dPL) / dLoss : dPL >= 0 && dTarget > 0 ? dPL / dTarget : 0;
  const wFrac = wPL < 0 && wLoss > 0 ? Math.abs(wPL) / wLoss : wPL >= 0 && wTarget > 0 ? wPL / wTarget : 0;

  const notPaired = !account.lastSyncAt;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="aLARM" style={{ height: 28 }} />
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setShowSettings(true)} style={btnStyle("#2c3e50")}>Settings</button>
          <button onClick={() => signOut({ callbackUrl: "/login" })} style={btnStyle("#2c3e50")}>Log out</button>
        </div>
      </div>

      {notPaired && (
        <div style={{ background: "#1a1500", border: "1px solid #5a4a00", borderRadius: 10, padding: 16, marginBottom: 20, fontSize: 13, color: "#f1c40f" }}>
          <b>Not connected yet.</b> Paste this Pairing Key into the <code>InpPairingKey</code> input of the aLARM EA in MT5, and set <code>InpApiUrl</code> to this site&apos;s URL:
          <div style={{ marginTop: 8, padding: 10, background: "#000", borderRadius: 6, fontFamily: "monospace", wordBreak: "break-all", color: "#fff" }}>
            {account.pairingKey}
          </div>
        </div>
      )}

      <StatusBanner locked={locked} reason={account.lockReason} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
        <Card label="Balance" value={fmt(account.balance)} />
        <Card label="Equity" value={fmt(account.equity)} />
      </div>

      <PLCard title="Daily P&L" pl={dPL} loss={dLoss} target={dTarget} frac={dFrac} locked={account.dailyLocked} />
      <PLCard title="Weekly P&L" pl={wPL} loss={wLoss} target={wTarget} frac={wFrac} locked={account.weeklyLocked} />

      <button
        onClick={toggleManualLock}
        style={{ ...btnStyle(account.manualLock ? OK : DANGER), width: "100%", marginTop: 16, padding: "14px 0", fontSize: 14, fontWeight: 700 }}
      >
        {account.manualLock ? "UNLOCK ACCOUNT" : "EMERGENCY LOCK ACCOUNT"}
      </button>

      <p style={{ fontSize: 11, color: "#666", marginTop: 24, textAlign: "center" }}>
        {account.accountLogin ? `MT5 #${account.accountLogin} · ${account.broker ?? ""}` : "Waiting for EA to sync…"}
        {account.lastSyncAt && ` · last sync ${new Date(account.lastSyncAt).toLocaleTimeString()}`}
      </p>

      {showSettings && (
        <SettingsModal
          form={form}
          setForm={setForm}
          onCancel={() => setShowSettings(false)}
          onSave={saveSettings}
          saving={saving}
        />
      )}
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#888" }}>{children}</div>;
}

function btnStyle(bg: string): React.CSSProperties {
  return { background: bg, color: "#fff", border: "none", borderRadius: 8, padding: "10px 16px", fontSize: 13, cursor: "pointer" };
}

function StatusBanner({ locked, reason }: { locked: boolean; reason: string | null }) {
  return (
    <div style={{
      background: locked ? DANGER : OK,
      color: locked ? "#fff" : "#0b0c10",
      borderRadius: 10,
      padding: "14px 18px",
      fontWeight: 700,
      fontSize: 14,
    }}>
      {locked ? `TRADING LOCKED${reason ? " — " + reason : ""}` : "TRADING ACTIVE"}
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 14 }}>
      <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>{value}</div>
    </div>
  );
}

function PLCard({ title, pl, loss, target, frac, locked }: { title: string; pl: number; loss: number; target: number; frac: number; locked: boolean }) {
  const clamped = Math.max(0, Math.min(1, frac));
  return (
    <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 14, marginTop: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#888", textTransform: "uppercase" }}>
        <span>{title}</span>
        {locked && <span style={{ color: DANGER, fontWeight: 700 }}>LOCKED</span>}
      </div>
      <div style={{ fontSize: 19, fontWeight: 700, color: pl >= 0 ? OK : DANGER, marginTop: 4 }}>{fmt(pl)}</div>
      <div style={{ fontSize: 11, color: "#777", marginTop: 2 }}>
        loss cap {loss > 0 ? `-${fmt(loss)}` : "off"} · target {target > 0 ? `+${fmt(target)}` : "off"}
      </div>
      <div style={{ height: 6, background: "#232430", borderRadius: 4, marginTop: 8, overflow: "hidden" }}>
        <div style={{ width: `${clamped * 100}%`, height: "100%", background: barColor(clamped) }} />
      </div>
    </div>
  );
}

function SettingsModal({ form, setForm, onCancel, onSave, saving }: {
  form: Partial<Account>;
  setForm: (f: Partial<Account>) => void;
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
}) {
  function num(key: keyof Account) {
    return {
      value: (form[key] as number) ?? 0,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: parseFloat(e.target.value) || 0 }),
    };
  }
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#15161d", border: `1px solid ${BORDER}`, borderRadius: 12, padding: 24, width: "100%", maxWidth: 420, maxHeight: "88vh", overflowY: "auto" }}>
        <h2 style={{ marginTop: 0, fontSize: 16 }}>Risk Settings</h2>

        {form.pairingKey && (
          <Field label="Pairing key (for the EA's InpPairingKey input)">
            <div style={{ ...inputStyle, fontFamily: "monospace", wordBreak: "break-all", userSelect: "all" }}>
              {form.pairingKey}
            </div>
          </Field>
        )}

        <Field label="Daily loss limit type">
          <select value={form.dailyLimitType} onChange={(e) => setForm({ ...form, dailyLimitType: e.target.value })} style={inputStyle}>
            <option value="percent">% of balance</option>
            <option value="money">Fixed amount</option>
          </select>
        </Field>
        <Field label="Daily loss limit"><input type="number" style={inputStyle} {...num("dailyLossLimit")} /></Field>
        <Field label="Daily profit target"><input type="number" style={inputStyle} {...num("dailyProfitTarget")} /></Field>

        <Field label="Weekly loss limit type">
          <select value={form.weeklyLimitType} onChange={(e) => setForm({ ...form, weeklyLimitType: e.target.value })} style={inputStyle}>
            <option value="percent">% of balance</option>
            <option value="money">Fixed amount</option>
          </select>
        </Field>
        <Field label="Weekly loss limit"><input type="number" style={inputStyle} {...num("weeklyLossLimit")} /></Field>
        <Field label="Weekly profit target"><input type="number" style={inputStyle} {...num("weeklyProfitTarget")} /></Field>

        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginTop: 12 }}>
          <input type="checkbox" checked={!!form.autoCloseOnBreach} onChange={(e) => setForm({ ...form, autoCloseOnBreach: e.target.checked })} />
          Auto-close all positions on breach
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginTop: 8 }}>
          <input type="checkbox" checked={!!form.blockNewTrades} onChange={(e) => setForm({ ...form, blockNewTrades: e.target.checked })} />
          Block new trades while locked
        </label>

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={onCancel} style={{ ...btnStyle("#2c3e50"), flex: 1 }}>Cancel</button>
          <button onClick={onSave} disabled={saving} style={{ ...btnStyle(OK), flex: 1 }}>{saving ? "Saving…" : "Save"}</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 10 }}>
      <label style={{ fontSize: 12, color: "#999", display: "block", marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#0b0c10",
  border: `1px solid ${BORDER}`,
  borderRadius: 6,
  padding: "8px 10px",
  color: "#fff",
  fontSize: 13,
};
