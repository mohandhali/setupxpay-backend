import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Signup from "./components/auth/Signup";
import Login from "./components/auth/Login";
import Dashboard from "./components/Dashboard";
import LandingPage from "./components/LandingPage"; // ✅ New LandingPage

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLoginSuccess = ({ token, user }) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <Router>
      <div className="p-4 flex flex-col items-center">
        <Routes>
          {/* ✅ Default route shows LandingPage */}
          <Route
            path="/"
            element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />}
          />

          <Route
            path="/signup"
            element={<Signup onSuccess={() => (window.location.href = "/login")} />}
          />

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

          <Route
            path="/dashboard"
            element={
              user ? (
                <Dashboard user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
