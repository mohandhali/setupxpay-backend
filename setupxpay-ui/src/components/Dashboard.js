import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import DepositUSDTModal from "./DepositUSDTModal";
import WithdrawUSDT from "./WithdrawUSDT";
import WithdrawINRModal from "./WithdrawINRModal";
import {
  FaBars, FaUser, FaCog, FaWallet, FaFileAlt, FaSignOutAlt,
  FaCopy, FaQrcode, FaUsers, FaExchangeAlt
} from "react-icons/fa";
import { MdClose } from "react-icons/md";
import setupxpayLogo from "../assets/logo.png";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState("0");
  const [buyRate, setBuyRate] = useState("-");
  const [sellRate, setSellRate] = useState("-");
  const [showSidebar, setShowSidebar] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showQR, setShowQR] = useState(false);
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

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen w-full bg-white">
      {/* Header */}
      <div className="w-full flex items-center justify-between px-4 py-3 bg-white shadow-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <FaBars className="text-2xl text-gray-800 cursor-pointer" onClick={() => setShowSidebar(true)} />
          <img src={setupxpayLogo} alt="logo" className="h-8 w-8" />
          <span className="text-lg font-bold text-gray-900 tracking-wide">SetupXPay</span>
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

      {/* Wallet Info - Upgraded Design */}
      <div className="max-w-md mx-auto px-4 mt-6 animate-fadeIn">
  {/* Main White Box with Rounded Corners */}
  <div className="bg-white shadow-soft border border-gray-200 rounded-2xl overflow-hidden">

    {/* USDT Balance Section */}
    <div className="text-center px-6 py-5">
      <p className="text-sm text-gray-500">USDT Balance</p>
      <h2 className="text-4xl font-bold text-gray-900 tracking-wide">{balance}</h2>
      <p className="text-xs text-gray-500 mt-1">
        Wallet: {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
      </p>
    </div>

    {/* Buy/Sell Strip */}
    <div className="bg-blue-800 text-white px-6 py-2 flex justify-between items-center text-sm font-semibold">
      <span>Buy ₹{buyRate}</span>
      <span>Sell ₹{sellRate}</span>
    </div>

    {/* Thin Blue Line Below Buy/Sell Bar */}
    <div className="h-1 bg-blue-700 w-full" />

  </div>
</div>

      {/* Button Section */}
      <div className="grid grid-cols-3 gap-3 mb-4 mt-6 px-4">
        <button
          onClick={() => setShowDeposit(true)}
          className="bg-gray-100 border text-gray-800 rounded-xl py-3 flex flex-col items-center hover:bg-gray-200"
        >
          <FaWallet className="text-2xl mb-1" />
          Wallet
        </button>
        <button
          onClick={() => alert("Show transactions modal")}
          className="bg-gray-100 border text-gray-800 rounded-xl py-3 flex flex-col items-center hover:bg-gray-200"
        >
          <FaExchangeAlt className="text-2xl mb-1" />
          Transactions
        </button>
        <button
          onClick={() => alert("Community help page")}
          className="bg-gray-100 border text-gray-800 rounded-xl py-3 flex flex-col items-center hover:bg-gray-200"
        >
          <FaUsers className="text-2xl mb-1" />
          Community
        </button>
      </div>

      {/* Refer Section */}
      <div className="bg-white border rounded-xl p-4 text-center mb-20 shadow-sm mx-4">
        <p className="text-base font-semibold">🎁 Refer & Earn</p>
        <p className="text-xs text-gray-600">Invite friends and earn rewards on every transaction they make!</p>
      </div>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 w-full px-4 py-3 bg-white border-t shadow-md grid grid-cols-3 gap-3">
        <button
          onClick={() => setShowDeposit(true)}
          className="bg-blue-700 text-white py-2 rounded-xl"
        >Buy USDT</button>
        <button
          onClick={() => alert("Open scanner for QR payment")}
          className="bg-gray-700 text-white py-2 rounded-xl"
        >
          <FaQrcode className="inline" />
        </button>
        <button
          onClick={() => setShowWithdrawModal(true)}
          className="bg-blue-700 text-white py-2 rounded-xl"
        >Sell USDT</button>
      </div>

      {/* Modals */}
      {showDeposit && (
        <DepositUSDTModal
          walletAddress={user.walletAddress}
          onClose={() => {
            setShowDeposit(false);
            fetchBalance();
          }}
          onPaymentSuccess={() => {
            setShowSuccess(true);
            fetchBalance();
            setTimeout(() => setShowSuccess(false), 3000);
          }}
        />
      )}

      {showWithdraw && (
        <WithdrawUSDT
          walletAddress={user.walletAddress}
          onClose={() => {
            setShowWithdraw(false);
            fetchBalance();
          }}
        />
      )}

      {showWithdrawModal && (
        <WithdrawINRModal
          userId={user._id}
          onClose={() => {
            setShowWithdrawModal(false);
          }}
        />
      )}

      {showSuccess && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-2 rounded-xl shadow-lg z-50">
          ✅ Payment Received Successfully!
        </div>
      )}
    </div>
  );
};

export default Dashboard;