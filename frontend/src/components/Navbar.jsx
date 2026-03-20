import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import { shortenAddress } from "../utils/helpers";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { account, connectWallet, disconnectWallet, isConnecting } = useWeb3();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { to: "/", label: "Trang chủ" },
    { to: "/votings", label: "Bình chọn" },
  ];

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>⬡</span>
          <span>VoteChain</span>
        </Link>

        <div className={styles.links}>
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} className={`${styles.link} ${location.pathname === l.to ? styles.active : ""}`}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className={styles.actions}>
          {account ? (
            <div className={styles.walletInfo}>
              <span className={styles.dot} />
              <span className={styles.address}>{shortenAddress(account)}</span>
              <button className={styles.disconnectBtn} onClick={disconnectWallet} title="Ngắt kết nối">✕</button>
            </div>
          ) : (
            <button className={styles.connectBtn} onClick={connectWallet} disabled={isConnecting}>
              {isConnecting ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Đang kết nối…</> : "Kết nối ví"}
            </button>
          )}
        </div>

        <button className={styles.menuToggle} onClick={() => setMenuOpen(!menuOpen)}>☰</button>
      </div>

      {menuOpen && (
        <div className={styles.mobileMenu}>
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} className={styles.mobileLink} onClick={() => setMenuOpen(false)}>{l.label}</Link>
          ))}
        </div>
      )}
    </nav>
  );
}
