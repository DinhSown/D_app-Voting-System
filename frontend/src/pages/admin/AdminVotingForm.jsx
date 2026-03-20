import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../utils/api";
import toast from "react-hot-toast";
import AdminLayout from "./AdminLayout";
import { Card, Input, Textarea, Button } from "../../components/UI";

const toLocalDatetime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};

export default function AdminVotingForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    contract_address: "",
    start_time: "",
    end_time: "",
    status: "draft",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/votings/${id}`).then(r => {
      const v = r.data.voting;
      setForm({
        title: v.title || "",
        description: v.description || "",
        contract_address: v.contract_address || "",
        start_time: toLocalDatetime(v.start_time),
        end_time: toLocalDatetime(v.end_time),
        status: v.status || "draft",
      });
    }).catch(() => toast.error("Không thể tải thông tin")).finally(() => setLoading(false));
  }, [id, isEdit]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Tên cuộc bình chọn là bắt buộc";
    if (!form.start_time) e.start_time = "Thời gian bắt đầu là bắt buộc";
    if (!form.end_time) e.end_time = "Thời gian kết thúc là bắt buộc";
    if (form.start_time && form.end_time && new Date(form.start_time) >= new Date(form.end_time)) {
      e.end_time = "Thời gian kết thúc phải sau thời gian bắt đầu";
    }
    if (form.contract_address && !/^0x[0-9a-fA-F]{40}$/.test(form.contract_address)) {
      e.contract_address = "Địa chỉ contract không hợp lệ (phải là địa chỉ Ethereum)";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        start_time: new Date(form.start_time).toISOString(),
        end_time: new Date(form.end_time).toISOString(),
        contract_address: form.contract_address.trim() || null,
      };

      if (isEdit) {
        await api.put(`/votings/${id}`, payload);
        toast.success("Đã cập nhật cuộc bình chọn");
      } else {
        const r = await api.post("/votings", payload);
        toast.success("Đã tạo cuộc bình chọn!");
        navigate(`/admin/votings/${r.data.voting.id}/candidates`);
        return;
      }
      navigate("/admin/votings");
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi lưu dữ liệu");
    } finally {
      setSaving(false);
    }
  };

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  if (loading) return <AdminLayout><div style={{ padding: 60, textAlign: "center" }}><div className="spinner" style={{ width: 32, height: 32, margin: "0 auto" }} /></div></AdminLayout>;

  return (
    <AdminLayout>
      <div style={{ maxWidth: 680 }}>
        <div style={{ marginBottom: 24 }}>
          <Link to="/admin/votings" style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>← Quay lại</Link>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginTop: 8 }}>
            {isEdit ? "Chỉnh sửa cuộc bình chọn" : "Tạo cuộc bình chọn mới"}
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <Card style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 16 }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-dim)", borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
              Thông tin cơ bản
            </h2>

            <Input
              label="Tên cuộc bình chọn *"
              placeholder="VD: Bình chọn Ban đại diện lớp 2024"
              value={form.title}
              onChange={e => set("title", e.target.value)}
              error={errors.title}
            />

            <Textarea
              label="Mô tả"
              placeholder="Mô tả chi tiết về cuộc bình chọn (không bắt buộc)"
              value={form.description}
              onChange={e => set("description", e.target.value)}
              rows={3}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Input
                label="Thời gian bắt đầu *"
                type="datetime-local"
                value={form.start_time}
                onChange={e => set("start_time", e.target.value)}
                error={errors.start_time}
              />
              <Input
                label="Thời gian kết thúc *"
                type="datetime-local"
                value={form.end_time}
                onChange={e => set("end_time", e.target.value)}
                error={errors.end_time}
              />
            </div>
          </Card>

          <Card style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 16 }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-dim)", borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
              Cấu hình Blockchain
            </h2>

            <Input
              label="Địa chỉ Smart Contract (sau khi deploy)"
              placeholder="0x..."
              value={form.contract_address}
              onChange={e => set("contract_address", e.target.value)}
              error={errors.contract_address}
              style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}
            />

            <div style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: "var(--radius)", padding: "14px 16px", fontSize: "0.83rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
              💡 <strong style={{ color: "var(--text-dim)" }}>Hướng dẫn:</strong> Deploy contract bằng lệnh <code style={{ fontFamily: "var(--font-mono)", background: "var(--bg-elevated)", padding: "2px 6px", borderRadius: 4, color: "var(--accent-bright)" }}>npm run deploy:local</code> trong thư mục <code style={{ fontFamily: "var(--font-mono)", background: "var(--bg-elevated)", padding: "2px 6px", borderRadius: 4 }}>blockchain/</code>, sau đó dán địa chỉ contract vào đây.
            </div>

            {isEdit && (
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-dim)", marginBottom: 6 }}>Trạng thái</label>
                <select
                  value={form.status}
                  onChange={e => set("status", e.target.value)}
                  style={{
                    background: "var(--bg-elevated)", border: "1px solid var(--border-bright)",
                    borderRadius: "var(--radius)", padding: "10px 14px",
                    color: "var(--text)", fontSize: "0.9rem", width: "100%", cursor: "pointer"
                  }}
                >
                  <option value="draft">Bản nháp</option>
                  <option value="active">Đang mở</option>
                  <option value="ended">Đã kết thúc</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>
            )}
          </Card>

          <div style={{ display: "flex", gap: 12 }}>
            <Button type="submit" variant="primary" size="lg" loading={saving}>
              {isEdit ? "💾 Lưu thay đổi" : "✅ Tạo và thêm ứng viên →"}
            </Button>
            <Link to="/admin/votings">
              <Button variant="ghost" size="lg">Hủy</Button>
            </Link>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
