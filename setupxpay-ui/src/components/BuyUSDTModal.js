import React, { useState, useEffect } from "react";
import { FaArrowLeft } from "react-icons/fa";

const BuyUSDTModal = ({ walletAddress, onClose, onPaymentSuccess }) => {
  const [amountInr, setAmountInr] = useState("");
  const [rate, setRate] = useState(null);
  const [fee, setFee] = useState(0);
  const [usdtQty, setUsdtQty] = useState("0");
  const [loading, setLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const res = await fetch("https://setupxpay-backend.onrender.com/rate");
        const data = await res.json();
        setRate(data?.buy || 95);
      } catch (err) {
        console.error("❌ Failed to fetch rate:", err);
        setRate(95); // fallback
      }
    };
    fetchRate();
  }, []);

  useEffect(() => {
    const amt = parseFloat(amountInr);
    if (!amt || !rate) {
      setFee(0);
      setUsdtQty("0");
      return;
    }

    const calculatedFee = Math.ceil(amt * 0.01); // 1% fee
    const usdt = (amt - calculatedFee) / rate;

    setFee(calculatedFee);
    setUsdtQty(usdt.toFixed(2));
  }, [amountInr, rate]);

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
          localStorage.setItem("payment_success", "true");
          setShowSuccessPopup(true);
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

  const handlePopupClose = () => {
    setShowSuccessPopup(false);
    onClose(); // Close BuyUSDTModal
    onPaymentSuccess(); // Show dashboard animation
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Main modal content */}
      <div className="relative w-full h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center p-4 shadow border-b">
          <button onClick={onClose} className="text-gray-700 text-lg">
            <FaArrowLeft />
          </button>
          <h2 className="text-lg font-semibold ml-4 text-gray-800">Buy USDT</h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 flex-1 overflow-auto">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Enter INR Amount
            </label>
            <input
              type="number"
              placeholder="e.g. 1000"
              className="w-full border px-4 py-2 rounded-lg text-sm outline-blue-600"
              value={amountInr}
              onChange={(e) => setAmountInr(e.target.value)}
            />
          </div>

          <div className="bg-gray-100 rounded-xl p-4 space-y-2 text-sm">
            <p className="flex justify-between text-gray-700">
              <span>Live Rate</span>
              <span>₹{rate || "--"}</span>
            </p>
            <p className="flex justify-between text-gray-700">
              <span>Platform Fee (1%)</span>
              <span>₹{fee}</span>
            </p>
            <hr />
            <p className="flex justify-between font-semibold text-blue-700 text-base">
              <span>USDT You’ll Receive</span>
              <span>{usdtQty}</span>
            </p>
          </div>

          <button
            onClick={handlePay}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700"
          >
            {loading ? "Processing..." : "Proceed to Pay"}
          </button>
        </div>
      </div>

      {/* ✅ Success Popup with backdrop blur */}
      {showSuccessPopup && (
        <div className="absolute inset-0 bg-white bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white px-6 py-6 rounded-xl shadow-lg text-center w-[90%] max-w-sm border border-green-300">
            <div className="text-4xl mb-2">✅</div>
            <h3 className="text-lg font-semibold text-green-700 mb-2">
              Payment Received Successfully!
            </h3>
            <p className="text-sm text-gray-700 mb-4">
              We've sent the USDT to your wallet address.
            </p>
            <button
              onClick={handlePopupClose}
              className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyUSDTModal;
