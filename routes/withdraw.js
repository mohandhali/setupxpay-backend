const express = require("express");
const router = express.Router();
const axios = require("axios");
const Withdraw = require("../models/Withdraw");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

const SETUPX_WALLET = "TMxbFWUuebqshwm8e5E5WVzJXnDmdBZtXb"; // ✅ Your pool wallet

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

    // ✅ Fetch user
    const user = await User.findById(userId);
    if (!user || !user.walletAddress || !user.privateKey) {
      return res.status(404).json({ message: "User or wallet/private key not found" });
    }

    // ✅ Calculate USDT from INR minus fees
    const rate = 95; // you can fetch from live endpoint
    const platformFee = 1;
    const trcFee = 5;
    const netInr = parseFloat(amount) - platformFee - trcFee;
    const usdtAmount = (netInr / rate).toFixed(2);

    // ✅ Send USDT from user to SetupX
    const tatumRes = await axios.post(
      "https://api-eu1.tatum.io/v3/tron/transaction",
      {
        fromPrivateKey: user.privateKey,
        to: SETUPX_WALLET,
        amount: usdtAmount,
      },
      {
        headers: {
          "x-api-key": process.env.TATUM_API_KEY,
        },
      }
    );

    console.log("✅ USDT sent. Tatum TxID:", tatumRes.data.txId);

    // ✅ Record mock INR withdrawal
    const newWithdraw = new Withdraw({
      userId,
      amount,
      bankDetails,
      status: "mocked_payout_success",
      type: "INR",
      method: isUpiValid ? "UPI-mock" : "Bank-mock",
      createdAt: new Date(),
    });

    await newWithdraw.save();

    // ✅ Save transaction
    await Transaction.create({
      type: "withdraw-inr",
      amountInr: amount,
      usdtAmount: usdtAmount,
      wallet: user.walletAddress,
      txId: tatumRes.data.txId,
      rate,
      from: userId,
      fee: "1 + 5", // platform + TRC20 fee
      network: isUpiValid ? "upi" : "bank",
      bankDetails,
    });

    res.json({
      success: true,
      message: "USDT transferred & mock INR payout successful",
      transactionId: newWithdraw._id,
    });
  } catch (err) {
    console.error("❌ Sell USDT Mock Error:", err.response?.data || err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
