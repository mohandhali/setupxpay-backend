const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const axios = require("axios");

const app = express();
const PORT = 5000;

const RAZORPAY_WEBHOOK_SECRET = "setupx_secret_key";
const TATUM_API_KEY = "t-684c3a005ad68338f85afe22-1792ec2110654df39d604f3b"; // replace with your Tatum API Key
const SENDER_PRIVATE_KEY = "ddc4d27b4b6eaf4c74088ac546b18e35674fa997c6e9d77d209f5fafa54b79ad";
const TOKEN_ADDRESS = "TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf";
const FROM_ADDRESS = "TTpuKGbuznUVWN5KM6zxNsbLuPxJRFZDHm";

app.use(bodyParser.json());

app.post("/razorpay-webhook", async (req, res) => {
  const receivedSignature = req.headers["x-razorpay-signature"];
  const payload = JSON.stringify(req.body);

  const expectedSignature = crypto
    .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");

  if (receivedSignature !== expectedSignature) {
    console.log("❌ Webhook signature mismatch");
    return res.status(403).send("Invalid signature");
  }

  const event = req.body;
  const payment = event?.payload?.payment?.entity;

  if (!payment || !payment.notes || !payment.notes.wallet_address) {
    console.log("❌ Missing receiver wallet address in notes");
    return res.status(400).send("Invalid or missing wallet address in payment notes.");
  }

  const amountINR = payment.amount / 100;
  const receiverWallet = payment.notes.wallet_address.trim();

  console.log(`✅ Payment Received: ₹${amountINR}`);
  console.log(`🔗 Receiver Wallet: ${receiverWallet}`);

  try {
    // Get Binance USDT rate (dummy fixed for testing or use actual API if needed)
    const usdtRate = 83; // INR per USDT
    const usdtAmount = (amountINR / usdtRate).toFixed(2);

    // Initiate payout with Tatum
    const transferResponse = await axios.post(
  "https://api.tatum.io/v3/tron/trc20/transaction",
  {
    to: receiverWallet,
    amount: usdtAmount,
    fromPrivateKey: SENDER_PRIVATE_KEY,
    tokenAddress: TOKEN_ADDRESS,
    feeLimit: 100,
  },
  {
    headers: {
      "x-api-key": TATUM_API_KEY,
      "Content-Type": "application/json",
    },
  }
);


    console.log("✅ USDT sent successfully:", transferResponse.data);
  } catch (error) {
    console.error("❌ Error sending USDT:", error.response?.data || error.message);
    return res.status(500).send("Error sending USDT");
  }

  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`✅ Webhook server running on http://localhost:${PORT}`);
});
