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
const multer = require("multer");
const path = require("path");
const cloudinary = require('cloudinary').v2;

// ===== BSC Testnet Pool Config =====
const BSC_POOL_ADDRESS = "0xC7894a2f14a7d9002dECBac352450B167374467c";
const BSC_POOL_PRIVATE_KEY = "78b2b5e84134d151fdafa309101509b361c6cb4803b13e43ae4f745d33b52b10";
const BEP20_USDT_CONTRACT = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd";

// ===== CORS Middleware (must be first) =====
app.use(cors({
  origin: [
    "https://setupxpay-78bb7.web.app",
    "https://setupxpay.com",
    "https://www.setupxpay.com",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));
app.options('*', cors());

// Catch-all CORS middleware for debugging
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // For debugging only, use your domain in production
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

// ===== Config =====
const JWT_SECRET = "setupxpay_secret_key";
const TATUM_API_KEY = "t-684c3a005ad68338f85afe22-1792ec2110654df39d604f3b";
const SENDER_PRIVATE_KEY = "ddc4d27b4b6eaf4c74088ac546b18e35674fa997c6e9d77d209f5fafa54b79ad";
const TOKEN_ADDRESS = "TMxbFWUuebqshwm8e5E5WVzJXnDmdBZtXb";
const RAZORPAY_WEBHOOK_SECRET = "setupx_secret_key";
const ENCRYPTION_KEY = "setupxpay_encryption_key_2024"; // For encrypting private keys

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Serve uploads statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Cloudinary config
cloudinary.config({
  cloud_name: 'dnmula0sq',
  api_key: '286351875114958',
  api_secret: '3erjFlmW3FSHNxfGIvNXbhs1d94',
});

// Helper to upload a file buffer to Cloudinary
async function uploadToCloudinaryBuffer(fileBuffer, originalname, folder) {
  return new Promise((resolve, reject) => {
    // Generate a unique public_id for each file
    const uniqueId = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = originalname.split('.').pop();
    const base = originalname.replace(/\.[^/.]+$/, "");
    cloudinary.uploader.upload_stream(
      { folder, public_id: `${base}-${uniqueId}` },
      (err, result) => {
        if (err) return reject(err);
        resolve(result.secure_url);
      }
    ).end(fileBuffer);
  });
}

// KYC file upload endpoint (Cloudinary version, memory buffer)
app.post("/kyc/upload", upload.fields([
  { name: "panCard", maxCount: 1 },
  { name: "aadharFront", maxCount: 1 },
  { name: "aadharBack", maxCount: 1 }
]), async (req, res) => {
  try {
    console.log("[KYC UPLOAD] req.body:", req.body);
    console.log("[KYC UPLOAD] req.files:", req.files);
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, error: "User ID required" });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });
    const files = req.files;
    const docUrls = {};
    if (files.panCard) docUrls.panCard = await uploadToCloudinaryBuffer(files.panCard[0].buffer, files.panCard[0].originalname, 'kyc_docs');
    if (files.aadharFront) docUrls.aadharFront = await uploadToCloudinaryBuffer(files.aadharFront[0].buffer, files.aadharFront[0].originalname, 'kyc_docs');
    if (files.aadharBack) docUrls.aadharBack = await uploadToCloudinaryBuffer(files.aadharBack[0].buffer, files.aadharBack[0].originalname, 'kyc_docs');
    user.kycDocuments = { ...user.kycDocuments, ...docUrls };
    await user.save();
    res.json({ success: true, kycDocuments: user.kycDocuments });
  } catch (err) {
    console.error("❌ KYC file upload error:", err.message);
    res.status(500).json({ success: false, error: "Failed to upload documents" });
  }
});


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

// 👇 Place webhook raw middleware BEFORE express.json()
app.use("/webhook", express.raw({ type: "application/json" }));
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/withdraw", withdrawRoutes);

// ===== Health Check =====
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    message: "SetupXPay Backend is running",
    version: "1.0.0"
  });
});

// ===== Test Auth Route =====
app.get("/test-auth", (req, res) => {
  res.json({ 
    message: "Auth routes are accessible",
    timestamp: new Date().toISOString(),
    routes: ["/auth/signup", "/auth/login", "/auth/me"]
  });
});



const PendingPayment = mongoose.model("PendingPayment", new mongoose.Schema({
  userId: String,
  amountInr: Number,
  paymentLinkId: String,
  createdAt: { type: Date, default: Date.now },
}));

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
  const { fromPrivateKey, to, amount, userId, network } = req.body;

  if (!fromPrivateKey || !to || !amount || !userId || !network) {
    return res.status(400).json({ success: false, error: "Missing input" });
  }

  // Validate and convert amount
  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json({ success: false, error: "Invalid amount" });
  }
  const amountStr = String(Number(amount));

  try {
    // Get user data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ success: false, error: "User not found" });
    }
    
    let senderAddress = user.walletAddress;
    if (network === "bep20") {
      senderAddress = user.bep20Address;
    }
    console.log("🔍 Sender address:", senderAddress);

    // Check TRX balance for TRC20 only
    if (network === "trc20") {
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
    }

    // === Network-specific USDT transfer ===
    if (network === "bep20") {
      // BEP20 (BSC) USDT transfer
      if (!to.startsWith("0x")) {
        return res.status(400).json({ success: false, error: "BSC address must start with 0x" });
      }
      // Use BSC testnet pool config
      const BEP20_USDT_CONTRACT = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd"; // Already defined at top, keep for clarity
      let senderAddress = user.bep20Address;
      let senderPrivateKey = fromPrivateKey;
      // If the sender is the pool (for payouts), use pool private key/address
      if (senderAddress === BSC_POOL_ADDRESS || user.isPool) {
        senderAddress = BSC_POOL_ADDRESS;
        senderPrivateKey = BSC_POOL_PRIVATE_KEY;
      }
      // Validate amount for BEP20
      const amount = parseFloat(amountStr);
      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ success: false, error: "Invalid amount for BEP20 transfer" });
      }
      try {
        console.log(`🔄 Attempting BEP20 transfer: ${amountStr} USDT to ${to}`);
        const tx = await axios.post("https://api.tatum.io/v3/bsc/transaction", {
          to,
          currency: "USDT",
          amount: amountStr,
          fromPrivateKey: senderPrivateKey,
          contractAddress: BEP20_USDT_CONTRACT
        }, {
          headers: {
            "x-api-key": TATUM_API_KEY,
            "Content-Type": "application/json"
          }
        });
        console.log("✅ BEP20 USDT transfer successful:", tx.data.txId);
        return res.json({ success: true, txId: tx.data.txId });
      } catch (err) {
        console.error("❌ BEP20 USDT send failed:", err.response?.data || err.message);
        
        // Check for specific BEP20 errors
        if (err.response?.data?.message?.includes('insufficient')) {
          return res.status(500).json({ 
            success: false, 
            error: "Insufficient BNB for gas fees. Please ensure you have at least 0.002 BNB in your wallet.",
            details: err.response?.data 
          });
        }
        
        if (err.response?.data?.message?.includes('invalid')) {
          return res.status(400).json({ 
            success: false, 
            error: "Invalid transaction parameters. Please check the amount and address.",
            details: err.response?.data 
          });
        }
        
        return res.status(500).json({ 
          success: false, 
          error: err.response?.data?.message || err.message, 
          details: err.response?.data 
        });
      }
    } else if (network === "trc20") {
      // TRC20 (Tron) USDT transfer
      if (!to.startsWith("T")) {
        return res.status(400).json({ success: false, error: "TRON address must start with T" });
      }
      try {
        const tx = await axios.post("https://api.tatum.io/v3/tron/trc20/transaction", {
          to,
          amount: amountStr,
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
          amount: amountStr,
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
    } else {
      return res.status(400).json({ success: false, error: "Unsupported network. Use 'bep20' or 'trc20' only." });
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
  // req.body is a Buffer because of express.raw middleware
  const signature = req.headers["x-razorpay-signature"];
  const rawBody = req.body; // Buffer

  // Signature verification
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
    event = JSON.parse(rawBody.toString("utf8"));
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
    // Find user by wallet address (from)
    const user = await User.findOne({ walletAddress: from });
    if (!user || !user.encryptedPrivateKey) {
      return res.status(404).json({ success: false, error: "User or private key not found" });
    }
    // Decrypt private key
    const fromPrivateKey = decryptPrivateKey(user.encryptedPrivateKey);

    // Call Tatum TRC20 API
    const response = await sendUSDTviaTatum(fromPrivateKey, to, amount); // 🚀 Success here

    // ✅ Save to MongoDB transaction log
    await Transaction.create({
      type: "withdraw",
      amountInr: null,
      usdtAmount: amount,
      from: from,
      to: to,
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

// ===== KYC API Endpoint =====
app.post("/kyc/submit", async (req, res) => {
  try {
    const { userId, kycData, documents } = req.body;
    
    if (!userId || !kycData) {
      return res.status(400).json({ success: false, error: "Missing userId or kycData" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    user.kycData = kycData;
    if (documents) user.kycDocuments = documents;
    user.kycStatus = "pending";
    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    console.error("❌ KYC submission error:", err.message);
    res.status(500).json({ success: false, error: "Failed to submit KYC" });
  }
});

// ===== Update KYC Status (Admin) =====
app.post("/kyc/update-status", async (req, res) => {
  try {
    const { userId, status } = req.body;
    
    if (!userId || !status) {
      return res.status(400).json({ success: false, error: "User ID and status required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    user.kycStatus = status;
    if (status === "verified") {
      user.kycVerifiedAt = new Date();
    }
    
    await user.save();

    console.log(`✅ KYC status updated to ${status} for user ${userId}`);
    
    res.json({ 
      success: true, 
      message: `KYC ${status} successfully`,
      kycStatus: status
    });

  } catch (err) {
    console.error("❌ KYC status update error:", err.message);
    res.status(500).json({ success: false, error: "Failed to update KYC status" });
  }
});

// ===== Get KYC Status =====
app.get("/kyc/status/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({ 
      success: true, 
      kycStatus: user.kycStatus || "pending",
      kycData: user.kycData || {},
      kycSubmittedAt: user.kycSubmittedAt,
      kycVerifiedAt: user.kycVerifiedAt
    });

  } catch (err) {
    console.error("❌ KYC status fetch error:", err.message);
    res.status(500).json({ success: false, error: "Failed to fetch KYC status" });
  }
});

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "setupxpay_admin_secret";

// Admin login endpoint
app.post("/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ admin: true }, ADMIN_JWT_SECRET, { expiresIn: "2h" });
    return res.json({ success: true, token });
  }
  res.status(401).json({ success: false, error: "Invalid credentials" });
});

// Admin auth middleware
function adminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ success: false, error: "No token provided" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, ADMIN_JWT_SECRET);
    if (!decoded.admin) throw new Error();
    next();
  } catch {
    return res.status(401).json({ success: false, error: "Invalid or expired token" });
  }
}

// ===== Admin: Get All KYC Users (protected) =====
app.get("/kyc/all", adminAuth, async (req, res) => {
  try {
    const users = await User.find({ kycData: { $exists: true }, kycStatus: { $ne: null } });
    res.json({ success: true, users });
  } catch (err) {
    console.error("❌ KYC admin fetch error:", err.message);
    res.status(500).json({ success: false, error: "Failed to fetch KYC users" });
  }
});

// ===== Update KYC Status (protected) =====
app.post("/kyc/update-status", adminAuth, async (req, res) => {
  try {
    const { userId, status } = req.body;
    if (!userId || !status) {
      return res.status(400).json({ success: false, error: "User ID and status required" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    user.kycStatus = status;
    if (status === "verified") {
      user.kycVerifiedAt = new Date();
    }
    await user.save();
    res.json({ success: true, message: `KYC ${status} successfully`, kycStatus: status });
  } catch (err) {
    console.error("❌ KYC status update error:", err.message);
    res.status(500).json({ success: false, error: "Failed to update KYC status" });
  }
});

// ====== BANK DETAILS API ======
const userAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// Add new bank/UPI details (user)
app.post("/user/bank-details", userAuth, async (req, res) => {
  try {
    const { accountHolder, accountNumber, ifsc, upiId } = req.body;
    if (!accountHolder || (!accountNumber && !upiId)) {
      return res.status(400).json({ error: "Account holder and at least one payment method required" });
    }
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    // Add new entry (pending)
    user.bankDetails.push({ accountHolder, accountNumber, ifsc, upiId, status: "pending" });
    await user.save();
    res.json({ success: true, message: "Bank/UPI details added. Only your own account/UPI is allowed. Third party details will be rejected by admin.", bankDetails: user.bankDetails });
  } catch (err) {
    res.status(500).json({ error: "Failed to add bank details" });
  }
});

// Get all bank/UPI details for user
app.get("/user/bank-details", userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, bankDetails: user.bankDetails || [] });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bank details" });
  }
});

// ====== ADMIN: BANK DETAILS REVIEW ======
// List all users with at least one bank detail (for admin panel)
app.get("/admin/bank-details", adminAuth, async (req, res) => {
  try {
    const users = await User.find({ "bankDetails.0": { $exists: true } });
    // Only send relevant info
    const result = users.map(u => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      kycStatus: u.kycStatus,
      kycData: u.kycData,
      bankDetails: u.bankDetails
    }));
    res.json({ success: true, users: result });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users' bank details" });
  }
});

// Approve/reject a user's bank detail (by index)
app.post("/admin/approve-bank-details", adminAuth, async (req, res) => {
  try {
    const { userId, index, status, adminNote } = req.body;
    if (!userId || typeof index !== "number" || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "userId, index, and valid status required" });
    }
    const user = await User.findById(userId);
    if (!user || !user.bankDetails[index]) {
      return res.status(404).json({ error: "User or bank detail not found" });
    }
    user.bankDetails[index].status = status;
    user.bankDetails[index].adminNote = adminNote || "";
    await user.save();
    res.json({ success: true, message: `Bank detail ${status}`, bankDetails: user.bankDetails });
  } catch (err) {
    res.status(500).json({ error: "Failed to update bank detail status" });
  }
});

// ===== Start Server =====
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
