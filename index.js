// ===== Imports & Setup =====
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const axios = require("axios");
const Razorpay = require("razorpay");
const jwt = require("jsonwebtoken");
const authRoutes = require("./routes/auth");
const User = require("./models/User");
const app = express();
const PORT = 5000;
const withdrawRoutes = require("./routes/withdraw");
const Transaction = require("./models/Transaction");


// ===== Config =====
const JWT_SECRET = "setupxpay_secret_key";
const TATUM_API_KEY = "t-684c3a005ad68338f85afe22-1792ec2110654df39d604f3b";
const SENDER_PRIVATE_KEY = "ddc4d27b4b6eaf4c74088ac546b18e35674fa997c6e9d77d209f5fafa54b79ad";
const TOKEN_ADDRESS = "TMxbFWUuebqshwm8e5E5WVzJXnDmdBZtXb";
const RAZORPAY_WEBHOOK_SECRET = "setupx_secret_key";

// ===== MongoDB Connection =====
mongoose.connect("mongodb+srv://setupxadmin:WavMOQBBj3I2IcW9@cluster0.em2tu28.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// ===== Middleware =====
app.use(cors({
  origin: [
    "https://setupxpay-78bb7.web.app",
    "https://setupxpay.com",
    "https://www.setupxpay.com"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));
app.use("/webhook", express.raw({ type: "application/json" }));
app.use("/auth", authRoutes);
app.use(express.json());
app.use("/withdraw", withdrawRoutes);



const PendingPayment = mongoose.model("PendingPayment", new mongoose.Schema({
  userId: String,
  amountInr: Number,
  paymentLinkId: String,
  createdAt: { type: Date, default: Date.now },
}));

// ===== Signup =====
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

    const user = new User({ name, email, password: hashedPassword, walletAddress: address, xpub });
    await user.save();

    await axios.post("https://api.tatum.io/v3/tron/transaction", {
      to: address,
      amount: "1",
      fromPrivateKey: SENDER_PRIVATE_KEY,
    }, {
      headers: { "x-api-key": TATUM_API_KEY },
    });

    res.json({
      message: "Signup successful",
      user: { id: user._id, name, email, walletAddress: address },
      wallet: { address, xpub, mnemonic },
    });

  } catch (err) {
    console.error("❌ Signup error:", err.message);
    res.status(500).json({ error: "Signup failed" });
  }
});

// ===== Login =====
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, email }, JWT_SECRET, { expiresIn: "7d" });

    res.json({ 
      success: true,
      message: "Login successful", 
      token, 
      user: {
        id: user._id,
        name: user.name,
        email,
        walletAddress: user.walletAddress
      }
    });

  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ success: false, error: "Login failed" });
  }
});


// ===== Get Wallet Balance =====
app.get("/get-balance/:address", async (req, res) => {
  const address = req.params.address;
  const usdtContract = "TMxbFWUuebqshwm8e5E5WVzJXnDmdBZtXb";

  try {
    const response = await axios.get(`https://api.tatum.io/v3/tron/account/${address}`, {
      headers: { "x-api-key": TATUM_API_KEY }
    });

    const trc20 = response.data.trc20;
    let usdtBalance = "0";
    if (Array.isArray(trc20)) {
      const token = trc20.find(item => item[usdtContract]);
      if (token) usdtBalance = token[usdtContract];
    }

    res.json({ address, usdt: usdtBalance });
  } catch (error) {
    console.error("❌ Balance error:", error.message);
    res.status(500).json({ error: "Failed to fetch balance" });
  }
});

// ===== Manual USDT Transfer =====
app.post("/send-usdt", async (req, res) => {
  const { amountInr, walletAddress } = req.body;
  if (!amountInr || !walletAddress) return res.status(400).json({ error: "Missing input" });

  try {
    const usdtRate = 83;
    const usdtAmount = (amountInr / usdtRate).toFixed(2);

    const response = await axios.post("https://api.tatum.io/v3/tron/trc20/transaction", {
      to: walletAddress,
      amount: usdtAmount,
      fromPrivateKey: SENDER_PRIVATE_KEY,
      tokenAddress: TOKEN_ADDRESS,
      feeLimit: 1000,
    }, {
      headers: { "x-api-key": TATUM_API_KEY, "Content-Type": "application/json" }
    });

    const txId = response?.data?.txId || "unknown";

    await Transaction.create({ amountInr, wallet: walletAddress, txId, usdtAmount, rate: usdtRate });
    res.json({ message: "USDT sent", txId, usdtAmount, rate: usdtRate });

  } catch (error) {
    console.error("❌ USDT send failed:", error.message);
    res.status(500).json({ error: "Transfer failed" });
  }
});

// ===== Binance USDT Rate Fetcher =====
let liveRateData = { binanceRate: 0, markup: 1, userRate: 0, updatedAt: new Date() };

async function fetchBinanceRate() {
  try {
    const response = await axios.post("https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search", {
      page: 1, rows: 1, payTypes: ["UPI"], asset: "USDT", tradeType: "SELL", fiat: "INR"
    }, {
      headers: { "Content-Type": "application/json" }
    });

    const price = parseFloat(response.data.data[0].adv.price);
    liveRateData.binanceRate = price;
    liveRateData.userRate = parseFloat((price + liveRateData.markup).toFixed(2));
    liveRateData.updatedAt = new Date();

    console.log(`[✔] Binance Rate: ₹${price} | User Rate: ₹${liveRateData.userRate}`);
  } catch (error) {
    console.error("❌ Rate fetch failed:", error.message);
  }
}

setInterval(fetchBinanceRate, 15000);
fetchBinanceRate();

// ✅ Updated /rate route to return both buy and sell prices
app.get("/rate", (req, res) => {
  const { binanceRate, markup, updatedAt } = liveRateData;

  const buy = parseFloat((binanceRate + markup).toFixed(2));  // Buyer pays more
  const sell = parseFloat((binanceRate - markup).toFixed(2)); // Seller receives less

  res.json({ buy, sell, updatedAt });
});

// ===== Transaction History =====
app.get("/transactions", async (req, res) => {
  const { wallet, userId } = req.query;

  if (!wallet && !userId) {
    return res.status(400).json({ error: "wallet or userId required" });
  }

  try {
    const conditions = [];

    if (wallet) {
      conditions.push({ wallet });
      conditions.push({ from: wallet });
    }

    if (userId) {
      conditions.push({ from: userId });
    }

    const query = { $or: conditions };

    const txs = await Transaction.find(query).sort({ createdAt: -1 });
    res.json(txs);
  } catch (err) {
    console.error("❌ Tx fetch error:", err.message);
    res.status(500).json({ error: "Fetch failed" });
  }
});



// ===== Razorpay Payment Link Generator =====
const razorpay = new Razorpay({
  key_id: "rzp_test_QflsX9eLx3HUJA",
  key_secret: "JsS6yJAtjqAVTd6Dxg7DkI7u",
});

app.post("/create-payment-link", async (req, res) => {
  const { amountInr, userId, walletAddress } = req.body;

  let resolvedWallet = walletAddress;

  try {
    if (userId && !walletAddress) {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: "User not found" });
      resolvedWallet = user.walletAddress;
    }

    if (!amountInr || !resolvedWallet) {
      return res.status(400).json({ error: "Amount or wallet address missing." });
    }

    const paymentLink = await razorpay.paymentLink.create({
      amount: Number(amountInr) * 100,
      currency: "INR",
      accept_partial: false,
      description: `Deposit USDT to ${resolvedWallet}`,
      notes: {
        wallet: resolvedWallet
      },
      customer: {
        name: "SetupXPay User",
        contact: "9000000000",
        email: "user@setupxpay.in",
      },
      notify: {
        sms: false,
        email: false,
      },
      callback_url: "https://setupxpay.com/payment-success",
      callback_method: "get"
    });

    console.log("✅ Payment link generated:", paymentLink.short_url);
    res.json({ url: paymentLink.short_url });

  } catch (err) {
    console.error("❌ Razorpay error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to generate Razorpay payment link" });
  }
});


// ===== Razorpay Webhook =====
app.post("/webhook", async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const rawBody = req.body.toString("utf8");

  const expectedSignature = crypto
    .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  if (signature !== expectedSignature) {
    console.error("❌ Webhook signature mismatch");
    return res.status(400).send("Invalid signature");
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch (err) {
    console.error("❌ Webhook JSON parse error:", err.message);
    return res.status(400).send("Invalid JSON");
  }

  // ✅ Use payment.captured (notes.wallet is available)
  if (event.event !== "payment.captured") {
    console.log(`ℹ️ Ignored event: ${event.event}`);
    return res.status(200).send("Ignored event");
  }

  const payment = event.payload.payment.entity;
  const amountInr = payment.amount / 100;
  const wallet = payment.notes?.wallet;

  if (!wallet) {
    console.error("❌ Wallet address missing in payment notes");
    return res.status(400).send("Wallet missing");
  }

  try {
    const usdtAmount = (amountInr / liveRateData.userRate).toFixed(2);

    const txRes = await axios.post("https://api.tatum.io/v3/tron/trc20/transaction", {
      to: wallet,
      amount: usdtAmount,
      fromPrivateKey: SENDER_PRIVATE_KEY,
      tokenAddress: TOKEN_ADDRESS,
      feeLimit: 1000,
    }, {
      headers: { "x-api-key": TATUM_API_KEY, "Content-Type": "application/json" }
    });

    const txId = txRes?.data?.txId || "unknown";

    await Transaction.create({
      type: "deposit",
      amountInr,
      usdtAmount,
      wallet,
      txId,
      rate: liveRateData.userRate,
    });

    console.log(`✅ Webhook processed: ₹${amountInr} → ${usdtAmount} USDT to ${wallet}`);
    res.status(200).send("Success");
  } catch (err) {
    console.error("❌ USDT send failed:", err.message);
    res.status(500).send("Failed to send USDT");
  }
});

// ===== Razorpay Modal Payment Order (for inline checkout) =====
app.post("/create-payment-order", async (req, res) => {
  const { amountInr, walletAddress } = req.body;

  if (!amountInr || !walletAddress) {
    return res.status(400).json({ error: "Amount or wallet address missing" });
  }

  try {
    const order = await razorpay.orders.create({
      amount: amountInr * 100, // ₹ to paise
      currency: "INR",
      receipt: `order_rcptid_${Date.now()}`,
      notes: { wallet: walletAddress },
    });

    console.log("✅ Razorpay order created:", order.id);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: "rzp_test_QflsX9eLx3HUJA", // 👉 replace with live key when needed
    });
  } catch (error) {
    console.error("❌ Razorpay order creation failed:", error);
    res.status(500).json({ error: "Failed to create Razorpay order" });
  }
});

async function sendUSDTviaTatum(from, to, amount) {
  try {
    const response = await axios.post("https://api.tatum.io/v3/tron/trc20/transaction", {
      to,
      amount,
      fromPrivateKey: SENDER_PRIVATE_KEY,
      tokenAddress: TOKEN_ADDRESS,
      feeLimit: 1000
    }, {
      headers: {
        "x-api-key": TATUM_API_KEY,
        "Content-Type": "application/json"
      }
    });

    return { txId: response.data.txId };
  } catch (err) {
    console.error("❌ sendUSDTviaTatum failed:", err.response?.data || err.message);
    throw err;
  }
}


// ===== withdraw usdt =====
app.post("/withdraw", async (req, res) => {
  const { from, to, amount, network } = req.body;

  if (!from || !to || !amount || !network) {
    return res.status(400).json({ success: false, error: "Missing fields" });
  }

  if (network === "bep20") {
    return res.status(400).json({ success: false, error: "BEP20 not yet supported" });
  }

  try {
    // Call Tatum TRC20 API
    const response = await sendUSDTviaTatum(from, to, amount); // 🚀 Success here

    // ✅ Save to MongoDB transaction log
    await Transaction.create({
      type: "withdraw",
      amountInr: null,
      usdtAmount: amount,
      wallet: to,
      from: from,
      txId: response.txId,
      rate: null,
      fee: "1",                // ✅ Static for now, update dynamically if needed
      network: network,        // ✅ Store trc20/bep20 etc
    });

    return res.json({ success: true, txId: response.txId });
  } catch (err) {
    console.error("❌ Withdraw failed:", err);
    return res.status(500).json({ success: false, error: "Withdraw error" });
  }
});



// ===== Start Server =====
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
