import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../utils/api";
import toast from "react-hot-toast";
import AdminLayout from "./AdminLayout";
import { Badge, Loader, Empty } from "../../components/UI";
import { formatDate, shortenAddress, copyToClipboard } from "../../utils/helpers";

const STATUS_COLOR = { confirmed: "#10b981", pending: "#f59e0b", failed: "#ef4444" };
const STATUS_LABEL = { confirmed: "Đã xác nhận", pending: "Đang chờ", failed: "Thất bại" };

export default function AdminTransactions() {
  const { id: votingId } = useParams();
  const [voting, setVoting] = useState(null);
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const [vRes, txRes] = await Promise.all([
        api.get(`/votings/${votingId}`),
        api.get(`/votings/${votingId}/transactions?page=${page}&limit=20`)
      ]);
      setVoting(vRes.data.voting);
      setTxs(txRes.data.transactions || []);
      setPagination(txRes.data.pagination || {});
    } catch {
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [votingId]);

  useEffect(() => { load(); }, [load]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const r = await api.post(`/sync/${votingId}`);
      toast.success(r.data.message || "Đồng bộ thành công");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi đồng bộ");
    } finally {
      setSyncing(false);
    }
  };

  const handleCopy = async (text) => {
    const ok = await copyToClipboard(text);
    if (ok) toast.success("Đã copy!");
  };

  return (
    <AdminLayout>
      <div style={{ marginBottom: 24 }}>
        <Link to="/admin/votings" style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>← Quay lại</Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginTop: 8 }}>
          <div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 4 }}>Log Giao dịch</h1>
            {voting && <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>📋 {voting.title} · {pagination.total} giao dịch</p>}
          </div>
          <button
            onClick={handleSync}
            disabled={syncing || !voting?.contract_address}
            style={{
              background: "var(--accent)", color: "white", padding: "10px 18px",
              borderRadius: "var(--radius)", fontWeight: 700, cursor: syncing ? "not-allowed" : "pointer",
              opacity: syncing ? 0.7 : 1, fontSize: "0.88rem", display: "flex", alignItems: "center", gap: 8,
              fontFamily: "var(--font-head)"
            }}
          >
            {syncing && <span className="spinner" style={{ width: 14, height: 14 }} />}
            🔄 {syncing ? "Đang đồng bộ…" : "Đồng bộ từ blockchain"}
          </button>
        </div>
      </div>

      {/* Stats bar */}
      {!loading && txs.length > 0 && (
        <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
          {["confirmed", "pending", "failed"].map(s => {
            const count = txs.filter(t => t.status === s).length;
            return (
              <div key={s} style={{ background: "var(--bg-card)", border: `1px solid ${STATUS_COLOR[s]}44`, borderRadius: "var(--radius)", padding: "10px 18px", display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: STATUS_COLOR[s], display: "inline-block" }} />
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{STATUS_LABEL[s]}</span>
                <span style={{ fontWeight: 800, color: STATUS_COLOR[s] }}>{count}</span>
              </div>
            );
          })}
        </div>
      )}

      {loading ? <Loader /> : txs.length === 0 ? (
        <Empty icon="📋" text="Chưa có giao dịch nào được ghi nhận" />
      ) : (
        <>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.83rem", minWidth: 700 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-elevated)" }}>
                    {["#", "Địa chỉ ví", "Ứng viên", "TX Hash", "Block", "Thời gian", "Trạng thái"].map(h => (
                      <th key={h} style={{ padding: "11px 14px", textAlign: "left", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {txs.map((tx, i) => (
                    <tr key={tx.id}
                      style={{ borderBottom: i < txs.length - 1 ? "1px solid var(--border)" : "none" }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--bg-elevated)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <td style={{ padding: "12px 14px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{tx.id}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <button
                          onClick={() => handleCopy(tx.wallet_address)}
                          style={{ background: "none", fontFamily: "var(--font-mono)", color: "var(--accent-bright)", fontSize: "0.8rem", cursor: "pointer", border: "none" }}
                          title={tx.wallet_address}
                        >
                          {shortenAddress(tx.wallet_address)}
                        </button>
                      </td>
                      <td style={{ padding: "12px 14px", fontWeight: 600 }}>
                        {tx.candidate_name || `#${tx.candidate_blockchain_id}`}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        {tx.tx_hash ? (
                          <button
                            onClick={() => handleCopy(tx.tx_hash)}
                            style={{ background: "none", fontFamily: "var(--font-mono)", color: "var(--text-muted)", fontSize: "0.75rem", cursor: "pointer", border: "none" }}
                            title={tx.tx_hash}
                          >
                            {tx.tx_hash.slice(0, 14)}…
                          </button>
                        ) : <span style={{ color: "var(--text-muted)" }}>–</span>}
                      </td>
                      <td style={{ padding: "12px 14px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                        {tx.block_number || "–"}
                      </td>
                      <td style={{ padding: "12px 14px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                        {formatDate(tx.created_at)}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <Badge label={STATUS_LABEL[tx.status] || tx.status} color={STATUS_COLOR[tx.status] || "#64748b"} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 20 }}>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => load(p)}
                  style={{
                    width: 36, height: 36, borderRadius: 8, border: "1px solid var(--border-bright)",
                    background: p === pagination.page ? "var(--accent)" : "var(--bg-elevated)",
                    color: p === pagination.page ? "white" : "var(--text-muted)",
                    fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-head)"
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
