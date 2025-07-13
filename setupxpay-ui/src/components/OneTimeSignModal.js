import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaShieldAlt, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const OneTimeSignModal = ({ onAccept, onDecline, walletAddress }) => {
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    try {
      // In real implementation, this would update the backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      onAccept();
    } catch (err) {
      console.error("Error accepting one-time sign:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        className="bg-white rounded-2xl p-6 w-full max-w-md mx-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaShieldAlt className="text-2xl text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">One-Time Authorization</h2>
          <p className="text-sm text-gray-600">
            Allow SetupXPay to automatically transfer USDT from your wallet for faster transactions
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-2">What this means:</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start">
              <FaCheckCircle className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
              <span>Faster USDT sales without repeated authentication</span>
            </li>
            <li className="flex items-start">
              <FaCheckCircle className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
              <span>Your private key remains encrypted and secure</span>
            </li>
            <li className="flex items-start">
              <FaCheckCircle className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
              <span>You can revoke this permission anytime</span>
            </li>
            <li className="flex items-start">
              <FaTimesCircle className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
              <span>SetupXPay cannot access your funds without your consent</span>
            </li>
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
          <p className="text-xs text-blue-800">
            <strong>Wallet:</strong> {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onDecline}
            className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Accept"}
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          You can change this setting later in your wallet settings
        </p>
      </motion.div>
    </div>
  );
};

export default OneTimeSignModal; 