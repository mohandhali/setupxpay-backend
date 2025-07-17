import React, { useState } from "react";
import BiometricAuth from "./BiometricAuth";
import SuccessModal from "./SuccessModal";

const WithdrawINRModal = ({ userId, onClose }) => {
    console.log("🧾 Passed userId to WithdrawINRModal:", userId);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("upi"); // "upi" or "bank"
  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [upiId, setUpiId] = useState("");
  const [showBiometricAuth, setShowBiometricAuth] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successDetails, setSuccessDetails] = useState({});
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
        // Show success modal with details
        setSuccessDetails({
          "USDT Sent": `${usdtAmount} USDT`,
          "INR Amount": `₹${amount}`,
          "Method": method === "upi" ? "UPI" : "Bank Transfer",
          "Recipient": method === "upi" ? upiId : `${accountHolder} (${accountNumber})`,
          "Transaction ID": sendData.txId,
          "Rate": `₹${rate}`
        });
        setShowSuccessModal(true);
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
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center p-4 shadow border-b">
        <button onClick={onClose} className="text-gray-700 text-lg mr-4">
          ←
        </button>
        <h2 className="text-xl font-semibold text-gray-800">Sell USDT for INR</h2>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">

        <div className="mb-6">
          <label className="block mb-3 font-semibold text-gray-700">Payment Method:</label>
          <div className="flex gap-4">
            <label className="flex-1">
              <input
                type="radio"
                value="upi"
                checked={method === "upi"}
                onChange={() => setMethod("upi")}
                className="hidden"
              />
              <div className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                method === "upi" 
                  ? "border-blue-500 bg-blue-50" 
                  : "border-gray-200 hover:border-gray-300"
              }`}>
                <div className="text-center">
                  <div className="text-2xl mb-2">📱</div>
                  <span className="font-medium">UPI</span>
                </div>
              </div>
            </label>
            <label className="flex-1">
              <input
                type="radio"
                value="bank"
                checked={method === "bank"}
                onChange={() => setMethod("bank")}
                className="hidden"
              />
              <div className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                method === "bank" 
                  ? "border-blue-500 bg-blue-50" 
                  : "border-gray-200 hover:border-gray-300"
              }`}>
                <div className="text-center">
                  <div className="text-2xl mb-2">🏦</div>
                  <span className="font-medium">Bank Transfer</span>
                </div>
              </div>
            </label>
          </div>
        </div>

        <div className="mb-6">
          <label className="block mb-2 font-semibold text-gray-700">Amount (₹)</label>
          <input
            type="number"
            placeholder="Enter amount in INR"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
          />
        </div>

        {/* Conditional Fields */}
        {method === "upi" && (
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700">UPI ID</label>
            <input
              type="text"
              placeholder="Enter your UPI ID (e.g., 1234567890@ybl)"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
            />
          </div>
        )}

        {method === "bank" && (
          <div className="space-y-4 mb-6">
            <div>
              <label className="block mb-2 font-semibold text-gray-700">Account Holder Name</label>
              <input
                type="text"
                placeholder="Enter account holder name"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-700">Account Number</label>
              <input
                type="text"
                placeholder="Enter account number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-700">IFSC Code</label>
              <input
                type="text"
                placeholder="Enter IFSC code"
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
              />
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={handleWithdraw}
            disabled={processing}
            className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg disabled:opacity-50"
          >
            {processing ? "Processing..." : "Sell USDT"}
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

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          onClose();
        }}
        title="USDT Sale Successful!"
        message="Your USDT has been sold and INR has been sent to your account."
        details={successDetails}
      />
    </div>
  );
};

export default WithdrawINRModal;
