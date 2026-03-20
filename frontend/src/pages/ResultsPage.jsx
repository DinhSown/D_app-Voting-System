import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../utils/api";
import { useWeb3 } from "../context/Web3Context";
import { PageWrapper, Loader, Badge, Card, ProgressBar } from "../components/UI";
import { formatDate, getVotingStatusLabel } from "../utils/helpers";

export default function ResultsPage() {
  const { id } = useParams();
  const { getReadonlyContract } = useWeb3();
  const [voting, setVoting] = useState(null);
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [chainResults, setChainResults] = useState([]);
  const [loadingChain, setLoadingChain] = useState(false);

  useEffect(() => {
    api.get(`/votings/${id}/results`).then(r => {
      setVoting(r.data.voting);
      setResults(r.data.results || []);
      setTotal(r.data.total_votes || 0);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  // Also fetch live from blockchain
  const fetchChainResults = useCallback(async () => {
    if (!voting?.contract_address) return;
    setLoadingChain(true);
    try {
      const cfg = await fetch("/contractConfig.json").then(r => r.json());
      const contract = getReadonlyContract(voting.contract_address, cfg.abi);
      const all = await contract.getAllCandidates();
      const mapped = all.map(c => ({ id: Number(c.id), name: c.name, voteCount: Number(c.voteCount) }));
      setChainResults(mapped);
    } catch (e) {
      console.warn("Chain fetch error:", e.message);
    } finally {
      setLoadingChain(false);
    }
  }, [voting, getReadonlyContract]);

  useEffect(() => { if (voting) fetchChainResults(); }, [voting, fetchChainResults]);

  if (loading) return <PageWrapper><Loader /></PageWrapper>;
  if (!voting) return <PageWrapper><p style={{ color: "var(--text-muted)" }}>Không tìm thấy</p></PageWrapper>;

  const { label, color } = getVotingStatusLabel(voting.status);

  // Prefer on-chain data if available
  const displayResults = chainResults.length > 0
    ? chainResults.map(c => {
        const dbRecord = results.find(r => r.blockchain_candidate_id === c.id);
        return { ...c, candidate_name: dbRecord?.candidate_name || c.name, candidate_description: dbRecord?.candidate_description, voteCount: c.voteCount };
      })
    : results.map(r => ({ ...r, voteCount: r.db_vote_count || 0 }));

  const chainTotal = chainResults.reduce((s, c) => s + c.voteCount, 0);
  const displayTotal = chainResults.length > 0 ? chainTotal : total;

  const winner = displayResults.length > 0
    ? displayResults.reduce((a, b) => a.voteCount > b.voteCount ? a : b)
    : null;

  const COLORS = ["#a855f7", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];

  return (
    <PageWrapper>
      <div style={{ marginBottom: 12 }}>
        <Link to={`/votings/${id}`} style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>← Quay lại</Link>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: 6 }}>📊 Kết quả: {voting.title}</h1>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Badge label={label} color={color} />
            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Kết thúc: {formatDate(voting.end_time)}</span>
          </div>
        </div>
        <button
          onClick={fetchChainResults}
          disabled={loadingChain}
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-bright)", color: "var(--text-dim)", borderRadius: "var(--radius)", padding: "8px 16px", cursor: "pointer", fontSize: "0.85rem" }}
        >
          {loadingChain ? "🔄 Đang tải…" : "🔄 Làm mới từ blockchain"}
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
        {[
          ["🗳️ Tổng phiếu", displayTotal, "var(--accent-bright)"],
          ["👥 Ứng viên", displayResults.length, "var(--text)"],
          ["🏆 Đang dẫn", winner?.candidate_name || "–", "var(--green)"],
        ].map(([k, v, c]) => (
          <Card key={k}>
            <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", marginBottom: 6 }}>{k}</p>
            <p style={{ fontWeight: 800, fontSize: "1.3rem", color: c, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v}</p>
          </Card>
        ))}
      </div>

      {chainResults.length > 0 && (
        <div style={{ marginBottom: 16, padding: "10px 16px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "var(--radius)", fontSize: "0.85rem", color: "var(--green)" }}>
          ✅ Dữ liệu đọc trực tiếp từ blockchain — hoàn toàn minh bạch
        </div>
      )}

      {/* Results list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {[...displayResults]
          .sort((a, b) => b.voteCount - a.voteCount)
          .map((c, i) => {
            const pct = displayTotal > 0 ? ((c.voteCount / displayTotal) * 100).toFixed(1) : 0;
            const isWinner = winner && c.id === winner.id && c.voteCount > 0;
            return (
              <Card key={c.id} style={{ border: isWinner ? "1px solid var(--green)" : "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
                {isWinner && (
                  <div style={{ position: "absolute", top: 0, right: 0, background: "var(--green)", color: "#0a0a0f", padding: "4px 12px", fontSize: "0.72rem", fontWeight: 800, borderBottomLeftRadius: 8 }}>
                    🏆 DẪN ĐẦU
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                      background: `${COLORS[i % COLORS.length]}22`, border: `2px solid ${COLORS[i % COLORS.length]}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 800, color: COLORS[i % COLORS.length], fontSize: "0.9rem"
                    }}>
                      {i + 1}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, marginBottom: 2 }}>{c.candidate_name || c.name}</p>
                      {c.candidate_description && <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{c.candidate_description}</p>}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontWeight: 800, fontSize: "1.3rem", color: COLORS[i % COLORS.length] }}>{c.voteCount}</p>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{pct}%</p>
                  </div>
                </div>
                <ProgressBar value={c.voteCount} max={displayTotal || 1} color={COLORS[i % COLORS.length]} />
              </Card>
            );
          })}
      </div>

      {displayResults.length === 0 && (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
          <div style={{ fontSize: "3rem", marginBottom: 12 }}>📊</div>
          <p>Chưa có phiếu bầu nào</p>
        </div>
      )}
    </PageWrapper>
  );
}
