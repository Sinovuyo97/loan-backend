const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const loanRoutes = require("./routes/loanRoutes");

dotenv.config();
const app = express();
app.use(express.json());

// 🔹 Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/loans", loanRoutes);

// 🔹 MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Database connected"))
  .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
