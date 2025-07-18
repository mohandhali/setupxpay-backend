import React, { useState } from "react";
import { FaCopy, FaDownload, FaCheckCircle, FaShieldAlt, FaLock, FaExclamationTriangle } from "react-icons/fa";
import { motion } from "framer-motion";

const WalletBackup = ({ mnemonic, trc20, bep20, onComplete }) => {
  const [step, setStep] = useState(1); // 1: Warning, 2: Show Phrase, 3: Success

  const words = mnemonic.trim().split(" ");

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg z-50';
    notification.textContent = 'Copied to clipboard!';
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 2000);
  };

  const handleDownload = (filename, text) => {
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-visible mx-auto my-6 sm:my-10">
        <div className="p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaExclamationTriangle className="text-2xl text-red-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">Secure Your Wallet</h2>
              <p className="text-gray-600 mb-4 leading-relaxed text-sm sm:text-base">
                Your secret recovery phrase is the key to your wallet. Write it down and keep it safe - if you lose it, you'll lose access to your funds forever.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5 text-left text-xs sm:text-sm">
                <div className="flex items-start gap-2">
                  <FaShieldAlt className="text-red-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-red-800 mb-1">Important Security Tips:</h4>
                    <ul className="text-red-700 space-y-1">
                      <li>• Write it down on paper, not digitally</li>
                      <li>• Store it in a safe, secure location</li>
                      <li>• Never share it with anyone</li>
                      <li>• We cannot recover it for you</li>
                    </ul>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setStep(2)}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 shadow-lg"
              >
                I Understand, Show My Recovery Phrase
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="text-center mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Your Recovery Phrase</h2>
                <p className="text-gray-600 text-sm">Write down these 12 words in order</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 mb-4">
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {words.map((word, index) => (
                    <div key={index} className="bg-white rounded-lg p-2 text-center border text-xs sm:text-sm">
                      <span className="text-gray-500 block mb-1">{index + 1}</span>
                      <span className="font-mono font-medium">{word}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => handleCopy(mnemonic)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <FaCopy /> Copy Phrase
                  </button>
                  <button
                    onClick={() => handleDownload("recovery-phrase.txt", `Recovery Phrase: ${mnemonic}\n\nTRC20 Address: ${trc20.address}\nBEP20 Address: ${bep20.address}\n\nIMPORTANT: Keep this safe and never share it!`)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <FaDownload /> Download
                  </button>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
                <div className="flex items-start gap-2">
                  <FaLock className="text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-1 text-sm">Wallet Addresses</h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs text-blue-600 font-medium">TRC20 (Tron):</span>
                        <div className="font-mono text-xs sm:text-sm bg-white rounded p-2 flex items-center justify-between">
                          <span className="truncate">{trc20.address}</span>
                          <button onClick={() => handleCopy(trc20.address)} className="text-blue-600 hover:text-blue-800"><FaCopy /></button>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-blue-600 font-medium">BEP20 (BSC):</span>
                        <div className="font-mono text-xs sm:text-sm bg-white rounded p-2 flex items-center justify-between">
                          <span className="truncate">{bep20.address}</span>
                          <button onClick={() => handleCopy(bep20.address)} className="text-blue-600 hover:text-blue-800"><FaCopy /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setStep(3)}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 shadow-lg mt-2"
              >
                I've Written It Down, Complete Signup
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheckCircle className="text-3xl text-green-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">Account Created Successfully!</h2>
              <p className="text-gray-600 mb-5 text-sm">Your wallet is now ready to use. You can now login to your account.</p>
              <button
                onClick={onComplete}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 shadow-lg"
              >
                Go to Login
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletBackup; 