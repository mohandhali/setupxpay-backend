import React, { useState } from "react";

const PaymentForm = () => {
  const [wallet, setWallet] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🔁 Sending Request...");

    try {
      const response = await fetch("http://localhost:5000/send-usdt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          walletAddress: wallet,
          amountInr: amount
        })
      });

      const data = await response.json();
      console.log("✅ Response received:", data);

      if (response.ok) {
        alert(`✅ Success! Tx ID: ${data.txId}`);
        // Clear the form
        setWallet("");
        setAmount("");
      } else {
        alert(`❌ Error: ${data.error || "Something went wrong"}`);
      }
    } catch (error) {
      console.error("❌ Error:", error);
      alert("❌ Failed to send USDT. Please try again.");
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
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Send USDT
        </button>
      </form>
    </div>
  );
};

export default PaymentForm;
