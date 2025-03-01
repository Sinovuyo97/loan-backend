const express = require("express");
const { check, validationResult } = require("express-validator");
const Loan = require("../models/Loan");
const authMiddleware = require("../middleware/authMiddleware");
const sendSMS = require("../utils/smsService");

const router = express.Router();

// 🔹 Apply for a loan
router.post(
  "/apply",
  [
    authMiddleware, // Protect route
    check("amount", "Loan amount is required").isNumeric(),
    check("duration", "Duration is required and must be a number").isNumeric(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { amount, duration } = req.body;

    try {
      const loan = new Loan({
        user: req.user.userId,
        amount,
        duration,
      });

      await loan.save();
      res.status(201).json(loan);

      // Send SMS notification
      const message = `Your loan application for ${amount} has been successfully submitted.`;
      const recipientPhone = "+27655853178"; // Replace with the actual recipient's phone number

      sendSMS(recipientPhone, message);
    } catch (err) {
      res.status(500).send("Server Error");
    }
  }
);

// 🔹 Get user loans
router.get("/my-loans", authMiddleware, async (req, res) => {
  try {
    const loans = await Loan.find({ user: req.user.userId });
    res.json(loans);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// 🔹 Admin: Get all loans
router.get("/all", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ msg: "Access denied" });

    const loans = await Loan.find().populate("user", "fullName email");
    res.json(loans);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// 🔹 Admin: Approve/Reject a loan
router.put("/:loanId/status", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ msg: "Access denied" });

    const loan = await Loan.findById(req.params.loanId);
    if (!loan) return res.status(404).json({ msg: "Loan not found" });

    loan.status = req.body.status;
    await loan.save();

    res.json(loan);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});
// 🔹 Make a repayment
router.post("/:loanId/repay", authMiddleware, async (req, res) => {
  const { amountPaid } = req.body;

  try {
    const loan = await Loan.findById(req.params.loanId);
    if (!loan) return res.status(404).json({ msg: "Loan not found" });
    if (loan.user.toString() !== req.user.userId)
      return res.status(403).json({ msg: "Access denied" });

    // Add repayment record
    loan.repayments.push({ amountPaid });
    await loan.save();

    if (loan.getOutstandingBalance() <= 0) {
      loan.status = "paid";
      await loan.save();

      // Send SMS notification
      const message = `Congratulations! Your loan with ID ${loan.id} has been fully paid.`;
      const recipientPhone = "+27655853178"; // Replace with the actual recipient's phone number

      sendSMS(recipientPhone, message);
    }

    res.json({
      msg: "Repayment successful",
      remainingBalance: loan.getOutstandingBalance(),
    });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// 🔹 Get loan details with repayment history
router.get("/:loanId", authMiddleware, async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.loanId);
    if (!loan) return res.status(404).json({ msg: "Loan not found" });
    if (loan.user.toString() !== req.user.userId)
      return res.status(403).json({ msg: "Access denied" });

    res.json({
      loan,
      outstandingBalance: loan.getOutstandingBalance(),
    });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

module.exports = router;
