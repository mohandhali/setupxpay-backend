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

const WalletBackup = ({ trc20, bep20, onComplete }) => {
  const [confirmed, setConfirmed] = useState(false);
  const [trcConfirm, setTrcConfirm] = useState("");
  const [bepConfirm, setBepConfirm] = useState("");
  const [trcCheck, setTrcCheck] = useState(false);
  const [bepCheck, setBepCheck] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Random indices for phrase confirm
  const trcIndices = getRandomIndices(trc20.mnemonic, 2);
  const bepIndices = getRandomIndices(bep20.mnemonic, 2);

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
  const checkTrc = () => {
    const words = trc20.mnemonic.trim().split(" ");
    const expected = trcIndices.map((i) => words[i]).join(" ");
    setTrcCheck(trcConfirm.trim() === expected);
  };
  const checkBep = () => {
    const words = bep20.mnemonic.trim().split(" ");
    const expected = bepIndices.map((i) => words[i]).join(" ");
    setBepCheck(bepConfirm.trim() === expected);
  };

  React.useEffect(() => {
    setConfirmed(trcCheck && bepCheck);
  }, [trcCheck, bepCheck]);

  // Show success and call onComplete after confirm
  React.useEffect(() => {
    if (confirmed) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onComplete();
      }, 2000);
    }
  }, [confirmed, onComplete]);

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-4 overflow-auto">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-6">
        <h2 className="text-2xl font-bold text-center mb-2 text-blue-700">Secure Your Wallet Backup</h2>
        <p className="text-center text-red-600 font-semibold mb-6">
          ⚠️ Save your secret phrase and private keys now. If you lose them, you lose access to your funds. We cannot recover them for you.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* TRC20 */}
          <div className="border rounded-xl p-4 bg-blue-50">
            <h3 className="font-semibold text-blue-700 mb-2">TRC20 (Tron)</h3>
            <div className="mb-2 text-xs text-gray-500">Address:</div>
            <div className="mb-2 font-mono break-all bg-white rounded p-2 flex items-center justify-between">
              <span>{trc20.address}</span>
              <button onClick={() => handleCopy(trc20.address)}><FaCopy /></button>
            </div>
            <div className="mb-2 text-xs text-gray-500">Mnemonic:</div>
            <div className="mb-2 font-mono break-all bg-white rounded p-2 flex items-center justify-between">
              <span>{trc20.mnemonic}</span>
              <button onClick={() => handleCopy(trc20.mnemonic)}><FaCopy /></button>
            </div>
            <div className="mb-2 text-xs text-gray-500">Private Key:</div>
            <div className="mb-2 font-mono break-all bg-white rounded p-2 flex items-center justify-between">
              <span>{trc20.privateKey}</span>
              <button onClick={() => handleCopy(trc20.privateKey)}><FaCopy /></button>
            </div>
            <button
              className="mt-2 w-full bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"
              onClick={() => handleDownload("trc20-wallet-backup.txt", `Address: ${trc20.address}\nMnemonic: ${trc20.mnemonic}\nPrivate Key: ${trc20.privateKey}`)}
            >
              <FaDownload /> Download Backup
            </button>
          </div>
          {/* BEP20 */}
          <div className="border rounded-xl p-4 bg-yellow-50">
            <h3 className="font-semibold text-yellow-700 mb-2">BEP20 (BSC)</h3>
            <div className="mb-2 text-xs text-gray-500">Address:</div>
            <div className="mb-2 font-mono break-all bg-white rounded p-2 flex items-center justify-between">
              <span>{bep20.address}</span>
              <button onClick={() => handleCopy(bep20.address)}><FaCopy /></button>
            </div>
            <div className="mb-2 text-xs text-gray-500">Mnemonic:</div>
            <div className="mb-2 font-mono break-all bg-white rounded p-2 flex items-center justify-between">
              <span>{bep20.mnemonic}</span>
              <button onClick={() => handleCopy(bep20.mnemonic)}><FaCopy /></button>
            </div>
            <div className="mb-2 text-xs text-gray-500">Private Key:</div>
            <div className="mb-2 font-mono break-all bg-white rounded p-2 flex items-center justify-between">
              <span>{bep20.privateKey}</span>
              <button onClick={() => handleCopy(bep20.privateKey)}><FaCopy /></button>
            </div>
            <button
              className="mt-2 w-full bg-yellow-500 text-white py-2 rounded-lg flex items-center justify-center gap-2"
              onClick={() => handleDownload("bep20-wallet-backup.txt", `Address: ${bep20.address}\nMnemonic: ${bep20.mnemonic}\nPrivate Key: ${bep20.privateKey}`)}
            >
              <FaDownload /> Download Backup
            </button>
          </div>
        </div>
        {/* Phrase Confirm Step */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h4 className="font-semibold mb-2 text-gray-700">Confirm Your Secret Phrase</h4>
          <div className="mb-3">
            <span className="font-medium text-blue-700">TRC20:</span> Enter word(s) #{trcIndices.map(i => i + 1).join(", ")} from your phrase:
            <input
              className="ml-2 border rounded px-2 py-1 font-mono"
              value={trcConfirm}
              onChange={e => setTrcConfirm(e.target.value)}
              onBlur={checkTrc}
              placeholder="word1 word2"
            />
            {trcCheck && <FaCheckCircle className="inline ml-2 text-green-600" />}
          </div>
          <div>
            <span className="font-medium text-yellow-700">BEP20:</span> Enter word(s) #{bepIndices.map(i => i + 1).join(", ")} from your phrase:
            <input
              className="ml-2 border rounded px-2 py-1 font-mono"
              value={bepConfirm}
              onChange={e => setBepConfirm(e.target.value)}
              onBlur={checkBep}
              placeholder="word1 word2"
            />
            {bepCheck && <FaCheckCircle className="inline ml-2 text-green-600" />}
          </div>
        </div>
        <button
          className={`w-full py-3 rounded-xl font-bold text-lg transition-all ${confirmed ? "bg-green-600 text-white hover:bg-green-700" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
          disabled={!confirmed}
          onClick={() => setConfirmed(true)}
        >
          I have securely backed up my wallet
        </button>
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