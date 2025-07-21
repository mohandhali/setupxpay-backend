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
  biometricEnabled: { type: Boolean, default: false },
  oneTimeSigned: { type: Boolean, default: false }, // Track if user has signed one-time permission
  
  // KYC Fields
  kycStatus: { type: String, enum: ["pending", "verified", "rejected"], default: "pending" },
  kycData: {
    fullName: String,
    dateOfBirth: String,
    panNumber: String,
    aadharNumber: String,
    address: String,
    city: String,
    state: String,
    country: { type: String, default: "India" },
    pincode: String
  },
  kycDocuments: {
    panCard: String,
    aadharFront: String,
    aadharBack: String
  },
  kycSubmittedAt: Date,
  kycVerifiedAt: Date,
  
  bankDetails: [
    {
      accountHolder: String,
      accountNumber: String,
      ifsc: String,
      upiId: String,
      status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
      adminNote: String,
      addedAt: { type: Date, default: Date.now }
    }
  ],
  
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
