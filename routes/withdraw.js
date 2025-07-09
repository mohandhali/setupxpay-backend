const express = require("express");
const router = express.Router();
const Withdraw = require("../models/Withdraw");
const Transaction = require("../models/Transaction");
const User = require("../models/User"); // ✅ Add this

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

    // ✅ Fetch wallet address from User
    const user = await User.findById(userId);
    if (!user || !user.walletAddress) {
      return res.status(404).json({ message: "User or wallet not found" });
    }

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

    // ✅ Save correct wallet address to transaction
    await Transaction.create({
      type: "withdraw-inr",
      amountInr: amount,
      usdtAmount: "-",
      wallet: user.walletAddress, // ✅ Correct wallet saved here
      txId: "mocked_inr_payout_" + newWithdraw._id.toString(),
      rate: null,
      from: userId,
      fee: "0",
      network: isUpiValid ? "upi" : "bank",
      bankDetails,
    });

    res.json({
      success: true,
      message: "Mock INR payout successful",
      transactionId: newWithdraw._id,
    });
  } catch (err) {
    console.error("Mock RazorpayX Payout Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
