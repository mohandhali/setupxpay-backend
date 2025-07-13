import React, { useState } from "react";
import BiometricAuth from "./BiometricAuth";

const WithdrawINRModal = ({ userId, onClose }) => {
    console.log("🧾 Passed userId to WithdrawINRModal:", userId);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("upi"); // "upi" or "bank"
  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [upiId, setUpiId] = useState("");
  const [showBiometricAuth, setShowBiometricAuth] = useState(false);
  const [processing, setProcessing] = useState(false);

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

    // Show biometric authentication first
    setShowBiometricAuth(true);
  };

  const handleBiometricSuccess = async () => {
    setShowBiometricAuth(false);
    setProcessing(true);

    try {
      const payload = {
        userId,
        amount,
        bankDetails: {},
      };

      if (method === "upi") {
        payload.bankDetails.upiId = upiId;
      } else {
        payload.bankDetails = {
          accountHolder,
          accountNumber,
          ifsc,
        };
      }

      // Step 1: Get user's private key from backend
      const keyRes = await fetch("https://setupxpay-backend.onrender.com/get-user-private-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const keyData = await keyRes.json();
      
      if (!keyData.success) {
        alert("❌ Failed to get wallet access: " + (keyData.error || "Unknown error"));
        setProcessing(false);
        return;
      }

      const privateKey = keyData.privateKey;

      // Step 2: Calculate USDT amount
      const rate = 95; // You can fetch this from API
      const platformFee = 1;
      const trcFee = 5;
      const netInr = parseFloat(amount) - platformFee - trcFee;
      const usdtAmount = (netInr / rate).toFixed(2);

      // Step 3: Send USDT to SetupXPay liquidity pool
      const setupxWalletAddress = "TMxbFWUuebqshwm8e5E5WVzJXnDmdBZtXb";
      
      const sendRes = await fetch("https://setupxpay-backend.onrender.com/send-usdt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromPrivateKey: privateKey,
          to: setupxWalletAddress,
          amount: usdtAmount,
          userId: userId,
        }),
      });

      const sendData = await sendRes.json();
      if (!sendData.success) {
        alert("❌ USDT transfer failed: " + (sendData.error || "Unknown error"));
        setProcessing(false);
        return;
      }

      // Step 4: Send INR to user via withdraw endpoint
      const withdrawRes = await fetch("https://setupxpay-backend.onrender.com/withdraw/inr-mock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const withdrawData = await withdrawRes.json();

      if (withdrawData.success) {
        alert("✅ USDT sent & INR withdrawal successful!");
        onClose();
      } else {
        alert("❌ INR withdrawal failed!");
      }
    } catch (err) {
      console.error("❌ Withdrawal error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setProcessing(false);
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
            disabled={processing}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {processing ? "Processing..." : "Withdraw"}
          </button>
        </div>
      </div>

      {/* Biometric Authentication Modal */}
      {showBiometricAuth && (
        <BiometricAuth
          onSuccess={handleBiometricSuccess}
          onCancel={() => setShowBiometricAuth(false)}
          message="Authenticate to complete USDT sale"
        />
      )}
    </div>
  );
};

export default WithdrawINRModal;
