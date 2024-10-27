const nodemailer = require("nodemailer");

const sendResetEmail = async (to, message) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail", // Use your email provider
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASS, // Your email password or app-specific password
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Password Reset",
    text: message,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendResetEmail;
