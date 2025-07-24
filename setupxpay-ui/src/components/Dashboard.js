import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import BuyUSDTModal from "./BuyUSDTModal";
import WalletModal from "./WalletModal";
import WithdrawINRModal from "./WithdrawINRModal";
import Profile from "./Profile";
import {
  FaBars, FaUser, FaCog, FaWallet, FaFileAlt, FaSignOutAlt,
  FaCopy, FaQrcode, FaUsers, FaExchangeAlt, FaTelegramPlane, FaWhatsapp, FaTimes, FaArrowLeft, FaPlus
} from "react-icons/fa";
import { MdClose } from "react-icons/md";
import setupxpayLogo from "../assets/logo.png";
import TransactionHistory from "./TransactionHistory";
import SellUSDTQRModal from "./SellUSDTQRModal";
import { CURRENT_CONFIG } from "../config/mainnet";



const Dashboard = () => {
  const [balance, setBalance] = useState("0");
  const [buyRate, setBuyRate] = useState("-");
  const [sellRate, setSellRate] = useState("-");
  const [showSidebar, setShowSidebar] = useState(false);
  const [showBuyUSDT, setShowBuyUSDT] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showSellQR, setShowSellQR] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [usdtPrice, setUsdtPrice] = useState(1.0);
  const navigate = useNavigate();
  
  // Add user and setUser state at the top of Dashboard.js
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : {};
  });

  // KYC states
  const [kycStatus, setKycStatus] = useState(user?.kycStatus || "pending"); // pending, verified, rejected
  // Set initial step based on whether user.kycData exists and is filled
  function isKycDataFilled(kycData) {
    return kycData && kycData.fullName && kycData.dateOfBirth && kycData.address && kycData.city && kycData.state && kycData.pincode;
  }
  const [kycStep, setKycStep] = useState(() => isKycDataFilled(user?.kycData) ? 2 : 1);

  // When KYC modal is opened, re-check and set the step
  useEffect(() => {
    if (showKYCModal) {
      if (user.kycStatus === "verified") {
        setKycStep(4); // Show verified screen
      } else if (user.kycStatus === "pending") {
        setKycStep(3); // Show processing screen
      } else if (isKycDataFilled(user?.kycData)) {
        setKycStep(2); // Go to document upload
      } else {
        setKycStep(1); // Show details form
      }
    }
  }, [showKYCModal, user]);

  // Add this useEffect to fetch latest user data when KYC modal opens
  // Add a loading state for KYC modal user fetch
  const [kycUserLoading, setKycUserLoading] = useState(false);

  useEffect(() => {
    const fetchLatestUser = async () => {
      if (showKYCModal && localStorage.getItem("token")) {
        setKycUserLoading(true);
        try {
          const res = await fetch("https://setupxpay-backend.onrender.com/auth/me", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          });
          const data = await res.json();
          if (data && data.user) {
            setUser(data.user);
            // Removed setKycStep here to avoid overwriting the main KYC step logic
          }
        } catch (err) {
          // fallback: do nothing
        }
        setKycUserLoading(false);
      }
    };
    fetchLatestUser();
    // eslint-disable-next-line
  }, [showKYCModal]);
  const [kycData, setKycData] = useState({
    fullName: "",
    dateOfBirth: "",
    panNumber: "",
    aadharNumber: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    documentType: "aadhar",
    documentNumber: ""
  });
  
  // Document upload states
  const [panCardFile, setPanCardFile] = useState(null);
  const [aadharFrontFile, setAadharFrontFile] = useState(null);
  const [aadharBackFile, setAadharBackFile] = useState(null);
  const [processingTime, setProcessingTime] = useState(30); // minutes
  const [extractionError, setExtractionError] = useState(""); // For extraction errors
  const [isExtracting, setIsExtracting] = useState(false); // Loading state for extraction

  // Avatar helper functions
  const getAvatarSvg = (avatarId) => {
    const avatarOptions = {
      default: (
        <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="18" fill="#3B82F6"/>
          <path d="M18 9C20.7614 9 23 11.2386 23 14C23 16.7614 20.7614 19 18 19C15.2386 19 13 16.7614 13 14C13 11.2386 15.2386 9 18 9Z" fill="white"/>
          <path d="M18 21C22.4183 21 26 24.5817 26 29H10C10 24.5817 13.5817 21 18 21Z" fill="white"/>
        </svg>
      ),
      rocket: (
        <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="18" fill="#EF4444"/>
          <path d="M18 8L20 12L18 16L16 12L18 8Z" fill="white"/>
          <path d="M18 16L18 28L14 24L18 16Z" fill="white"/>
          <path d="M18 16L18 28L22 24L18 16Z" fill="white"/>
          <circle cx="18" cy="12" r="2" fill="#EF4444"/>
        </svg>
      ),
      star: (
        <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="18" fill="#F59E0B"/>
          <path d="M18 6L22 14L30 15L24 21L26 29L18 25L10 29L12 21L6 15L14 14L18 6Z" fill="white"/>
        </svg>
      ),
      diamond: (
        <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="18" fill="#8B5CF6"/>
          <path d="M18 8L24 18L18 28L12 18L18 8Z" fill="white"/>
          <path d="M18 8L18 28" stroke="#8B5CF6" strokeWidth="2"/>
          <path d="M12 18L24 18" stroke="#8B5CF6" strokeWidth="2"/>
        </svg>
      ),
      shield: (
        <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="18" fill="#10B981"/>
          <path d="M18 8L24 12V18C24 22 21 26 18 28C15 26 12 22 12 18V12L18 8Z" fill="white"/>
          <path d="M16 18L18 20L22 16" stroke="#10B981" strokeWidth="2" fill="none"/>
        </svg>
      ),
      crown: (
        <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="18" fill="#F97316"/>
          <path d="M8 20L12 14L18 16L24 14L28 20L26 26H10L8 20Z" fill="white"/>
          <path d="M12 14L14 8L18 10L22 8L24 14" stroke="#F97316" strokeWidth="1" fill="none"/>
        </svg>
      ),
      lightning: (
        <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="18" fill="#EAB308"/>
          <path d="M18 8L12 18H16L14 28L24 18H20L18 8Z" fill="white"/>
        </svg>
      ),
      heart: (
        <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="18" fill="#EC4899"/>
          <path d="M18 12C18 12 20 10 22 10C24 10 26 12 26 14C26 18 18 24 18 24C18 24 10 18 10 14C10 12 12 10 14 10C16 10 18 12 18 12Z" fill="white"/>
        </svg>
      ),
      moon: (
        <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="18" fill="#6366F1"/>
          <path d="M18 8C22 8 26 12 26 18C26 24 22 28 18 28C14 28 10 24 10 18C10 12 14 8 18 8Z" fill="white"/>
          <path d="M18 8C22 8 26 12 26 18C26 24 22 28 18 28C14 28 10 24 10 18C10 12 14 8 18 8Z" fill="#6366F1"/>
          <circle cx="22" cy="14" r="3" fill="#6366F1"/>
        </svg>
      ),
      fire: (
        <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="18" fill="#DC2626"/>
          <path d="M18 8C18 8 20 12 20 16C20 20 18 24 18 24C18 24 16 20 16 16C16 12 18 8 18 8Z" fill="white"/>
          <path d="M18 12C18 12 19 14 19 16C19 18 18 20 18 20C18 20 17 18 17 16C17 14 18 12 18 12Z" fill="#DC2626"/>
        </svg>
      )
    };
    return avatarOptions[avatarId] || avatarOptions.default;
  };

  useEffect(() => {
    if (user?.walletAddress || user?.bep20Address) {
      fetchBalance();
      fetchRates();
      fetchUSDTPrice();

      // 🔄 Auto-refresh rates every 10 seconds
      const interval = setInterval(() => {
        fetchRates();
        fetchUSDTPrice();
      }, 10000);

      return () => clearInterval(interval); // Cleanup on unmount
    }
  }, [user]);

  // Updated fetchBalance to support BEP20 (BSC) and TRC20
  const fetchBalance = async () => {
    try {
      let address = user.bep20Address || user.walletAddress;
      if (!address) return;
      const res = await fetch(`${CURRENT_CONFIG.BACKEND_URL}/get-balance/${address}`);
      const data = await res.json();
      setBalance(data.usdt || "0");
    } catch (err) {
      console.error("❌ Error fetching balance:", err);
    }
  };

  const fetchRates = async () => {
    try {
      const res = await fetch(`${CURRENT_CONFIG.BACKEND_URL}/rate`);
      const data = await res.json();
      setBuyRate(data?.buy || "-");
      setSellRate(data?.sell || "-");
    } catch (err) {
      console.error("❌ Error fetching rates:", err);
    }
  };

  // Fetch USDT price in USD from Binance
  const fetchUSDTPrice = async () => {
    try {
      const res = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=USDTUSD");
      if (res.ok) {
        const data = await res.json();
        setUsdtPrice(parseFloat(data.price));
      } else {
        setUsdtPrice(1.0); // fallback
      }
    } catch (err) {
      setUsdtPrice(1.0);
    }
  };

  const handlePanCardUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert("Please upload a valid image file (JPG, PNG, or WebP)");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    setPanCardFile(file);
  };

  const handleAadharUpload = (event, side) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert("Please upload a valid image file (JPG, PNG, or WebP)");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    if (side === 'front') {
      setAadharFrontFile(file);
    } else {
      setAadharBackFile(file);
    }
  };

  const handleKYCConfirm = () => {
    if (!kycData.pincode || kycData.pincode.length !== 6) {
      alert("Please enter a valid 6-digit pincode.");
      return;
    }
    
    setKycStep(4);
    
    // Simulate processing
    const interval = setInterval(() => {
      setProcessingTime(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setKycStep(5);
          setKycStatus("verified");
          
          // Update user data in localStorage
          const updatedUser = { ...user, kycStatus: "verified", kycData: kycData };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          
          return 0;
        }
        return prev - 1;
      });
    }, 60000); // 1 minute intervals
  };

  const handleKYCSubmit = () => {
    // Validate KYC data
    if (!kycData.fullName || !kycData.dateOfBirth || !kycData.panNumber || !kycData.aadharNumber || !kycData.address || !kycData.city || !kycData.state || !kycData.pincode) {
      alert("Please fill in all required fields.");
      return;
    }

    // Validate PAN number format (10 characters)
    if (kycData.panNumber.length !== 10) {
      alert("PAN number must be 10 characters long.");
      return;
    }

    // Validate Aadhar number format (12 digits)
    if (kycData.aadharNumber.length !== 12 || !/^\d+$/.test(kycData.aadharNumber)) {
      alert("Aadhar number must be 12 digits.");
      return;
    }

    // Validate pincode format (6 digits)
    if (kycData.pincode.length !== 6 || !/^\d+$/.test(kycData.pincode)) {
      alert("Pincode must be 6 digits.");
      return;
    }

    // Simulate KYC submission
    alert("KYC submitted successfully! Your verification will be processed within 24-48 hours.");
    setKycStatus("pending");
    setShowKYCModal(false);
    
    // Update user data in localStorage
    const updatedUser = { ...user, kycStatus: "pending", kycData: kycData };
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const handleKYCBack = () => {
    if (kycStep > 1) {
      setKycStep(kycStep - 1);
      setExtractionError("");
      setIsExtracting(false);
    }
  };

  const handleKYCReset = () => {
    const confirmed = window.confirm("Are you sure you want to reset the KYC process? All uploaded documents and entered information will be cleared.");
    if (confirmed) {
      setKycStep(1);
      setKycData({
        fullName: "",
        dateOfBirth: "",
        panNumber: "",
        aadharNumber: "",
        address: "",
        city: "",
        state: "",
        country: "India",
        pincode: "",
        documentType: "aadhar",
        documentNumber: ""
      });
      setPanCardFile(null);
      setAadharFrontFile(null);
      setAadharBackFile(null);
      setExtractionError("");
      setIsExtracting(false);
    }
  };

  const getKYCStatusColor = (status) => {
    switch (status) {
      case "verified":
        return "text-green-600 bg-green-100";
      case "rejected":
        return "text-red-600 bg-red-100";
      case "pending":
      default:
        return "text-yellow-600 bg-yellow-100";
    }
  };

  const getKYCStatusText = (status) => {
    switch (status) {
      case "verified":
        return "Verified";
      case "rejected":
        return "Rejected";
      case "pending":
      default:
        return "Pending";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/"; // Force redirect to landing page
  };

  useEffect(() => {
    setKycStatus(user?.kycStatus || "pending");
  }, [user.kycStatus]);

  // Replace showBankModal/modal with full-page section
  const [showBankSection, setShowBankSection] = useState(false);
  const [bankDetails, setBankDetails] = useState([]);
  const [bankLoading, setBankLoading] = useState(false);
  const [bankForm, setBankForm] = useState({ accountHolder: "", accountNumber: "", ifsc: "", upiId: "" });
  const [bankError, setBankError] = useState("");
  const [bankSuccess, setBankSuccess] = useState("");
  const [bankSubmitting, setBankSubmitting] = useState(false);

  // Fetch bank details when modal opens
  useEffect(() => {
    if (showBankSection) fetchBankDetails();
    // eslint-disable-next-line
  }, [showBankSection]);

  const fetchBankDetails = async () => {
    setBankLoading(true);
    setBankError("");
    try {
      const res = await fetch("https://setupxpay-backend.onrender.com/user/bank-details", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      if (data.success) {
        setBankDetails(data.bankDetails || []);
      } else {
        setBankError(data.error || "Failed to fetch bank details");
      }
    } catch (err) {
      setBankError("Failed to fetch bank details");
    }
    setBankLoading(false);
  };

  const handleBankFormChange = (e) => {
    setBankForm({ ...bankForm, [e.target.name]: e.target.value });
  };

  const handleBankSubmit = async (e) => {
    e.preventDefault();
    setBankError("");
    setBankSuccess("");
    setBankSubmitting(true);
    if (!bankForm.accountHolder || (!bankForm.accountNumber && !bankForm.upiId)) {
      setBankError("Account holder and at least one payment method required");
      setBankSubmitting(false);
      return;
    }
    try {
      const res = await fetch("https://setupxpay-backend.onrender.com/user/bank-details", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify(bankForm)
      });
      const data = await res.json();
      if (data.success) {
        setBankSuccess("Bank/UPI details added. Awaiting admin approval.");
        setBankForm({ accountHolder: "", accountNumber: "", ifsc: "", upiId: "" });
        fetchBankDetails();
      } else {
        setBankError(data.error || "Failed to add bank details");
      }
    } catch (err) {
      setBankError("Failed to add bank details");
    }
    setBankSubmitting(false);
  };

  if (!user || !user._id) {
    // Optionally clear localStorage if user is invalid
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">Please log in again</h2>
        <button
          className="px-6 py-3 bg-blue-700 text-white rounded-lg font-semibold"
          onClick={() => window.location.href = "/login"}
        >
          Go to Login
        </button>
      </div>
    );
  }

  // --- UI ---
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
      {/* Main scrollable content (everything except footer) */}
      <div className="flex-1 overflow-y-auto pb-32" style={{ maxHeight: '100vh', minHeight: 0 }}>
        {/* Header: User name only, no email, always white background, sticky at top */}
        <div className="w-full flex items-center justify-between px-4 py-4 bg-white sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <FaBars className="text-2xl text-gray-800 cursor-pointer" onClick={() => setShowSidebar(true)} />
            <span className="text-lg font-bold text-blue-900 tracking-wide">
              {user?.name
                ? user.name.split(" ")[0]
                : user?.email
                  ? user.email.split("@")[0]
                  : "User"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center">
              {getAvatarSvg(user?.avatar || "default")}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${showSidebar ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex justify-between items-center px-4 py-3 border-b">
            <div className="flex items-center gap-2">
              <img src={setupxpayLogo} alt="logo" className="h-6 w-6" />
              <span className="text-base font-semibold text-gray-800">SetupXPay</span>
            </div>
            <MdClose className="text-xl cursor-pointer" onClick={() => setShowSidebar(false)} />
          </div>
          <div className="px-4 py-4 flex flex-col gap-4">
            <button 
              onClick={() => {
                setShowProfile(true);
                setShowSidebar(false);
              }}
              className="flex items-center gap-3 text-gray-800 hover:text-blue-700"
            >
              <FaUser /> Profile
            </button>
            <button 
              onClick={() => {
                setShowKYCModal(true);
                setShowSidebar(false);
              }}
              className="flex items-center justify-between text-gray-800 hover:text-blue-700"
            >
              <div className="flex items-center gap-3">
                <FaFileAlt /> 
                <span>KYC</span>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getKYCStatusColor(kycStatus)}`}>
                {getKYCStatusText(kycStatus)}
              </div>
            </button>
            <button 
              onClick={() => {
                setShowBankSection(true);
                setShowSidebar(false);
              }}
              className="flex items-center gap-3 text-gray-800 hover:text-blue-700"
            >
              <FaWallet /> Bank Details
            </button>
            <button 
              onClick={() => {
                navigate("/referrals");
                setShowSidebar(false);
              }}
              className="flex items-center gap-3 text-gray-800 hover:text-blue-700"
            >
              <FaUsers /> Referrals
            </button>
            <button className="flex items-center gap-3 text-gray-800 hover:text-blue-700"><FaCog /> Settings</button>
            <button className="flex items-center gap-3 text-red-600 hover:text-red-800" onClick={handleLogout}><FaSignOutAlt /> Logout</button>
          </div>
        </div>

        {/* Offer Banner */}
        <div className="w-full -mt-2">
          <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-none p-3 shadow-lg border border-blue-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-white font-semibold text-xs">Today's Special Offer!</div>
                  <div className="text-yellow-300 text-xs">First Deposit Bonus</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-yellow-400 font-bold text-xs">Up to 500 STX</div>
                <div className="text-blue-200 text-xs">Free Tokens</div>
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Asset Card with merged Buy/Sell Rate (no extra white box below) */}
        <div className="max-w-md mx-auto px-4 mt-4 animate-fadeIn">
          <div className="bg-white/90 shadow-lg border border-blue-100 rounded-3xl overflow-hidden flex flex-col items-center pt-8 pb-0 mb-2">
            <div className="text-xs font-semibold text-blue-700 mb-2 tracking-widest uppercase">Wallet Asset</div>
            <div className="flex flex-col items-center mb-1">
              <span className="text-3xl font-bold text-gray-900 tracking-wide">${(parseFloat(balance) * usdtPrice).toFixed(2)}</span>
              <div className="text-xs text-gray-500 mt-1">{parseFloat(balance).toFixed(2)} USDT</div>
            </div>
            <div className="flex gap-4 mt-2 mb-4">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">USDT</span>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">Multi-chain</span>
            </div>
            {/* Merged Buy/Sell Rate Strip, flush with card bottom, with border-radius */}
            <div className="w-full bg-blue-800 text-white px-6 py-3 flex justify-between items-center text-base font-semibold rounded-b-3xl shadow-none">
              <span>Buy ₹{buyRate}</span>
              <span>Sell ₹{sellRate}</span>
            </div>
          </div>
        </div>

        {/* Main Actions (Wallet, Transactions, Community) - match footer button size and add more vertical gap above */}
        <div className="max-w-md mx-auto px-4 mt-4 mb-4">
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setShowWalletModal(true)}
              className="flex flex-col items-center justify-center bg-white border border-blue-100 text-blue-900 rounded-2xl py-3 px-2 w-full shadow hover:bg-blue-50 transition text-xs font-semibold h-20"
            >
              <FaWallet className="text-xl mb-1" />
              Wallet
            </button>
            <button
              onClick={() => setShowTransactionHistory(true)}
              className="flex flex-col items-center justify-center bg-white border border-blue-100 text-blue-900 rounded-2xl py-3 px-2 w-full shadow hover:bg-blue-50 transition text-xs font-semibold h-20"
            >
              <FaExchangeAlt className="text-xl mb-1" />
              Transactions
            </button>
                        <button
              onClick={() => navigate("/community")}
              className="flex flex-col items-center justify-center bg-white border border-blue-100 text-blue-900 rounded-2xl py-3 px-2 w-full shadow hover:bg-blue-50 transition text-xs font-semibold h-20"
            >
              <FaUsers className="text-xl mb-1" />
              Community
            </button>
          </div>
        </div>



        {/* Refer & Earn Section - Luxury Design */}
        <div className="max-w-md mx-auto px-4 mb-20">
          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 border border-yellow-500 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-300 px-6 py-4 text-center">
              <h2 className="text-xl font-bold text-gray-900">Refer & Earn STX Tokens</h2>
              <p className="text-gray-700 text-sm mt-1 font-medium">
                Earn exclusive STX tokens for every successful referral
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 text-center border border-yellow-300 shadow-lg">
                  <div className="text-2xl font-bold text-yellow-600">100 STX</div>
                  <div className="text-xs text-gray-600 font-medium">Per Signup</div>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 text-center border border-gray-300 shadow-lg">
                  <div className="text-2xl font-bold text-gray-700">+100 STX</div>
                  <div className="text-xs text-gray-600 font-medium">Per 10 USDT Trade</div>
                </div>
              </div>

              {/* Referral Link */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-300">Your Referral Link</span>
                </div>
                <div className="bg-gray-800 border border-yellow-500 rounded-xl p-3 flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-mono text-gray-300 truncate">
                      https://setupxpay.com/signup?ref={user._id?.slice(-6) || "abc123"}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`https://setupxpay.com/signup?ref=${user._id?.slice(-6) || "abc123"}`);
                      alert("Referral link copied to clipboard!");
                    }}
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 px-3 py-2 rounded-lg text-xs font-medium hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 flex items-center gap-1 shadow-md"
                  >
                    <FaCopy className="text-xs" />
                    Copy
                  </button>
                </div>
              </div>

              {/* Share Buttons */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-300">Share via</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={`https://wa.me/?text=Join%20SetupXPay%20and%20earn%20STX%20tokens!%20Use%20my%20referral%20link:%20https://setupxpay.com/signup?ref=${user._id?.slice(-6) || "abc123"}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-3 text-sm rounded-xl border border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-gray-900 transition-all duration-200 font-medium"
                  >
                    <FaWhatsapp className="text-lg" />
                    WhatsApp
                  </a>
                  <a
                    href={`https://t.me/share/url?url=https://setupxpay.com/signup?ref=${user._id?.slice(-6) || "abc123"}&text=Join%20SetupXPay%20and%20earn%20STX%20tokens!%20Best%20USDT%20trading%20platform!`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-3 text-sm rounded-xl border border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-gray-900 transition-all duration-200 font-medium"
                  >
                    <FaTelegramPlane className="text-lg" />
                    Telegram
                  </a>
                </div>
              </div>

              {/* How it works */}
              <div className="bg-gray-800 rounded-xl p-4 border border-yellow-500">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-300">How it works</span>
                </div>
                <div className="space-y-2 text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-yellow-500 text-gray-900 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    <span>Share your referral link with friends</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-yellow-500 text-gray-900 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    <span>They sign up and complete KYC</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-yellow-500 text-gray-900 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                    <span>You get 100 STX tokens instantly</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-yellow-500 text-gray-900 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                    <span>+100 STX for every 10 USDT they trade</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions - White background, dark blue buttons with white icon/text, no overlap with Refer & Earn */}
      <div className="fixed bottom-0 left-0 w-full flex justify-center items-center py-4 z-50 bg-white">
        <div className="flex gap-3 max-w-md w-full justify-center items-center px-4">
          <button
            onClick={() => setShowBuyUSDT(true)}
            className="flex flex-col items-center justify-center bg-blue-800 text-white rounded-2xl py-3 px-2 w-24 shadow hover:bg-blue-900 transition text-xs font-semibold"
          >
            <FaWallet className="text-xl mb-1 text-white" />
            Buy USDT
          </button>
          <button
            onClick={() => {
              console.log("Sell QR clicked, user:", user);
              setShowSellQR(true);
            }}
            className="flex flex-col items-center justify-center bg-blue-800 text-white rounded-2xl py-3 px-2 w-24 shadow hover:bg-blue-900 transition text-xs font-semibold"
          >
            <FaQrcode className="text-xl mb-1 text-white" />
            Scan & Pay
          </button>
          <button
            onClick={() => {
              console.log("Sell USDT clicked, user:", user);
              setShowWithdrawModal(true);
            }}
            className="flex flex-col items-center justify-center bg-blue-800 text-white rounded-2xl py-3 px-2 w-24 shadow hover:bg-blue-900 transition text-xs font-semibold"
          >
            <FaExchangeAlt className="text-xl mb-1 text-white" />
            Sell USDT
          </button>
        </div>
      </div>

      {/* Modals */}
      {showBuyUSDT && (
        <BuyUSDTModal
          trc20Address={user.walletAddress}
          bep20Address={user.bep20Address}
          onClose={() => setShowBuyUSDT(false)}
          onPaymentSuccess={() => {
            fetchBalance();
          }}
        />
      )}
      {showWalletModal && (
        <WalletModal
          trc20Address={user.walletAddress}
          bep20Address={user.bep20Address}
          onClose={() => setShowWalletModal(false)}
          openBuyModal={() => {
            setShowWalletModal(false);
            setTimeout(() => setShowBuyUSDT(true), 300);
          }}
        />
      )}
      {showSellQR && user?._id && (
        <SellUSDTQRModal
          userId={user._id}
          trc20Address={user.walletAddress}
          bep20Address={user.bep20Address}
          onClose={() => {
            setShowSellQR(false);
          }}
        />
      )}
      {showWithdrawModal && user?._id && (
        <WithdrawINRModal
          userId={user._id}
          trc20Address={user.walletAddress}
          bep20Address={user.bep20Address}
          onClose={() => setShowWithdrawModal(false)}
        />
      )}
      {showTransactionHistory && (
        <TransactionHistory user={user} onClose={() => setShowTransactionHistory(false)} />
      )}
      {showProfile && (
        <Profile 
          user={user} 
          onClose={() => setShowProfile(false)} 
        />
      )}

      {/* KYC Full Page */}
      {showKYCModal && (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col overflow-hidden z-50">
          {/* Header */}
          <div className="bg-white shadow-sm px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowKYCModal(false)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <FaArrowLeft className="text-gray-600" />
              </button>
              <h1 className="text-xl font-bold text-gray-800">KYC Verification</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500">Step {kycStep} of 4</div>
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${(kycStep / 4) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="max-w-md mx-auto space-y-6">
              
              {/* Step 1: Manual Details */}
              {kycStep === 1 && (
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FaFileAlt className="text-blue-600 text-2xl" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Enter Your Details</h3>
                    <p className="text-sm text-gray-600">Please enter your personal information</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                        <input
                          type="text"
                          value={kycData.fullName}
                          onChange={(e) => setKycData({...kycData, fullName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                        <input
                          type="date"
                          value={kycData.dateOfBirth}
                          onChange={(e) => setKycData({...kycData, dateOfBirth: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                      <textarea
                        value={kycData.address}
                        onChange={(e) => setKycData({...kycData, address: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                        placeholder="Enter your complete address"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                        <input
                          type="text"
                          value={kycData.city}
                          onChange={(e) => setKycData({...kycData, city: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter city name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                        <input
                          type="text"
                          value={kycData.state}
                          onChange={(e) => setKycData({...kycData, state: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter state name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
                        <input
                          type="text"
                          value={kycData.pincode}
                          onChange={(e) => setKycData({...kycData, pincode: e.target.value.replace(/\D/g, '')})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="123456"
                          maxLength="6"
                        />
                      </div>
                    </div>
                    
                    <button
                      onClick={async () => {
                        // Validate required fields
                        if (!kycData.fullName || !kycData.dateOfBirth || !kycData.address || !kycData.city || !kycData.state || !kycData.pincode) {
                          alert("Please fill in all required fields marked with *");
                          return;
                        }
                        // Validate pincode format
                        if (kycData.pincode.length !== 6) {
                          alert("Pincode must be exactly 6 digits");
                          return;
                        }
                        // Submit KYC details to backend
                        try {
                          const kycSubmission = {
                            userId: user._id,
                            kycData: kycData,
                            documents: user.kycDocuments || {}
                          };
                          const response = await fetch("https://setupxpay-backend.onrender.com/kyc/submit", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(kycSubmission)
                          });
                          const result = await response.json();
                          if (!result.success) {
                            alert("❌ KYC submission failed: " + (result.error || "Unknown error"));
                            return;
                          }
                          // Fetch latest user data from backend
                          const meRes = await fetch("https://setupxpay-backend.onrender.com/auth/me", {
                            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                          });
                          const meData = await meRes.json();
                          if (meData && meData.user) {
                            setUser(meData.user);
                            localStorage.setItem("user", JSON.stringify(meData.user));
                          }
                          setKycStep(2); // Move to document upload
                        } catch (error) {
                          alert("❌ Failed to submit KYC. Please try again.");
                        }
                      }}
                      className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Document Upload */}
              {kycStep === 2 && (
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FaFileAlt className="text-green-600 text-2xl" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Upload Documents</h3>
                    <p className="text-sm text-gray-600">Please upload a clear photo of your PAN card and Aadhar card</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePanCardUpload}
                          className="hidden"
                          id="panCardUpload"
                        />
                        <label htmlFor="panCardUpload" className="cursor-pointer">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <FaFileAlt className="text-gray-600 text-sm" />
                          </div>
                          <div className="text-xs font-medium text-gray-700">PAN Card</div>
                          {panCardFile && (
                            <div className="text-xs text-green-600 mt-1">{panCardFile.name}</div>
                          )}
                        </label>
                      </div>
                      
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-400 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleAadharUpload(e, 'front')}
                          className="hidden"
                          id="aadharFrontUpload"
                        />
                        <label htmlFor="aadharFrontUpload" className="cursor-pointer">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <FaFileAlt className="text-gray-600 text-sm" />
                          </div>
                          <div className="text-xs font-medium text-gray-700">Aadhar Front</div>
                          {aadharFrontFile && (
                            <div className="text-xs text-green-600 mt-1">{aadharFrontFile.name}</div>
                          )}
                        </label>
                      </div>
                    </div>
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleAadharUpload(e, 'back')}
                        className="hidden"
                        id="aadharBackUpload"
                      />
                      <label htmlFor="aadharBackUpload" className="cursor-pointer">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <FaFileAlt className="text-gray-600 text-sm" />
                        </div>
                        <div className="text-xs font-medium text-gray-700">Aadhar Back</div>
                        {aadharBackFile && (
                          <div className="text-xs text-green-600 mt-1">{aadharBackFile.name}</div>
                        )}
                      </label>
                    </div>
                    
                    <button
                      onClick={async () => {
                        // Validate mandatory uploads
                        if (!panCardFile || !aadharFrontFile || !aadharBackFile) {
                          alert("Please upload PAN card and both sides of Aadhar card.");
                          return;
                        }
                        // Log files for debugging
                        console.log("Uploading files:", {
                          panCardFile,
                          aadharFrontFile,
                          aadharBackFile
                        });
                        try {
                          let docUrls = {};
                          if (panCardFile || aadharFrontFile || aadharBackFile) {
                            const formData = new FormData();
                            formData.append("userId", user._id);
                            if (panCardFile) formData.append("panCard", panCardFile);
                            if (aadharFrontFile) formData.append("aadharFront", aadharFrontFile);
                            if (aadharBackFile) formData.append("aadharBack", aadharBackFile);
                            const uploadRes = await fetch("https://setupxpay-backend.onrender.com/kyc/upload", {
                              method: "POST",
                              body: formData
                            });
                            const uploadData = await uploadRes.json();
                            if (uploadData.success) {
                              docUrls = uploadData.kycDocuments;
                            } else {
                              alert("Document upload failed: " + (uploadData.error || "Unknown error"));
                              return;
                            }
                          }
                          // Save KYC data to database
                          const kycSubmission = {
                            userId: user._id,
                            kycData: kycData,
                            documents: docUrls
                          };
                          // Call KYC API
                          const response = await fetch("https://setupxpay-backend.onrender.com/kyc/submit", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(kycSubmission)
                          });
                          const result = await response.json();
                          if (!result.success) {
                            alert("❌ KYC submission failed: " + (result.error || "Unknown error"));
                            return;
                          }
                          // Update user data in localStorage
                          const updatedUser = { 
                            ...user, 
                            kycStatus: "pending", 
                            kycData: kycData,
                            kycSubmission: kycSubmission
                          };
                          localStorage.setItem("user", JSON.stringify(updatedUser));
                          setKycStep(3); // Move to processing
                        } catch (error) {
                          console.error("❌ KYC submission error:", error);
                          alert("❌ Failed to submit KYC. Please try again.");
                        }
                      }}
                      className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Processing */}
              {kycStep === 3 && (
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FaFileAlt className="text-blue-600 text-2xl" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">KYC Submitted Successfully!</h3>
                    <p className="text-sm text-gray-600">Our team will verify your documents and update your status</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-800">Processing</span>
                        <span className="text-sm font-bold text-blue-800">Processing</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: "25%" }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="text-sm text-green-800 font-medium mb-2">✅ What happens next?</div>
                      <ul className="text-xs text-green-700 space-y-1">
                        <li>• Your KYC details have been saved to our database</li>
                        <li>• Our verification team will review your documents</li>
                        <li>• PAN and Aadhar details will be verified</li>
                        <li>• You'll be notified once verification is complete</li>
                        <li>• Status will be updated to "Verified" in your profile</li>
                      </ul>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>KYC details submitted successfully</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Documents uploaded to database</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span>Team verification in progress...</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setShowKYCModal(false)}
                      className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                    >
                      Back to Dashboard
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Verified */}
              {kycStep === 4 && (
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FaFileAlt className="text-green-600 text-2xl" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">KYC Verified!</h3>
                    <p className="text-sm text-gray-600">Your account has been successfully verified</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-green-800 mb-2">
                        <FaFileAlt />
                        <span className="font-medium">Verification Complete</span>
                      </div>
                      <div className="text-sm text-green-700">
                        Your KYC has been verified successfully. You can now access higher transaction limits and all features.
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="text-sm text-blue-800 font-medium mb-2">What's Next?</div>
                      <ul className="text-xs text-blue-700 space-y-1">
                        <li>• You can now buy and sell USDT with higher limits</li>
                        <li>• Access to all premium features</li>
                        <li>• Faster transaction processing</li>
                        <li>• Priority customer support</li>
                      </ul>
                    </div>
                    
                    <button
                      onClick={() => setShowKYCModal(false)}
                      className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition-colors"
                    >
                      Continue to Dashboard
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bank Details Modal */}
      {showBankSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white overflow-auto">
          <div className="w-full max-w-2xl mx-auto p-6 relative min-h-screen flex flex-col">
            {/* Back button top-left */}
            <button className="absolute top-4 left-4 text-gray-500 hover:text-gray-800 flex items-center gap-1" onClick={() => setShowBankSection(false)}>
              <FaArrowLeft className="inline-block" /> Back
            </button>
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 mt-10"><FaWallet /> Bank & UPI Details</h2>
            <div className="text-sm text-blue-800 bg-blue-50 rounded px-4 py-3 mb-6">
              <b>Important:</b> Please add <b>only your own</b> bank account or UPI ID. <b>Third-party details are strictly prohibited</b> and will be rejected by the admin. Withdrawals will only be processed to your own verified accounts. Ensure the account holder name matches your KYC documents.
            </div>
            <form onSubmit={handleBankSubmit} className="mb-6 space-y-3 bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Account Holder Name</label>
                  <input type="text" name="accountHolder" value={bankForm.accountHolder} onChange={handleBankFormChange} className="w-full border px-2 py-1 rounded text-sm" required />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Account Number</label>
                  <input type="text" name="accountNumber" value={bankForm.accountNumber} onChange={handleBankFormChange} className="w-full border px-2 py-1 rounded text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">IFSC Code</label>
                  <input type="text" name="ifsc" value={bankForm.ifsc} onChange={handleBankFormChange} className="w-full border px-2 py-1 rounded text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">UPI ID</label>
                  <input type="text" name="upiId" value={bankForm.upiId} onChange={handleBankFormChange} className="w-full border px-2 py-1 rounded text-sm" />
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">At least one payment method (Account Number or UPI ID) is required.</div>
              {bankError && <div className="text-red-600 text-xs mt-1">{bankError}</div>}
              {bankSuccess && <div className="text-green-600 text-xs mt-1">{bankSuccess}</div>}
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-medium mt-2" disabled={bankSubmitting}>
                {bankSubmitting ? "Saving..." : <span className="flex items-center justify-center gap-2"><FaPlus /> Add Bank/UPI</span>}
              </button>
            </form>
            <div className="mb-2 font-semibold text-base">Your Bank/UPI Details</div>
            {bankLoading ? <div>Loading...</div> : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {bankDetails.length === 0 && <div className="text-xs text-gray-500">No bank/UPI details added yet.</div>}
                {bankDetails.map((bd, idx) => (
                  <div key={idx} className="border rounded-lg px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-sm bg-white shadow-sm">
                    <div>
                      <div><b>Account Holder:</b> {bd.accountHolder || "-"}</div>
                      {bd.accountNumber && <div><b>Account No:</b> {bd.accountNumber}</div>}
                      {bd.ifsc && <div><b>IFSC:</b> {bd.ifsc}</div>}
                      {bd.upiId && <div><b>UPI:</b> {bd.upiId}</div>}
                      <div className="text-gray-400 text-xs mt-1">Added: {bd.addedAt ? new Date(bd.addedAt).toLocaleString() : "-"}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${bd.status === "approved" ? "bg-green-100 text-green-700" : bd.status === "rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{bd.status}</span>
                      {bd.adminNote && <span className="text-xs text-gray-500">Note: {bd.adminNote}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;