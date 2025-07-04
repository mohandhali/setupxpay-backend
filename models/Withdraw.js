const mongoose = require("mongoose");

const withdrawSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  amount: Number,
  bankDetails: {
    accountHolder: String,
    accountNumber: String,
    ifsc: String,
    upiId: String,
  },
  status: String, // mocked_payout_success / pending / failed
  type: String,   // INR / USDT
  method: String, // RazorpayX-mock / Tatum
  createdAt: Date,
});

module.exports = mongoose.model("Withdraw", withdrawSchema);
