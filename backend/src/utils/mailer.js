import nodemailer from "nodemailer";
import User from "../models/user.models.js";
import dotenv from 'dotenv';
dotenv.config();
export const sendEmail=async({
    email,
    otp,
    name,
    type,
    userId
})=>{
 try {
    const transporter = nodemailer.createTransport({
         service: "gmail",
         auth: {
           user: process.env.SENDER_MAIL,
           pass: process.env.SMTP_PASS,
         },
       });
       const mailOptions = {
         from: process.env.SENDER_MAIL,
         to: email,
         subject: `Your OTP Code for ${type}`,
         html: `
           <div style="font-family: Arial, sans-serif; line-height: 1.6;">
             <h2>Hello, ${name}</h2>
             <p>Thank you for registering. Your OTP code is below:</p>
             <h1>${otp}</h1>
             <h2>Visit Here to fill the OTP http://localhost:3000/api/user/verifyUser/${userId}</h2>
             <p>This OTP is valid for 1 hour.</p>
             <p>If you did not request this, please ignore this email.</p>
             <p>Thanks,</p>
             <p>Your Company Team</p>
           </div>
         `,
       };
       const mailResponse = await transporter.sendMail(mailOptions);
       console.log(mailResponse);
       return mailResponse;
 } catch (error) {
    console.log(error);
 }
}