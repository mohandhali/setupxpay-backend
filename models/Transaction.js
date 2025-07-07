const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  type: { type: String, required: true },         // deposit / withdraw / withdraw-inr
  amountInr: Number,
  usdtAmount: String,
  wallet: String,
  txId: String,
  rate: Number,
  from: String,                                   // sender wallet or user ID
  fee: String,
  network: String,                                // trc20 / bep20 / INR-mock
  bankDetails: Object,                            // ✅ Optional for INR withdrawals
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Transaction", transactionSchema);
