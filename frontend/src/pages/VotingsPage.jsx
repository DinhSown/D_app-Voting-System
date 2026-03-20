import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import { PageWrapper, Loader, Empty, Badge } from "../components/UI";
import { formatDate, getVotingStatusLabel } from "../utils/helpers";

export default function VotingsPage() {
  const [votings, setVotings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/votings").then(r => setVotings(r.data.votings || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageWrapper><Loader /></PageWrapper>;

  return (
    <PageWrapper>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: 8 }}>Danh sách Bình chọn</h1>
        <p style={{ color: "var(--text-muted)" }}>Chọn một cuộc bình chọn để tham gia hoặc xem kết quả</p>
      </div>

      {votings.length === 0 ? (
        <Empty icon="🗳️" text="Chưa có cuộc bình chọn nào" />
      ) : (
        <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
          {votings.map(v => {
            const { label, color } = getVotingStatusLabel(v.status);
            return (
              <Link to={`/votings/${v.id}`} key={v.id} style={{ display: "block" }}>
                <div style={{
                  background: "var(--bg-card)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-lg)", padding: "24px",
                  transition: "var(--transition)", cursor: "pointer"
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "none"; }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <Badge label={label} color={color} />
                    <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{v.candidate_count || 0} ứng viên</span>
                  </div>
                  <h2 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: 8, color: "var(--text)" }}>{v.title}</h2>
                  {v.description && <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: 16, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{v.description}</p>}
                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                      <span style={{ color: "var(--text-muted)" }}>Bắt đầu</span>
                      <span style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>{formatDate(v.start_time)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                      <span style={{ color: "var(--text-muted)" }}>Kết thúc</span>
                      <span style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>{formatDate(v.end_time)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginTop: 4 }}>
                      <span style={{ color: "var(--text-muted)" }}>Tổng phiếu</span>
                      <span style={{ color: "var(--accent-bright)", fontWeight: 700 }}>{v.total_votes || 0}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </PageWrapper>
  );
}
