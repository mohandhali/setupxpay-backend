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
  const [approvedBankDetails, setApprovedBankDetails] = useState([]);
  const [selectedBankIdx, setSelectedBankIdx] = useState(0);

  // SetupXPay liquidity pool addresses (example)
  const setupxWalletAddressTRC = "TMxbFWUuebqshwm8e5E5WVzJXnDmdBZtXb";
  const setupxWalletAddressBEP = "0x015B50b700853E29F331B2138721447FEC773f29";

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
        setApprovedBankDetails(approved);
        setSelectedBankIdx(0);
      } else {
        setApprovedBankDetails([]);
      }
    } catch {
      setApprovedBankDetails([]);
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
    if (!amt) return 0;
    const net = amt - platformFee - networkFee;
    return (net / rate).toFixed(2);
  };

  const handleSell = async () => {
    if (!amountInr) {
      alert("Enter valid amount");
      return;
    }
    // Use payout details from selected approved bank/UPI
    const payout = approvedBankDetails[selectedBankIdx];
    if (!payout) {
      alert("Please select an approved payout method");
      return;
    }
    // For UPI payout, prefer UPI ID, else bank
    let payoutUpi = payout.upiId;
    if (!payoutUpi && payout.accountNumber && payout.ifsc) {
      payoutUpi = null; // fallback to bank transfer (not implemented in this modal)
    }
    if (!payoutUpi) {
      alert("Only UPI payout is supported in this flow. Please add an approved UPI ID.");
      return;
    }
    setUpiId(payoutUpi);
    setMerchantName(payout.accountHolder);
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
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Select Payout Method (Approved Only)</label>
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
              {/* Show selected payout details */}
              {approvedBankDetails[selectedBankIdx] && (
                <div className="bg-blue-50 rounded-lg p-3 mb-2 mt-2">
                  <div className="text-xs text-gray-500 mb-1">Account Holder</div>
                  <div className="font-semibold text-gray-800">{approvedBankDetails[selectedBankIdx].accountHolder}</div>
                  {approvedBankDetails[selectedBankIdx].upiId && <><div className="text-xs text-gray-500 mt-2">UPI ID</div><div className="font-mono text-xs break-all">{approvedBankDetails[selectedBankIdx].upiId}</div></>}
                  {approvedBankDetails[selectedBankIdx].accountNumber && <><div className="text-xs text-gray-500 mt-2">Account No</div><div className="font-mono text-xs break-all">{approvedBankDetails[selectedBankIdx].accountNumber}</div></>}
                  {approvedBankDetails[selectedBankIdx].ifsc && <><div className="text-xs text-gray-500 mt-2">IFSC</div><div className="font-mono text-xs break-all">{approvedBankDetails[selectedBankIdx].ifsc}</div></>}
                </div>
              )}
              {/* INR Amount input and live USDT calculation */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Enter INR Amount</label>
                <input
                  type="number"
                  placeholder="e.g. 1000"
                  className="w-full border px-4 py-2 rounded-lg text-sm outline-blue-600"
                  value={amountInr}
                  onChange={e => setAmountInr(e.target.value)}
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
                    <span>{(() => {
                      const amt = parseFloat(amountInr);
                      if (!amt || !rate) return "0.00";
                      const net = amt - platformFee - networkFee;
                      return net > 0 ? (net / rate).toFixed(2) : "0.00";
                    })()}</span>
                  </p>
                </div>
              </div>
              <button
                className="w-full bg-blue-600 text-white py-2 rounded font-medium mt-4 disabled:opacity-50"
                disabled={approvedBankDetails.length === 0 || !amountInr || parseFloat(amountInr) <= 0}
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
