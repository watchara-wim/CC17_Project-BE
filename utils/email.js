const nodemailer = require("nodemailer");

const sendVerificationEmail = (email, token) => {
   const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
         user: process.env.EMAIL,
         pass: process.env.EMAIL_PASSWORD,
      },
   });

   const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "(Cafe In) ยืนยันอีเมล",
      text: `โปรดคลิกที่ลิงค์ เพื่อทำการยืนยันอีเมล: ${process.env.CLIENT_URL}/verify-email/${token}`,
   };

   transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
         console.error("Error sending email: ", error);
      } else {
         console.log("Verification email sent: ", info.response);
      }
   });
};

const sendResetPasswordEmail = (email, token) => {
   const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
         user: process.env.EMAIL,
         pass: process.env.EMAIL_PASSWORD,
      },
   });

   const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "(Cafe In) รีเซ็ตรหัสผ่าน",
      text: `โปรดคลิกที่ลิงค์ เพื่อทำการตั้งรหัสผ่านใหม่: ${process.env.CLIENT_URL}/reset-password/${token}`,
   };

   transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
         console.error("Error sending email: ", error);
      } else {
         console.log("Password reset email sent: ", info.response);
      }
   });
};

module.exports = { sendVerificationEmail, sendResetPasswordEmail };
