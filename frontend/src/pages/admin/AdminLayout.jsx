import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: "📊", exact: true },
  { to: "/admin/votings", label: "Cuộc bình chọn", icon: "🗳️" },
];

export default function AdminLayout({ children }) {
  const { admin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    toast("Đã đăng xuất", { icon: "👋" });
    navigate("/admin/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 240 : 64, transition: "width 0.25s ease",
        background: "var(--bg-card)", borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden"
      }}>
        {/* Logo */}
        <div style={{ padding: "20px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>⬡</span>
          {sidebarOpen && <span style={{ fontWeight: 800, fontSize: "1rem", whiteSpace: "nowrap" }}>VoteChain Admin</span>}
        </div>

        {/* Nav */}
        <nav style={{ padding: "12px 8px", flex: 1 }}>
          {NAV.map(n => {
            const active = n.exact ? location.pathname === n.to : location.pathname.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                borderRadius: 8, marginBottom: 2, color: active ? "var(--accent-bright)" : "var(--text-muted)",
                background: active ? "var(--accent-glow)" : "transparent",
                fontWeight: active ? 700 : 500, fontSize: "0.9rem", whiteSpace: "nowrap",
                transition: "var(--transition)"
              }}>
                <span style={{ flexShrink: 0 }}>{n.icon}</span>
                {sidebarOpen && n.label}
              </Link>
            );
          })}
        </nav>

        {/* User + logout */}
        <div style={{ padding: "12px 8px", borderTop: "1px solid var(--border)" }}>
          {sidebarOpen && (
            <div style={{ padding: "8px 12px", marginBottom: 8 }}>
              <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text)" }}>{admin?.username}</p>
              <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{admin?.role}</p>
            </div>
          )}
          <button onClick={handleLogout} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", borderRadius: 8, background: "none",
            color: "var(--red)", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer"
          }}>
            <span>🚪</span>{sidebarOpen && "Đăng xuất"}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {/* Topbar */}
        <header style={{
          height: 56, padding: "0 24px", borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", gap: 16, background: "var(--bg-card)",
          position: "sticky", top: 0, zIndex: 10
        }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "none", color: "var(--text-muted)", fontSize: "1.2rem", cursor: "pointer" }}>☰</button>
          <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            {location.pathname.replace("/admin", "Admin") || "Admin"}
          </span>
          <div style={{ marginLeft: "auto" }}>
            <Link to="/" style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>← Về trang chủ</Link>
          </div>
        </header>

        <main style={{ padding: "28px 32px" }} className="fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
