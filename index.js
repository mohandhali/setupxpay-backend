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
const ENCRYPTION_KEY = "setupxpay_encryption_key_2024"; // For encrypting private keys

// ===== MongoDB Connection =====
mongoose.connect("mongodb+srv://setupxadmin:WavMOQBBj3I2IcW9@cluster0.em2tu28.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// ===== Encryption Utilities =====
function encryptPrivateKey(privateKey) {
  // Create a fixed IV for simplicity (in production, use random IV)
  const iv = Buffer.alloc(16, 0); // 16 bytes of zeros
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32); // 32 bytes key
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  
  let encrypted = cipher.update(privateKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decryptPrivateKey(encryptedPrivateKey) {
  // Create a fixed IV for simplicity (in production, use random IV)
  const iv = Buffer.alloc(16, 0); // 16 bytes of zeros
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32); // 32 bytes key
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  
  let decrypted = decipher.update(encryptedPrivateKey, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

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

    // === TRC20 (Tron) Wallet Generation ===
    const walletRes = await axios.get("https://api.tatum.io/v3/tron/wallet", {
      headers: { "x-api-key": TATUM_API_KEY },
    });
    const { mnemonic, xpub } = walletRes.data;
    const addressRes = await axios.get(`https://api.tatum.io/v3/tron/address/${xpub}/0`, {
      headers: { "x-api-key": TATUM_API_KEY },
    });
    const address = addressRes.data.address;
    // ✅ Get Private Key from Mnemonic
    const privateKeyRes = await axios.post(
      "https://api.tatum.io/v3/tron/wallet/priv",
      { index: 0, mnemonic },
      { headers: { "x-api-key": TATUM_API_KEY } }
    );
    const privateKey = privateKeyRes.data.key;

    // === BEP20 (BSC) Wallet Generation ===
    const bep20WalletRes = await axios.get("https://api.tatum.io/v3/bsc/wallet", {
      headers: { "x-api-key": TATUM_API_KEY },
    });
    const bep20Mnemonic = bep20WalletRes.data.mnemonic;
    const bep20Xpub = bep20WalletRes.data.xpub;
    const bep20AddressRes = await axios.get(`https://api.tatum.io/v3/bsc/address/${bep20Xpub}/0`, {
      headers: { "x-api-key": TATUM_API_KEY },
    });
    const bep20Address = bep20AddressRes.data.address;
    // ✅ Get BEP20 Private Key from Mnemonic
    const bep20PrivateKeyRes = await axios.post(
      "https://api.tatum.io/v3/bsc/wallet/priv",
      { index: 0, mnemonic: bep20Mnemonic },
      { headers: { "x-api-key": TATUM_API_KEY } }
    );
    const bep20PrivateKey = bep20PrivateKeyRes.data.key;

    const user = new User({
      name,
      email,
      password: hashedPassword,
      walletAddress: address,
      xpub,
      encryptedPrivateKey: encryptPrivateKey(privateKey), // TRC20
      bep20Address,
      bep20EncryptedPrivateKey: encryptPrivateKey(bep20PrivateKey),
      bep20Mnemonic,
    });

    await user.save();

    // Optional: send 1 TRX to new wallet from pool
    await axios.post(
      "https://api.tatum.io/v3/tron/transaction",
      {
        to: address,
        amount: "1",
        fromPrivateKey: SENDER_PRIVATE_KEY,
      },
      { headers: { "x-api-key": TATUM_API_KEY } }
    );

    res.json({
      message: "Signup successful",
      user: { id: user._id, name, email, walletAddress: address, bep20Address },
      wallet: {
        trc20: { address, xpub, mnemonic, privateKey },
        bep20: { address: bep20Address, xpub: bep20Xpub, mnemonic: bep20Mnemonic, privateKey: bep20PrivateKey },
      },
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

    // Get TRX balance
    const trxBalance = response.data.balance || "0";

    res.json({ 
      address, 
      usdt: usdtBalance,
      trx: trxBalance 
    });
  } catch (error) {
    console.error("❌ Balance error:", error.message);
    res.status(500).json({ error: "Failed to fetch balance" });
  }
});

// ===== Check and Fund TRX for Transaction =====
app.post("/ensure-trx-balance", async (req, res) => {
  const { address } = req.body;
  
  if (!address) {
    return res.status(400).json({ success: false, error: "Address required" });
  }

  try {
    // Get current balance
    const balanceRes = await axios.get(`https://api.tatum.io/v3/tron/account/${address}`, {
      headers: { "x-api-key": TATUM_API_KEY }
    });

    const trxBalance = parseFloat(balanceRes.data.balance || "0");
    const minTrxRequired = 1; // Minimum TRX needed for transaction

    if (trxBalance < minTrxRequired) {
      // Send TRX to user wallet
      const trxAmount = "2"; // Send 2 TRX for fees
      
      const trxRes = await axios.post("https://api.tatum.io/v3/tron/transaction", {
        to: address,
        amount: trxAmount,
        fromPrivateKey: SENDER_PRIVATE_KEY,
      }, {
        headers: {
          "x-api-key": TATUM_API_KEY,
          "Content-Type": "application/json"
        }
      });

      console.log("✅ TRX funded:", trxRes.data.txId);
      
      res.json({ 
        success: true, 
        message: "TRX funded for transaction",
        txId: trxRes.data.txId,
        funded: true
      });
    } else {
      res.json({ 
        success: true, 
        message: "Sufficient TRX balance",
        funded: false
      });
    }

  } catch (error) {
    console.error("❌ TRX funding error:", error.response?.data || error.message);
    res.status(500).json({ success: false, error: "Failed to fund TRX" });
  }
});

// ===== Get User's Private Key (for transactions) =====
app.post("/get-user-private-key", async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: "User ID required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Check if user has encrypted private key
    if (!user.encryptedPrivateKey) {
      // For existing users, try to get from localStorage (temporary fix)
      return res.status(400).json({ 
        success: false, 
        error: "No private key found for user. Please re-login or recreate wallet.",
        needsReauth: true
      });
    }

    // Decrypt and return private key
    const privateKey = decryptPrivateKey(user.encryptedPrivateKey);
    
    res.json({ 
      success: true, 
      privateKey,
      biometricEnabled: user.biometricEnabled,
      oneTimeSigned: user.oneTimeSigned
    });

  } catch (err) {
    console.error("❌ Get private key error:", err.message);
    res.status(500).json({ success: false, error: "Failed to get private key" });
  }
});

// ===== Migration: Add Private Key for Existing Users =====
app.post("/migrate-user-private-key", async (req, res) => {
  try {
    const { userId, privateKey } = req.body;
    
    if (!userId || !privateKey) {
      return res.status(400).json({ success: false, error: "User ID and private key required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Encrypt and store private key
    user.encryptedPrivateKey = encryptPrivateKey(privateKey);
    await user.save();

    res.json({ success: true, message: "Private key migrated successfully" });

  } catch (err) {
    console.error("❌ Migration error:", err.message);
    res.status(500).json({ success: false, error: "Migration failed" });
  }
});

// ===== Manual USDT Transfer =====
app.post("/send-usdt", async (req, res) => {
  const { fromPrivateKey, to, amount, userId } = req.body;

  if (!fromPrivateKey || !to || !amount || !userId) {
    return res.status(400).json({ success: false, error: "Missing input" });
  }

  try {
    // Get user data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ success: false, error: "User not found" });
    }
    
    const senderAddress = user.walletAddress;
    console.log("🔍 Sender address:", senderAddress);

    // Check TRX balance before transaction
    const balanceRes = await axios.get(`https://api.tatum.io/v3/tron/account/${senderAddress}`, {
      headers: { "x-api-key": TATUM_API_KEY }
    });

    const trxBalance = parseFloat(balanceRes.data.balance || "0");
    console.log("🔍 TRX Balance:", trxBalance);

    if (trxBalance < 1) {
      console.log("⚠️ Low TRX balance, funding...");
      
      // Fund TRX
      const trxRes = await axios.post("https://api.tatum.io/v3/tron/transaction", {
        to: senderAddress,
        amount: "5", // Send more TRX
        fromPrivateKey: SENDER_PRIVATE_KEY,
      }, {
        headers: {
          "x-api-key": TATUM_API_KEY,
          "Content-Type": "application/json"
        }
      });

      console.log("✅ TRX funded:", trxRes.data.txId);
      
      // Wait for TRX transaction to confirm
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    console.log("🚀 Starting USDT transfer...");
    
    // Try with lower fee limit first
    try {
      const tx = await axios.post("https://api.tatum.io/v3/tron/trc20/transaction", {
        to,
        amount,
        fromPrivateKey,
        tokenAddress: TOKEN_ADDRESS,
        feeLimit: 100
      }, {
        headers: {
          "x-api-key": TATUM_API_KEY,
          "Content-Type": "application/json"
        }
      });

      console.log("✅ USDT transfer successful:", tx.data.txId);
      return res.json({ success: true, txId: tx.data.txId });
    } catch (feeError) {
      console.log("⚠️ Low fee failed, trying with higher fee...");
      
      // Try with higher fee limit
      const tx = await axios.post("https://api.tatum.io/v3/tron/trc20/transaction", {
        to,
        amount,
        fromPrivateKey,
        tokenAddress: TOKEN_ADDRESS,
        feeLimit: 500
      }, {
        headers: {
          "x-api-key": TATUM_API_KEY,
          "Content-Type": "application/json"
        }
      });

      console.log("✅ USDT transfer successful with higher fee:", tx.data.txId);
      return res.json({ success: true, txId: tx.data.txId });
    }
  } catch (err) {
    console.error("❌ Send failed:", err.response?.data || err.message);
    
    // Check if it's a resource insufficient error
    if (err.response?.data?.cause?.includes('Account resource insufficient')) {
      return res.status(500).json({ 
        success: false, 
        error: "Insufficient TRX for transaction fees. Please try again in a few minutes.",
        details: err.response?.data 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      error: err.response?.data?.message || err.message,
      details: err.response?.data 
    });
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
      fromPrivateKey: from,
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
