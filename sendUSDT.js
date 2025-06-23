// sendUSDT.js
const axios = require("axios");
require("dotenv").config();

async function sendUSDT(amount) {
  try {
    const res = await axios.post(
      "https://api.tatum.io/v3/tron/transaction/trc20",
      {
        to: process.env.RECEIVER_ADDRESS,
        amount: amount.toString(),
        fromPrivateKey: process.env.PRIVATE_KEY,
        contractAddress: process.env.CONTRACT_ADDRESS,
        feeLimit: 10000000
      },
      {
        headers: {
          "x-api-key": process.env.TATUM_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ Token sent!");
    console.log("Tx ID:", res.data.txId);
    return res.data;
  } catch (error) {
    console.error("❌ Error sending token:", error.response?.data || error.message);
    return null;
  }
}

module.exports = sendUSDT;
