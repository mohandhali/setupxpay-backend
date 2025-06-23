const axios = require('axios');

const TATUM_API_KEY = "t-684c3a005ad68338f85afe22-1792ec2110654df39d604f3b"; // 🔁 Replace with your real Tatum testnet API key
const PRIVATE_KEY = "ddc4d27b4b6eaf4c74088ac546b18e35674fa997c6e9d77d209f5fafa54b79ad"; // 🔁 Sender wallet private key
const CONTRACT_ADDRESS = "TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj"; // USDT TRC20 contract

async function sendTronUSDT(to, amount) {
  const url = 'https://api.tatum.io/v3/tron/transaction';

  const payload = {
    fromPrivateKey: PRIVATE_KEY,
    to,
    amount: amount.toString(),
    tokenAddress: CONTRACT_ADDRESS
  };

  const headers = {
    'x-api-key': TATUM_API_KEY,
    'Content-Type': 'application/json'
  };

  const response = await axios.post(url, payload, { headers });
  return response.data.txId;
}

module.exports = { sendTronUSDT };
