const db = require("../models");
const { Op } = require("sequelize"); // Sequelize operator
const crypto = require("crypto");
const bcryptjs = require("bcryptjs");
const { sendVerificationEmail } = require("../utils/email");

const verifyEmail = async (req, res) => {
   const { token } = req.params;
   const userInfo = await db.User_Informations.findOne({
      where: { verification_token: token },
   });

   if (!userInfo) {
      return res.status(400).send({ message: "คำขอหมดอายุ" });
   }

   await db.Users.update(
      { is_verified: true },
      { where: { user_id: userInfo.user_id } }
   );
   userInfo.verification_token = null;
   userInfo.verification_token_expires = null;
   await userInfo.save();

   return res.status(200).send({ message: "ยืนยันอีเมลสำเร็จ" });
};

const updateEmail = async (req, res) => {
   const { username, new_email } = req.body;

   const user = await db.Users.findOne({
      where: { username },
   });

   if (!user) {
      return res.status(404).send({ message: "ไม่พบข้อมูลผู้ใช้งาน" });
   }

   const userInfo = await db.User_Informations.findOne({
      where: { user_id: user.user_id },
   });

   if (!userInfo) {
      return res.status(404).send({ message: "ไม่พบข้อมูลผู้ใช้งาน" });
   }

   const verificationToken = crypto.randomBytes(32).toString("hex");
   const tokenExpires = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

   userInfo.new_email = new_email;
   userInfo.verification_token = verificationToken;
   userInfo.verification_token_expires = tokenExpires;

   await userInfo.save();

   sendVerificationEmail(new_email, verificationToken);

   return res.status(200).send({
      message: "ส่งลิงก์ยืนยันไปยังอีเมลใหม่แล้ว กรุณายืนยันภายใน 3 วัน",
   });
};

// ANCHOR - function เช็ค expired verify token >> ลบข้อมูลที่ไม่ได้ verified ทิ้ง
const verifyTokenExpiration = async () => {
   const currentDate = new Date();

   // NOTE - case เปลี่ยนที่อยู่เมล (Users.is_verified === true) >> set new_email === null
   const usersToUpdateEmail = await db.User_Informations.findAll({
      include: [{ model: db.Users, where: { is_verified: true } }],
      where: {
         verification_token: { [Op.ne]: null },
         verification_token_expires: {
            [Op.lt]: currentDate,
         },
      }, // query verification_token ที่ไม่เท่ากับ (not equal, ne) null และ วันที่ก่อนวันนี้ (less than, lt)
   });

   usersToUpdateEmail.forEach(async (userInfo) => {
      userInfo.new_email = null;
      userInfo.verification_token = null;
      userInfo.verification_token_expires = null;

      await userInfo.save();
   });

   // NOTE - case สมัครใหม่ (Users.is_verified === false) >> delete record
   const usersToDelete = await db.User_Informations.findAll({
      include: [{ model: db.Users, where: { is_verified: false } }],
      where: {
         verification_token: { [Op.ne]: null },
         verification_token_expires: {
            [Op.lt]: currentDate,
         },
      },
   });

   usersToDelete.forEach(async (userInfo) => {
      await db.Users.destroy({ where: { user_id: userInfo.user_id } });
   });

   // NOTE - case reset passwword
   const usersToResetPassword = await db.Users.findAll({
      where: {
         reset_password_token: { [Op.ne]: null },
         reset_password_expires: { [Op.lt]: currentDate },
      },
   });

   usersToResetPassword.forEach(async (user) => {
      user.reset_password_token = null;
      user.reset_password_expires = null;

      await user.save();
   });
};

module.exports = {
   verifyEmail,
   updateEmail,
   verifyTokenExpiration,
};
