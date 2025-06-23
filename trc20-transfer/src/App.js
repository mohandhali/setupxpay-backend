import React, { useState } from "react";
import axios from "axios";

const App = () => {
  const [contractAddress, setContractAddress] = useState("TMxbFWUuebqshwm8e5E5WVzJXnDmdBZtXb");
  const [receiver, setReceiver] = useState("TYdt3VMoJxcTeCt77Uvt4iTTA1iP72rKRM");
  const [amount, setAmount] = useState("1");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const sendToken = async () => {
    setLoading(true);
    setResponse("");

    try {
      const res = await axios.post(
        "https://api.tatum.io/v3/tron/trc20/transaction",
        {
          to: receiver,
          amount,
          tokenAddress: contractAddress,
          fromPrivateKey: "ddc4d27b4b6eaf4c74088ac546b18e35674fa997c6e9d77d209f5fafa54b79ad", // ⚠️ Testnet private key only!
          feeLimit: 1000,
        },
        {
          headers: {
            "x-api-key": "t-684c3a005ad68338f85afe22-1792ec2110654df39d604f3b",
            "Content-Type": "application/json",
          },
        }
      );

      setResponse(`✅ Token sent!\nTx ID: ${res.data.txId}`);
    } catch (err) {
      const error = err.response?.data || err.message;
      setResponse("❌ Error: " + JSON.stringify(error, null, 2));
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h2>🚀 TRC-20 Token Transfer</h2>

      <label>Receiver Address:</label>
      <input
        type="text"
        value={receiver}
        onChange={(e) => setReceiver(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <label>Amount:</label>
      <input
        type="text"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <label>TRC-20 Token Address:</label>
      <input
        type="text"
        value={contractAddress}
        onChange={(e) => setContractAddress(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <button onClick={sendToken} disabled={loading}>
        {loading ? "Sending..." : "Send Token"}
      </button>

      <pre style={{ background: "#f4f4f4", padding: 10, marginTop: 20 }}>
        {response}
      </pre>
    </div>
  );
};

export default App;
