const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  walletAddress: String, // TRC20 address
  xpub: String,
  encryptedPrivateKey: String, // TRC20 encrypted private key
  bep20Address: String, // BEP20 address
  bep20EncryptedPrivateKey: String, // BEP20 encrypted private key
  bep20Mnemonic: String, // BEP20 mnemonic (optional, for backup)
  biometricEnabled: { type: Boolean, default: false },
  oneTimeSigned: { type: Boolean, default: false }, // Track if user has signed one-time permission
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
