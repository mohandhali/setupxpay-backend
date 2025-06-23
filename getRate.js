// getRate.js
const axios = require("axios");

async function getRate() {
  try {
    const res = await axios.get(
      "https://api.binance.com/api/v3/ticker/price?symbol=USDTINR"
    );
    return parseFloat(res.data.price);
  } catch (error) {
    console.error("Error fetching rate:", error.message);
    return null;
  }
}

module.exports = getRate;
