import React, { useState, useEffect } from "react";

const DepositUSDTModal = ({ walletAddress, onClose }) => {
  const [inrAmount, setInrAmount] = useState("");
  const [usdtRate, setUsdtRate] = useState(null);
  const [usdtQty, setUsdtQty] = useState(null);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const res = await fetch("https://setupxpay-backend.onrender.com/rate");
        const data = await res.json();
        setUsdtRate(data.rate);
      } catch (err) {
        console.error("Rate fetch failed", err);
      }
    };
    fetchRate();
  }, []);

  useEffect(() => {
    if (inrAmount && usdtRate) {
      setUsdtQty((parseFloat(inrAmount) / usdtRate).toFixed(2));
    }
  }, [inrAmount, usdtRate]);

  const handleProceed = async () => {
    try {
      const res = await fetch("https://setupxpay-backend.onrender.com/create-payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountInr: inrAmount, walletAddress }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Payment link creation failed.");
        console.error("Backend returned:", data);
      }
    } catch (err) {
      console.error("Failed to create payment link", err);
      alert("Something went wrong. Try again later.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[350px]">
        <h2 className="text-xl font-semibold mb-4">Deposit USDT</h2>
        <input
          type="number"
          placeholder="Enter INR amount"
          value={inrAmount}
          onChange={(e) => setInrAmount(e.target.value)}
          className="border border-gray-300 rounded-md w-full p-2 mb-3"
        />
        {usdtRate && (
          <div className="text-gray-700 text-sm mb-4">
            Live Rate: ₹{usdtRate} / USDT <br />
            You will receive: <strong>{usdtQty} USDT</strong>
          </div>
        )}
        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleProceed}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
          >
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepositUSDTModal;
