const { Resend } = require("resend");

// --- RESEND CONFIG ---
const resend = new Resend(process.env.RESEND_API_KEY);

const sendForgotPasswordEmail = async (email, resetUrl) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Paraplug <noreply@paraplug.store>",
      reply_to: "paraplugs@gmail.com",
      to: email,
      subject: "Reset Your Password – Paraplug",
      text: `
Hello,

We received a request to reset your password for your Paraplug account.

Click the link below to choose a new password:
${resetUrl}

If you did not request a password reset, you can safely ignore this email.

This link will expire soon for security reasons.

—
Paraplug © 2025 Paraplug, Inc. All Rights Reserved.
      `.trim(),
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Password Reset</title>
<style>
  /* Same responsive + styling rules as your original email */
  body {font-family: Arial, sans-serif;}
</style>
</head>

<body style="background:#FAFAFA; margin:0; padding:0;">

<table width="100%" bgcolor="#FAFAFA" style="padding:0; margin:0;">
<tr><td align="center">

<table width="600" bgcolor="#FFFFFF" cellpadding="0" cellspacing="0" style="margin-top:30px;">
<tr>
<td align="center" style="padding:30px 20px;">
  <img src="https://fcfkrrt.stripocdn.email/content/guids/CABINET_637b3dc440c27613cc4d4ce356771851228bc9a36033a94638af596713983095/images/headed_para.PNG" width="200" alt="Paraplug"/>
</td>
</tr>

<tr>
<td align="center" style="padding:10px;">
  <img src="https://cdn-icons-png.flaticon.com/512/3064/3064197.png" width="80" style="display:block;" />
</td>
</tr>

<tr>
<td align="center">
  <h1 style="font-size:32px; color:#333; margin:0;">Reset Your Password</h1>
</td>
</tr>

<tr>
<td align="center" style="padding:15px 40px; color:#555; font-size:16px;">
  We received a request to reset the password associated with your account.
  <br/><br/>
  Click the button below to set a new password.
</td>
</tr>

<tr>
<td align="center" style="padding:20px;">
  <a href="${resetUrl}"
    style="
      background:#0084d6;
      color:#fff;
      padding:12px 30px;
      font-size:18px;
      text-decoration:none;
      border-radius:6px;
      display:inline-block;
    ">
    RESET PASSWORD
  </a>
</td>
</tr>

<tr>
<td align="center" style="padding:10px 40px; color:#555; font-size:14px;">
  If you did not request this, you can safely ignore this email.
</td>
</tr>

<tr>
<td align="center" style="padding:5px 40px; color:#777; font-size:12px;">
  For your security, this link will expire shortly.
</td>
</tr>

<tr>
<td align="center" style="padding:25px;">
  <p style="font-size:12px;color:#888;">Paraplug © 2025 Paraplug, Inc. All Rights Reserved.</p>
</td>
</tr>

</table>

</td></tr>
</table>

</body>
</html>
`,
    });

    if (error) {
      console.log("Email Error:", error);
      return false;
    }

    console.log("Password reset email sent:", data);
    return true;
  } catch (error) {
    console.log("Failed to send reset email:", error);
    return false;
  }
};

module.exports = sendForgotPasswordEmail;
