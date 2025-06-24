import React, { useEffect, useState } from "react";
import PaymentForm from "./components/PaymentForm";
import TransactionTable from "./components/TransactionTable";

function App() {
  const [transactions, setTransactions] = useState([]);

  const addTransaction = (tx) => {
    setTransactions((prev) => [tx, ...prev]);
  };

  // ⏬ Fetch on page load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("https://setupxpay-backend.onrender.com/transactions"); // ✅ Use deployed backend
        const data = await res.json();
        setTransactions(data);
        console.log("📥 Transactions fetched:", data);
      } catch (error) {
        console.error("❌ Failed to fetch transactions:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-4 flex flex-col items-center">
      <PaymentForm onSuccess={addTransaction} /> {/* ✅ Pass onSuccess */}
      <TransactionTable data={transactions} />
    </div>
  );
}

export default App;
