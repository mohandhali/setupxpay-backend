import WithdrawUSDT from "./WithdrawUSDT";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import DepositUSDTModal from "./DepositUSDTModal";
import { FaUserCircle } from "react-icons/fa";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState("0");
  const [transactions, setTransactions] = useState([]);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  const [showWithdraw, setShowWithdraw] = useState(false);

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
      fetchTransactions();
    }
  }, [user]);

  // ✅ Show success message if redirected from payment
  useEffect(() => {
    const paymentStatus = localStorage.getItem("paymentStatus");
    if (paymentStatus === "success") {
      localStorage.removeItem("paymentStatus");
      setTimeout(() => {
        alert("✅ Payment received successfully!");
      }, 500);
    }
  }, []);

  const fetchBalance = async () => {
    try {
      const res = await fetch(`https://setupxpay-backend.onrender.com/get-balance/${user.walletAddress}`);
      const data = await res.json();
      setBalance(data.usdt || "0");
    } catch (err) {
      console.error("❌ Error fetching balance:", err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch(`https://setupxpay-backend.onrender.com/transactions?wallet=${user.walletAddress}`);
      const data = await res.json();
      setTransactions(data || []);
    } catch (err) {
      console.error("❌ Error fetching transactions:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-100 to-blue-300 overflow-auto px-4 py-6">
    {showSuccess && (
       <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-2 rounded-xl shadow-lg z-50 transition-opacity duration-500 ease-in-out opacity-100 animate-fade">
          ✅ Payment Received Successfully!
       </div>
     )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-blue-900">Dashboard</h2>
        <div className="relative">
          <FaUserCircle
            className="text-3xl text-blue-700 cursor-pointer"
            onClick={() => setShowDropdown(!showDropdown)}
          />
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-44 bg-white border rounded-lg shadow-md z-10">
              <div className="px-4 py-2 text-sm text-gray-700 border-b">{user.email}</div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Wallet Info */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 text-center">
        <p className="text-lg font-semibold text-gray-700 mb-1">Wallet Address</p>
        <p className="text-xs text-blue-800 break-all mb-4">{user.walletAddress}</p>
        <div className="flex justify-center mb-4">
          <div className="bg-white p-2 rounded-lg shadow">
            <QRCode value={user.walletAddress} size={120} bgColor="#ffffff" fgColor="#000000" />
          </div>
        </div>
        <p className="text-md text-gray-600 font-medium">
          💰 USDT Balance:{" "}
          <span className="text-green-700 font-semibold">{balance}</span>
        </p>
      </div>

      {/* Deposit Button */}
      <div className="text-center mb-8">
        <button
          onClick={() => setShowDeposit(true)}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg shadow-md hover:scale-105 transition"
        >
          Deposit USDT
        </button>
         <button
           onClick={() => setShowWithdraw(true)}
           className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg shadow-md hover:scale-105 transition"
  >
          Withdraw USDT
        </button>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">📜 Transaction History</h3>
        {transactions.length === 0 ? (
          <p className="text-sm text-gray-500">No transactions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border">
              <thead className="bg-gray-100">
                <tr>
                   <th className="p-2 border">Date</th>
                   <th className="p-2 border">Type</th> {/* 🆕 */}
                   <th className="p-2 border">INR</th>
                   <th className="p-2 border">USDT</th>
                   <th className="p-2 border">Tx ID</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-gray-50">
                    <td className="p-2 border">{new Date(tx.createdAt).toLocaleString()}</td>
                    <td className="p-2 border capitalize">{tx.type || "deposit"}</td> {/* 🆕 */}
                    <td className="p-2 border">{tx.amountInr ? `₹${tx.amountInr}` : "-"}</td>
                    <td className="p-2 border">{tx.usdtAmount}</td>
                    <td className="p-2 border text-blue-600 underline"> 
                      <a
                        href={`https://tronscan.org/#/transaction/${tx.txId}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Deposit Modal */}
      {showDeposit && (
  <DepositUSDTModal
    walletAddress={user.walletAddress}
    onClose={() => {
      setShowDeposit(false);
      fetchBalance();
      fetchTransactions();
    }}
    onPaymentSuccess={() => {
      setShowSuccess(true); // ✅ Animated message
      fetchBalance();
      fetchTransactions();
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
      fetchTransactions();
    }}
  />
)}

    </div>
  );
};

export default Dashboard;
