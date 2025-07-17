// routes/auth.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = "setupxpay_secret_key";

// ✅ Middleware to verify token and extract userId
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// ===== Encryption Utilities (copied from index.js) =====
const crypto = require("crypto");
const ENCRYPTION_KEY = "setupxpay_encryption_key_2024"; // For encrypting private keys

function encryptPrivateKey(privateKey) {
  // Create a fixed IV for simplicity (in production, use random IV)
  const iv = Buffer.alloc(16, 0); // 16 bytes of zeros
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32); // 32 bytes key
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  
  let encrypted = cipher.update(privateKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// ===== Signup =====
const axios = require("axios");
const bcrypt = require("bcryptjs");
const TATUM_API_KEY = "t-684c3a005ad68338f85afe22-1792ec2110654df39d604f3b";
const SENDER_PRIVATE_KEY = "ddc4d27b4b6eaf4c74088ac546b18e35674fa997c6e9d77d209f5fafa54b79ad";

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "All fields are required." });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(409).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // === Generate a single mnemonic (using Tron for BIP39 compatibility) ===
    const walletRes = await axios.get("https://api.tatum.io/v3/tron/wallet", {
      headers: { "x-api-key": TATUM_API_KEY },
    });
    const { mnemonic, xpub: trc20Xpub } = walletRes.data;

    // === TRC20 (Tron) Wallet from mnemonic ===
    const trc20AddressRes = await axios.get(`https://api.tatum.io/v3/tron/address/${trc20Xpub}/0`, {
      headers: { "x-api-key": TATUM_API_KEY },
    });
    const trc20Address = trc20AddressRes.data.address;
    const trc20PrivateKeyRes = await axios.post(
      "https://api.tatum.io/v3/tron/wallet/priv",
      { index: 0, mnemonic },
      { headers: { "x-api-key": TATUM_API_KEY } }
    );
    const trc20PrivateKey = trc20PrivateKeyRes.data.key;

    // === BEP20 (BSC) Wallet from same mnemonic ===
    // Get xpub for BSC from mnemonic
    const bscWalletRes = await axios.post(
      "https://api.tatum.io/v3/bsc/wallet",
      { mnemonic },
      { headers: { "x-api-key": TATUM_API_KEY } }
    );
    const bep20Xpub = bscWalletRes.data.xpub;
    const bep20AddressRes = await axios.get(`https://api.tatum.io/v3/bsc/address/${bep20Xpub}/0`, {
      headers: { "x-api-key": TATUM_API_KEY },
    });
    const bep20Address = bep20AddressRes.data.address;
    const bep20PrivateKeyRes = await axios.post(
      "https://api.tatum.io/v3/bsc/wallet/priv",
      { index: 0, mnemonic },
      { headers: { "x-api-key": TATUM_API_KEY } }
    );
    const bep20PrivateKey = bep20PrivateKeyRes.data.key;

    const user = new User({
      name,
      email,
      password: hashedPassword,
      walletAddress: trc20Address,
      xpub: trc20Xpub,
      encryptedPrivateKey: encryptPrivateKey(trc20PrivateKey), // TRC20
      bep20Address,
      bep20EncryptedPrivateKey: encryptPrivateKey(bep20PrivateKey),
      // No mnemonic stored in DB
    });

    await user.save();

    // Optional: send 1 TRX to new wallet from pool
    await axios.post(
      "https://api.tatum.io/v3/tron/transaction",
      {
        to: trc20Address,
        amount: "1",
        fromPrivateKey: SENDER_PRIVATE_KEY,
      },
      { headers: { "x-api-key": TATUM_API_KEY } }
    );

    res.json({
      message: "Signup successful",
      user: { id: user._id, name, email, walletAddress: trc20Address, bep20Address },
      wallet: {
        mnemonic,
        trc20: { address: trc20Address, xpub: trc20Xpub, privateKey: trc20PrivateKey },
        bep20: { address: bep20Address, xpub: bep20Xpub, privateKey: bep20PrivateKey },
      },
    });

  } catch (err) {
    console.error("❌ Signup error:", err.message);
    res.status(500).json({ error: "Signup failed" });
  }
});

// ===== Login =====
router.post("/login", async (req, res) => {
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

// ✅ GET /auth/me route
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;
