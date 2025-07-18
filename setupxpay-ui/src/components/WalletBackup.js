import React, { useState } from "react";
import { FaCopy, FaDownload, FaCheckCircle, FaEye, FaEyeSlash, FaShieldAlt, FaLock, FaExclamationTriangle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

function getRandomIndices(mnemonic, count = 3) {
  const words = mnemonic.trim().split(" ");
  const indices = [];
  while (indices.length < count) {
    const idx = Math.floor(Math.random() * words.length);
    if (!indices.includes(idx)) indices.push(idx);
  }
  return indices.sort((a, b) => a - b);
}

const WalletBackup = ({ mnemonic, trc20, bep20, onComplete }) => {
  const [step, setStep] = useState(1); // 1: Warning, 2: Show Phrase, 3: Confirm, 4: Success
  const [showPhrase, setShowPhrase] = useState(false);
  const [phraseConfirm, setPhraseConfirm] = useState("");
  const [phraseCheck, setPhraseCheck] = useState(false);
  const [selectedWords, setSelectedWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  // Random indices for phrase confirm
  const indices = getRandomIndices(mnemonic, 3);
  const words = mnemonic.trim().split(" ");
  const expectedWords = indices.map(i => words[i]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    // Show a better copy notification
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

  const handleWordSelect = (word) => {
    if (selectedWords.length < expectedWords.length) {
      const newSelectedWords = [...selectedWords, word];
      setSelectedWords(newSelectedWords);
      
      if (newSelectedWords.length === expectedWords.length) {
        const isCorrect = newSelectedWords.every((word, index) => word === expectedWords[index]);
        setPhraseCheck(isCorrect);
        if (isCorrect) {
          setTimeout(() => setStep(4), 1000);
        }
      } else {
        setCurrentWordIndex(newSelectedWords.length);
      }
    }
  };

  const resetConfirmation = () => {
    setSelectedWords([]);
    setCurrentWordIndex(0);
    setPhraseCheck(false);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaExclamationTriangle className="text-3xl text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Secure Your Wallet</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Your secret recovery phrase is the key to your wallet. Write it down and keep it safe - 
              if you lose it, you'll lose access to your funds forever.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <FaShieldAlt className="text-red-600 mt-1 flex-shrink-0" />
                <div className="text-left">
                  <h4 className="font-semibold text-red-800 mb-2">Important Security Tips:</h4>
                  <ul className="text-sm text-red-700 space-y-1">
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
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg"
            >
              I Understand, Show My Recovery Phrase
            </button>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Recovery Phrase</h2>
              <p className="text-gray-600">Write down these 12 words in order</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="grid grid-cols-3 gap-2 mb-4">
                {words.map((word, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 text-center border">
                    <span className="text-xs text-gray-500 block mb-1">{index + 1}</span>
                    <span className="font-mono text-sm font-medium">{word}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
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

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <FaLock className="text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-800 mb-1">Wallet Addresses</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-blue-600 font-medium">TRC20 (Tron):</span>
                      <div className="font-mono text-sm bg-white rounded p-2 flex items-center justify-between">
                        <span className="truncate">{trc20.address}</span>
                        <button onClick={() => handleCopy(trc20.address)} className="text-blue-600 hover:text-blue-800">
                          <FaCopy />
                        </button>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-blue-600 font-medium">BEP20 (BSC):</span>
                      <div className="font-mono text-sm bg-white rounded p-2 flex items-center justify-between">
                        <span className="truncate">{bep20.address}</span>
                        <button onClick={() => handleCopy(bep20.address)} className="text-blue-600 hover:text-blue-800">
                          <FaCopy />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(3)}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg"
            >
              I've Written It Down, Verify Now
            </button>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Recovery Phrase</h2>
              <p className="text-gray-600">Select the words in the correct order</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">
                  Select word #{indices[currentWordIndex] + 1}:
                </p>
                <div className="flex gap-2 flex-wrap">
                  {words.map((word, index) => (
                    <button
                      key={index}
                      onClick={() => handleWordSelect(word)}
                      disabled={selectedWords.includes(word)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedWords.includes(word)
                          ? 'bg-green-100 text-green-800 border border-green-300'
                          : 'bg-white hover:bg-blue-50 text-gray-700 border border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>

              {selectedWords.length > 0 && (
                <div className="bg-white rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-600 mb-2">Selected words:</p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedWords.map((word, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedWords.length === expectedWords.length && !phraseCheck && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-red-700 text-sm">Incorrect order. Please try again.</p>
                  <button
                    onClick={resetConfirmation}
                    className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Reset
                  </button>
                </div>
              )}

              {phraseCheck && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2">
                    <FaCheckCircle className="text-green-600" />
                    <p className="text-green-700 font-medium">Correct! Verifying...</p>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={resetConfirmation}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-xl font-semibold text-lg transition-all duration-200"
            >
              Start Over
            </button>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaCheckCircle className="text-3xl text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Wallet Created Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Your wallet is now ready to use. You can start receiving and sending USDT.
            </p>
            <button
              onClick={onComplete}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg"
            >
              Continue to Dashboard
            </button>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100 z-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default WalletBackup; 