import React, { useState } from "react";

const DepositUSDTModal = ({ walletAddress, onClose, onPaymentSuccess }) => {
  const [amountInr, setAmountInr] = useState("");
  const [loading, setLoading] = useState(false);
  const [usdtQty, setUsdtQty] = useState("");
  const [rate, setRate] = useState(null);

  const handleFetchRate = async () => {
    if (!amountInr) return alert("Enter amount in INR");

    try {
      const res = await fetch("https://setupxpay-backend.onrender.com/rate");
      const data = await res.json();
      setRate(data.rate);
      const usdt = (Number(amountInr) / data.rate).toFixed(2);
      setUsdtQty(usdt);
    } catch (err) {
      console.error("❌ Rate fetch failed:", err);
      alert("Failed to fetch USDT rate.");
    }
  };

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePay = async () => {
    if (!amountInr || !walletAddress) return alert("Amount or wallet missing");
    setLoading(true);

    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      alert("Razorpay SDK load failed");
      return setLoading(false);
    }

    try {
      // 👉 Create payment order from backend
      const res = await fetch("https://setupxpay-backend.onrender.com/create-payment-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountInr, walletAddress }),
      });
      const data = await res.json();

      if (!data.orderId) {
        alert("Failed to create payment order");
        return setLoading(false);
      }

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "SetupXPay",
        description: `Deposit USDT to wallet`,
        order_id: data.orderId,
        handler: function (response) {
          console.log("✅ Payment successful:", response);
          // Razorpay will trigger webhook → send USDT
          localStorage.setItem("payment_success", "true");
          onClose(); // close modal
          onPaymentSuccess(); // show dashboard success animation
        },
        prefill: {
          name: "SetupXPay User",
          email: "user@setupxpay.in",
        },
        notes: {
          wallet: walletAddress,
        },
        theme: {
          color: "#0d9488",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("❌ Razorpay init failed:", err);
      alert("Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 text-xl hover:text-red-600"
        >
          ×
        </button>
        <h3 className="text-xl font-bold text-center text-blue-800 mb-4">💸 Deposit USDT</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount (in ₹)
          </label>
          <input
            type="number"
            value={amountInr}
            onChange={(e) => setAmountInr(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter INR amount"
          />
        </div>

        <button
          onClick={handleFetchRate}
          className="mb-3 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition"
        >
          Show USDT Rate
        </button>

        {rate && (
          <div className="text-center mb-4">
            <p className="text-sm text-gray-700">Live Rate: ₹{rate}</p>
            <p className="text-md text-green-600 font-bold">
              You will get ≈ {usdtQty} USDT
            </p>
          </div>
        )}

        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded transition"
        >
          {loading ? "Processing..." : "Proceed to Pay"}
        </button>
      </div>
    </div>
  );
};

export default DepositUSDTModal;
