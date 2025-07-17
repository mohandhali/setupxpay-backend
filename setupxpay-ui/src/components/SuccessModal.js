import React from "react";
import { motion } from "framer-motion";
import { FaCheckCircle, FaTimes } from "react-icons/fa";

const SuccessModal = ({ isOpen, onClose, title, message, details }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FaTimes className="text-xl" />
        </button>

        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <motion.div
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          >
            <FaCheckCircle className="text-4xl text-green-600" />
          </motion.div>
        </div>

        {/* Content */}
        <div className="text-center">
          <motion.h2
            className="text-2xl font-bold text-gray-800 mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {title || "Success!"}
          </motion.h2>

          <motion.p
            className="text-gray-600 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {message || "Operation completed successfully"}
          </motion.p>

          {/* Details */}
          {details && (
            <motion.div
              className="bg-gray-50 rounded-lg p-4 mb-6 text-left"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="font-semibold text-gray-800 mb-2">Transaction Details:</h3>
              {Object.entries(details).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                  <span className="font-medium text-gray-800">{value}</span>
                </div>
              ))}
            </motion.div>
          )}

          {/* Action Button */}
          <motion.button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Continue
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default SuccessModal; 