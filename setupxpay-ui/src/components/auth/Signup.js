import React, { useState } from "react";

const Signup = ({ onSuccess }) => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("https://setupxpay-backend.onrender.com/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Account created successfully");
        onSuccess(); // Switch to login page
      } else {
        setMessage(`❌ ${data.error || "Signup failed"}`);
      }
    } catch (error) {
      console.error("❌ Signup error:", error);
      setMessage("❌ Signup error: " + error.message);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-10 p-6 border rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">🚀 Sign Up</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="👤 Name"
          value={form.name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
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
          placeholder="🔐 Password"
          value={form.password}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Sign Up
        </button>
      </form>

      {message && <div className="text-sm mt-2">{message}</div>}
    </div>
  );
};

export default Signup;
