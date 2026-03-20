import React from "react";
import { Link } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import { PageWrapper } from "../components/UI";
import styles from "./HomePage.module.css";

const FEATURES = [
  { icon: "🔗", title: "Lưu trên Blockchain", desc: "Mỗi phiếu bầu là một giao dịch bất biến trên blockchain, không thể sửa đổi." },
  { icon: "🔐", title: "Xác thực bằng ví", desc: "Mỗi địa chỉ ví chỉ bỏ phiếu một lần, được kiểm soát bởi smart contract." },
  { icon: "📊", title: "Kết quả minh bạch", desc: "Ai cũng có thể kiểm tra kết quả và lịch sử bỏ phiếu công khai." },
  { icon: "⚡", title: "Không cần tin tưởng", desc: "Smart contract tự động thực thi quy tắc, không cần bên trung gian." },
];

export default function HomePage() {
  const { account, connectWallet, isConnecting } = useWeb3();

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <div className={styles.orb1} />
          <div className={styles.orb2} />
          <div className={styles.grid} />
        </div>
        <PageWrapper>
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <span className={styles.heroBadgeDot} /> Powered by Blockchain
            </div>
            <h1 className={styles.heroTitle}>
              Bình Chọn<br />
              <span className={styles.heroTitleAccent}>Minh Bạch</span><br />
              Trên Chuỗi Khối
            </h1>
            <p className={styles.heroSub}>
              Hệ thống bình chọn phi tập trung — mỗi phiếu bầu được ghi nhận công khai,
              không thể sửa đổi, và ai cũng có thể kiểm chứng.
            </p>
            <div className={styles.heroActions}>
              <Link to="/votings" className={styles.ctaPrimary}>Xem các cuộc bình chọn →</Link>
              {!account && (
                <button className={styles.ctaSecondary} onClick={connectWallet} disabled={isConnecting}>
                  {isConnecting ? "Đang kết nối…" : "Kết nối MetaMask"}
                </button>
              )}
            </div>
            {account && (
              <p className={styles.connectedNote}>✅ Ví đã kết nối — bạn có thể bắt đầu bỏ phiếu!</p>
            )}
          </div>
        </PageWrapper>
      </section>

      {/* Features */}
      <PageWrapper>
        <section className={styles.features}>
          <h2 className={styles.sectionTitle}>Tại sao chọn VoteChain?</h2>
          <div className={styles.featureGrid}>
            {FEATURES.map((f, i) => (
              <div key={i} className={styles.featureCard} style={{ animationDelay: `${i * 0.1}s` }}>
                <span className={styles.featureIcon}>{f.icon}</span>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className={styles.howto}>
          <h2 className={styles.sectionTitle}>Cách hoạt động</h2>
          <div className={styles.steps}>
            {[
              ["01", "Kết nối ví", "Kết nối MetaMask của bạn vào hệ thống."],
              ["02", "Chọn cuộc bình chọn", "Xem danh sách các cuộc bình chọn đang diễn ra."],
              ["03", "Bỏ phiếu", "Chọn ứng viên và ký giao dịch qua MetaMask."],
              ["04", "Xem kết quả", "Kết quả cập nhật trực tiếp từ blockchain."],
            ].map(([num, title, desc]) => (
              <div key={num} className={styles.step}>
                <span className={styles.stepNum}>{num}</span>
                <h3 className={styles.stepTitle}>{title}</h3>
                <p className={styles.stepDesc}>{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </PageWrapper>
    </div>
  );
}
