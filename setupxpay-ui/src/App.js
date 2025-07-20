import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Community from "./components/Community";
import Signup from "./components/auth/Signup";
import Login from "./components/auth/Login";
import Dashboard from "./components/Dashboard";
import LandingPage from "./components/LandingPage";
import PaymentSuccess from "./components/PaymentSuccess"; // ✅ New success screen
import Referrals from "./components/Referrals";

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLoginSuccess = ({ token, user }) => {
    if (user.id && !user._id) user._id = user.id; // Patch for backend bug
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
    console.log("Logged in user:", user); // Debug log
    setTimeout(() => {
      navigate("/dashboard");
    }, 0); // 👈 Let React finish render, then navigate
  };


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/"); // ✅ Redirect to Landing Page
  };

  return (
    <div className="min-h-screen w-full bg-white">
      <div className="max-w-md mx-auto px-4"></div>
      <Routes>
        {/* ✅ Landing Page */}
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />}
        />

        {/* ✅ Signup */}
        <Route
          path="/signup"
          element={<Signup onSuccess={() => (window.location.href = "/login")} />}
        />

        {/* ✅ Login */}
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login onSuccess={handleLoginSuccess} />
            )
          }
        />

        {/* ✅ Dashboard (only if logged in) */}
        <Route
          path="/dashboard"
          element={
            user ? (
              <Dashboard user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* ✅ Razorpay redirect page */}
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/community" element={<Community />} />
        <Route 
          path="/referrals" 
          element={
            user ? (
              <Referrals user={user} onClose={() => navigate("/dashboard")} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
      </Routes>
    </div>
  );
}

export default App;
