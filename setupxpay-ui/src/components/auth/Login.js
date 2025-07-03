import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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
      if (res.ok) {
        onSuccess(data); // { token, user }
        navigate("/dashboard");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Server error. Try again later.");
    }
  };

  return (
    <div className="min-h-screen w-full px-4 py-6 flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="bg-white w-full max-w-sm sm:max-w-md p-6 sm:p-8 rounded-xl shadow-xl animate-fade-in">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-blue-800">Login to SetupXPay</h2>

        {error && <p className="text-red-600 mb-4 text-sm text-center">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg shadow transition-transform duration-200 hover:scale-[1.02]"
          >
            Login
          </button>
        </form>

        <p className="mt-5 text-sm text-center text-gray-500">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-blue-600 font-semibold hover:underline cursor-pointer"
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
