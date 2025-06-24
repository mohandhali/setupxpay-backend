const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const axios = require("axios");

const app = express();
const PORT = 5000;

// ✅ Connect to MongoDB
mongoose.connect("mongodb+srv://mohan:mohan123@cluster0.em2tu28.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// ✅ Schema
const Transaction = mongoose.model("Transaction", new mongoose.Schema({
  amountInr: Number,
  wallet: String,
  txId: { type: String, required: false },
  usdtAmount: String,
  rate: Number,
  createdAt: { type: Date, default: Date.now }
}));

// ✅ Middleware
app.use(cors());

// ⛔ Razorpay webhook raw parser (must be before bodyParser)
app.use("/webhook", express.raw({ type: "application/json" }));

// ✅ For all other routes
app.use(bodyParser.json());

// ✅ Secrets and Config
const RAZORPAY_WEBHOOK_SECRET = "setupx_secret_key";
const TATUM_API_KEY = "t-684c3a005ad68338f85afe22-1792ec2110654df39d604f3b";
const SENDER_PRIVATE_KEY = "ddc4d27b4b6eaf4c74088ac546b18e35674fa997c6e9d77d209f5fafa54b79ad";
const TOKEN_ADDRESS = "TMxbFWUuebqshwm8e5E5WVzJXnDmdBZtXb";

// ✅ React Manual Payment Route
app.post("/send-usdt", async (req, res) => {
  const { amountInr, walletAddress } = req.body;

  if (!amountInr || !walletAddress) {
    return res.status(400).json({ error: "Missing amountInr or walletAddress" });
  }

  console.log(`✅ Manual Payment Received: ₹${amountInr}`);
  console.log(`🔗 Receiver Wallet: ${walletAddress}`);

  try {
    const usdtRate = 83;
    const usdtAmount = (amountInr / usdtRate).toFixed(2);

    const response = await axios.post(
      "https://api.tatum.io/v3/tron/trc20/transaction",
      {
        to: walletAddress,
        amount: usdtAmount,
        fromPrivateKey: SENDER_PRIVATE_KEY,
        tokenAddress: TOKEN_ADDRESS,
        feeLimit: 1000,
      },
      {
        headers: {
          "x-api-key": TATUM_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const txId = response?.data?.txId || "unknown";
    console.log("✅ USDT sent successfully!");
    console.log("🔁 Tx ID:", txId);

    await Transaction.create({
      amountInr,
      wallet: walletAddress,
      txId,
      usdtAmount,
      rate: usdtRate,
    });

    console.log("💾 Data saved to DB");

    res.json({
      message: "USDT sent successfully!",
      txId,
      usdtAmount,
      rate: usdtRate,
    });

  } catch (error) {
    console.error("❌ Error sending token:", error.response?.data || error.message);
    res.status(500).json({ error: "USDT transfer failed" });
  }
});

// ✅ Webhook Route from Razorpay
app.post("/webhook", (req, res) => {
  const secret = RAZORPAY_WEBHOOK_SECRET;

  const sha = crypto.createHmac("sha256", secret);
  sha.update(req.body.toString());
  const signature = sha.digest("hex");

  if (signature === req.headers["x-razorpay-signature"]) {
    console.log("✅ Webhook verified:", req.body);

    const { amount, notes } = JSON.parse(req.body).payload.payment.entity;
    const wallet = notes?.wallet;

    console.log(`🎯 Webhook INR: ₹${amount / 100}`);
    console.log(`🎯 Webhook Wallet: ${wallet}`);

    // Optional: Auto transfer logic can be added here

    return res.status(200).json({ status: "ok" });
  } else {
    console.warn("❌ Invalid Razorpay Signature");
    return res.status(403).json({ error: "Invalid signature" });
  }
});

// ✅ Get all transactions
app.get("/transactions", async (req, res) => {
  try {
    const txs = await Transaction.find().sort({ createdAt: -1 }).limit(100);
    res.json(txs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// 🚀 Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
