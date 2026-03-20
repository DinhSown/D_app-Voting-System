import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import api from "../utils/api";
import { useWeb3 } from "../context/Web3Context";
import { PageWrapper, Loader, Button, Card } from "../components/UI";
import { formatDate, shortenAddress } from "../utils/helpers";

export default function VotePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { account, connectWallet, getContract } = useWeb3();

  const [voting, setVoting] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [voting_tx, setVotingTx] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [contractConfig, setContractConfig] = useState(null);

  // Load voting data
  useEffect(() => {
    const load = async () => {
      try {
        const r = await api.get(`/votings/${id}`);
        setVoting(r.data.voting);
        setCandidates(r.data.candidates || []);

        // Load contract config
        try {
          const cfg = await fetch("/contractConfig.json").then(r => r.json());
          setContractConfig(cfg);
        } catch {}
      } catch {
        toast.error("Không thể tải dữ liệu cuộc bình chọn");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // Check if wallet already voted
  const checkHasVoted = useCallback(async () => {
    if (!account || !voting?.contract_address || !contractConfig) return;
    try {
      const contract = getContract(voting.contract_address, contractConfig.abi);
      if (!contract) return;
      const voted = await contract.hasAddressVoted(account);
      setHasVoted(voted);
    } catch (err) {
      console.error("checkHasVoted error:", err);
    }
  }, [account, voting, contractConfig, getContract]);

  useEffect(() => { checkHasVoted(); }, [checkHasVoted]);

  const handleVote = async () => {
    if (!account) { connectWallet(); return; }
    if (!selected) { toast.error("Vui lòng chọn một ứng viên"); return; }
    if (!voting?.contract_address) { toast.error("Cuộc bình chọn chưa có địa chỉ contract"); return; }
    if (!contractConfig) { toast.error("Không tìm thấy cấu hình contract"); return; }

    setVotingTx(true);
    const toastId = toast.loading("Đang gửi giao dịch…");

    try {
      const contract = getContract(voting.contract_address, contractConfig.abi);
      if (!contract) throw new Error("Không thể kết nối contract");

      // Check again on-chain
      const alreadyVoted = await contract.hasAddressVoted(account);
      if (alreadyVoted) {
        toast.error("Ví này đã bỏ phiếu rồi!", { id: toastId });
        setHasVoted(true);
        return;
      }

      toast.loading("Chờ bạn xác nhận trong MetaMask…", { id: toastId });
      const tx = await contract.vote(selected);

      toast.loading("Đang chờ xác nhận giao dịch…", { id: toastId });
      const receipt = await tx.wait();

      setTxHash(receipt.hash);
      setHasVoted(true);
      toast.success("🎉 Bỏ phiếu thành công!", { id: toastId });

      // Record in backend
      try {
        await api.post("/transactions", {
          voting_id: parseInt(id),
          wallet_address: account,
          candidate_blockchain_id: selected,
          tx_hash: receipt.hash,
        });
      } catch (e) {
        console.warn("Backend record failed (non-critical):", e.message);
      }
    } catch (err) {
      if (err.code === 4001 || err.code === "ACTION_REJECTED") {
        toast.error("Bạn đã hủy giao dịch.", { id: toastId });
      } else if (err.message?.includes("already voted")) {
        toast.error("Ví này đã bỏ phiếu rồi!", { id: toastId });
        setHasVoted(true);
      } else {
        toast.error("Lỗi: " + (err.reason || err.message), { id: toastId });
      }
    } finally {
      setVotingTx(false);
    }
  };

  if (loading) return <PageWrapper><Loader /></PageWrapper>;
  if (!voting) return <PageWrapper><p style={{ color: "var(--text-muted)" }}>Không tìm thấy</p></PageWrapper>;

  if (voting.status !== "active") {
    return (
      <PageWrapper maxWidth="600px">
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>{voting.status === "ended" ? "🏁" : "📋"}</div>
          <h2 style={{ fontWeight: 800, marginBottom: 8 }}>Cuộc bình chọn {voting.status === "ended" ? "đã kết thúc" : "chưa mở"}</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>{voting.title}</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Link to={`/votings/${id}/results`}><Button>Xem kết quả</Button></Link>
            <Link to="/votings"><Button variant="ghost">Quay lại</Button></Link>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (hasVoted && txHash) {
    return (
      <PageWrapper maxWidth="600px">
        <Card style={{ textAlign: "center", padding: "48px 40px" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--green-glow)", border: "2px solid var(--green)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", margin: "0 auto 20px" }}>✅</div>
          <h2 style={{ fontWeight: 800, fontSize: "1.5rem", marginBottom: 8 }}>Bỏ phiếu thành công!</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>Phiếu bầu của bạn đã được ghi nhận trên blockchain</p>
          <div style={{ background: "var(--bg-elevated)", borderRadius: "var(--radius)", padding: "12px 16px", marginBottom: 24, wordBreak: "break-all" }}>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 4 }}>TX HASH</p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--accent-bright)" }}>{txHash}</p>
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Link to={`/votings/${id}/results`}><Button>Xem kết quả →</Button></Link>
            <Link to="/votings"><Button variant="ghost">Quay lại</Button></Link>
          </div>
        </Card>
      </PageWrapper>
    );
  }

  if (hasVoted) {
    return (
      <PageWrapper maxWidth="600px">
        <Card style={{ textAlign: "center", padding: "48px 40px" }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>🗳️</div>
          <h2 style={{ fontWeight: 800, marginBottom: 8 }}>Bạn đã bỏ phiếu</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: 8 }}>Ví <span style={{ fontFamily: "var(--font-mono)", color: "var(--accent-bright)" }}>{shortenAddress(account)}</span> đã tham gia bình chọn này.</p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: 24 }}>Mỗi địa chỉ ví chỉ được bỏ phiếu một lần.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Link to={`/votings/${id}/results`}><Button>Xem kết quả</Button></Link>
          </div>
        </Card>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper maxWidth="720px">
      <div style={{ marginBottom: 12 }}>
        <Link to={`/votings/${id}`} style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>← Quay lại</Link>
      </div>

      <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: 6 }}>{voting.title}</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: 8, fontSize: "0.9rem" }}>Kết thúc: {formatDate(voting.end_time)}</p>

      {!account && (
        <Card style={{ marginBottom: 20, background: "rgba(124,58,237,0.08)", borderColor: "rgba(124,58,237,0.3)" }}>
          <p style={{ marginBottom: 12, fontWeight: 600 }}>🔗 Kết nối ví để bỏ phiếu</p>
          <Button onClick={connectWallet}>Kết nối MetaMask</Button>
        </Card>
      )}

      <p style={{ color: "var(--text-dim)", fontWeight: 600, marginBottom: 16 }}>
        Chọn một ứng viên ({candidates.length} người):
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
        {candidates.map((c, i) => {
          const isSelected = selected === c.blockchain_candidate_id;
          return (
            <div
              key={c.id}
              onClick={() => account && setSelected(c.blockchain_candidate_id)}
              style={{
                background: isSelected ? "rgba(124,58,237,0.12)" : "var(--bg-card)",
                border: `2px solid ${isSelected ? "var(--accent)" : "var(--border)"}`,
                borderRadius: "var(--radius-lg)", padding: "18px 20px",
                cursor: account ? "pointer" : "not-allowed",
                transition: "var(--transition)", display: "flex", alignItems: "center", gap: 16,
                opacity: account ? 1 : 0.6,
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                background: isSelected ? "var(--accent)" : "var(--bg-elevated)",
                border: `2px solid ${isSelected ? "var(--accent)" : "var(--border-bright)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, color: isSelected ? "white" : "var(--text-muted)"
              }}>
                {isSelected ? "✓" : (i + 1)}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, marginBottom: 2, color: isSelected ? "var(--accent-bright)" : "var(--text)" }}>{c.candidate_name}</p>
                {c.candidate_description && <p style={{ color: "var(--text-muted)", fontSize: "0.83rem" }}>{c.candidate_description}</p>}
              </div>
              {isSelected && <span style={{ color: "var(--accent-bright)", fontWeight: 700 }}>✓ Đã chọn</span>}
            </div>
          );
        })}
      </div>

      <Button
        variant="primary"
        size="lg"
        loading={voting_tx}
        disabled={!account || !selected || voting_tx}
        onClick={handleVote}
        style={{ width: "100%", justifyContent: "center", padding: "16px" }}
      >
        {!account ? "Kết nối ví để bỏ phiếu" : !selected ? "Chọn ứng viên trước" : "🗳️ Xác nhận bỏ phiếu"}
      </Button>

      <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: 12, textAlign: "center" }}>
        Giao dịch sẽ yêu cầu xác nhận từ MetaMask. Mỗi ví chỉ được bỏ phiếu một lần.
      </p>
    </PageWrapper>
  );
}
