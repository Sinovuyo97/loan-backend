const mongoose = require("mongoose");

const LoanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  duration: { type: Number, required: true }, // in months
  status: { type: String, enum: ["pending", "approved", "rejected", "paid"], default: "pending" },
  repayments: [
    {
      amountPaid: { type: Number, required: true },
      date: { type: Date, default: Date.now }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

LoanSchema.methods.getOutstandingBalance = function () {
  const totalPaid = this.repayments.reduce((sum, r) => sum + r.amountPaid, 0);
  return this.amount - totalPaid;
};

module.exports = mongoose.model("Loan", LoanSchema);
