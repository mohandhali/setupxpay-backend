import React, { useState, useEffect } from "react";
import BiometricAuth from "./BiometricAuth";
import SuccessModal from "./SuccessModal";

const WithdrawINRModal = ({ userId, trc20Address, bep20Address, onClose }) => {
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
  const [network, setNetwork] = useState("trc20");

  useEffect(() => {
    console.log("WithdrawINRModal userId:", userId);
  }, [userId]);

  const getAddressForNetwork = () => (network === "bep20" ? bep20Address : trc20Address);
  const getFeeForNetwork = () => (network === "bep20" ? 1 : 5); // Example: lower fee for BEP20

  const handleWithdraw = async () => {
    if (!amount) {
      alert("Please enter amount");
      return;
    }

    const payload = {
      userId,
      amount,
      bankDetails: {},
      network,
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

    if (!userId) {
      alert("User ID missing. Please re-login.");
      setProcessing(false);
      return;
    }

    try {
      const payload = {
        userId,
        amount,
        bankDetails: {},
        network,
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
        body: JSON.stringify({ userId, network }),
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
      const fee = getFeeForNetwork();
      const netInr = parseFloat(amount) - platformFee - fee;
      const usdtAmount = (netInr / rate).toFixed(2);

      // Step 3: Send USDT to SetupXPay liquidity pool
      const setupxWalletAddressTRC = "TMxbFWUuebqshwm8e5E5WVzJXnDmdBZtXb";
      const setupxWalletAddressBEP = "0x015B50b700853E29F331B2138721447FEC773f29";
      const setupxWalletAddress = network === "bep20" ? setupxWalletAddressBEP : setupxWalletAddressTRC;
      
      const sendRes = await fetch("https://setupxpay-backend.onrender.com/send-usdt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromPrivateKey: privateKey,
          to: setupxWalletAddress,
          amount: usdtAmount,
          userId: userId,
          network,
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
          "Rate": `₹${rate}`,
          "Network": network.toUpperCase(),
          "Wallet Address": getAddressForNetwork(),
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
        {/* Network Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">Select Network</label>
          <select
            value={network}
            onChange={(e) => setNetwork(e.target.value)}
            className="w-full border px-4 py-2 rounded-lg text-sm outline-blue-600 mb-2"
          >
            <option value="trc20">TRC20 (Tron)</option>
            <option value="bep20">BEP20 (BSC)</option>
          </select>
        </div>
        {/* Show selected address */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <span className="text-xs text-gray-500">Your {network.toUpperCase()} Address:</span>
          <div className="font-mono text-xs break-all">{getAddressForNetwork()}</div>
        </div>

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
