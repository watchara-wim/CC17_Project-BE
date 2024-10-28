const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
   service: "gmail",
   host: "smtp.gmail.com",
   port: 465,
   secure: true,
   auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
   },
});

const sendVerificationEmail = (email, token) => {
   const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "(Cafe In) ยืนยันอีเมล",
      text: `โปรดคลิกที่ลิงค: ${process.env.CLIENT_URL}/verify-email/${token} เพื่อทำการยืนยันอีเมล 
      *โปรดยืนยันอีเมลภายใน 7 วัน


      ขอแสดงขอบคุณเป็นอย่างสูง
      ร้านคาเฟอิน
      `,
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
