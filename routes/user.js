("use strict");
const router = require("express").Router();
const User = require("../model/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const Token = require("../model/Token");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { Resend } = require("resend");
const sendForgotPasswordEmail = require("../lib/forgotPassword");

// // --- MAILER CONFIG ---
// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   service: "gmail",
//   port: 587,
//   secure: false,
//   auth: {
//     user: process.env.MAIL,
//     pass: process.env.MAIL_PASS,
//   },
//   tls: {
//     rejectUnauthorized: false,
//   },
// });

// transporter.verify((err) => {
//   if (err) {
//     console.log("Mail Error:", err);
//   } else console.log("Mailer Ready");
// });

// --- RESEND CONFIG ---
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (email, subject, verifyUrl) => {
  console.log(email);
  try {
    const { data, error } = await resend.emails.send({
      from: "Paraplug <noreply@paraplug.store>",
      reply_to: "paraplugs@gmail.com",
      to: email,
      subject: subject,
      text: `
Hello,

Welcome to Paraplug! We're excited to have you on board.

To get started, please verify your email address by clicking the link below:
${verifyUrl}

This link will expire in 24 hours for security reasons.

If you didn't create an account with Paraplug, you can safely ignore this email.

Need help? Reply to this email and we'll be happy to assist you.

Best regards,
The Paraplug Team

---
Paraplug
© 2025 Paraplug, Inc. All Rights Reserved.
      `.trim(),
      html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="format-detection" content="telephone=no"/>
    <meta name="format-detection" content="date=no"/>
    <meta name="format-detection" content="address=no"/>
    <meta name="format-detection" content="email=no"/>
    <title>Verify Your Email - Paraplug</title>
    <style type="text/css">
        body {
            margin: 0;
            padding: 0;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        table {
            border-collapse: collapse;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }
        img {
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
            -ms-interpolation-mode: bicubic;
        }
        a {
            text-decoration: none;
        }
        .gradient-bg {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .hover-button:hover {
            opacity: 0.9 !important;
        }
        @media only screen and (max-width: 600px) {
            .wrapper {
                width: 100% !important;
            }
            .container {
                width: 100% !important;
            }
            .mobile-padding {
                padding-left: 20px !important;
                padding-right: 20px !important;
            }
            .mobile-text {
                font-size: 15px !important;
                line-height: 24px !important;
            }
            .mobile-title {
                font-size: 24px !important;
            }
        }
    </style>
    <!--[if mso]>
    <style type="text/css">
        .gradient-bg {
            background: #667eea !important;
        }
    </style>
    <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    
    <!-- Wrapper Table -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f5f5f5;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                
                <!-- Main Container Table -->
                <table role="presentation" class="wrapper" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    
                    <!-- Header with Gradient -->
                    <tr>
                        <td class="gradient-bg" align="center" style="padding: 40px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td align="center">
                                        <h1 style="margin: 0; font-size: 36px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">PARAPLUG</h1>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Spacer -->
                    <tr>
                        <td height="30" style="font-size: 0; line-height: 0;">&nbsp;</td>
                    </tr>
                    
                    <!-- Email Icon -->
                   <tr>
                        <td align="center" style="padding: 0 40px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td align="center" class="gradient-bg" width="80" height="80" style="border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                                        <span style="font-size: 36px; line-height: 80px; color: #ffffff;">✉</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Spacer -->
                    <tr>
                        <td height="30" style="font-size: 0; line-height: 0;">&nbsp;</td>
                    </tr>
                    
                    <!-- Title -->
                    <tr>
                        <td class="mobile-padding" align="center" style="padding: 0 40px;">
                            <h2 class="mobile-title" style="margin: 0; font-size: 28px; font-weight: 700; color: #1a1a1a; line-height: 1.3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">Verify Your Email Address</h2>
                        </td>
                    </tr>
                    
                    <!-- Spacer -->
                    <tr>
                        <td height="20" style="font-size: 0; line-height: 0;">&nbsp;</td>
                    </tr>
                    
                    <!-- Body Text -->
                    <tr>
                        <td class="mobile-padding" align="center" style="padding: 0 40px;">
                            <p class="mobile-text" style="margin: 0 0 15px 0; font-size: 16px; line-height: 26px; color: #666666; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                                Welcome to Paraplug! We're thrilled to have you join our community.
                            </p>
                        </td>
                    </tr>
                    
                    <tr>
                        <td class="mobile-padding" align="center" style="padding: 0 40px;">
                            <p class="mobile-text" style="margin: 0; font-size: 16px; line-height: 26px; color: #666666; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                                To complete your registration and secure your account, please verify your email address by clicking the button below.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Spacer -->
                    <tr>
                        <td height="30" style="font-size: 0; line-height: 0;">&nbsp;</td>
                    </tr>
                    
                    <!-- CTA Button -->
                    <tr>
                        <td align="center" style="padding: 0 40px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td class="gradient-bg hover-button" align="center" style="border-radius: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                                        <a href="${verifyUrl}" target="_blank" style="display: inline-block; padding: 16px 48px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                                            Verify Email Address
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Spacer -->
                    <tr>
                        <td height="30" style="font-size: 0; line-height: 0;">&nbsp;</td>
                    </tr>
                    
                    <!-- Security Notice -->
                    <tr>
                        <td class="mobile-padding" style="padding: 0 40px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8f9fa; border-left: 4px solid #667eea; border-radius: 4px;">
                                <tr>
                                    <td style="padding: 16px 20px;">
                                        <p style="margin: 0; font-size: 14px; line-height: 22px; color: #555555; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                                            <strong>🔒 Security Notice:</strong> This verification link will expire in 24 hours for your protection. If you didn't create an account with Paraplug, you can safely ignore this email.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Spacer -->
                    <tr>
                        <td height="30" style="font-size: 0; line-height: 0;">&nbsp;</td>
                    </tr>
                    
                    <!-- Alternative Link -->
                    <tr>
                        <td class="mobile-padding" style="padding: 0 40px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8f9fa; border-radius: 8px;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <p style="margin: 0 0 10px 0; font-size: 13px; line-height: 20px; color: #666666; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                                            <strong>Button not working?</strong> Copy and paste this link into your browser:
                                        </p>
                                        <p style="margin: 0; font-size: 12px; line-height: 18px; color: #667eea; text-align: center; word-break: break-all; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                                            <a href="${verifyUrl}" style="color: #667eea; text-decoration: none;">${verifyUrl}</a>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Spacer -->
                    <tr>
                        <td height="30" style="font-size: 0; line-height: 0;">&nbsp;</td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #fafafa; padding: 30px 40px; border-radius: 0 0 12px 12px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td align="center">
                                        <p style="margin: 0 0 15px 0; font-size: 13px; line-height: 20px; color: #999999; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                                            Need help? Simply reply to this email and our support team will assist you.
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding: 10px 0;">
                                        <p style="margin: 0; font-size: 13px; line-height: 20px; color: #999999; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                                            <a href="#" style="color: #999999; text-decoration: none;">Twitter</a> • 
                                            <a href="#" style="color: #999999; text-decoration: none;">Instagram</a> • 
                                            <a href="#" style="color: #999999; text-decoration: none;">Support</a>
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-top: 10px;">
                                        <p style="margin: 0; font-size: 12px; line-height: 18px; color: #bbbbbb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                                            © 2025 Paraplug, Inc. All Rights Reserved.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                </table>
                
            </td>
        </tr>
    </table>
    
</body>
</html>`,
    });

    if (error) {
      console.log("Email Error:", error);
      return false;
    }

    console.log("Email sent successfully:", data);
    return true;
  } catch (error) {
    console.log("Email sending failed:", error);
    return false;
  }
};

// --- REGISTER NEW USER ---
router.post("/", async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser)
      return res.status(400).json({ error: "User already exists" });

    const newUser = new User({
      ref: req.body.ref || "",
      fullName: req.body.fullName,
      email: req.body.email,
      username: req.body.username,
      password: CryptoJS.AES.encrypt(
        req.body.password,
        process.env.PASS_CRYPTO
      ).toString(),
      image: req.body.image,
    });

    const savedUser = await newUser.save();

    // Handle referral relationship
    if (req.body.ref) {
      const referrer = await User.findOne({ referralCode: req.body.ref });
      if (referrer) {
        referrer.referredUsers.push(savedUser._id);
        await referrer.save();
      }
    }

    // Create verification token
    const token = await new Token({
      userId: savedUser._id,
      token: crypto.randomBytes(32).toString("hex"),
    }).save();

    const verifyUrl = `${process.env.DOMAIN}/confirm/${savedUser._id}/${token.token}`;
    await sendEmail(savedUser.email, "Verify Email", verifyUrl);
    res.status(200).json({
      message:
        "A confirmation email has been sent. Please verify your account.",
      user: savedUser,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- LOGIN USER ---
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user)
      return res.status(400).json({ error: "Wrong email or password" });

    const decryptedPass = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASS_CRYPTO
    ).toString(CryptoJS.enc.Utf8);

    if (decryptedPass !== req.body.password)
      return res.status(400).json({ error: "Wrong email or password" });

    if (!user.isVerified) {
      let token = await Token.findOne({ userId: user._id });
      if (!token) {
        token = await new Token({
          userId: user._id,
          token: crypto.randomBytes(32).toString("hex"),
        }).save();
        const verifyUrl = `${process.env.DOMAIN}/confirm/${user._id}/${token.token}`;
        await sendEmail(user.email, "Verify Email", verifyUrl);
      }
      return res.status(403).json({
        message: "Verification email sent. Please verify your account.",
      });
    }

    const accessToken = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
        email: user.email,
        firstname: user?.fullName,
        lastname: user?.username,
      },
      process.env.JWTPASS,
      { expiresIn: "3d" }
    );

    const { password, ...others } = user._doc;
    res.status(200).json({
      message: "Login successful",
      ...others,
      accessToken,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- VERIFY USER ---
router.get("/:id/:token", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(400).json({ message: "Invalid link" });

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token)
      return res.status(400).json({ message: "Invalid or expired token" });

    user.isVerified = true;
    await user.save();
    await token.deleteOne();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- UPDATE USER ---
router.put("/:id", async (req, res) => {
  if (req.body.password) {
    req.body.password = CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_CRYPTO
    ).toString();
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json({
      message: "Profile updated successfully",
      updatedUser,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- GET SINGLE USER ---
router.get("/find/details/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("favourites");
    if (!user) return res.status(404).json({ message: "User not found" });
    const { password, ...others } = user._doc;
    res.status(200).json({
      message: "User found successfully",
      user: others,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- DELETE USER ---
router.delete("/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- GET ALL USERS ---
router.get("/", async (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const page = req.query.page ? Number(req.query.page) : 1;

    const skip = (page - 1) * limit;

    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      message: "Users fetched successfully",
      users,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- GET USER REFERRALS ---
router.get("/find/ref/:id", async (req, res) => {
  try {
    const referrals = await User.find({ ref: req.params.id });
    res.status(200).json({
      message: "User referrals fetched successfully",
      referrals,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- REQUEST PASSWORD RESET ---
router.post("/reset-password-request", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Delete previous reset token if exists
    let token = await Token.findOne({ userId: user._id });
    if (token) await token.deleteOne();

    // Create new token
    const resetToken = crypto.randomBytes(32).toString("hex");
    await new Token({
      userId: user._id,
      token: resetToken,
    }).save();

    // Reset link
    const resetUrl = `${process.env.DOMAIN}/reset-password/${user._id}/${resetToken}`;

    await sendForgotPasswordEmail(user.email, resetUrl);
    res.status(200).json({
      message: "Password reset email sent. Check your inbox.",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- RESET PASSWORD ---
router.post("/reset-password/:id/:token", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(400).json({ message: "Invalid link" });

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token)
      return res.status(400).json({ message: "Invalid or expired token" });

    // Encrypt new password
    user.password = CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_CRYPTO
    ).toString();

    await user.save();
    await token.deleteOne();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
