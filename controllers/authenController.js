const db = require("../models");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendVerificationEmail } = require("../utils/email");

// ANCHOR - Register
const registerUser = async (req, res) => {
   const { username, password, name, email, birth_date } = req.body;
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
   });

   await db.User_Informations.create({
      user_id: newUser.user_id,
      name,
      email,
      birth_date,
      verification_token: verificationToken,
      verification_token_expires: new Date(
         Date.now() + 7 * 24 * 60 * 60 * 1000
      ),
   });

   // ส่ง link ยืนยันไปที่ email ที่สมัคร
   sendVerificationEmail(email, verificationToken);

   return res.status(201).send({
      message:
         "สร้างบัญชีผู้ใช้งานสำเร็จ โปรดทำการยืนยันตัวตนผ่านอีเมลที่ท่านได้ลงทะเบียนไว้ภายใน 7 วัน",
   });
};

// ANCHOR - Login
const loginUser = async (req, res) => {
   const { username, password } = req.body;
   const targetUser = await db.Users.findOne({ where: { username } });

   if (!targetUser) {
      return res.status(400).send("Username หรือ password ไม่ถูกต้อง");
   }

   const isCorrectPassword = bcryptjs.compareSync(
      password,
      targetUser.password
   );

   if (!isCorrectPassword) {
      return res.status(400).send("Username หรือ password ไม่ถูกต้อง");
   }

   if (isCorrectPassword && !targetUser.is_verified) {
      return res.status(403).send("กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ");
   }

   const userInfo = await db.User_Informations.findOne({
      where: { user_id: targetUser.user_id },
   });

   if (!userInfo) {
      return res.status(400).send("ไม่พบข้อมูล");
   }

   const payload = {
      name: userInfo.name,
      id: userInfo.info_id,
   };
   const token = jwt.sign(payload, process.env.SECRET_KEY, {
      expiresIn: 7 * 24 * 60 * 60, // 7 วัน
   });

   return res.status(200).send({
      token,
      message: "เข้าสู่ระบบสำเร็จ",
   });
};

module.exports = {
   registerUser,
   loginUser,
};
