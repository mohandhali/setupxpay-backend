import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup = ({ onSuccess }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("https://setupxpay-backend.onrender.com/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        onSuccess(); // redirects to login
      } else {
        setError(data.error || "Signup failed");
      }
    } catch (err) {
      setError("Server error. Try again later.");
    }
  };

  return (
    <div className="min-h-screen w-full px-4 py-6 flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="bg-white w-full max-w-sm sm:max-w-md p-6 sm:p-8 rounded-xl shadow-xl animate-slideFadeIn">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-blue-800">Create Account</h2>

        {error && <p className="text-red-600 mb-4 text-sm text-center">{error}</p>}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-transform hover:scale-[1.02]"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-5 text-sm text-center text-gray-500">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-blue-600 font-semibold hover:underline cursor-pointer"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Signup;
