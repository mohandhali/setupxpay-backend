import React, { useState } from "react";
import { FaCopy, FaDownload, FaCheckCircle, FaShieldAlt, FaLock, FaExclamationTriangle } from "react-icons/fa";
import { motion } from "framer-motion";

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
  const [selectedWords, setSelectedWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [phraseCheck, setPhraseCheck] = useState(false);

  // Random indices for phrase confirm
  const indices = getRandomIndices(mnemonic, 3);
  const words = mnemonic.trim().split(" ");
  const expectedWords = indices.map(i => words[i]);

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

  // Responsive modal container
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
                I've Written It Down, Confirm
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="text-center mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Verify Your Recovery Phrase</h2>
                <p className="text-gray-600 text-sm">Select the words in the correct order</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 mb-4">
                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-2">Select word #{indices[currentWordIndex] + 1}:</p>
                  <div className="flex gap-2 flex-wrap">
                    {words.map((word, index) => (
                      <button
                        key={index}
                        onClick={() => handleWordSelect(word)}
                        disabled={selectedWords.includes(word)}
                        className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${selectedWords.includes(word) ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-white hover:bg-blue-50 text-gray-700 border border-gray-300 hover:border-blue-300'}`}
                      >
                        {word}
                      </button>
                    ))}
                  </div>
                </div>
                {selectedWords.length > 0 && (
                  <div className="bg-white rounded-lg p-2 mb-3">
                    <p className="text-xs text-gray-600 mb-1">Selected words:</p>
                    <div className="flex gap-2 flex-wrap">
                      {selectedWords.map((word, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs sm:text-sm font-medium">{word}</span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedWords.length === expectedWords.length && !phraseCheck && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-3">
                    <p className="text-red-700 text-xs">Incorrect order. Please try again.</p>
                    <button
                      onClick={resetConfirmation}
                      className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
                    >
                      Reset
                    </button>
                  </div>
                )}
                {phraseCheck && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-3">
                    <div className="flex items-center gap-2">
                      <FaCheckCircle className="text-green-600" />
                      <p className="text-green-700 font-medium text-xs">Correct! Verifying...</p>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={resetConfirmation}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-xl font-semibold text-base sm:text-lg transition-all duration-200"
              >
                Start Over
              </button>
            </motion.div>
          )}

          {step === 4 && (
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