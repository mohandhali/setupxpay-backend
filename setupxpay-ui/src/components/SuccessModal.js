import React from "react";
import { motion } from "framer-motion";
import { FaCheckCircle, FaTimes } from "react-icons/fa";

const SuccessModal = ({ isOpen, onClose, title, message, details }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-green-700 mb-2 text-center">{title}</h2>
        <p className="text-center text-gray-700 mb-4">{message}</p>
        {details && (
          <div className="bg-gray-50 rounded-lg p-4 mb-2 text-sm">
            {Object.entries(details).map(([key, value]) => (
              <div key={key} className="mb-1 flex flex-col">
                <span className="font-semibold text-gray-600">{key}:</span>
                <span style={
                  key.toLowerCase().includes('wallet') || key.toLowerCase().includes('transaction')
                    ? {
                        display: 'inline-block',
                        maxWidth: '220px',
                        overflowWrap: 'break-word',
                        wordBreak: 'break-all',
                        whiteSpace: 'pre-line',
                        verticalAlign: 'middle',
                        fontFamily: 'monospace',
                        fontSize: '0.95em',
                        background: '#f3f4f6',
                        padding: '2px 4px',
                        borderRadius: '4px',
                      }
                    : {}
                }>{value}</span>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-center mt-4">
          <button
            className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal; 