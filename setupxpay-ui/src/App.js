import React, { useState } from "react";
import Signup from "./components/auth/Signup";
import Login from "./components/auth/Login";
import Dashboard from "./components/Dashboard";

function App() {
  const [view, setView] = useState("signup"); // 'signup' | 'login' | 'dashboard'
  const [user, setUser] = useState(null);

  const handleSignupSuccess = () => {
    setView("login"); // After signup, show Login
  };

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setView("dashboard");
  };

  return (
    <div className="p-4 flex flex-col items-center">
      {view === "signup" && <Signup onSuccess={handleSignupSuccess} />}
      {view === "login" && <Login onSuccess={handleLoginSuccess} />}
      {view === "dashboard" && <Dashboard user={user} />}
      
      {view !== "dashboard" && (
        <div className="mt-4">
          {view === "signup" && (
            <p className="text-sm">
              Already have an account?{" "}
              <button onClick={() => setView("login")} className="text-blue-500 underline">Login</button>
            </p>
          )}
          {view === "login" && (
            <p className="text-sm">
              Don’t have an account?{" "}
              <button onClick={() => setView("signup")} className="text-blue-500 underline">Sign up</button>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
