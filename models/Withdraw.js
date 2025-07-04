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
  status: String,
  type: String,
  method: String,
}, {
  timestamps: true // 👉 Adds createdAt and updatedAt automatically
});


module.exports = mongoose.model("Withdraw", withdrawSchema);
