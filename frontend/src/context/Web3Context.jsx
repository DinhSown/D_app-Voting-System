import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";

const Web3Context = createContext(null);

export function Web3Provider({ children }) {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);

  useEffect(() => {
    setIsMetaMaskInstalled(typeof window.ethereum !== "undefined");
  }, []);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      toast.error("Vui lòng cài MetaMask để tiếp tục!");
      window.open("https://metamask.io/download/", "_blank");
      return;
    }
    setIsConnecting(true);
    try {
      const _provider = new ethers.BrowserProvider(window.ethereum);
      await _provider.send("eth_requestAccounts", []);
      const _signer = await _provider.getSigner();
      const _account = await _signer.getAddress();
      const network = await _provider.getNetwork();

      setProvider(_provider);
      setSigner(_signer);
      setAccount(_account);
      setChainId(Number(network.chainId));
      toast.success("Đã kết nối ví thành công!");
    } catch (err) {
      if (err.code === 4001) toast.error("Bạn đã từ chối kết nối ví.");
      else toast.error("Lỗi kết nối ví: " + err.message);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
    toast("Đã ngắt kết nối ví.", { icon: "👋" });
  }, []);

  // Auto reconnect if already authorized
  useEffect(() => {
    const autoConnect = async () => {
      if (!window.ethereum) return;
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          const _provider = new ethers.BrowserProvider(window.ethereum);
          const _signer = await _provider.getSigner();
          const network = await _provider.getNetwork();
          setProvider(_provider);
          setSigner(_signer);
          setAccount(accounts[0]);
          setChainId(Number(network.chainId));
        }
      } catch {}
    };
    autoConnect();
  }, []);

  // Listen for account/chain changes
  useEffect(() => {
    if (!window.ethereum) return;
    const onAccountsChanged = (accounts) => {
      if (accounts.length === 0) disconnectWallet();
      else {
        setAccount(accounts[0]);
        toast("Đã chuyển tài khoản.", { icon: "🔄" });
      }
    };
    const onChainChanged = () => window.location.reload();
    window.ethereum.on("accountsChanged", onAccountsChanged);
    window.ethereum.on("chainChanged", onChainChanged);
    return () => {
      window.ethereum.removeListener("accountsChanged", onAccountsChanged);
      window.ethereum.removeListener("chainChanged", onChainChanged);
    };
  }, [disconnectWallet]);

  const getContract = useCallback((address, abi) => {
    if (!signer) return null;
    return new ethers.Contract(address, abi, signer);
  }, [signer]);

  const getReadonlyContract = useCallback((address, abi) => {
    const p = provider || new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    return new ethers.Contract(address, abi, p);
  }, [provider]);

  return (
    <Web3Context.Provider value={{
      provider, signer, account, chainId,
      isConnecting, isMetaMaskInstalled,
      connectWallet, disconnectWallet,
      getContract, getReadonlyContract,
    }}>
      {children}
    </Web3Context.Provider>
  );
}

export const useWeb3 = () => {
  const ctx = useContext(Web3Context);
  if (!ctx) throw new Error("useWeb3 must be inside Web3Provider");
  return ctx;
};
