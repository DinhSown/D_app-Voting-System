import React from "react";

/* ─── Card ─────────────────────────────────────── */
export function Card({ children, style, className = "" }) {
  return (
    <div className={className} style={{
      background: "var(--bg-card)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)", padding: "24px", ...style
    }}>
      {children}
    </div>
  );
}

/* ─── Badge ─────────────────────────────────────── */
export function Badge({ label, color = "#64748b" }) {
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", borderRadius: "999px",
      fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.05em",
      background: color + "22", color,
      border: `1px solid ${color}44`
    }}>
      {label}
    </span>
  );
}

/* ─── Button ─────────────────────────────────────── */
export function Button({ children, variant = "primary", size = "md", loading, disabled, onClick, style, type = "button" }) {
  const sizes = { sm: "8px 16px", md: "10px 24px", lg: "14px 32px" };
  const fontSizes = { sm: "0.8rem", md: "0.9rem", lg: "1rem" };
  const variants = {
    primary: { background: "var(--accent)", color: "white" },
    secondary: { background: "var(--bg-elevated)", color: "var(--text)", border: "1px solid var(--border-bright)" },
    danger: { background: "#ef4444", color: "white" },
    ghost: { background: "transparent", color: "var(--text-muted)", border: "1px solid var(--border)" },
    success: { background: "var(--green)", color: "white" },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        padding: sizes[size], fontSize: fontSizes[size], fontWeight: 700,
        borderRadius: "var(--radius)", display: "inline-flex", alignItems: "center", gap: 8,
        transition: "var(--transition)", cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled || loading ? 0.6 : 1,
        ...variants[variant], ...style
      }}
    >
      {loading && <span className="spinner" style={{ width: 14, height: 14 }} />}
      {children}
    </button>
  );
}

/* ─── Input ─────────────────────────────────────── */
export function Input({ label, error, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-dim)" }}>{label}</label>}
      <input
        {...props}
        style={{
          background: "var(--bg-elevated)", border: `1px solid ${error ? "var(--red)" : "var(--border-bright)"}`,
          borderRadius: "var(--radius)", padding: "10px 14px",
          color: "var(--text)", fontSize: "0.9rem", width: "100%",
          ...props.style
        }}
      />
      {error && <span style={{ color: "var(--red)", fontSize: "0.8rem" }}>{error}</span>}
    </div>
  );
}

/* ─── Textarea ─────────────────────────────────────── */
export function Textarea({ label, error, rows = 4, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-dim)" }}>{label}</label>}
      <textarea
        rows={rows}
        {...props}
        style={{
          background: "var(--bg-elevated)", border: `1px solid ${error ? "var(--red)" : "var(--border-bright)"}`,
          borderRadius: "var(--radius)", padding: "10px 14px",
          color: "var(--text)", fontSize: "0.9rem", width: "100%",
          resize: "vertical", ...props.style
        }}
      />
      {error && <span style={{ color: "var(--red)", fontSize: "0.8rem" }}>{error}</span>}
    </div>
  );
}

/* ─── PageWrapper ─────────────────────────────────────── */
export function PageWrapper({ children, maxWidth = "1100px" }) {
  return (
    <main className="fade-in" style={{ maxWidth, margin: "0 auto", padding: "40px 24px 80px" }}>
      {children}
    </main>
  );
}

/* ─── Spinner centered ─────────────────────────────────────── */
export function Loader({ text = "Đang tải…" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 80, gap: 16 }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
      <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{text}</span>
    </div>
  );
}

/* ─── Empty state ─────────────────────────────────────── */
export function Empty({ icon = "📭", text = "Chưa có dữ liệu" }) {
  return (
    <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
      <div style={{ fontSize: "3rem", marginBottom: 12 }}>{icon}</div>
      <p>{text}</p>
    </div>
  );
}

/* ─── Progress bar ─────────────────────────────────────── */
export function ProgressBar({ value, max, color = "var(--accent-bright)" }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ background: "var(--border)", borderRadius: 999, height: 8, overflow: "hidden", width: "100%" }}>
      <div style={{
        width: `${pct}%`, height: "100%", background: color,
        borderRadius: 999, transition: "width 0.5s ease",
        boxShadow: `0 0 8px ${color}88`
      }} />
    </div>
  );
}
