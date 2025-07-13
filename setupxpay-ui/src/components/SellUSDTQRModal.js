import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { FaArrowLeft } from "react-icons/fa";
import BiometricAuth from "./BiometricAuth";

const SellUSDTQRModal = ({ userId, onClose }) => {
  const [step, setStep] = useState("scan");
  const [upiId, setUpiId] = useState("");
  const [merchantName, setMerchantName] = useState("");
  const [amountInr, setAmountInr] = useState("");
  const [rate, setRate] = useState(95);
  const platformFee = 1;
  const trcFee = 5;
  const [processing, setProcessing] = useState(false);
  const [showBiometricAuth, setShowBiometricAuth] = useState(false);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  const setupxWalletAddress = "TMxbFWUuebqshwm8e5E5WVzJXnDmdBZtXb";

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
    if (!amt) return 0;
    const net = amt - platformFee - trcFee;
    return (net / rate).toFixed(2);
  };

  const handleSell = async () => {
    if (!amountInr || !upiId) {
      alert("Enter valid amount and UPI ID");
      return;
    }

    const cleanUpi = upiId.trim().match(/[a-zA-Z0-9.\-_]+@[a-zA-Z]+/)?.[0];
    if (!cleanUpi) {
      alert("Invalid UPI ID scanned.");
      return;
    }

    const usdtAmount = calculateUSDT();
    
    // Show biometric authentication first
    setShowBiometricAuth(true);
  };

  const handleBiometricSuccess = async () => {
    setShowBiometricAuth(false);
    setProcessing(true);

    try {
      // Re-calculate values for this scope
      const cleanUpi = upiId.trim().match(/[a-zA-Z0-9.\-_]+@[a-zA-Z]+/)?.[0];
      const usdtAmount = calculateUSDT();

      // Step 1: Get user's private key from backend
      let privateKey = null;
      
      const keyRes = await fetch("https://setupxpay-backend.onrender.com/get-user-private-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const keyData = await keyRes.json();
      
      if (keyData.success) {
        privateKey = keyData.privateKey;
      } else if (keyData.needsReauth) {
        // Try to migrate private key from localStorage
        const storedPrivateKey = localStorage.getItem("privateKey");
        if (storedPrivateKey) {
          try {
            const migrateRes = await fetch("https://setupxpay-backend.onrender.com/migrate-user-private-key", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId, privateKey: storedPrivateKey }),
            });

            const migrateData = await migrateRes.json();
            if (migrateData.success) {
              // Retry getting private key
              const retryRes = await fetch("https://setupxpay-backend.onrender.com/get-user-private-key", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
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
      const sendRes = await fetch("https://setupxpay-backend.onrender.com/send-usdt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromPrivateKey: privateKey,
          to: setupxWalletAddress,
          amount: usdtAmount,
        }),
      });

      const sendData = await sendRes.json();
      if (!sendData.success) {
        alert("❌ USDT transfer failed: " + (sendData.message || "Unknown error"));
        setProcessing(false);
        return;
      }

      // Step 3: Send INR to merchant via Razorpay
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
      if (inrData.success) {
        alert("✅ USDT sent & INR payout complete");
        onClose();
      } else {
        alert("❌ INR payout failed");
      }
    } catch (err) {
      console.error("❌ Error in sell flow:", err);
      alert("Something went wrong.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex flex-col z-50">
      <div className="flex items-center p-4 bg-white shadow">
        <button onClick={onClose} className="text-gray-700 text-lg">
          <FaArrowLeft />
        </button>
        <h2 className="ml-4 text-lg font-semibold text-gray-800">
          {step === "scan" ? "Scan to Sell USDT" : "Confirm Payment"}
        </h2>
      </div>

      {step === "scan" && (
        <div className="flex-1 bg-black flex flex-col items-center justify-center p-6">
          <div className="text-white text-center mb-6">
            <p className="text-lg font-semibold">Scan UPI QR to sell USDT</p>
            <p className="text-sm text-gray-300">Auto-detect UPI & merchant</p>
          </div>
          <div ref={scannerRef} id="qr-reader" className="w-72 h-72 rounded-xl overflow-hidden" />

          {/* ✅ Upload QR Button */}
          <label className="mt-4 text-sm px-4 py-2 bg-white text-blue-700 rounded-xl shadow hover:bg-blue-50 cursor-pointer">
            Upload QR from Device
            <input
              type="file"
              accept="image/*"
              onChange={handleQRUpload}
              className="hidden"
            />
          </label>
        </div>
      )}

      {step === "details" && (
        <div className="p-6 bg-white flex flex-col flex-1">
          <p className="mb-2 text-sm">Merchant:</p>
          <div className="border rounded px-3 py-2 mb-3 bg-gray-100">
            {merchantName} ({upiId})
          </div>

          <label className="text-sm mb-1">Enter INR Amount</label>
          <input
            type="number"
            placeholder="e.g. 1000"
            value={amountInr}
            onChange={(e) => setAmountInr(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-4 outline-blue-500"
          />

          <div className="bg-gray-100 rounded-xl p-4 space-y-2 text-sm">
            <p className="flex justify-between">
              <span>Live Rate</span>
              <span>₹{rate}</span>
            </p>
            <p className="flex justify-between">
              <span>Platform Fee</span>
              <span>₹{platformFee}</span>
            </p>
            <p className="flex justify-between">
              <span>TRC20 Fee</span>
              <span>₹{trcFee}</span>
            </p>
            <hr />
            <p className="flex justify-between font-semibold text-blue-700 text-base">
              <span>USDT You'll Sell</span>
              <span>{calculateUSDT()}</span>
            </p>
          </div>

          <button
            onClick={handleSell}
            disabled={processing}
            className="mt-5 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700"
          >
            {processing ? "Processing..." : "Confirm & Sell"}
          </button>
        </div>
      )}

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

export default SellUSDTQRModal;
