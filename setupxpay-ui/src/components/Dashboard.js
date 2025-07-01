import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DepositUSDTModal from "./DepositUSDTModal";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState("0");
  const [transactions, setTransactions] = useState([]);
  const [showDeposit, setShowDeposit] = useState(false);
  const navigate = useNavigate();

  // ✅ On first load - fetch user or redirect
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // ✅ When user loads - fetch balance + transactions
  useEffect(() => {
    if (user) {
      fetchBalance();
      fetchTransactions();
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
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="w-full max-w-3xl mx-auto mt-10 p-6 border rounded-lg shadow-lg bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">👋 Welcome, {user.name}</h2>
        <button
          onClick={handleLogout}
          className="text-red-600 hover:underline text-sm"
        >
          Logout
        </button>
      </div>

      <p className="mb-1">
        📬 <strong>Wallet Address:</strong><br />
        <span className="text-gray-700 break-all">{user.walletAddress}</span>
      </p>
      <p className="mb-4">
        💰 <strong>USDT Balance:</strong> {balance}
      </p>

      <button
        onClick={() => setShowDeposit(true)}
        className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded"
      >
        Deposit USDT
      </button>

      <h3 className="text-lg font-semibold mt-6">📜 Transaction History</h3>
      {transactions.length === 0 ? (
        <p className="text-sm text-gray-500 mt-2">No transactions yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full mt-2 text-sm border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Date</th>
                <th className="border p-2">INR</th>
                <th className="border p-2">USDT</th>
                <th className="border p-2">Tx ID</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx._id}>
                  <td className="border p-2">{new Date(tx.createdAt).toLocaleString()}</td>
                  <td className="border p-2">₹{tx.amountInr}</td>
                  <td className="border p-2">{tx.usdtAmount}</td>
                  <td className="border p-2 text-blue-600 underline">
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

      {showDeposit && (
        <DepositUSDTModal
          walletAddress={user.walletAddress}
          onClose={() => {
            setShowDeposit(false);
            fetchBalance(); // 🔄 refresh balance after deposit
            fetchTransactions(); // 🔄 refresh tx list
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
