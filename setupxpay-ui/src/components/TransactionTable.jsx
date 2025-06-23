import React from "react";

const TransactionTable = ({ data }) => {
  if (data.length === 0) return null;

  return (
    <div className="mt-10 w-full max-w-3xl">
      <h3 className="text-lg font-bold mb-2">Transaction History</h3>
      <table className="w-full table-auto border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">Time</th>
            <th className="border px-2 py-1">INR</th>
            <th className="border px-2 py-1">Wallet</th>
            <th className="border px-2 py-1">Tx ID</th>
          </tr>
        </thead>
        <tbody>
          {data.map((tx, index) => (
            <tr key={index}>
              <td className="border px-2 py-1">
                {new Date(tx.createdAt).toLocaleString()}
              </td>
              <td className="border px-2 py-1">₹{tx.amountInr}</td>
              <td className="border px-2 py-1">{tx.wallet}</td>
              <td className="border px-2 py-1">
                <a
                  href={`https://tronscan.io/#/transaction/${tx.txId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-500 underline"
                >
                  View
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
