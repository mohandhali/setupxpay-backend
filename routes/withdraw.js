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

    const user = await User.findById(userId);

if (!user || !user.walletAddress) {
  console.log("❌ User or wallet missing:", user);
  return res.status(404).json({ message: "User or wallet not found" });
}


    const rate = 95;
    const platformFee = 1;
    const trcFee = 5;
    const netInr = parseFloat(amount) - platformFee - trcFee;
    const usdtAmount = (netInr / rate).toFixed(2);

    console.log("💰 Sending", usdtAmount, "USDT to SetupX wallet");

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
        txId: tatumRes.data.txId,
        rate,
        from: userId,
        fee: "1 + 5",
        network: isUpiValid ? "upi" : "bank",
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
