const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const axios = require("axios");
const Razorpay = require("razorpay");
const jwt = require("jsonwebtoken");

const User = require("./models/User");

const app = express();
const PORT = 5000;

// ✅ Config
const JWT_SECRET = "setupxpay_secret_key";
const TATUM_API_KEY = "t-684c3a005ad68338f85afe22-1792ec2110654df39d604f3b";
const SENDER_PRIVATE_KEY = "ddc4d27b4b6eaf4c74088ac546b18e35674fa997c6e9d77d209f5fafa54b79ad";
const TOKEN_ADDRESS = "TMxbFWUuebqshwm8e5E5WVzJXnDmdBZtXb";
const RAZORPAY_WEBHOOK_SECRET = "setupx_secret_key";

// ✅ MongoDB
mongoose.connect("mongodb+srv://mohan:mohan123@cluster0.em2tu28.mongodb.net/setupxpay?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// ✅ Middleware
app.use(cors({
  origin: "https://setupxpay-78bb7.web.app",
  credentials: true,
}));
app.use("/webhook", express.raw({ type: "application/json" }));
app.use(bodyParser.json());

// ✅ Transaction Schema
const Transaction = mongoose.model("Transaction", new mongoose.Schema({
  amountInr: Number,
  wallet: String,
  txId: String,
  usdtAmount: String,
  rate: Number,
  createdAt: { type: Date, default: Date.now }
}));

// ✅ UPDATED Signup Route
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "All fields are required." });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(409).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const walletRes = await axios.get("https://api.tatum.io/v3/tron/wallet", {
      headers: { "x-api-key": TATUM_API_KEY },
    });
    const { mnemonic, xpub } = walletRes.data;

    const addressRes = await axios.get(`https://api.tatum.io/v3/tron/address/${xpub}/0`, {
      headers: { "x-api-key": TATUM_API_KEY },
    });

    const address = addressRes.data.address;

    const user = new User({
      name,
      email,
      password: hashedPassword,
      walletAddress: address,
      xpub,
    });

    await user.save();

    // ✅ Send 1 TRX
    await axios.post("https://api.tatum.io/v3/tron/transaction", {
      to: address,
      amount: "1",
      fromPrivateKey: SENDER_PRIVATE_KEY,
    }, {
      headers: { "x-api-key": TATUM_API_KEY },
    });

    console.log(`✅ Sent 1 TRX to ${address} after signup.`);

    res.json({
      message: "Signup successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        walletAddress: user.walletAddress,
      },
      wallet: {
        address,
        xpub,
        mnemonic,
      },
    });
  } catch (err) {
    console.error("❌ Signup error:", err.message);
    res.status(500).json({ error: "Signup failed" });
  }
});

// ✅ Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        walletAddress: user.walletAddress,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ error: "Login failed" });
  }
});

// ✅ Get Balance
app.get("/get-balance/:address", async (req, res) => {
  const address = req.params.address;
  const usdtContractAddress = "TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj";

  try {
    const response = await axios.get(
      `https://api.tatum.io/v3/tron/account/${address}`,
      { headers: { "x-api-key": TATUM_API_KEY } }
    );

    const trc20 = response.data.trc20;
    let usdtBalance = "0";

    if (Array.isArray(trc20)) {
      const token = trc20.find((item) => item[usdtContractAddress]);
      if (token) {
        usdtBalance = token[usdtContractAddress];
      }
    }

    res.json({ address, usdt: usdtBalance });
  } catch (error) {
    console.error("❌ Error fetching balance:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch balance" });
  }
});

// ✅ Manual USDT Transfer
app.post("/send-usdt", async (req, res) => {
  const { amountInr, walletAddress } = req.body;
  if (!amountInr || !walletAddress) return res.status(400).json({ error: "Missing input" });

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
      { headers: { "x-api-key": TATUM_API_KEY, "Content-Type": "application/json" } }
    );

    const txId = response?.data?.txId || "unknown";

    await Transaction.create({
      amountInr,
      wallet: walletAddress,
      txId,
      usdtAmount,
      rate: usdtRate,
    });

    res.json({ message: "USDT sent", txId, usdtAmount, rate: usdtRate });
  } catch (error) {
    console.error("❌ USDT transfer failed:", error.response?.data || error.message);
    res.status(500).json({ error: "USDT transfer failed" });
  }
});

// ✅ Binance Rate Fetching
let liveRateData = {
  binanceRate: 0,
  markup: 1,
  userRate: 0,
  updatedAt: new Date()
};

async function fetchBinanceRate() {
  try {
    const response = await axios.post(
      "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search",
      {
        page: 1,
        rows: 1,
        payTypes: ["UPI"],
        asset: "USDT",
        tradeType: "SELL",
        fiat: "INR"
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    const price = parseFloat(response.data.data[0].adv.price);
    liveRateData.binanceRate = price;
    liveRateData.userRate = parseFloat((price + liveRateData.markup).toFixed(2));
    liveRateData.updatedAt = new Date();

    console.log(`[✔] Binance Rate: ₹${price} | User Rate: ₹${liveRateData.userRate}`);
  } catch (error) {
    console.error("❌ Binance rate fetch failed:", error.message);
  }
}

setInterval(fetchBinanceRate, 15000);
fetchBinanceRate();

app.get("/rate", (req, res) => {
  res.json({ rate: liveRateData.userRate });
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("✅ SetupX backend ready...");
});
