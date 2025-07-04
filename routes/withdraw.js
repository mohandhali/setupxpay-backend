const express = require("express");
const router = express.Router();
const Withdraw = require("../models/Withdraw");

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
