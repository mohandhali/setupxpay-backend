const express = require("express");
const router = express.Router();
const Withdraw = require("../models/Withdraw");

router.post("/inr-mock", async (req, res) => {
  try {
    const { userId, amount, bankDetails } = req.body;

    if (!userId || !amount || !bankDetails) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newWithdraw = new Withdraw({
      userId,
      amount,
      bankDetails,
      status: "mocked_payout_success",
      type: "INR",
      method: "RazorpayX-mock",
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
