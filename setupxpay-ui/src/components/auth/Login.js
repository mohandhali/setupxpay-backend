import React, { useState } from "react";

const Login = ({ onSuccess }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("https://setupxpay-backend.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Login successful");
        onSuccess(data.user); // 👈 Go to dashboard with user
      } else {
        setMessage(`❌ ${data.error || "Login failed"}`);
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      setMessage("❌ Login error: " + error.message);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-10 p-6 border rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">🔐 Login</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="email"
          name="email"
          placeholder="📧 Email"
          value={form.email}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="🔒 Password"
          value={form.password}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
      </form>

      {message && <div className="text-sm mt-2">{message}</div>}
    </div>
  );
};

export default Login;
