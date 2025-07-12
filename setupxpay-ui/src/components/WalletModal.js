import React, { useState } from "react";
import QRCode from "react-qr-code";
import { FaArrowLeft } from "react-icons/fa";

const WalletModal = ({ walletAddress, onClose, openBuyModal }) => {
  const [activeTab, setActiveTab] = useState("receive");
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [network, setNetwork] = useState("trc20");
  const [loading, setLoading] = useState(false);
  const [receiveNetwork, setReceiveNetwork] = useState("trc20");

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
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="min-h-screen flex flex-col px-4 py-5">

        {/* Back Button */}
        <button
          onClick={onClose}
          className="text-gray-700 text-xl flex items-center gap-2 mb-4"
        >
          <FaArrowLeft />
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Tab Buttons */}
        <div className="flex justify-between border-b border-gray-200 mb-4">
          <button
            className={`w-1/2 py-3 font-semibold text-sm ${
              activeTab === "receive" ? "text-blue-700 border-b-2 border-blue-700 bg-blue-50" : "text-gray-600"
            }`}
            onClick={() => setActiveTab("receive")}
          >
            Receive
          </button>
          <button
            className={`w-1/2 py-3 font-semibold text-sm ${
              activeTab === "send" ? "text-blue-700 border-b-2 border-blue-700 bg-blue-50" : "text-gray-600"
            }`}
            onClick={() => setActiveTab("send")}
          >
            Send
          </button>
        </div>

        {/* Receive Tab */}
        {activeTab === "receive" && (
          <div className="w-full h-full flex flex-col items-center animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Receive USDT</h2>

            {/* Select Network */}
            <div className="w-full mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Network</label>
              <select
                value={receiveNetwork}
                onChange={(e) => setReceiveNetwork(e.target.value)}
                className="w-full border rounded px-3 py-2 focus:outline-none"
              >
                <option value="trc20">TRC20</option>
                <option value="bep20" disabled>BEP20 (Coming Soon)</option>
              </select>
            </div>

            <p className="text-sm text-gray-600 font-semibold mb-3">
              Receiving on <span className="text-blue-800 uppercase">{receiveNetwork}</span> network
            </p>

            <div className="bg-white p-3 rounded-lg shadow-md mb-3">
              <QRCode value={walletAddress} size={160} />
            </div>

            <p className="text-xs text-gray-700 text-center break-all mb-3">{walletAddress}</p>

            {/* Copy & Share */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(walletAddress);
                  alert("Copied!");
                }}
                className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded-full text-sm"
              >
                📋 Copy
              </button>
              <button
                onClick={() => {
                  const shareData = {
                    title: "My USDT Wallet",
                    text: "Send USDT here:",
                    url: walletAddress,
                  };
                  if (navigator.share) {
                    navigator.share(shareData).catch(() => alert("Sharing cancelled"));
                  } else {
                    alert("Sharing not supported");
                  }
                }}
                className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded-full text-sm"
              >
                📤 Share
              </button>
            </div>

            <button
              onClick={() => {
                onClose();
                setTimeout(() => openBuyModal(), 300);
              }}
              className="w-full bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold"
            >
              Buy from SetupXPay
            </button>
          </div>
        )}

        {/* Send Tab */}
        {activeTab === "send" && (
          <div className="w-full animate-fadeIn">
            <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">Send USDT</h2>

            <label className="block text-sm font-medium text-gray-700 mb-1">Select Network</label>
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              className="w-full px-3 py-2 mb-4 border rounded"
            >
              <option value="trc20">TRC20 (1 USDT fee)</option>
              <option value="bep20" disabled>BEP20 (Coming Soon)</option>
            </select>

            <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Wallet Address</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full px-3 py-2 mb-4 border rounded"
              placeholder="Enter recipient's wallet"
            />

            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (USDT)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 mb-4 border rounded"
              placeholder="e.g. 25"
            />

            <button
  onClick={handleWithdraw}
  disabled={loading}
  className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded-lg text-sm font-semibold"
>
  {loading ? "Sending..." : "Send USDT"}
</button>

          </div>
        )}
      </div>
    </div>
  );
};

export default WalletModal;
