const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  walletAddress: String,
  xpub: String,
  encryptedPrivateKey: String, // Encrypted private key
  biometricEnabled: { type: Boolean, default: false },
  oneTimeSigned: { type: Boolean, default: false }, // Track if user has signed one-time permission
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
