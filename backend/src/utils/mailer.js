import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const sendEmail = async ({ email, otp, name, type, userId }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SENDER_MAIL,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"Muzox Team" <${process.env.SENDER_MAIL}>`,
      to: email,
      subject: `Your OTP Code for ${type}`,
      html: `
       <div style="background: #000; 
    padding: 50px 0; 
    font-family: 'Montserrat', sans-serif;">

<div style="max-width: 600px; 
        margin: auto; 
        background: rgba(15, 15, 15, 0.95); 
        padding: 30px; 
        border-radius: 12px; 
        text-align: center; 
        color: #fff;
        box-shadow: 0 0 15px rgba(138, 43, 226, 0.2);">

<h1 style="color: #fff; 
           font-size: 28px; 
           font-weight: bold;">
    Welcome to <span style="color: #7F00FF;">Muzox</span>, ${name}! 🎶
</h1>

<p style="font-size: 16px; 
          line-height: 1.5; 
          color: #aaa;">
    Your gateway to a premium music experience starts now.  
    Verify your email using the OTP below:
</p>

<div style="display: inline-block; 
            background: rgba(255, 255, 255, 0.1); 
            padding: 15px 30px; 
            border-radius: 8px;
            backdrop-filter: blur(10px);
            font-size: 24px; 
            font-weight: bold; 
            color: #8A2BE2; 
            letter-spacing: 2px;
            box-shadow: 0 0 10px rgba(138, 43, 226, 0.6);">
    ${otp}
</div>

<p style="margin-top: 20px; font-size: 16px; color: #bbb;">
    Click the button below to verify your email:
</p>

<a href="http://localhost:3000/api/user/verifyUser/${userId}" 
   style="display: inline-block; 
          background: linear-gradient(90deg, #7F00FF, #E100FF); 
          color: #fff; 
          text-decoration: none; 
          padding: 12px 30px; 
          border-radius: 6px; 
          font-size: 18px; 
          font-weight: bold; 
          box-shadow: 0 4px 10px rgba(127, 0, 255, 0.5);">
   Verify Email
</a>

<p style="margin-top: 20px; font-size: 14px; color: #bbb;">
    This OTP is valid for <strong>1 hour</strong>.  
    If you didn’t request this, please ignore this email.
</p>

<hr style="border: 0.5px solid #333; margin: 20px 0;">

<p style="font-size: 14px; color: #777;">
    Get ready for an <strong>ultimate</strong> music experience with <strong>Muzox</strong>! 🎧
</p>

<p style="font-size: 14px; color: #777;">
    Cheers, <br><strong>Muzox Team</strong>
</p>
</div>
</div>
      `,
    };

    const mailResponse = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", mailResponse.accepted);
    return mailResponse;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Email could not be sent. Please try again later.");
  }
};
