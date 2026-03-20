export const shortenAddress = (addr) => {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return "–";
  return new Date(dateStr).toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

export const getVotingStatusLabel = (status) => {
  const map = {
    draft: { label: "Bản nháp", color: "#64748b" },
    active: { label: "Đang mở", color: "#10b981" },
    ended: { label: "Đã kết thúc", color: "#ef4444" },
    cancelled: { label: "Đã hủy", color: "#f59e0b" },
  };
  return map[status] || { label: status, color: "#64748b" };
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

export const getExplorerUrl = (txHash, chainId) => {
  if (chainId === 11155111) return `https://sepolia.etherscan.io/tx/${txHash}`;
  if (chainId === 80001) return `https://mumbai.polygonscan.com/tx/${txHash}`;
  return null; // local
};
