import React, { useState, useEffect } from "react";
import BiometricAuth from "./BiometricAuth";
import SuccessModal from "./SuccessModal";

const WithdrawINRModal = ({ userId, trc20Address, bep20Address, onClose }) => {
    console.log("🧾 Passed userId to WithdrawINRModal:", userId);
  const [amount, setAmount] = useState("");
  const [approvedBankDetails, setApprovedBankDetails] = useState([]);
  const [selectedBankIdx, setSelectedBankIdx] = useState(0);
  const [showBiometricAuth, setShowBiometricAuth] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successDetails, setSuccessDetails] = useState({});
  const [processing, setProcessing] = useState(false);
  const [network, setNetwork] = useState("trc20");
  const [rate, setRate] = useState(null);
  const [platformFee, setPlatformFee] = useState(1);
  const [networkFee, setNetworkFee] = useState(5);

  useEffect(() => {
    // Fetch approved payout methods
    const fetchApprovedBankDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://setupxpay-backend.onrender.com/user/bank-details", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          const approved = (data.bankDetails || []).filter(bd => bd.status === "approved");
          setApprovedBankDetails(approved);
          setSelectedBankIdx(0);
        } else {
          setApprovedBankDetails([]);
        }
      } catch {
        setApprovedBankDetails([]);
      }
    };
    fetchApprovedBankDetails();
  }, [userId]);

  useEffect(() => {
    // Fetch live rate and update network fee
    const fetchRate = async () => {
      try {
        const res = await fetch("https://setupxpay-backend.onrender.com/rate");
        const data = await res.json();
        setRate(data?.sell || 95);
      } catch {
        setRate(95);
      }
    };
    fetchRate();
    setNetworkFee(network === "bep20" ? 1 : 5);
  }, [network]);

  const getAddressForNetwork = () => (network === "bep20" ? bep20Address : trc20Address);

  const calculateUSDT = () => {
    const amt = parseFloat(amount);
    if (!amt || !rate) return "0.00";
    const totalInr = amt + platformFee + networkFee;
    let usdt = totalInr / rate;
    usdt = Math.ceil(usdt * 100) / 100; // round up to 2 decimals
    return usdt.toFixed(2);
  };

  const handleWithdraw = async () => {
    if (!amount) {
      alert("Please enter amount");
      return;
    }
    const payout = approvedBankDetails[selectedBankIdx];
    if (!payout) {
      alert("Please select an approved payout method");
      return;
    }
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
      const payout = approvedBankDetails[selectedBankIdx];
      const payload = {
        userId,
        amount,
        bankDetails: {},
        network,
      };
      if (payout.upiId) {
        payload.bankDetails.upiId = payout.upiId;
      } else {
        payload.bankDetails = {
          accountHolder: payout.accountHolder,
          accountNumber: payout.accountNumber,
          ifsc: payout.ifsc,
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
      const usdtAmount = calculateUSDT();
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const withdrawData = await withdrawRes.json();
      if (withdrawData.success) {
        setSuccessDetails({
          "USDT Sent": `${usdtAmount} USDT`,
          "INR Amount": `₹${amount}`,
          "Method": payout.upiId ? "UPI" : "Bank Transfer",
          "Recipient": payout.upiId ? payout.upiId : `${payout.accountHolder} (${payout.accountNumber})`,
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
        {/* Approved payout methods as cards */}
        <div className="mb-6">
          <label className="block mb-3 font-semibold text-gray-700">Select Payout Method (Approved Only):</label>
          {approvedBankDetails.length === 0 ? (
            <div className="text-xs text-red-600">No approved bank/UPI details found. Please add and wait for admin approval.</div>
          ) : (
            <div className="flex flex-col gap-3">
              {approvedBankDetails.map((bd, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`w-full text-left border rounded-lg p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2 shadow-sm transition-all ${selectedBankIdx === idx ? "border-blue-600 bg-blue-50" : "border-gray-200 bg-white hover:border-blue-300"}`}
                  onClick={() => setSelectedBankIdx(idx)}
                >
                  <div>
                    <div className="font-semibold text-gray-800">{bd.accountHolder}</div>
                    {bd.upiId && <div className="text-xs text-gray-600">UPI: <span className="font-mono">{bd.upiId}</span></div>}
                    {bd.accountNumber && <div className="text-xs text-gray-600">A/C: <span className="font-mono">{bd.accountNumber}</span> {bd.ifsc && <span>IFSC: {bd.ifsc}</span>}</div>}
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${bd.status === "approved" ? "bg-green-100 text-green-700" : bd.status === "rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{bd.status}</span>
                    {bd.adminNote && <span className="text-xs text-gray-500">Note: {bd.adminNote}</span>}
                    {selectedBankIdx === idx && <span className="text-xs text-blue-600 font-semibold mt-1">Selected</span>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        {/* Payment Method summary box */}
        {approvedBankDetails[selectedBankIdx] && (
          <div className="bg-green-50 border border-green-300 rounded-lg p-4 mb-4 flex flex-col gap-1">
            <div className="font-semibold text-green-800 text-base mb-1">Payment Method</div>
            <div className="text-sm text-gray-800">
              <b>Account Holder:</b> {approvedBankDetails[selectedBankIdx].accountHolder}
            </div>
            {approvedBankDetails[selectedBankIdx].upiId && (
              <div className="text-sm text-gray-800">
                <b>UPI ID:</b> <span className="font-mono">{approvedBankDetails[selectedBankIdx].upiId}</span>
              </div>
            )}
            {approvedBankDetails[selectedBankIdx].accountNumber && (
              <div className="text-sm text-gray-800">
                <b>Account No:</b> <span className="font-mono">{approvedBankDetails[selectedBankIdx].accountNumber}</span>
              </div>
            )}
            {approvedBankDetails[selectedBankIdx].ifsc && (
              <div className="text-sm text-gray-800">
                <b>IFSC:</b> <span className="font-mono">{approvedBankDetails[selectedBankIdx].ifsc}</span>
              </div>
            )}
            {approvedBankDetails[selectedBankIdx].adminNote && (
              <div className="text-xs text-gray-500 mt-1">Note: {approvedBankDetails[selectedBankIdx].adminNote}</div>
            )}
          </div>
        )}
        {/* INR Amount input and live USDT calculation */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Enter INR Amount</label>
          <input
            type="number"
            placeholder="e.g. 1000"
            className="w-full border px-4 py-2 rounded-lg text-sm outline-blue-600"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
          <div className="bg-gray-100 rounded-xl p-4 space-y-2 text-sm mt-2">
            <p className="flex justify-between text-gray-700">
              <span>Live Rate</span>
              <span className="font-semibold">₹{rate || "-"} / USDT</span>
            </p>
            <p className="flex justify-between text-gray-700">
              <span>Platform Fee</span>
              <span>₹{platformFee}</span>
            </p>
            <p className="flex justify-between text-gray-700">
              <span>Network Fee</span>
              <span>₹{networkFee}</span>
            </p>
            <p className="flex justify-between text-gray-900 font-semibold">
              <span>USDT to be deducted</span>
              <span>{calculateUSDT()}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-4 mt-6">
          <button
            onClick={handleWithdraw}
            disabled={processing || approvedBankDetails.length === 0 || !amount || parseFloat(amount) <= 0}
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
