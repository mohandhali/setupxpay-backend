const express = require("express");
const router = express.Router();
const axios = require("axios");
const crypto = require("crypto");
const Withdraw = require("../models/Withdraw");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

const SETUPX_WALLET = "TMxbFWUuebqshwm8e5E5WVzJXnDmdBZtXb"; // ✅ Your pool wallet
const ENCRYPTION_KEY = "setupxpay_encryption_key_2024"; // For decrypting private keys

// Decryption function
function decryptPrivateKey(encryptedPrivateKey) {
  const iv = Buffer.alloc(16, 0);
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  
  let decrypted = decipher.update(encryptedPrivateKey, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

router.post("/inr-mock", async (req, res) => {
  try {
    console.log("BODY:", req.body);
    const { userId, amount, bankDetails } = req.body;

    if (!userId || !amount || !bankDetails) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const {
      accountHolder = "",
      accountNumber = "",
      ifsc = "",
      upiId = "",
    } = bankDetails;

    const isBankValid = accountHolder && accountNumber && ifsc;
    const isUpiValid = upiId.trim() !== "";

    if (!isBankValid && !isUpiValid) {
      return res.status(400).json({
        message: "Please provide either UPI ID or complete bank details.",
      });
    }

    const user = await User.findById(userId);

if (!user || !user.walletAddress) {
  console.log("❌ User or wallet missing:", user);
  return res.status(404).json({ message: "User or wallet not found" });
}

 console.log("✅ INR payout: user found", user.walletAddress);

    const rate = 95;
    const platformFee = 1;
    const trcFee = 5;
    // Use network from request body
    const network = req.body.network || 'trc20';
    const networkFee = network === 'bep20' ? 1 : 5;
    const netInr = parseFloat(amount) + platformFee + networkFee;
    let usdtAmount = netInr / rate;
    usdtAmount = Math.ceil(usdtAmount * 100) / 100; // round up to 2 decimals
    usdtAmount = usdtAmount.toFixed(2);

    console.log("✅ Calculated USDT amount:", usdtAmount);

    // Note: USDT is already sent in the main flow, this is just for INR payout
    console.log("💰 Mock INR payout to:", upiId || `${accountHolder} (${accountNumber})`);

    // Simulate INR payout (in real implementation, this would be Razorpay/UPI)
    const mockTxId = `mock_inr_${Date.now()}`;
    console.log("✅ Mock INR payout successful. TxID:", mockTxId);

    const newWithdraw = new Withdraw({
      userId,
      amount,
      bankDetails,
      status: "mocked_payout_success",
      type: "INR",
      method: isUpiValid ? "UPI-mock" : "Bank-mock",
      createdAt: new Date(),
    });

    try {
      await newWithdraw.save();
      console.log("✅ Withdraw saved to DB");
    } catch (err) {
      console.error("❌ Error saving Withdraw:", err.message);
    }

    try {
      await Transaction.create({
        type: "withdraw-inr",
        amountInr: amount,
        usdtAmount: usdtAmount,
        wallet: user.walletAddress,
        txId: mockTxId,
        rate,
        from: userId,
        fee: `${platformFee} + ${networkFee}`,
        network: network, // use the selected network
        bankDetails,
      });
      console.log("✅ Transaction saved to DB");
    } catch (err) {
      console.error("❌ Error saving Transaction:", err.message);
    }

    res.json({
      success: true,
      message: "USDT transferred & mock INR payout successful",
    });
  } catch (err) {
    console.error("❌ Sell USDT Mock Error:", err.response?.data || err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


module.exports = router;
