import React, { useState } from "react";
import { useRouter } from "next/router"; // or useNavigate if using React Router

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter(); // useNavigate() for CRA

  const handleLogin = async () => {
    try {
      const res = await fetch("https://setupxpay-backend.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        // ✅ Save token and user in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // ✅ Redirect to dashboard
        router.push("/dashboard");
      } else {
        alert(data.error || "Login failed");
      }
    } catch (err) {
      console.error("Login error", err);
      alert("Something went wrong. Try again.");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Login to SetupXPay</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        className="border w-full p-2 mb-3 rounded"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        className="border w-full p-2 mb-3 rounded"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Login
      </button>
    </div>
  );
};

export default Login;
