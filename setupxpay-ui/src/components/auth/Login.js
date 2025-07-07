import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Login = ({ onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("https://setupxpay-backend.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        // ✅ 1. Store JWT token
        localStorage.setItem("token", data.token);

        // ✅ 2. Fetch full user data using token
        const meRes = await fetch("https://setupxpay-backend.onrender.com/auth/me", {
          headers: {
            Authorization: `Bearer ${data.token}`,
          },
        });

        const meData = await meRes.json();

        if (meData && meData.user) {
          // ✅ 3. Store complete user object
          localStorage.setItem("user", JSON.stringify(meData.user));

          // ✅ 4. Navigate to dashboard
         onSuccess({ token: data.token, user: meData.user });
        } else {
          setError("Failed to retrieve user info.");
        }
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center px-4 py-8 overflow-hidden">
      <motion.div
        className="w-full max-w-md bg-white p-6 sm:p-8 rounded-2xl shadow-xl"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-extrabold text-blue-800 text-center mb-6">Welcome Back</h2>

        {error && <p className="text-red-600 text-sm text-center mb-4">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm text-gray-700">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <motion.button
            type="submit"
            whileTap={{ scale: 0.97 }}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2.5 rounded-2xl transition-all shadow-md"
          >
            Login
          </motion.button>
        </form>

        <p className="mt-5 text-sm text-center text-gray-600">
          New to SetupXPay?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-blue-700 font-semibold cursor-pointer hover:underline"
          >
            Create an account
          </span>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
