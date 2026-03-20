import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../utils/api";
import toast from "react-hot-toast";
import AdminLayout from "./AdminLayout";
import { Card, Input, Textarea, Button, Loader, Empty } from "../../components/UI";

const BLANK = { candidate_name: "", candidate_description: "", image_url: "", blockchain_candidate_id: "" };

export default function AdminCandidates() {
  const { id: votingId } = useParams();
  const [voting, setVoting] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    try {
      const r = await api.get(`/votings/${votingId}`);
      setVoting(r.data.voting);
      setCandidates(r.data.candidates || []);
    } catch {
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [votingId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.candidate_name.trim()) { toast.error("Tên ứng viên là bắt buộc"); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        blockchain_candidate_id: form.blockchain_candidate_id ? parseInt(form.blockchain_candidate_id) : candidates.length + 1,
      };
      if (editId) {
        await api.put(`/candidates/${editId}`, payload);
        toast.success("Đã cập nhật ứng viên");
      } else {
        await api.post(`/votings/${votingId}/candidates`, payload);
        toast.success("Đã thêm ứng viên");
      }
      setForm(BLANK);
      setEditId(null);
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi lưu ứng viên");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (c) => {
    setForm({
      candidate_name: c.candidate_name,
      candidate_description: c.candidate_description || "",
      image_url: c.image_url || "",
      blockchain_candidate_id: c.blockchain_candidate_id || "",
    });
    setEditId(c.id);
    setShowForm(true);
  };

  const handleDelete = async (cid, name) => {
    if (!window.confirm(`Xóa ứng viên "${name}"?`)) return;
    try {
      await api.delete(`/candidates/${cid}`);
      toast.success("Đã xóa ứng viên");
      load();
    } catch {
      toast.error("Lỗi xóa ứng viên");
    }
  };

  const cancelEdit = () => { setForm(BLANK); setEditId(null); setShowForm(false); };

  return (
    <AdminLayout>
      <div style={{ maxWidth: 800 }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Link to="/admin/votings" style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>← Quay lại</Link>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginTop: 8, marginBottom: 4 }}>
            Quản lý ứng viên
          </h1>
          {voting && <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>📋 {voting.title}</p>}
        </div>

        {/* Add button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              marginBottom: 20, background: "var(--accent)", color: "white",
              padding: "10px 20px", borderRadius: "var(--radius)", fontWeight: 700,
              cursor: "pointer", fontSize: "0.9rem"
            }}
          >
            ＋ Thêm ứng viên
          </button>
        )}

        {/* Form */}
        {showForm && (
          <Card style={{ marginBottom: 24 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: "1rem" }}>
              {editId ? "✏️ Chỉnh sửa ứng viên" : "➕ Thêm ứng viên mới"}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Input
                label="Tên ứng viên *"
                placeholder="VD: Nguyễn Văn An"
                value={form.candidate_name}
                onChange={e => setForm(f => ({ ...f, candidate_name: e.target.value }))}
              />
              <Textarea
                label="Mô tả"
                placeholder="Giới thiệu ngắn về ứng viên..."
                value={form.candidate_description}
                onChange={e => setForm(f => ({ ...f, candidate_description: e.target.value }))}
                rows={2}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Input
                  label="URL ảnh đại diện"
                  placeholder="https://..."
                  value={form.image_url}
                  onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                />
                <Input
                  label="ID trên blockchain"
                  type="number"
                  placeholder="Tự động nếu để trống"
                  value={form.blockchain_candidate_id}
                  onChange={e => setForm(f => ({ ...f, blockchain_candidate_id: e.target.value }))}
                />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <Button type="submit" variant="primary" loading={saving}>
                  {editId ? "Lưu thay đổi" : "Thêm ứng viên"}
                </Button>
                <Button type="button" variant="ghost" onClick={cancelEdit}>Hủy</Button>
              </div>
            </form>
          </Card>
        )}

        {/* Candidates list */}
        <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 14, color: "var(--text-dim)" }}>
          Danh sách ứng viên ({candidates.length})
        </h2>

        {loading ? <Loader /> : candidates.length === 0 ? (
          <Empty icon="👤" text="Chưa có ứng viên nào. Thêm ứng viên đầu tiên!" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {candidates.map((c, i) => (
              <div key={c.id} style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)", padding: "16px 20px",
                display: "flex", alignItems: "center", gap: 16
              }}>
                {/* Avatar */}
                <div style={{
                  width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg, var(--accent), var(--accent-bright))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.2rem", fontWeight: 800, color: "white", overflow: "hidden"
                }}>
                  {c.image_url
                    ? <img src={c.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
                    : (i + 1)
                  }
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, marginBottom: 2 }}>{c.candidate_name}</p>
                  {c.candidate_description && (
                    <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 400 }}>
                      {c.candidate_description}
                    </p>
                  )}
                  <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontFamily: "var(--font-mono)" }}>
                    Blockchain ID: #{c.blockchain_candidate_id || "–"}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => handleEdit(c)}
                    style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-bright)", color: "var(--text-dim)", padding: "6px 14px", borderRadius: 8, fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-head)" }}
                  >
                    ✏️ Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(c.id, c.candidate_name)}
                    style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "var(--red)", padding: "6px 14px", borderRadius: 8, fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-head)" }}
                  >
                    🗑️ Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Note about blockchain */}
        {candidates.length > 0 && (
          <div style={{ marginTop: 24, padding: "14px 16px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "var(--radius)", fontSize: "0.83rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
            ⚠️ <strong style={{ color: "var(--yellow)" }}>Lưu ý:</strong> Danh sách ứng viên này là metadata phục vụ hiển thị. Ứng viên thực sự trên blockchain được khai báo khi <strong>deploy contract</strong>. Đảm bảo <strong>Blockchain ID</strong> khớp với thứ tự trong constructor của contract.
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
