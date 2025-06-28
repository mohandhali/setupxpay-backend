import React, { useState } from "react";

const Login = ({ onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    try {
      const res = await fetch("https://setupxpay-backend.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        // ✅ Success: call onSuccess with user and token
        onSuccess({ token: data.token, user: data.user });
      } else {
        setMessage(data.error || "Login failed");
      }
    } catch (err) {
      console.error("Login error", err);
      setMessage("Something went wrong. Try again.");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto mt-10 border rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">🔐 Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        className="border w-full p-2 mb-3 rounded"
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        className="border w-full p-2 mb-3 rounded"
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
      >
        Login
      </button>

      {message && <p className="text-sm mt-2 text-red-600">{message}</p>}
      <p className="text-sm mt-4">
        Don’t have an account?{" "}
        <a href="/signup" className="text-blue-600 underline">Sign up</a>
      </p>
    </div>
  );
};

export default Login;
