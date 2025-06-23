const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

let liveRateData = {
  binanceRate: 0,
  markup: 1, // profit per USDT
  userRate: 0,
  updatedAt: new Date()
};

async function fetchBinanceRate() {
  try {
    const response = await axios.post('https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search', {
      page: 1,
      rows: 1,
      payTypes: ["UPI"],
      asset: "USDT",
      tradeType: "SELL",
      fiat: "INR"
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const price = parseFloat(response.data.data[0].adv.price);
    liveRateData.binanceRate = price;
    liveRateData.userRate = parseFloat((price + liveRateData.markup).toFixed(2));
    liveRateData.updatedAt = new Date();

    console.log(`[RATE UPDATED] Binance: ₹${price}, User: ₹${liveRateData.userRate}`);
  } catch (error) {
    console.error("Error fetching Binance rate:", error.message);
  }
}

setInterval(fetchBinanceRate, 15000);
fetchBinanceRate(); // first time call

app.get('/get-rate', (req, res) => {
  res.json(liveRateData);
});

app.listen(PORT, () => {
  console.log(`✅ Rate Engine running on http://localhost:${PORT}`);
});
