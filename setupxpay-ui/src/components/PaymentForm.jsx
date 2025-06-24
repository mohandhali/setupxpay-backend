import React, { useState } from "react";

const PaymentForm = () => {
  const [wallet, setWallet] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("🔁 Generating Payment Link...");

    try {
      const res = await fetch("https://setupxpay-backend.onrender.com/create-payment-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amountInr: amount,
          walletAddress: wallet,
        }),
      });

      const data = await res.json();
      console.log("✅ Payment Link Response:", data);

      if (res.ok && data.url) {
        alert("✅ Payment link created! Opening now...");
        window.open(data.url, "_blank");
        setWallet("");
        setAmount("");
      } else {
        alert("❌ Failed to generate payment link");
      }

    } catch (error) {
      console.error("❌ Error:", error);
      alert("❌ Something went wrong while creating payment link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-blue-600">SetupXPay</h2>

        <input
          type="text"
          placeholder="Wallet Address"
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
          className="w-full mb-4 px-4 py-2 border border-blue-300 rounded"
          required
        />

        <input
          type="number"
          placeholder="Amount in INR"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full mb-4 px-4 py-2 border border-blue-300 rounded"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Processing..." : "Generate Payment Link"}
        </button>
      </form>
    </div>
  );
};

export default PaymentForm;
