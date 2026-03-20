import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.username, form.password);
      toast.success("Đăng nhập thành công!");
      navigate("/admin");
    } catch (err) {
      toast.error(err.response?.data?.message || "Sai thông tin đăng nhập");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg)", padding: 24
    }}>
      <div style={{ width: "100%", maxWidth: 400 }} className="fade-in">
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <span style={{ fontSize: "3rem" }}>⬡</span>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginTop: 8 }}>Admin VoteChain</h1>
          <p style={{ color: "var(--text-muted)", marginTop: 4 }}>Đăng nhập để quản lý hệ thống</p>
        </div>

        <form onSubmit={handleSubmit} style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", padding: 32, display: "flex", flexDirection: "column", gap: 20
        }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-dim)", marginBottom: 6 }}>Tên đăng nhập</label>
            <input
              type="text" placeholder="admin" value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              required
              style={{
                width: "100%", background: "var(--bg-elevated)", border: "1px solid var(--border-bright)",
                borderRadius: "var(--radius)", padding: "11px 14px", color: "var(--text)", fontSize: "0.95rem"
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-dim)", marginBottom: 6 }}>Mật khẩu</label>
            <input
              type="password" placeholder="••••••••" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
              style={{
                width: "100%", background: "var(--bg-elevated)", border: "1px solid var(--border-bright)",
                borderRadius: "var(--radius)", padding: "11px 14px", color: "var(--text)", fontSize: "0.95rem"
              }}
            />
          </div>
          <button
            type="submit" disabled={loading}
            style={{
              background: "var(--accent)", color: "white", padding: "13px",
              borderRadius: "var(--radius)", fontWeight: 700, fontSize: "1rem",
              cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8
            }}
          >
            {loading && <span className="spinner" style={{ width: 16, height: 16 }} />}
            {loading ? "Đang đăng nhập…" : "Đăng nhập"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 20, color: "var(--text-muted)", fontSize: "0.8rem" }}>
          Default: admin / Admin@123456
        </p>
      </div>
    </div>
  );
}
