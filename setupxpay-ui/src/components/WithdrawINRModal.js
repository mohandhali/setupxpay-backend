import React, { useState } from "react";

const WithdrawINRModal = ({ userId, onClose }) => {
  const [amount, setAmount] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [upiId, setUpiId] = useState("");

  const handleWithdraw = async () => {
    if (!amount || !accountHolder || !accountNumber || !ifsc) {
      alert("Please fill all required fields");
      return;
    }

    const res = await fetch("https://your-backend.com/withdraw/inr-mock", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        amount,
        bankDetails: {
          accountHolder,
          accountNumber,
          ifsc,
          upiId,
        },
      }),
    });

    const data = await res.json();

    if (data.success) {
      alert("✅ INR Withdraw request (mock) successful!");
      onClose(); // Close the modal
    } else {
      alert("❌ Withdrawal failed!");
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white p-6 rounded-xl w-[90%] max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Withdraw INR (Mock)</h2>

        <input
          type="number"
          placeholder="Amount (₹)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />

        <input
          type="text"
          placeholder="Account Holder Name"
          value={accountHolder}
          onChange={(e) => setAccountHolder(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />

        <input
          type="text"
          placeholder="Account Number"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />

        <input
          type="text"
          placeholder="IFSC Code"
          value={ifsc}
          onChange={(e) => setIfsc(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />

        <input
          type="text"
          placeholder="Optional: UPI ID"
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />

        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
            Cancel
          </button>
          <button
            onClick={handleWithdraw}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Withdraw
          </button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawINRModal;
