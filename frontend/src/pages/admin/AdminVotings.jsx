import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import toast from "react-hot-toast";
import AdminLayout from "./AdminLayout";
import { Badge, Loader, Empty } from "../../components/UI";
import { formatDate, getVotingStatusLabel } from "../../utils/helpers";

export default function AdminVotings() {
  const [votings, setVotings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState({});

  const load = () => {
    setLoading(true);
    api.get("/votings").then(r => setVotings(r.data.votings || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Xóa cuộc bình chọn "${title}"?`)) return;
    try {
      await api.delete(`/votings/${id}`);
      toast.success("Đã xóa");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi xóa");
    }
  };

  const handleChangeStatus = async (id, status) => {
    try {
      await api.put(`/votings/${id}`, { status });
      toast.success(`Đã cập nhật trạng thái: ${status}`);
      load();
    } catch (err) {
      toast.error("Lỗi cập nhật trạng thái");
    }
  };

  const handleSync = async (id) => {
    setSyncing(s => ({ ...s, [id]: true }));
    try {
      const r = await api.post(`/sync/${id}`);
      toast.success(r.data.message || "Đồng bộ thành công");
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi đồng bộ blockchain");
    } finally {
      setSyncing(s => ({ ...s, [id]: false }));
    }
  };

  return (
    <AdminLayout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 4 }}>Quản lý Bình chọn</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>{votings.length} cuộc bình chọn</p>
        </div>
        <Link to="/admin/votings/new">
          <button style={{ background: "var(--accent)", color: "white", padding: "10px 20px", borderRadius: "var(--radius)", fontWeight: 700, cursor: "pointer" }}>
            ＋ Tạo mới
          </button>
        </Link>
      </div>

      {loading ? <Loader /> : votings.length === 0 ? <Empty icon="🗳️" text="Chưa có cuộc bình chọn nào" /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {votings.map(v => {
            const { label, color } = getVotingStatusLabel(v.status);
            return (
              <div key={v.id} style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)", padding: "20px 24px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <Badge label={label} color={color} />
                      <span style={{ color: "var(--text-muted)", fontSize: "0.78rem", fontFamily: "var(--font-mono)" }}>#{v.id}</span>
                    </div>
                    <h3 style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: 4 }}>{v.title}</h3>
                    {v.description && <p style={{ color: "var(--text-muted)", fontSize: "0.83rem", marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{v.description}</p>}
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      <span>📅 {formatDate(v.start_time)} → {formatDate(v.end_time)}</span>
                      <span>👤 {v.candidate_count || 0} ứng viên</span>
                      <span style={{ color: "var(--accent-bright)", fontWeight: 700 }}>🗳️ {v.total_votes || 0} phiếu</span>
                      {v.contract_address && <span style={{ fontFamily: "var(--font-mono)" }}>📄 {v.contract_address.slice(0, 10)}…</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <Link to={`/admin/votings/${v.id}/candidates`}>
                      <ActionBtn>👤 Ứng viên</ActionBtn>
                    </Link>
                    <Link to={`/admin/votings/${v.id}/transactions`}>
                      <ActionBtn>📋 Giao dịch</ActionBtn>
                    </Link>
                    <Link to={`/admin/votings/${v.id}/edit`}>
                      <ActionBtn>✏️ Sửa</ActionBtn>
                    </Link>

                    {v.status === "draft" && (
                      <ActionBtn onClick={() => handleChangeStatus(v.id, "active")} color="var(--green)">▶ Mở vote</ActionBtn>
                    )}
                    {v.status === "active" && (
                      <ActionBtn onClick={() => handleChangeStatus(v.id, "ended")} color="var(--yellow)">⏹ Kết thúc</ActionBtn>
                    )}
                    {v.contract_address && (
                      <ActionBtn onClick={() => handleSync(v.id)} disabled={syncing[v.id]} color="var(--accent-bright)">
                        {syncing[v.id] ? "⟳ Đang sync…" : "🔄 Sync"}
                      </ActionBtn>
                    )}
                    <ActionBtn onClick={() => handleDelete(v.id, v.title)} color="var(--red)">🗑 Xóa</ActionBtn>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}

function ActionBtn({ children, onClick, color, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: "var(--bg-elevated)", border: "1px solid var(--border-bright)",
        color: color || "var(--text-dim)", padding: "7px 14px", borderRadius: 8,
        fontSize: "0.8rem", fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1, whiteSpace: "nowrap", fontFamily: "var(--font-head)",
        transition: "var(--transition)"
      }}
    >
      {children}
    </button>
  );
}
