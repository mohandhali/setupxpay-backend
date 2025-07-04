import React, { useState } from "react";

const WithdrawUSDT = ({ walletAddress, onClose }) => {
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [network, setNetwork] = useState("trc20"); // default
  const [loading, setLoading] = useState(false);

  const handleWithdraw = async () => {
    if (!amount || !recipient) {
      return alert("⚠️ Please enter all fields.");
    }

    if (network === "bep20") {
      return alert("🚧 BEP20 withdrawals coming soon!");
    }

    try {
      setLoading(true);
      const res = await fetch("https://setupxpay-backend.onrender.com/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from: walletAddress, to: recipient, amount, network }),
      });

      const data = await res.json();
      if (data.success) {
        alert("✅ Withdrawal successful!");
        if (typeof onClose === "function") onClose();
      } else {
        alert("❌ Withdrawal failed: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("❌ Withdrawal error:", err);
      alert("Withdrawal failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 text-xl hover:text-red-600"
        >
          ×
        </button>

        <h2 className="text-xl font-bold text-center text-blue-800 mb-4">Withdraw USDT</h2>

        <label className="block mb-2 font-medium text-sm text-gray-700">Amount (USDT)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-3 py-2 mb-4 border rounded focus:outline-none"
          placeholder="e.g. 10"
        />

        <label className="block mb-2 font-medium text-sm text-gray-700">Recipient Wallet</label>
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="w-full px-3 py-2 mb-4 border rounded focus:outline-none"
          placeholder="Enter USDT wallet address"
        />

        <label className="block mb-2 font-medium text-sm text-gray-700">Select Network</label>
        <select
          value={network}
          onChange={(e) => setNetwork(e.target.value)}
          className="w-full px-3 py-2 mb-4 border rounded"
        >
          <option value="trc20">TRC20 (1 USDT fee)</option>
          <option value="bep20" disabled>
            BEP20 (Coming Soon)
          </option>
        </select>

        <button
          onClick={handleWithdraw}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded transition"
        >
          {loading ? "Processing..." : "Withdraw"}
        </button>
      </div>
    </div>
  );
};

export default WithdrawUSDT;
