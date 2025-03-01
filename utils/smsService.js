require("dotenv").config();
const twilio = require("twilio");

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const sendSMS = async (phone, message) => {
  try {
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to: phone,
    });
    console.log("SMS sent to", phone);
  } catch (err) {
    console.error("SMS Error:", err.message);
  }
};

module.exports = sendSMS;
