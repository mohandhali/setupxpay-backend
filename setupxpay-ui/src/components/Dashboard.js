import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import BuyUSDTModal from "./BuyUSDTModal";
import WalletModal from "./WalletModal";
import WithdrawINRModal from "./WithdrawINRModal";
import {
  FaBars, FaUser, FaCog, FaWallet, FaFileAlt, FaSignOutAlt,
  FaCopy, FaQrcode, FaUsers, FaExchangeAlt, FaTelegramPlane, FaWhatsapp
} from "react-icons/fa";
import { MdClose } from "react-icons/md";
import setupxpayLogo from "../assets/logo.png";
import TransactionHistory from "./TransactionHistory";
import SellUSDTQRModal from "./SellUSDTQRModal";



const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState("0");
  const [buyRate, setBuyRate] = useState("-");
  const [sellRate, setSellRate] = useState("-");
  const [showSidebar, setShowSidebar] = useState(false);
  const [showBuyUSDT, setShowBuyUSDT] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showSellQR, setShowSellQR] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [usdtPrice, setUsdtPrice] = useState(1.0);
  const navigate = useNavigate();
  

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed && parsed.walletAddress) {
          setUser(parsed);
        } else {
          navigate("/");
        }
      } catch {
        navigate("/");
      }
    } else {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    if (user?.walletAddress) {
      fetchBalance();
      fetchRates();
      fetchUSDTPrice();

     // 🔄 Auto-refresh rates every 10 seconds
    const interval = setInterval(() => {
      fetchRates();
      fetchUSDTPrice();
    }, 10000);

    return () => clearInterval(interval); // Cleanup on unmount
  }
}, [user]);

  const fetchBalance = async () => {
    try {
      const res = await fetch(`https://setupxpay-backend.onrender.com/get-balance/${user.walletAddress}`);
      const data = await res.json();
      setBalance(data.usdt || "0");
    } catch (err) {
      console.error("❌ Error fetching balance:", err);
    }
  };

  const fetchRates = async () => {
    try {
      const res = await fetch("https://setupxpay-backend.onrender.com/rate");
      const data = await res.json();
      setBuyRate(data?.buy || "-");
      setSellRate(data?.sell || "-");
    } catch (err) {
      console.error("❌ Error fetching rates:", err);
    }
  };

  // Fetch USDT price in USD from Binance
  const fetchUSDTPrice = async () => {
    try {
      const res = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=USDTUSD");
      if (res.ok) {
        const data = await res.json();
        setUsdtPrice(parseFloat(data.price));
      } else {
        setUsdtPrice(1.0); // fallback
      }
    } catch (err) {
      setUsdtPrice(1.0);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/"); // Redirect to landing page
  };

  if (!user) return null;

  // --- UI ---
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
      {/* Main scrollable content (everything except footer) */}
      <div className="flex-1 overflow-y-auto pb-32" style={{ maxHeight: '100vh', minHeight: 0 }}>
        {/* Header: User name only, no email, always white background, sticky at top */}
        <div className="w-full flex items-center justify-between px-4 py-4 bg-white sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <FaBars className="text-2xl text-gray-800 cursor-pointer" onClick={() => setShowSidebar(true)} />
            <span className="text-lg font-bold text-blue-900 tracking-wide">
              {user?.name
                ? user.name.split(" ")[0]
                : user?.email
                  ? user.email.split("@")[0]
                  : "User"}
            </span>
          </div>
        </div>

        {/* Sidebar */}
        <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${showSidebar ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex justify-between items-center px-4 py-3 border-b">
            <div className="flex items-center gap-2">
              <img src={setupxpayLogo} alt="logo" className="h-6 w-6" />
              <span className="text-base font-semibold text-gray-800">SetupXPay</span>
            </div>
            <MdClose className="text-xl cursor-pointer" onClick={() => setShowSidebar(false)} />
          </div>
          <div className="px-4 py-4 flex flex-col gap-4">
            <button className="flex items-center gap-3 text-gray-800 hover:text-blue-700"><FaUser /> Profile</button>
            <button className="flex items-center gap-3 text-gray-800 hover:text-blue-700"><FaFileAlt /> KYC</button>
            <button className="flex items-center gap-3 text-gray-800 hover:text-blue-700"><FaWallet /> Bank Details</button>
            <button className="flex items-center gap-3 text-gray-800 hover:text-blue-700"><FaCog /> Settings</button>
            <button className="flex items-center gap-3 text-red-600 hover:text-red-800" onClick={handleLogout}><FaSignOutAlt /> Logout</button>
          </div>
        </div>

        {/* Wallet Asset Card with merged Buy/Sell Rate (no extra white box below) */}
        <div className="max-w-md mx-auto px-4 mt-4 animate-fadeIn">
          <div className="bg-white/90 shadow-lg border border-blue-100 rounded-3xl overflow-hidden flex flex-col items-center pt-8 pb-0 mb-2">
            <div className="text-xs font-semibold text-blue-700 mb-2 tracking-widest uppercase">Wallet Asset</div>
            <div className="flex flex-col items-center mb-1">
              <span className="text-3xl font-bold text-gray-900 tracking-wide">${(parseFloat(balance) * usdtPrice).toFixed(2)}</span>
              <div className="text-xs text-gray-500 mt-1">{parseFloat(balance).toFixed(2)} USDT</div>
            </div>
            <div className="flex gap-4 mt-2 mb-4">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">USDT</span>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">Multi-chain</span>
            </div>
            {/* Merged Buy/Sell Rate Strip, flush with card bottom, with border-radius */}
            <div className="w-full bg-blue-800 text-white px-6 py-3 flex justify-between items-center text-base font-semibold rounded-b-3xl shadow-none">
              <span>Buy ₹{buyRate}</span>
              <span>Sell ₹{sellRate}</span>
            </div>
          </div>
        </div>

        {/* Main Actions (Wallet, Transactions, Community) - match footer button size and add more vertical gap above */}
        <div className="max-w-md mx-auto px-4 mt-4 mb-4">
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setShowWalletModal(true)}
              className="flex flex-col items-center justify-center bg-white border border-blue-100 text-blue-900 rounded-2xl py-3 px-2 w-full shadow hover:bg-blue-50 transition text-xs font-semibold h-20"
            >
              <FaWallet className="text-xl mb-1" />
              Wallet
            </button>
            <button
              onClick={() => setShowTransactionHistory(true)}
              className="flex flex-col items-center justify-center bg-white border border-blue-100 text-blue-900 rounded-2xl py-3 px-2 w-full shadow hover:bg-blue-50 transition text-xs font-semibold h-20"
            >
              <FaExchangeAlt className="text-xl mb-1" />
              Transactions
            </button>
            <button
              onClick={() => navigate("/community")}
              className="flex flex-col items-center justify-center bg-white border border-blue-100 text-blue-900 rounded-2xl py-3 px-2 w-full shadow hover:bg-blue-50 transition text-xs font-semibold h-20"
            >
              <FaUsers className="text-xl mb-1" />
              Community
            </button>
          </div>
        </div>

        {/* Refer Section - Upgraded, match Wallet Asset card width and alignment */}
        <div className="max-w-md mx-auto px-4 bg-white border rounded-2xl shadow-md p-5 mb-20 space-y-4">
          <h2 className="text-lg font-bold text-blue-700 text-center">🎁 Refer & Earn</h2>
          <p className="text-sm text-gray-600 text-center">
            Invite friends and earn rewards when they buy or sell USDT.
          </p>
          <div className="bg-gray-100 px-3 py-2 rounded-xl flex items-center justify-between text-sm">
            <span className="truncate font-mono">
              https://setupxpay.com/signup?ref={user._id?.slice(-6) || "abc123"}
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`https://setupxpay.com/signup?ref=${user._id?.slice(-6) || "abc123"}`);
                alert("Referral link copied!");
              }}
              className="ml-2 px-2 py-1 text-xs bg-blue-600 text-white rounded"
            >
              <FaCopy className="inline mr-1" /> Copy
            </button>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <a
              href={`https://wa.me/?text=Join%20SetupXPay%20and%20earn%20rewards!%20Use%20this%20link:%20https://setupxpay.com/signup?ref=${user._id?.slice(-6) || "abc123"}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-1 text-sm rounded-lg border text-green-600 border-green-600 hover:bg-green-50"
            >
              <FaWhatsapp />
              WhatsApp
            </a>
            <a
              href={`https://t.me/share/url?url=https://setupxpay.com/signup?ref=${user._id?.slice(-6) || "abc123"}&text=Join%20SetupXPay%20and%20earn%20USDT%20rewards!`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-1 text-sm rounded-lg border text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              <FaTelegramPlane />
              Telegram
            </a>
          </div>
        </div>
      </div>

      {/* Footer Actions - White background, dark blue buttons with white icon/text, no overlap with Refer & Earn */}
      <div className="fixed bottom-0 left-0 w-full flex justify-center items-center py-4 z-50 bg-white">
        <div className="flex gap-3 max-w-md w-full justify-center items-center px-4">
          <button
            onClick={() => setShowBuyUSDT(true)}
            className="flex flex-col items-center justify-center bg-blue-800 text-white rounded-2xl py-3 px-2 w-24 shadow hover:bg-blue-900 transition text-xs font-semibold"
          >
            <FaWallet className="text-xl mb-1 text-white" />
            Buy USDT
          </button>
          <button
            onClick={() => setShowSellQR(true)}
            className="flex flex-col items-center justify-center bg-blue-800 text-white rounded-2xl py-3 px-2 w-24 shadow hover:bg-blue-900 transition text-xs font-semibold"
          >
            <FaQrcode className="text-xl mb-1 text-white" />
            Scan & Pay
          </button>
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="flex flex-col items-center justify-center bg-blue-800 text-white rounded-2xl py-3 px-2 w-24 shadow hover:bg-blue-900 transition text-xs font-semibold"
          >
            <FaExchangeAlt className="text-xl mb-1 text-white" />
            Sell USDT
          </button>
        </div>
      </div>

      {/* Modals */}
      {showBuyUSDT && (
        <BuyUSDTModal
          trc20Address={user.walletAddress}
          bep20Address={user.bep20Address}
          onClose={() => setShowBuyUSDT(false)}
          onPaymentSuccess={() => {
            fetchBalance();
          }}
        />
      )}
      {showWalletModal && (
        <WalletModal
          trc20Address={user.walletAddress}
          bep20Address={user.bep20Address}
          onClose={() => setShowWalletModal(false)}
          openBuyModal={() => {
            setShowWalletModal(false);
            setTimeout(() => setShowBuyUSDT(true), 300);
          }}
        />
      )}
      {showSellQR && (
        <SellUSDTQRModal
          userId={user?._id}
          trc20Address={user?.walletAddress}
          bep20Address={user?.bep20Address}
          onClose={() => {
            setShowSellQR(false);
          }}
        />
      )}
      {showWithdrawModal && (
        <WithdrawINRModal
          userId={user?._id}
          trc20Address={user?.walletAddress}
          bep20Address={user?.bep20Address}
          onClose={() => setShowWithdrawModal(false)}
        />
      )}
      {showTransactionHistory && (
        <TransactionHistory
          walletAddress={user.walletAddress}
          onClose={() => setShowTransactionHistory(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;