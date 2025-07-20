import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaShieldAlt, FaBolt, FaGlobe, FaMobileAlt, FaLock, FaExchangeAlt } from "react-icons/fa";

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <FaShieldAlt className="text-2xl" />,
      title: "Secure",
      description: "Non-custodial wallets with encryption"
    },
    {
      icon: <FaBolt className="text-2xl" />,
      title: "Fast",
      description: "Instant USDT ⇄ INR conversions"
    },
    {
      icon: <FaGlobe className="text-2xl" />,
      title: "Multi-Chain",
      description: "TRC20 & BEP20 support"
    },
    {
      icon: <FaMobileAlt className="text-2xl" />,
      title: "Mobile-First",
      description: "Optimized for all devices"
    },
    {
      icon: <FaLock className="text-2xl" />,
      title: "Private",
      description: "Your keys, your control"
    },
    {
      icon: <FaExchangeAlt className="text-2xl" />,
      title: "Seamless",
      description: "One-click buy/sell USDT"
    }
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 overflow-y-auto">
      {/* Header */}
      <motion.header 
        className="flex justify-end items-center px-6 py-4 bg-white shadow-sm sticky top-0 z-50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex gap-4">
          <button 
            onClick={() => navigate("/login")}
            className="text-blue-700 hover:text-blue-800 font-medium"
          >
            Login
          </button>
          <button 
            onClick={() => navigate("/signup")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Sign Up
          </button>
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.section 
        className="text-center px-6 py-12"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >

        <div className="flex flex-col items-center mb-4">
          <img 
            src="/logo1.png" 
            alt="SetupXPay Logo" 
            className="w-24 h-24 md:w-32 md:h-32 mb-4 rounded-full object-cover"
          />
          <h1 className="text-5xl md:text-6xl font-extrabold text-blue-800 tracking-tight">
            Setup<span className="text-yellow-500">X</span>Pay
          </h1>
        </div>
        <p className="text-xl text-gray-600 mb-2">Your Gateway to Crypto ⇄ INR</p>
        <p className="text-lg text-gray-500 mb-8">Fast | Secure | Seamless</p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <motion.button
            onClick={() => navigate("/signup")}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg transition duration-150 text-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started Free
          </motion.button>
          <motion.button
            onClick={() => navigate("/login")}
            className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold py-4 px-8 rounded-2xl transition duration-150 text-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Login
          </motion.button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
            <div className="text-gray-600">Happy Users</div>
          </motion.div>
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="text-3xl font-bold text-blue-600 mb-2">₹50M+</div>
            <div className="text-gray-600">Trading Volume</div>
          </motion.div>
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="text-3xl font-bold text-blue-600 mb-2">99.9%</div>
            <div className="text-gray-600">Uptime</div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        className="px-6 py-16 bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Why Choose SetupXPay?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl text-center hover:shadow-lg transition duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-blue-600 mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* How It Works */}
      <motion.section 
        className="px-6 py-16 bg-gradient-to-br from-blue-50 to-blue-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.8 }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="bg-white p-6 rounded-2xl shadow-lg"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 2 }}
            >
              <div className="text-3xl font-bold text-blue-600 mb-4">1</div>
              <h3 className="text-xl font-semibold mb-2">Create Wallet</h3>
              <p className="text-gray-600">Sign up and get your secure multi-chain wallet instantly</p>
            </motion.div>
            <motion.div 
              className="bg-white p-6 rounded-2xl shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2.2 }}
            >
              <div className="text-3xl font-bold text-blue-600 mb-4">2</div>
              <h3 className="text-xl font-semibold mb-2">Buy/Sell USDT</h3>
              <p className="text-gray-600">Convert INR to USDT or vice versa with best rates</p>
            </motion.div>
            <motion.div 
              className="bg-white p-6 rounded-2xl shadow-lg"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 2.4 }}
            >
              <div className="text-3xl font-bold text-blue-600 mb-4">3</div>
              <h3 className="text-xl font-semibold mb-2">Trade Freely</h3>
              <p className="text-gray-600">Use your USDT across multiple blockchain networks</p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer 
        className="bg-gray-800 text-white px-6 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 2.6 }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <span className="text-xl font-bold">SetupXPay</span>
          </div>
          <p className="text-gray-400 mb-4">
            Your trusted platform for seamless crypto trading
          </p>
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} SetupXPay. All rights reserved.
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default LandingPage;
