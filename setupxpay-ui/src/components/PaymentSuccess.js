import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCheckCircle, FaArrowRight, FaHome, FaWallet } from "react-icons/fa";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showConfetti, setShowConfetti] = useState(false);

  // Get payment details from URL params
  const amount = searchParams.get('amount') || '0';
  const usdtAmount = searchParams.get('usdt') || '0';
  const txId = searchParams.get('txId') || '';

  useEffect(() => {
    // Show confetti after a short delay
    const confettiTimer = setTimeout(() => {
      setShowConfetti(true);
    }, 500);

    // Auto redirect after 5 seconds
    const redirectTimer = setTimeout(() => {
      navigate("/dashboard");
    }, 5000);

    return () => {
      clearTimeout(confettiTimer);
      clearTimeout(redirectTimer);
    };
  }, [navigate]);

  // Confetti component
  const Confetti = () => {
    if (!showConfetti) return null;
    
    return (
      <div className="fixed inset-0 pointer-events-none z-10">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: -10,
              rotate: 0,
            }}
            animate={{
              y: window.innerHeight + 10,
              rotate: 360,
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              left: Math.random() * window.innerWidth,
              backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][Math.floor(Math.random() * 5)],
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-green-50 via-white to-blue-50 flex flex-col items-center justify-center px-4 z-50">
      <Confetti />
      
      <motion.div
        initial={{ scale: 0.6, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-md w-full relative overflow-hidden"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: "spring", delay: 0.2 }}
          className="relative"
        >
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mb-6">
            <FaCheckCircle className="text-white text-3xl" />
          </div>
          
          {/* Ripple effect */}
          <motion.div
            className="absolute inset-0 bg-green-400 rounded-full opacity-20"
            initial={{ scale: 0 }}
            animate={{ scale: 2 }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
          />
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Payment Successful! 🎉
          </h1>
          <p className="text-gray-600 mb-6">
            Your USDT has been added to your wallet
          </p>
        </motion.div>

        {/* Payment Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-6 mb-6"
        >
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Amount Paid:</span>
              <span className="font-semibold text-gray-800">₹{amount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">USDT Received:</span>
              <span className="font-bold text-green-600 text-lg">{usdtAmount} USDT</span>
            </div>
            {txId && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-mono text-xs text-gray-500 truncate max-w-24">
                  {txId.slice(0, 8)}...{txId.slice(-8)}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="space-y-3"
        >
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 flex items-center justify-center gap-2"
          >
            <FaWallet />
            Go to Dashboard
            <FaArrowRight className="text-sm" />
          </button>
          
          <button
            onClick={() => navigate("/")}
            className="w-full border-2 border-gray-300 text-gray-600 hover:bg-gray-50 font-medium py-3 px-6 rounded-xl transition duration-200 flex items-center justify-center gap-2"
          >
            <FaHome />
            Back to Home
          </button>
        </motion.div>

        {/* Auto redirect notice */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="text-xs text-gray-500 mt-4"
        >
          Redirecting to dashboard in 5 seconds...
        </motion.p>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
