const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const axios = require("axios");

const app = express();
const PORT = 5000;

// ✅ Connect to MongoDB
mongoose.connect("mongodb+srv://mohan:mohan123@cluster0.em2tu28.mongodb.net/setupxpay?retryWrites=true&w=majority&appName=Cluster0")
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
app.use("/webhook", express.raw({ type: "application/json" })); // Raw body for webhook
app.use(bodyParser.json());

// ✅ Config
const RAZORPAY_WEBHOOK_SECRET = "setupx_secret_key";
const TATUM_API_KEY = "t-684c3a005ad68338f85afe22-1792ec2110654df39d604f3b";
const SENDER_PRIVATE_KEY = "ddc4d27b4b6eaf4c74088ac546b18e35674fa997c6e9d77d209f5fafa54b79ad";
const TOKEN_ADDRESS = "TMxbFWUuebqshwm8e5E5WVzJXnDmdBZtXb";

// ✅ Manual Payment Route
app.post("/send-usdt", async (req, res) => {
  const { amountInr, walletAddress } = req.body;

  if (!amountInr || !walletAddress) {
    return res.status(400).json({ error: "Missing amountInr or walletAddress" });
  }

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

    await Transaction.create({
      amountInr,
      wallet: walletAddress,
      txId,
      usdtAmount,
      rate: usdtRate,
    });

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

// ✅ Webhook Auto Payout Route
app.post("/webhook", async (req, res) => {
  const receivedSig = req.headers["x-razorpay-signature"];
  const expectedSig = crypto.createHmac("sha256", RAZORPAY_WEBHOOK_SECRET).update(req.body).digest("hex");

  if (receivedSig !== expectedSig) {
    console.warn("❌ Invalid Razorpay Signature");
    return res.status(403).json({ error: "Invalid signature" });
  }

  try {
    const payload = JSON.parse(req.body);
    const entity = payload?.payload?.payment?.entity;

    const amountInr = entity.amount / 100;
    const wallet = entity.notes?.wallet;

    if (!wallet) {
      return res.status(400).json({ error: "Missing wallet address in notes" });
    }

    console.log(`✅ Webhook Payment Received: ₹${amountInr}`);
    console.log(`🔗 Wallet: ${wallet}`);

    // 🔁 USDT Calculation
    const usdtRate = 83;
    const usdtAmount = (amountInr / usdtRate).toFixed(2);

    // 🔁 Tatum Transfer
    const response = await axios.post(
      "https://api.tatum.io/v3/tron/trc20/transaction",
      {
        to: wallet,
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

    // 💾 Save in DB
    await Transaction.create({
      amountInr,
      wallet,
      txId,
      usdtAmount,
      rate: usdtRate,
    });

    console.log("✅ Webhook payout successful:", txId);
    res.status(200).json({ status: "ok" });

  } catch (err) {
    console.error("❌ Webhook Error:", err);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

// ✅ Transactions API
app.get("/transactions", async (req, res) => {
  try {
    const txs = await Transaction.find().sort({ createdAt: -1 }).limit(100);
    res.json(txs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// ✅ Create Razorpay Payment Link
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: "rzp_test_yourKeyHere",
  key_secret: "yourSecretKeyHere"
});

app.post("/create-payment-link", async (req, res) => {
  const { amountInr, walletAddress } = req.body;

  if (!amountInr || !walletAddress) {
    return res.status(400).json({ error: "Missing amount or wallet address" });
  }

  try {
    const response = await razorpay.paymentLink.create({
      amount: amountInr * 100,
      currency: "INR",
      accept_partial: false,
      description: "USDT Auto Payout via SetupXPay",
      customer: {
        name: "User",
        contact: "",
        email: "",
      },
      notify: {
        sms: false,
        email: false,
      },
      reminder_enable: true,
      notes: {
        wallet: walletAddress,
      },
      callback_url: "https://setupxpay-78bb7.web.app",
      callback_method: "get"
    });

    res.json({ url: response.short_url });
  } catch (err) {
    console.error("❌ Error creating payment link:", err);
    res.status(500).json({ error: "Failed to create payment link" });
  }
});

// 🚀 Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
