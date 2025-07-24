import React, { useEffect, useState } from "react";
import { FaClock } from "react-icons/fa";
import { CURRENT_CONFIG } from "../config/mainnet";

const TransactionHistory = ({ user, network, onClose }) => {
  const [transactions, setTransactions] = useState([]);
  const [expandedIdx, setExpandedIdx] = useState(null); // new for inline details

  useEffect(() => {
    const fetchAll = async () => {
      const addresses = [];
      if (user?.walletAddress) addresses.push(user.walletAddress.toLowerCase());
      if (user?.bep20Address) addresses.push(user.bep20Address.toLowerCase());
      let allTxs = [];
      for (const address of addresses) {
        try {
          const res = await fetch(`${CURRENT_CONFIG.BACKEND_URL}/transactions?wallet=${address}`);
          const data = await res.json();
          if (Array.isArray(data)) allTxs = allTxs.concat(data);
        } catch (err) {
          // ignore
        }
      }
      // Remove duplicates by txId
      const seen = new Set();
      const uniqueTxs = allTxs.filter(tx => {
        if (seen.has(tx.txId)) return false;
        seen.add(tx.txId);
        return true;
      });
      // Sort by createdAt desc
      uniqueTxs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setTransactions(uniqueTxs);
    };
    fetchAll();
  }, [user]);

  const getFormattedDate = (tx) =>
    new Date(tx.timestamp || tx.createdAt).toLocaleString();

  const getAmount = (tx) =>
    tx.amount || tx.amountInr || tx.usdtAmount || "-";

  const getStatusText = (status) => {
    const s = status?.toLowerCase();
    if (s?.includes("success") || s?.includes("completed")) return "Success";
    if (s?.includes("pending")) return "Pending";
    if (s?.includes("fail")) return "Failed";
    return "Success";
  };

  const getStatusClass = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes("success") || s.includes("completed")) return "text-green-500";
    if (s.includes("pending")) return "text-yellow-500";
    if (s.includes("fail")) return "text-red-500";
    return "text-green-500"; // fallback green if nothing matches
  };

  const getTxLabel = (tx) => {
    const type = tx.type?.toLowerCase() || "";
    const method = tx.method?.toLowerCase() || "";
    const network = tx.network?.toLowerCase() || "";

    if (type === "sell-qr") return "Sell USDT QR";
    if (type === "withdraw-inr" || method === "upi") return "Sell USDT";
    if (type === "deposit" && method !== "onchain") return "Buy USDT";
    if (type === "deposit" && method === "onchain") return "Deposit USDT";
    if (type === "withdraw" && network.includes("trc")) return "Send USDT";
    return "Transaction";
  };

  const getAmountColor = (tx) => {
    const type = getTxLabel(tx);
    return type.includes("Buy") || type.includes("Deposit") ? "text-green-600" : "text-red-600";
  };

  const getAmountSymbol = (tx) => {
    const label = getTxLabel(tx);
    if (label.includes("Buy") || label.includes("Sell") || label.includes("QR")) return "₹";
    if (label.includes("Send") || label.includes("Deposit")) return "$";
    return "";
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center px-4 py-3 shadow-md border-b">
        <button onClick={onClose} className="text-xl text-gray-700 mr-3">←</button>
        <h2 className="text-lg font-semibold text-gray-800">Transaction History</h2>
      </div>

      {/* List */}
      <div className="p-4 space-y-4">
        {transactions.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">No transactions found.</p>
        ) : (
          transactions.map((tx, idx) => (
            <div
              key={idx}
              className="border rounded-xl shadow-sm p-4 hover:bg-gray-50 transition-all duration-200"
              onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
            >
              <div className="flex justify-between items-center cursor-pointer">
                <div>
                  <p className="font-semibold text-gray-800 capitalize">{getTxLabel(tx)}</p>
                  <p className="text-xs text-gray-500">{tx.network?.toUpperCase() || "-"}</p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <FaClock className="text-gray-400" />
                    {getFormattedDate(tx)}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${getAmountColor(tx)}`}>
                    {getAmountSymbol(tx)}{getAmount(tx)}
                  </p>
                  <p className={`text-xs mt-1 font-medium ${getStatusClass(tx.status)}`}>
                    {getStatusText(tx.status)}
                  </p>
                </div>
              </div>

              {/* Inline Details View */}
              {expandedIdx === idx && (
                <div className="mt-4 border-t pt-3 text-sm text-gray-700 space-y-1">
                  <p>
                    <strong>Status:</strong>{" "}
                    <span className={getStatusClass(tx.status)}>{getStatusText(tx.status)}</span>
                  </p>

                  {getTxLabel(tx).includes("Buy") && (
                    <>
                      <p><strong>INR Spent:</strong> ₹{tx.amountInr}</p>
                      <p><strong>Rate:</strong> ₹{tx.rate || "-"}/USDT</p>
                      <p><strong>USDT Received:</strong> {tx.usdtAmount || "-"}</p>
                    </>
                  )}

                  {getTxLabel(tx).includes("Sell") && (
                    <>
                      <p><strong>USDT Sold:</strong> {tx.usdtAmount || "-"}</p>
                      <p><strong>Rate:</strong> ₹{tx.rate || "-"}/USDT</p>
                      <p><strong>INR Received:</strong> ₹{tx.amountInr || "-"}</p>
                    </>
                  )}

                  {!getTxLabel(tx).includes("Buy") &&
                    !getTxLabel(tx).includes("Sell") && (
                      <p><strong>Amount:</strong> {getAmount(tx)}</p>
                  )}

                  <p><strong>Network:</strong> {tx.network ? tx.network.toUpperCase() : '-'}</p>
                  {tx.wallet && <p><strong>Wallet:</strong> <span style={{
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
                  }}>{tx.wallet}</span></p>}
                  {tx.to && <p><strong>To:</strong> {tx.to}</p>}
                  {tx.from && <p><strong>From:</strong> {tx.from}</p>}
                  {tx.txId && (
                    <p>
                      <strong>Transaction ID:</strong>{' '}
                      <span style={{
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
                      }}>{tx.txId}</span>
                    </p>
                  )}
                  <p><strong>Time:</strong> {getFormattedDate(tx)}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
