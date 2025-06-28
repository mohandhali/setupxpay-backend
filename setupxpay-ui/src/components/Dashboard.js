import React, { useEffect, useState } from "react";
import { useRouter } from "next/router"; // or useNavigate if using CRA
import DepositUSDTModal from "./DepositUSDTModal";

const Dashboard = ({ user: userProp }) => {
  const [user, setUser] = useState(userProp || null);
  const [balance, setBalance] = useState("0");
  const [transactions, setTransactions] = useState([]);
  const [showDeposit, setShowDeposit] = useState(false);
  const router = useRouter(); // or useNavigate() for CRA

  useEffect(() => {
    // ✅ Load user from localStorage if not passed as prop
    if (!userProp) {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        // ❌ No user found, redirect to login
        router.push("/login");
      }
    }
  }, []);

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
    } catch (error) {
      console.error("❌ Balance fetch error:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch(`https://setupxpay-backend.onrender.com/transactions?wallet=${user.walletAddress}`);
      const data = await res.json();
      setTransactions(data);
    } catch (error) {
      console.error("❌ Transaction fetch error:", error);
    }
  };

  if (!user) return null; // wait for user to be loaded

  return (
    <div className="w-full max-w-3xl mx-auto mt-10 p-6 border rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">👋 Welcome, {user.name}</h2>
      <p>📬 <strong>Wallet Address:</strong><br />{user.walletAddress}</p>
      <p>💰 <strong>USDT Balance:</strong> {balance}</p>

      <button
        onClick={() => setShowDeposit(true)}
        className="mt-4 bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded"
      >
        Deposit USDT
      </button>

      <h3 className="text-lg font-semibold mt-6">📜 Transaction History</h3>
      {transactions.length === 0 ? (
        <p className="text-sm text-gray-500">No transactions yet.</p>
      ) : (
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
            {transactions.map(tx => (
              <tr key={tx._id}>
                <td className="border p-2">{new Date(tx.createdAt).toLocaleString()}</td>
                <td className="border p-2">₹{tx.amountInr}</td>
                <td className="border p-2">{tx.usdtAmount}</td>
                <td className="border p-2 text-blue-600 underline">
                  <a href={`https://tronscan.org/#/transaction/${tx.txId}`} target="_blank" rel="noreferrer">
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showDeposit && (
        <DepositUSDTModal
          walletAddress={user.walletAddress}
          onClose={() => setShowDeposit(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
