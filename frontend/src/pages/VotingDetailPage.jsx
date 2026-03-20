import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../utils/api";
import { useWeb3 } from "../context/Web3Context";
import { PageWrapper, Loader, Badge, Button, Card } from "../components/UI";
import { formatDate, getVotingStatusLabel, shortenAddress } from "../utils/helpers";

export default function VotingDetailPage() {
  const { id } = useParams();
  const { account } = useWeb3();
  const [voting, setVoting] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/votings/${id}`).then(r => {
      setVoting(r.data.voting);
      setCandidates(r.data.candidates || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageWrapper><Loader /></PageWrapper>;
  if (!voting) return <PageWrapper><p style={{ color: "var(--text-muted)" }}>Không tìm thấy cuộc bình chọn</p></PageWrapper>;

  const { label, color } = getVotingStatusLabel(voting.status);

  return (
    <PageWrapper>
      <div style={{ marginBottom: 12 }}>
        <Link to="/votings" style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>← Quay lại</Link>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          <Badge label={label} color={color} />
          <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}>
            {voting.contract_address ? shortenAddress(voting.contract_address) : "Chưa deploy contract"}
          </span>
        </div>

        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: 12 }}>{voting.title}</h1>
        {voting.description && <p style={{ color: "var(--text-dim)", lineHeight: 1.7, marginBottom: 20 }}>{voting.description}</p>}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
          {[
            ["📅 Bắt đầu", formatDate(voting.start_time)],
            ["🏁 Kết thúc", formatDate(voting.end_time)],
            ["👤 Ứng viên", candidates.length],
          ].map(([k, v]) => (
            <div key={k} style={{ background: "var(--bg-elevated)", borderRadius: "var(--radius)", padding: "14px" }}>
              <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", marginBottom: 4 }}>{k}</p>
              <p style={{ fontWeight: 700, fontSize: "0.95rem" }}>{v}</p>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {voting.status === "active" && (
            <Link to={`/votings/${id}/vote`}>
              <Button variant="primary" size="lg">
                🗳️ {account ? "Tham gia bỏ phiếu" : "Kết nối ví để bỏ phiếu"}
              </Button>
            </Link>
          )}
          <Link to={`/votings/${id}/results`}>
            <Button variant="secondary">📊 Xem kết quả</Button>
          </Link>
        </div>
      </Card>

      <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 16 }}>Danh sách ứng viên ({candidates.length})</h2>
      {candidates.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>Chưa có ứng viên</p>
      ) : (
        <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
          {candidates.map((c, i) => (
            <Card key={c.id} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{
                width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg, var(--accent), var(--accent-bright))",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.3rem", fontWeight: 800, color: "white"
              }}>
                {c.image_url ? <img src={c.image_url} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} /> : (i + 1)}
              </div>
              <div>
                <p style={{ fontWeight: 700, marginBottom: 4 }}>{c.candidate_name}</p>
                {c.candidate_description && <p style={{ color: "var(--text-muted)", fontSize: "0.83rem", lineHeight: 1.5 }}>{c.candidate_description}</p>}
                <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: 6, fontFamily: "var(--font-mono)" }}>ID #{c.blockchain_candidate_id}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
