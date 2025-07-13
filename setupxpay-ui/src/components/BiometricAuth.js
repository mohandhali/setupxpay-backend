import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaFingerprint, FaEye, FaEyeSlash } from "react-icons/fa";

const BiometricAuth = ({ onSuccess, onCancel, message = "Authenticate to continue" }) => {
  const [authMethod, setAuthMethod] = useState("biometric"); // biometric, password
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if biometric authentication is available
    if (typeof window !== 'undefined' && window.PublicKeyCredential && window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
      window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then((available) => {
          if (!available) {
            setAuthMethod("password");
          }
        });
    } else {
      setAuthMethod("password");
    }
  }, []);

  const handleBiometricAuth = async () => {
    setLoading(true);
    setError("");

    try {
      // Simulate biometric authentication
      // In real implementation, you would use WebAuthn API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, always succeed
      onSuccess();
    } catch (err) {
      setError("Biometric authentication failed. Try password instead.");
      setAuthMethod("password");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordAuth = async () => {
    if (!password) {
      setError("Please enter your password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // In real implementation, verify password with backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, accept any password
      onSuccess();
    } catch (err) {
      setError("Invalid password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Security Check</h2>
          <p className="text-sm text-gray-600">{message}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {authMethod === "biometric" ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <motion.button
                onClick={handleBiometricAuth}
                disabled={loading}
                className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-200 transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                <FaFingerprint className="text-3xl" />
              </motion.button>
            </div>
            
            <p className="text-center text-sm text-gray-600">
              {loading ? "Authenticating..." : "Touch your fingerprint sensor"}
            </p>

            <button
              onClick={() => setAuthMethod("password")}
              className="w-full text-sm text-blue-600 hover:text-blue-700"
            >
              Use password instead
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              onClick={handlePasswordAuth}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Continue"}
            </button>

            <button
              onClick={() => setAuthMethod("biometric")}
              className="w-full text-sm text-blue-600 hover:text-blue-700"
            >
              Use biometric instead
            </button>
          </div>
        )}

        <button
          onClick={onCancel}
          className="w-full mt-4 text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </motion.div>
    </div>
  );
};

export default BiometricAuth; 