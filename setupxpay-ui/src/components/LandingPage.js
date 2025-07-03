import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full h-full fixed inset-0 bg-gradient-to-br from-[#e0f2fe] to-[#c7d2fe] flex flex-col justify-between items-center overflow-hidden px-4 py-6 safe-area-inset">
      
      {/* Animated Logo + Branding */}
      <motion.div 
        className="flex flex-col justify-center items-center flex-grow"
        initial={{ opacity: 0, y: -30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.8 }}
      >
        <motion.img
          src="/logo1.png"
          alt="SetupXPay Logo"
          className="w-44 mb-4"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        />
        <h1 className="text-4xl font-extrabold text-blue-800 tracking-tight">
          SetupXPay
        </h1>
        <p className="text-sm text-gray-600 mt-2">Your Gateway to Crypto ⇄ INR</p>
        <p className="text-xs text-gray-500 mb-6">Fast. Secure. Seamless.</p>

        {/* CTA Button */}
        <motion.button
          onClick={() => navigate("/signup")}
          className="w-52 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2.5 rounded-2xl shadow-lg transition duration-150"
          whileTap={{ scale: 0.97 }}
        >
          Get Started
        </motion.button>

        {/* Login link */}
        <p className="mt-3 text-xs text-gray-700">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-blue-700 font-medium underline cursor-pointer"
          >
            Login
          </span>
        </p>
      </motion.div>

      {/* Footer */}
      <footer className="text-xs text-gray-500 text-center pt-3">
        © {new Date().getFullYear()} SetupXPay. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
