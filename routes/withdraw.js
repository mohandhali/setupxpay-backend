const express = require("express");
const router = express.Router();
const Withdraw = require("../models/Withdraw");
const Transaction = require("../models/Transaction");

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
    // ✅ Also log to Transaction table
    await Transaction.create({
      type: "withdraw-inr",
      amountInr: amount,
      usdtAmount: "-",
      wallet: isUpiValid ? upiId : accountNumber,
      txId: "mocked_inr_payout_" + newWithdraw._id.toString(),
      rate: null,
      from: userId,
      fee: "0",
      network: isUpiValid ? "upi" : "bank",
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
