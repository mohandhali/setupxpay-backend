import React, { useState } from "react";

const Signup = ({ onSignupSuccess, showLoginLink }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("https://setupxpay-backend.onrender.com/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Signup failed");
      }

      setMessage("🎉 Account created successfully!");
      onSignupSuccess(); // ✅ This shows login link
    } catch (err) {
      console.error("❌ Signup error:", err.message);
      setMessage(`❌ ${err.message}`);
    }
  };

  return (
    <div className="p-4 border rounded-md shadow-md max-w-sm w-full">
      <h2 className="text-xl font-semibold mb-4">🚀 Sign Up</h2>
      <form onSubmit={handleSignup} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Name"
          className="w-full p-2 border rounded"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full p-2 border rounded"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full p-2 border rounded"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button
          type="submit"
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
        >
          Sign Up
        </button>
        {message && <div className="text-sm mt-2">{message}</div>}
        {showLoginLink && (
          <div className="text-sm mt-2 text-blue-600 cursor-pointer" onClick={showLoginLink}>
            🔑 Already have an account? Login
          </div>
        )}
      </form>
    </div>
  );
};

export default Signup;
