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
  const [rate, setRate] = useState(95);
  const platformFee = 1;
  const trcFee = 5;
  const bepFee = 1; // Example: lower fee for BEP20
  const [network, setNetwork] = useState("trc20");
  const [processing, setProcessing] = useState(false);
  const [showBiometricAuth, setShowBiometricAuth] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successDetails, setSuccessDetails] = useState({});
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  // SetupXPay liquidity pool addresses (example)
  const setupxWalletAddressTRC = "TMxbFWUuebqshwm8e5E5WVzJXnDmdBZtXb";
  const setupxWalletAddressBEP = "0x015B50b700853E29F331B2138721447FEC773f29";

  const getAddressForNetwork = () => (network === "bep20" ? bep20Address : trc20Address);
  const getSetupxWalletForNetwork = () => (network === "bep20" ? setupxWalletAddressBEP : setupxWalletAddressTRC);
  const getFeeForNetwork = () => (network === "bep20" ? bepFee : trcFee);

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

  useEffect(() => {
    console.log("SellUSDTQRModal userId:", userId);
  }, [userId]);

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
    const net = amt - platformFee - getFeeForNetwork();
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
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Merchant Name</div>
                <div className="font-semibold text-gray-800">{merchantName}</div>
                <div className="text-xs text-gray-500 mt-2">UPI ID</div>
                <div className="font-mono text-xs break-all">{upiId}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Enter INR Amount</label>
                <input
                  type="number"
                  placeholder="e.g. 1000"
                  className="w-full border px-4 py-2 rounded-lg text-sm outline-blue-600"
                  value={amountInr}
                  onChange={(e) => setAmountInr(e.target.value)}
                />
              </div>
              <div className="bg-gray-100 rounded-xl p-4 space-y-2 text-sm">
                <p className="flex justify-between text-gray-700">
                  <span>Live Rate</span>
                  <span>₹{rate || "--"}</span>
                </p>
                <p className="flex justify-between text-gray-700">
                  <span>Platform Fee</span>
                  <span>₹{platformFee}</span>
                </p>
                <p className="flex justify-between text-gray-700">
                  <span>{network.toUpperCase()} Fee</span>
                  <span>₹{getFeeForNetwork()}</span>
                </p>
                <hr />
                <p className="flex justify-between font-semibold text-blue-700 text-base">
                  <span>USDT You’ll Sell</span>
                  <span>{calculateUSDT()}</span>
                </p>
              </div>
              <button
                onClick={handleSell}
                disabled={processing}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700"
              >
                {processing ? "Processing..." : "Sell USDT"}
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
