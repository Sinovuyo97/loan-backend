const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "your_email@gmail.com",
    pass: "your_email_password",
  },
});

const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: '"Loan App" <your_email@gmail.com>',
      to,
      subject,
      text,
    });
    console.log("Email sent to", to);
  } catch (err) {
    console.error("Email Error:", err.message);
  }
};

module.exports = sendEmail;
