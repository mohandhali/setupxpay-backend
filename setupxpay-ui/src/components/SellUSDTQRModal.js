import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { FaArrowLeft } from "react-icons/fa";
import BiometricAuth from "./BiometricAuth";
import SuccessModal from "./SuccessModal";

const SellUSDTQRModal = ({ userId, trc20Address, bep20Address, onClose }) => {
  const [step, setStep] = useState("scan");
  const [upiId, setUpiId] = useState("");
  const [merchantName, setMerchantName] = useState("");
  const [amountInr, setAmountInr] = useState("");
  // 1. Add state for live rate
  const [rate, setRate] = useState(null);
  const [platformFee, setPlatformFee] = useState(1);
  const [networkFee, setNetworkFee] = useState(5); // default for TRC20
  const [network, setNetwork] = useState("trc20");
  const [processing, setProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [showBiometricAuth, setShowBiometricAuth] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successDetails, setSuccessDetails] = useState({});
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const [userSellHistory, setUserSellHistory] = useState([]);
  const SELL_LIMIT = 10000;

  // SetupXPay liquidity pool addresses (example)
  const setupxWalletAddressTRC = "TMxbFWUuebqshwm8e5E5WVzJXnDmdBZtXb";
  // Use the correct BSC pool address for testnet
  const setupxWalletAddressBEP = "0xC7894a2f14a7d9002dECBac352450B167374467c";

  const getAddressForNetwork = () => (network === "bep20" ? bep20Address : trc20Address);
  const getSetupxWalletForNetwork = () => (network === "bep20" ? setupxWalletAddressBEP : setupxWalletAddressTRC);
  const getFeeForNetwork = () => (network === "bep20" ? 1 : 5); // This function is no longer needed for the new UI

  // 2. Fetch live rate and update network fee on open/network change
  useEffect(() => {
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

  // Fetch approved bank/UPI details on open
  useEffect(() => {
    if (userId) fetchApprovedBankDetails();
    // eslint-disable-next-line
  }, [userId]);

  const fetchApprovedBankDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://setupxpay-backend.onrender.com/user/bank-details", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        const approved = (data.bankDetails || []).filter(bd => bd.status === "approved");
        // setApprovedBankDetails(approved); // This state is no longer needed
        // setSelectedBankIdx(0); // This state is no longer needed
      } else {
        // setApprovedBankDetails([]); // This state is no longer needed
      }
    } catch {
      // setApprovedBankDetails([]); // This state is no longer needed
    }
  };

  useEffect(() => {
    console.log("SellUSDTQRModal userId:", userId);
  }, [userId]);

  useEffect(() => {
    if (step === "scan" && scannerRef.current) {
      const config = { fps: 10, qrbox: 250 };
      const qrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = qrCode;

      qrCode
        .start(
          { facingMode: "environment" },
          config,
          (decodedText) => handleScan(decodedText),
          (err) => console.warn("QR Scan Error", err)
        )
        .catch((err) => {
          console.error("Camera start error:", err);
          alert("Camera access failed.");
        });
    }

    return () => {
      stopScanner();
    };
  }, [step]);

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear();
      } catch (err) {
        console.warn("Failed to stop camera:", err);
      }
    }
  };

  const handleScan = async (data) => {
    try {
      const url = new URL(data);
      const params = new URLSearchParams(url.search);
      const pa = params.get("pa");
      const pn = params.get("pn");

      if (pa && pn) {
        setUpiId(pa);
        setMerchantName(pn);
        await stopScanner();
        setStep("details");
      } else {
        alert("Invalid UPI QR");
      }
    } catch (err) {
      alert("Unsupported QR Code");
    }
  };

  const handleQRUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const html5QrCode = new Html5Qrcode("qr-reader");
    try {
      const result = await html5QrCode.scanFile(file, true);
      handleScan(result);
    } catch (err) {
      console.error("QR Upload failed:", err);
      alert("❌ Failed to read QR from uploaded image.");
    }
  };

  const calculateUSDT = () => {
    const amt = parseFloat(amountInr);
    if (!amt || !rate) return "0.00";
    const totalInr = amt + platformFee + networkFee;
    let usdt = totalInr / rate;
    usdt = Math.ceil(usdt * 100) / 100; // round up to 2 decimals
    return usdt.toFixed(2);
  };

  const handleSell = async () => {
    if (!amountInr) {
      alert("Enter valid amount");
      return;
    }
    // Use payout details from selected approved bank/UPI
    // const payout = approvedBankDetails[selectedBankIdx]; // This logic is no longer needed
    // if (!payout) {
    //   alert("Please select an approved payout method");
    //   return;
    // }
    // For UPI payout, prefer UPI ID, else bank
    let payoutUpi = upiId;
    if (!payoutUpi) {
      alert("Please enter a UPI ID or select a bank account.");
      return;
    }
    setUpiId(payoutUpi);
    setMerchantName(payoutUpi); // Assuming merchant name is the UPI ID for manual entry
    setShowBiometricAuth(true);
  };

  const handleBiometricSuccess = async () => {
    setShowBiometricAuth(false);
    setProcessing(true);
    setLoadingMessage("Getting wallet access...");

    if (!userId) {
      alert("User ID missing. Please re-login.");
      setProcessing(false);
      return;
    }

    try {
      const cleanUpi = upiId.trim().match(/[a-zA-Z0-9.\-_]+@[a-zA-Z]+/)?.[0];
      const usdtAmount = calculateUSDT();

      // Step 1: Get user's private key from backend
      let privateKey = null;
      const keyRes = await fetch("https://setupxpay-backend.onrender.com/get-user-private-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, network }),
      });
      const keyData = await keyRes.json();
      if (keyData.success) {
        privateKey = keyData.privateKey;
      } else if (keyData.needsReauth) {
        const storedPrivateKey = localStorage.getItem("privateKey");
        if (storedPrivateKey) {
          try {
            const migrateRes = await fetch("https://setupxpay-backend.onrender.com/migrate-user-private-key", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId, privateKey: storedPrivateKey, network }),
            });
            const migrateData = await migrateRes.json();
            if (migrateData.success) {
              const retryRes = await fetch("https://setupxpay-backend.onrender.com/get-user-private-key", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, network }),
              });
              const retryData = await retryRes.json();
              if (retryData.success) {
                privateKey = retryData.privateKey;
              } else {
                alert("❌ Failed to migrate wallet access");
                setProcessing(false);
                return;
              }
            } else {
              alert("❌ Failed to migrate wallet: " + (migrateData.error || "Unknown error"));
              setProcessing(false);
              return;
            }
          } catch (migrateErr) {
            alert("❌ Migration failed. Please re-login.");
            setProcessing(false);
            return;
          }
        } else {
          alert("❌ No private key found. Please re-login or recreate wallet.");
          setProcessing(false);
          return;
        }
      } else {
        alert("❌ Failed to get wallet access: " + (keyData.error || "Unknown error"));
        setProcessing(false);
        return;
      }

      if (!privateKey) {
        alert("❌ No private key available");
        setProcessing(false);
        return;
      }

      // Step 2: Send USDT to SetupXPay liquidity pool
      setLoadingMessage("Sending USDT to liquidity pool...");
      const sendRes = await fetch("https://setupxpay-backend.onrender.com/send-usdt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromPrivateKey: privateKey,
          to: getSetupxWalletForNetwork(),
          amount: usdtAmount,
          userId: userId,
          network,
        }),
      });
      const sendData = await sendRes.json();
      if (!sendData.success) {
        alert("❌ USDT transfer failed: " + (sendData.message || "Unknown error"));
        setProcessing(false);
        return;
      }

      // Step 3: Send INR to merchant via Razorpay
      setLoadingMessage("Processing INR payout...");
      const inrPayload = {
        userId,
        amount: amountInr,
        bankDetails: { upiId: cleanUpi },
      };
      const inrRes = await fetch("https://setupxpay-backend.onrender.com/withdraw/inr-mock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inrPayload),
      });
      const inrData = await inrRes.json();
      if (!inrData.success) {
        alert("❌ INR payout failed: " + (inrData.message || "Unknown error"));
        setProcessing(false);
        return;
      }

      setSuccessDetails({
        usdtAmount,
        network,
        merchantName,
        upiId: cleanUpi,
        inrAmount: amountInr,
      });
      setShowSuccessModal(true);
      setProcessing(false);
    } catch (err) {
      alert("❌ Transaction failed. Please try again.");
      setProcessing(false);
    }
  };

  const handleAmountChange = (e) => {
    const val = e.target.value;
    if (parseFloat(val) > SELL_LIMIT) {
      alert("You cannot sell more than ₹10,000 in a single transaction.");
      return;
    }
    const total24h = get24hTotal();
    if (total24h + parseFloat(val) > SELL_LIMIT) {
      alert("You cannot sell more than ₹10,000 in 24 hours.");
      return;
    }
    setAmountInr(val);
  };

  useEffect(() => {
    // Fetch user's sell history for last 24 hours
    const fetchSellHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://setupxpay-backend.onrender.com/user/sell-history", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setUserSellHistory(data.history || []);
        } else {
          setUserSellHistory([]);
        }
      } catch {
        setUserSellHistory([]);
      }
    };
    fetchSellHistory();
  }, [userId]);

  const get24hTotal = () => {
    const now = Date.now();
    return userSellHistory
      .filter(tx => now - new Date(tx.timestamp).getTime() < 24 * 60 * 60 * 1000)
      .reduce((sum, tx) => sum + (parseFloat(tx.amountInr) || 0), 0);
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <div className="relative w-full h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center p-4 shadow border-b">
          <button onClick={onClose} className="text-gray-700 text-lg">
            <FaArrowLeft />
          </button>
          <h2 className="text-lg font-semibold ml-4 text-gray-800">Sell USDT</h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 flex-1 overflow-auto">
          {/* Network Selector */}
          <div>
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
          <div className="bg-gray-50 rounded-lg p-3 mb-2">
            <span className="text-xs text-gray-500">Your {network.toUpperCase()} Address:</span>
            <div className="font-mono text-xs break-all">{getAddressForNetwork()}</div>
          </div>

          {/* QR Scanner or Details Step */}
          {step === "scan" && (
            <div className="flex flex-col items-center">
              <div ref={scannerRef} id="qr-reader" className="w-full max-w-xs h-64 bg-gray-100 rounded-lg mb-4"></div>
              <input
                type="file"
                accept="image/*"
                onChange={handleQRUpload}
                className="mb-2"
              />
              <p className="text-xs text-gray-500">Scan merchant's UPI QR code</p>
            </div>
          )}

          {step === "details" && (
            <div className="space-y-4">
              {/* Show selected payout details */}
              <div className="bg-blue-50 rounded-lg p-3 mb-2 mt-2">
                <div className="text-xs text-gray-500 mb-1">Account Holder</div>
                <div className="font-semibold text-gray-800">{merchantName}</div>
                {upiId && <><div className="text-xs text-gray-500 mt-2">UPI ID</div><div className="font-mono text-xs break-all">{upiId}</div></>}
                {/* {approvedBankDetails[selectedBankIdx] && (
                  <div className="text-sm text-gray-800">
                    <b>UPI ID:</b> <span className="font-mono">{approvedBankDetails[selectedBankIdx].upiId}</span>
                  </div>
                )} */}
                {/* {approvedBankDetails[selectedBankIdx] && (
                  <div className="text-sm text-gray-800">
                    <b>Account No:</b> <span className="font-mono">{approvedBankDetails[selectedBankIdx].accountNumber}</span>
                  </div>
                )} */}
                {/* {approvedBankDetails[selectedBankIdx] && (
                  <div className="text-sm text-gray-800">
                    <b>IFSC:</b> <span className="font-mono">{approvedBankDetails[selectedBankIdx].ifsc}</span>
                  </div>
                )} */}
              </div>
              {/* INR Amount input and live USDT calculation */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Enter INR Amount</label>
                <input
                  type="number"
                  placeholder="e.g. 1000"
                  className="w-full border px-4 py-2 rounded-lg text-sm outline-blue-600"
                  value={amountInr}
                  onChange={handleAmountChange}
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
              <button
                className="w-full bg-blue-600 text-white py-2 rounded font-medium mt-4 disabled:opacity-50"
                disabled={!amountInr || parseFloat(amountInr) <= 0}
                onClick={handleSell}
              >
                Sell USDT
              </button>
            </div>
          )}
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

export default SellUSDTQRModal;
