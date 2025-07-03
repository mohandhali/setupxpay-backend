import React from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full h-full fixed inset-0 bg-gradient-to-br from-blue-100 to-blue-200 flex flex-col justify-between overflow-hidden">
      
      {/* Top Section + CTA */}
      <div className="flex flex-col justify-center items-center px-4 flex-grow">
        <img
          src="/logo1.png"
          alt="SetupXPay Logo"
          className="w-40 sm:w-44 md:w-48 mb-4"
          style={{ maxWidth: "90%" }}
        />
        <h1 className="text-3xl font-bold text-blue-900">SetupXPay</h1>
        <p className="text-base text-gray-700 mt-1">Your Gateway to Crypto ⇄ INR</p>
        <p className="text-sm text-gray-600 mb-5">Fast. Secure. Seamless.</p>

        <button
          onClick={() => navigate("/signup")}
          className="w-52 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-base shadow-md"
        >
          Get Started
        </button>

        <p className="mt-2 text-xs text-gray-600">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-blue-700 font-medium cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>

      {/* Footer */}
      <footer className="text-xs text-gray-500 text-center pb-3">
        © {new Date().getFullYear()} SetupXPay. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
