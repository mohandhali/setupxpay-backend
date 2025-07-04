import React, { useState } from "react";

const WithdrawINRModal = ({ userId, onClose }) => {
    console.log("🧾 Passed userId to WithdrawINRModal:", userId);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("upi"); // "upi" or "bank"
  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [upiId, setUpiId] = useState("");

  const handleWithdraw = async () => {
    if (!amount) {
      alert("Please enter amount");
      return;
    }

    const payload = {
      userId,
      amount,
      bankDetails: {},
    };

    if (method === "upi") {
      if (!upiId.trim()) {
        alert("Please enter UPI ID");
        return;
      }
      payload.bankDetails.upiId = upiId;
    } else {
      if (!accountHolder || !accountNumber || !ifsc) {
        alert("Please fill all bank details");
        return;
      }
      payload.bankDetails = {
        accountHolder,
        accountNumber,
        ifsc,
      };
    }

    try {
      const res = await fetch("https://setupxpay-backend.onrender.com/withdraw/inr-mock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        alert("✅ INR withdrawal (mock) successful!");
        onClose(); // Close modal
      } else {
        alert("❌ Withdrawal failed!");
      }
    } catch (err) {
      console.error("❌ Withdrawal error:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white p-6 rounded-xl w-[90%] max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Withdraw INR</h2>

        <div className="mb-4">
          <label className="block mb-2 font-medium">Withdraw Method:</label>
          <div className="flex gap-4">
            <label>
              <input
                type="radio"
                value="upi"
                checked={method === "upi"}
                onChange={() => setMethod("upi")}
              />
              <span className="ml-2">UPI</span>
            </label>
            <label>
              <input
                type="radio"
                value="bank"
                checked={method === "bank"}
                onChange={() => setMethod("bank")}
              />
              <span className="ml-2">Bank Transfer</span>
            </label>
          </div>
        </div>

        <input
          type="number"
          placeholder="Amount (₹)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />

        {/* Conditional Fields */}
        {method === "upi" && (
          <input
            type="text"
            placeholder="UPI ID"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
          />
        )}

        {method === "bank" && (
          <>
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
              className="w-full p-2 mb-4 border rounded"
            />
          </>
        )}

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
