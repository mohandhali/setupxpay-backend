import React, { useState } from "react";
import { FaCopy, FaDownload, FaCheckCircle } from "react-icons/fa";

function getRandomIndices(mnemonic, count = 2) {
  const words = mnemonic.trim().split(" ");
  const indices = [];
  while (indices.length < count) {
    const idx = Math.floor(Math.random() * words.length);
    if (!indices.includes(idx)) indices.push(idx);
  }
  return indices.sort((a, b) => a - b);
}

const WalletBackup = ({ mnemonic, trc20, bep20, onComplete }) => {
  const [confirmed, setConfirmed] = useState(false);
  const [phraseConfirm, setPhraseConfirm] = useState("");
  const [phraseCheck, setPhraseCheck] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Random indices for phrase confirm
  const indices = getRandomIndices(mnemonic, 2);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied!");
  };

  const handleDownload = (filename, text) => {
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  // Confirm phrase logic
  const checkPhrase = () => {
    const words = mnemonic.trim().split(" ");
    const expected = indices.map((i) => words[i]).join(" ");
    setPhraseCheck(phraseConfirm.trim() === expected);
  };

  React.useEffect(() => {
    if (phraseCheck) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onComplete();
      }, 2000);
    }
  }, [phraseCheck, onComplete]);

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-4 overflow-auto">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl p-6">
        <h2 className="text-2xl font-bold text-center mb-2 text-blue-700">Secure Your Wallet Backup</h2>
        <p className="text-center text-red-600 font-semibold mb-6">
          ⚠️ Save your secret phrase now. If you lose it, you lose access to your funds. We cannot recover it for you.
        </p>
        <div className="mb-6">
          <div className="text-xs text-gray-500 mb-1">Secret Recovery Phrase (for all networks):</div>
          <div className="font-mono break-all bg-gray-50 rounded p-3 flex items-center justify-between text-lg mb-2">
            <span>{mnemonic}</span>
            <button onClick={() => handleCopy(mnemonic)}><FaCopy /></button>
          </div>
          <button
            className="w-full bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 mb-2"
            onClick={() => handleDownload("wallet-backup.txt", `Mnemonic: ${mnemonic}\n\nTRC20 Address: ${trc20.address}\nTRC20 Private Key: ${trc20.privateKey}\nBEP20 Address: ${bep20.address}\nBEP20 Private Key: ${bep20.privateKey}`)}
          >
            <FaDownload /> Download Backup
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* TRC20 */}
          <div className="border rounded-xl p-4 bg-blue-50">
            <h3 className="font-semibold text-blue-700 mb-2">TRC20 (Tron)</h3>
            <div className="mb-2 text-xs text-gray-500">Address:</div>
            <div className="mb-2 font-mono break-all bg-white rounded p-2 flex items-center justify-between">
              <span>{trc20.address}</span>
              <button onClick={() => handleCopy(trc20.address)}><FaCopy /></button>
            </div>
            <div className="mb-2 text-xs text-gray-500">Private Key:</div>
            <div className="mb-2 font-mono break-all bg-white rounded p-2 flex items-center justify-between">
              <span>{trc20.privateKey}</span>
              <button onClick={() => handleCopy(trc20.privateKey)}><FaCopy /></button>
            </div>
          </div>
          {/* BEP20 */}
          <div className="border rounded-xl p-4 bg-yellow-50">
            <h3 className="font-semibold text-yellow-700 mb-2">BEP20 (BSC)</h3>
            <div className="mb-2 text-xs text-gray-500">Address:</div>
            <div className="mb-2 font-mono break-all bg-white rounded p-2 flex items-center justify-between">
              <span>{bep20.address}</span>
              <button onClick={() => handleCopy(bep20.address)}><FaCopy /></button>
            </div>
            <div className="mb-2 text-xs text-gray-500">Private Key:</div>
            <div className="mb-2 font-mono break-all bg-white rounded p-2 flex items-center justify-between">
              <span>{bep20.privateKey}</span>
              <button onClick={() => handleCopy(bep20.privateKey)}><FaCopy /></button>
            </div>
          </div>
        </div>
        {/* Confirm Step */}
        {!showConfirm && (
          <button
            className="w-full py-3 rounded-xl font-bold text-lg bg-green-600 text-white hover:bg-green-700 transition-all"
            onClick={() => setShowConfirm(true)}
          >
            I have securely backed up my wallet
          </button>
        )}
        {showConfirm && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6 mt-4">
            <h4 className="font-semibold mb-2 text-gray-700">Confirm Your Secret Phrase</h4>
            <div className="mb-3">
              Enter word(s) #{indices.map(i => i + 1).join(", ")} from your phrase:
              <input
                className="ml-2 border rounded px-2 py-1 font-mono"
                value={phraseConfirm}
                onChange={e => setPhraseConfirm(e.target.value)}
                onBlur={checkPhrase}
                placeholder="word1 word2"
              />
              {phraseCheck && <FaCheckCircle className="inline ml-2 text-green-600" />}
            </div>
          </div>
        )}
        {showSuccess && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white border border-green-400 rounded-2xl shadow-xl px-8 py-6 flex flex-col items-center">
              <FaCheckCircle className="text-4xl text-green-600 mb-2" />
              <div className="text-lg font-bold text-green-700 mb-1">Signup Complete!</div>
              <div className="text-gray-700 mb-2">Now you can login to your account.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletBackup; 