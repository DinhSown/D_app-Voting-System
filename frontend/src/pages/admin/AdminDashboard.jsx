import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import AdminLayout from "./AdminLayout";
import { Card, Badge, Loader } from "../../components/UI";
import { formatDate, getVotingStatusLabel } from "../../utils/helpers";

export default function AdminDashboard() {
  const { admin } = useAuth();
  const [votings, setVotings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/votings").then(r => setVotings(r.data.votings || [])).finally(() => setLoading(false));
  }, []);

  const stats = {
    total: votings.length,
    active: votings.filter(v => v.status === "active").length,
    ended: votings.filter(v => v.status === "ended").length,
    totalVotes: votings.reduce((s, v) => s + (parseInt(v.total_votes) || 0), 0),
  };

  return (
    <AdminLayout>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, marginBottom: 4 }}>
          Chào mừng, {admin?.username} 👋
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          Tổng quan hệ thống bình chọn blockchain
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
        {[
          { label: "Tổng cuộc bình chọn", value: stats.total, icon: "🗳️", color: "var(--accent-bright)" },
          { label: "Đang mở", value: stats.active, icon: "🟢", color: "var(--green)" },
          { label: "Đã kết thúc", value: stats.ended, icon: "🏁", color: "var(--text-muted)" },
          { label: "Tổng phiếu bầu", value: stats.totalVotes, icon: "📊", color: "var(--yellow)" },
        ].map(s => (
          <Card key={s.label} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "1.6rem" }}>{s.icon}</span>
              <span style={{ fontSize: "2rem", fontWeight: 800, color: s.color }}>{s.value}</span>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap" }}>
        <Link to="/admin/votings/new">
          <button style={{
            background: "var(--accent)", color: "white", padding: "10px 20px",
            borderRadius: "var(--radius)", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem"
          }}>
            ＋ Tạo cuộc bình chọn mới
          </button>
        </Link>
        <Link to="/admin/votings">
          <button style={{
            background: "var(--bg-elevated)", color: "var(--text)", padding: "10px 20px",
            borderRadius: "var(--radius)", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem",
            border: "1px solid var(--border-bright)"
          }}>
            Quản lý tất cả →
          </button>
        </Link>
      </div>

      {/* Recent votings table */}
      <div>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>Cuộc bình chọn gần đây</h2>
        {loading ? <Loader /> : (
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-elevated)" }}>
                  {["Tên cuộc bình chọn", "Trạng thái", "Ứng viên", "Phiếu", "Kết thúc", ""].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {votings.slice(0, 8).map((v, i) => {
                  const { label, color } = getVotingStatusLabel(v.status);
                  return (
                    <tr key={v.id} style={{ borderBottom: i < votings.length - 1 ? "1px solid var(--border)" : "none", transition: "background 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--bg-elevated)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <td style={{ padding: "14px 16px", fontWeight: 600, maxWidth: 280 }}>
                        <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.title}</span>
                      </td>
                      <td style={{ padding: "14px 16px" }}><Badge label={label} color={color} /></td>
                      <td style={{ padding: "14px 16px", color: "var(--text-dim)", textAlign: "center" }}>{v.candidate_count || 0}</td>
                      <td style={{ padding: "14px 16px", color: "var(--accent-bright)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>{v.total_votes || 0}</td>
                      <td style={{ padding: "14px 16px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.78rem", whiteSpace: "nowrap" }}>{formatDate(v.end_time)}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <Link to={`/admin/votings/${v.id}/candidates`} style={{ color: "var(--accent-bright)", fontSize: "0.8rem", fontWeight: 600 }}>Ứng viên</Link>
                          <Link to={`/admin/votings/${v.id}/edit`} style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Sửa</Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {votings.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Chưa có cuộc bình chọn nào. <Link to="/admin/votings/new" style={{ color: "var(--accent-bright)" }}>Tạo ngay →</Link></td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
