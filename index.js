const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// In-memory storage for users and OTPs
let users = {};       // { email: { password } }
let otpStore = {};    // { email: otp }

// Configure nodemailer (use your Gmail or any SMTP)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'bhargav838281@gmail.com', // replace with your Gmail
    pass: '@Gumutari1'     // create App Password in Gmail settings
  }
});

// Helper to generate 6-digit OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP
app.post('/send-otp', (req, res) => {
  const { email, password } = req.body;
  if(!email || !password) return res.json({ success: false, message: "Email and password required" });

  const otp = generateOtp();
  otpStore[email] = otp;
  users[email] = { password }; // store password temporarily

  const mailOptions = {
    from: 'YOUR_EMAIL@gmail.com',
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP is: ${otp}`
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if(err) {
      console.error(err);
      return res.json({ success: false, message: "Failed to send OTP" });
    } else {
      return res.json({ success: true });
    }
  });
});

// Verify OTP
app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if(!email || !otp) return res.json({ success: false, message: "Email and OTP required" });

  if(otpStore[email] && otpStore[email] === otp){
    delete otpStore[email]; // OTP used
    return res.json({ success: true });
  } else {
    return res.json({ success: false, message: "Invalid OTP" });
  }
});

// Login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if(!email || !password) return res.json({ success: false, message: "Email and password required" });

  if(users[email] && users[email].password === password){
    return res.json({ success: true });
  } else {
    return res.json({ success: false, message: "Invalid credentials" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});