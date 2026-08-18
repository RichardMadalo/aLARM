export const OK = "#28b463";
const CARD_BG = "#15161d";
const BORDER = "#232430";

export const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#0b0c10",
  border: `1px solid ${BORDER}`,
  borderRadius: 6,
  padding: "10px 12px",
  color: "#fff",
  fontSize: 14,
  boxSizing: "border-box",
};

export function btnStyle(bg: string): React.CSSProperties {
  return { background: bg, color: "#fff", border: "none", borderRadius: 8, padding: "10px 16px", fontSize: 14, cursor: "pointer" };
}

export function AuthCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 28, width: "100%", maxWidth: 360 }}>
        <h1 style={{ margin: "0 0 4px", fontSize: 20, letterSpacing: 1 }}>aLARM</h1>
        <p style={{ margin: "0 0 20px", color: "#888", fontSize: 13 }}>{title}</p>
        {children}
      </div>
    </div>
  );
}
