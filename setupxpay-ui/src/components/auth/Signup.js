import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import OneTimeSignModal from "../OneTimeSignModal";
import WalletBackup from "../WalletBackup";

const Signup = ({ onSuccess }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showOneTimeSign, setShowOneTimeSign] = useState(false);
  const [signupData, setSignupData] = useState(null);
  const [showBackup, setShowBackup] = useState(false);
  const [walletBackup, setWalletBackup] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    console.log("[Signup] Submitting:", { name, email, password });
    try {
      const res = await fetch("https://setupxpay-backend.onrender.com/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      console.log("[Signup] Response status:", res.status);
      const data = await res.json();
      console.log("[Signup] Response data:", data);
      if (res.ok && data.wallet) {
        setWalletBackup(data.wallet);
        setShowBackup(true);
      } else {
        setError(data.error || "Signup failed");
      }
    } catch (err) {
      setError("Server error. Try again later.");
      console.error("[Signup] Network or JS error:", err);
    } finally {
      setLoading(false);
    }
  };

  // After backup, show one-time sign modal (if needed), then complete
  const handleBackupComplete = () => {
    setShowBackup(false);
    setShowOneTimeSign(true);
    setSignupData({}); // dummy, for compatibility
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-8 overflow-hidden">
      {/* Cross Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors z-50"
      >
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <motion.div
        className="w-full max-w-md bg-white p-6 sm:p-8 rounded-2xl shadow-xl"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img 
            src="/logo1.png" 
            alt="SetupXPay Logo" 
            className="w-20 h-20 rounded-full object-cover"
          />
        </div>
        
        <h2 className="text-3xl font-extrabold text-gray-800 text-center mb-6">Create Your Wallet</h2>

        {error && <p className="text-red-600 text-sm text-center mb-4">{error}</p>}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="text-sm text-gray-700">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-0"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-700">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-0"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-0"
              required
            />
          </div>

          <motion.button
            type="submit"
            whileTap={{ scale: 0.97 }}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2.5 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                Creating Wallet...
              </>
            ) : (
              "Sign Up"
            )}
          </motion.button>
        </form>

        <p className="mt-5 text-sm text-center text-gray-600">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-blue-600 font-semibold cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </motion.div>

      {/* Wallet Backup Modal */}
      {showBackup && walletBackup && (
        <WalletBackup
          mnemonic={walletBackup.mnemonic}
          trc20={walletBackup.trc20}
          bep20={walletBackup.bep20}
          onComplete={handleBackupComplete}
        />
      )}

      {/* One-Time Sign Permission Modal (optional, can be skipped or kept for future) */}
      {showOneTimeSign && (
        <OneTimeSignModal
          onAccept={() => {
            setShowOneTimeSign(false);
            onSuccess(); // redirect to login
          }}
          onDecline={() => {
            setShowOneTimeSign(false);
            onSuccess(); // redirect to login
          }}
          walletAddress={walletBackup?.trc20?.address}
        />
      )}
    </div>
  );
};

export default Signup;
