const Loan = require("../models/Loan"); // Make sure you have a Loan model
const User = require("../models/User"); // Make sure you have a User model
const sendSMS = require("../utils/smsService");
const sendEmail = require("../utils/emailService");

// Approve a loan and notify user
const approveLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.loanId).populate("user");
    if (!loan) return res.status(404).json({ msg: "Loan not found" });

    loan.status = "approved";
    await loan.save();

    const message = `Your loan of R${loan.amount} has been approved.`;
    await sendSMS(loan.user.phone, message);
    await sendEmail(loan.user.email, "Loan Approved", message);

    res.json({ msg: "Loan approved & user notified" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// Make a repayment and notify user
const makeRepayment = async (req, res) => {
  const { amountPaid } = req.body;
  try {
    const loan = await Loan.findById(req.params.loanId).populate("user");
    if (!loan) return res.status(404).json({ msg: "Loan not found" });

    loan.repayments.push({ amountPaid });
    await loan.save();

    const remainingBalance = loan.amount - loan.repayments.reduce((sum, r) => sum + r.amountPaid, 0);

    const message = `You have made a payment of R${amountPaid}. Remaining balance: R${remainingBalance}`;
    await sendSMS(loan.user.phone, message);
    await sendEmail(loan.user.email, "Loan Repayment", message);

    res.json({ msg: "Repayment successful", remainingBalance });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

module.exports = { approveLoan, makeRepayment };
