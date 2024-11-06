const db = require("../models");
const { Op } = require("sequelize"); // Sequelize operator
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {
   sendVerificationEmail,
   sendResetPasswordEmail,
} = require("../utils/email");

// ANCHOR - Register
const registerUser = async (req, res) => {
   const { username, password, name, email, birth_date, tel } = req.body;
   const targetUser = await db.Users.findOne({ where: { username } });
   const targetEmail = await db.User_Informations.findOne({ where: { email } });

   if (targetUser && targetEmail) {
      return res
         .status(400)
         .send({ message: "ไม่สามารถใช้ Username และ Email นี้ได้" });
   } else if (targetUser) {
      return res.status(400).send({ message: "Username นี้ถูกใช้ไปแล้ว" });
   } else if (targetEmail) {
      return res.status(400).send({ message: "Email นี้ถูกใช้ไปแล้ว" });
   }

   const salt = bcryptjs.genSaltSync(12);
   const hashedPassword = bcryptjs.hashSync(password, salt);
   const verificationToken = crypto.randomBytes(32).toString("hex");

   const newUser = await db.Users.create({
      username,
      password: hashedPassword,
      is_verified: false, // ต้องยืนยันอีเมลก่อนจึงจะเปลี่ยนเป็น true
      user_role: process.env.ROLE_MEMBER,
   });

   await db.User_Informations.create({
      user_id: newUser.user_id,
      name,
      email,
      tel,
      birth_date,
      verification_token: verificationToken,
      verification_token_expires: new Date(
         Date.now() + 7 * 24 * 60 * 60 * 1000
      ),
   });

   // ส่ง link ยืนยันไปที่ email ที่สมัคร
   sendVerificationEmail(email, verificationToken);

   return res.status(201).send({
      message: "โปรดทำการยืนยันตัวตนผ่านอีเมลที่ท่านได้ลงทะเบียนไว้ภายใน 7 วัน",
   });
};

// ANCHOR - Login
const loginUser = async (req, res) => {
   const { username, password } = req.body;
   const targetUser = await db.Users.findOne({ where: { username } });

   if (!targetUser) {
      return res
         .status(400)
         .send({ message: "Username หรือ password ไม่ถูกต้อง" });
   }

   const isCorrectPassword = bcryptjs.compareSync(
      password,
      targetUser.password
   );

   if (!isCorrectPassword) {
      return res
         .status(400)
         .send({ message: "Username หรือ password ไม่ถูกต้อง" });
   }

   if (isCorrectPassword && !targetUser.is_verified) {
      return res
         .status(403)
         .send({ message: "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ" });
   }

   const userInfo = await db.User_Informations.findOne({
      where: { user_id: targetUser.user_id },
   });

   if (!userInfo) {
      return res.status(404).send({ message: "ไม่พบข้อมูล" });
   }

   const payload = {
      name: userInfo.name,
      id: userInfo.info_id,
   };
   const token = jwt.sign(payload, process.env.SECRET, {
      expiresIn:
         targetUser.user_role === process.env.ROLE_ADMIN
            ? 16 * 60 * 60 // admin - 16 ชม.
            : 7 * 24 * 60 * 60, // member - 7 วัน
   });

   return res.status(200).send({
      token,
      access: targetUser.user_role,
      message: "เข้าสู่ระบบสำเร็จ",
   });
};

const getProfile = async (req, res) => {
   const targetUser = req.user;

   const userInfo = await db.User_Informations.findOne({
      where: { user_id: targetUser.user_id },
   });

   const profile = {
      username: targetUser.username,
      email: userInfo.email,
      name: userInfo.name,
      tel: userInfo.tel,
      birth_date: userInfo.birth_date,
      point: userInfo.point,
   };

   res.status(200).send({ profile });
};

const updateProfile = async (req, res) => {
   const targetUser = req.user;
   const { name, new_password, password, tel } = req.body;

   if (!password) {
      return res.status(400).send({ message: "กรุณาระบุ password" });
   }

   const isCorrectPassword = bcryptjs.compareSync(
      password,
      targetUser.password
   );

   if (!isCorrectPassword) {
      return res.status(400).send({ message: "password ไม่ถูกต้อง" });
   }

   const userInfo = await db.User_Informations.findOne({
      where: { user_id: targetUser.user_id },
   });

   if (!userInfo) {
      return res.status(404).send({ message: "ไม่พบข้อมูลผู้ใช้" });
   }

   if (new_password) {
      const salt = bcryptjs.genSaltSync(12);
      const updatedPassword = bcryptjs.hashSync(new_password, salt);

      await db.Users.update(
         {
            password: updatedPassword,
         },
         {
            where: { user_id: targetUser.user_id },
         }
      );
   }

   await db.User_Informations.update(
      {
         name: name ?? userInfo.name,
         tel: tel ?? userInfo.tel,
      },
      {
         where: { user_id: targetUser.user_id },
      }
   );

   return res.status(200).send({ message: "อัปเดตข้อมูลสำเร็จ" });
};

const sendResetPassword = async (req, res) => {
   const { email } = req.body;
   const userInfo = await db.User_Informations.findOne({ where: { email } });

   if (!userInfo) {
      return res.status(404).send({ message: "ไม่พบอีเมลนี้ในระบบ" });
   }

   const user = await db.Users.findOne({
      where: { user_id: userInfo.user_id },
   });

   if (!user) {
      return res.status(404).send({ message: "ไม่พบชื่อผู้ใช้งานในระบบ" });
   }

   if (!user.is_verified) {
      return res
         .status(405)
         .send({ message: "อีเมลนี้ยังไม่ได้รับการยืนยันตัวตน" });
   }

   const resetToken = crypto.randomBytes(32).toString("hex");
   const resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000);

   await db.Users.update(
      {
         reset_password_token: resetToken,
         reset_password_expires: resetTokenExpires,
      },
      { where: { user_id: userInfo.user_id } }
   );

   sendResetPasswordEmail(email, resetToken);

   return res.status(200).send({
      message:
         "สามารถตั้งค่ารหัสผ่านใหม่ของคุณได้ ผ่านทางอีเมลที่สมัครไว้ (คำร้องนี้จะหมดอายุใน 15 นาที)",
   });
};

// ANCHOR - สำหรับเปลี่ยนรหัส
const resetPassword = async (req, res) => {
   const { token } = req.params;
   const { newPassword } = req.body;
   const targetUser = await db.Users.findOne({
      where: {
         reset_password_token: token,
         reset_password_expires: { [Op.gt]: Date.now() },
      },
   });

   if (!targetUser) {
      return res.status(404).send({ message: "ไม่พบคำร้อง" });
   }

   const salt = bcryptjs.genSaltSync(12);
   const hashedPassword = bcryptjs.hashSync(newPassword, salt);

   targetUser.password = hashedPassword;
   targetUser.reset_password_token = null;
   targetUser.reset_password_expires = null;
   await targetUser.save();

   return res.status(200).send({ message: "ตั้งค่ารหัสผ่านใหม่เสร็จสิ้น" });
};

module.exports = {
   registerUser,
   loginUser,
   getProfile,
   updateProfile,
   sendResetPassword,
   resetPassword,
};
