const db = require("../models");
const { Op } = require("sequelize"); // Sequelize operator
const crypto = require("crypto");
const bcryptjs = require("bcryptjs");
const sendResetEmail = require("../utils/email");

const verifyEmail = async (req, res) => {
   const { token } = req.params;
   const userInfo = await db.User_Informations.findOne({
      where: { verification_token: token },
   });

   if (!userInfo) {
      return res.status(400).send("ข้อมูลไม่ถูกต้อง");
   }

   await db.Users.update(
      { is_verified: true },
      { where: { user_id: userInfo.user_id } }
   );
   userInfo.verification_token = null;
   await userInfo.save();

   return res.status(200).send({ message: "ยืนยันอีเมลสำเร็จ" });
};

const sendResetPassword = async (req, res) => {
   const { email } = req.body;
   const userInfo = await db.User_Informations.findOne({ where: { email } });

   if (!userInfo) {
      return res.status(400).send("ไม่พบข้อมูลในระบบ");
   }

   const resetToken = crypto.randomBytes(32).toString("hex");
   const resetTokenExpires = Date.now() + 15 * 60 * 1000;

   await db.Users.update(
      {
         reset_password_token: resetToken,
         reset_password_expires: resetTokenExpires,
      },
      { where: { user_id: userInfo.user_id } }
   );

   sendResetEmail(email, resetToken);

   return res.status(200).send({
      message:
         "สามารถตั้งค่ารหัสผ่านใหม่ของคุณได้ ผ่านทางอีเมลที่สมัครไว้ (คำร้องนี้จะหมดอายุใน 15 นาที)",
   });
};

// ANCHOR - สำหรับเปลี่ยนรหัส
const resetPassword = async (req, res) => {
   const { token, newPassword } = req.body;
   const targetUser = await db.Users.findOne({
      where: {
         reset_password_token: token,
         reset_password_expires: { [Op.gt]: Date.now() },
      },
   });

   if (!targetUser) {
      return res.status(400).send("ข้อมูลไม่ถูกต้อง");
   }

   const salt = bcryptjs.genSaltSync(12);
   const hashedPassword = bcryptjs.hashSync(newPassword, salt);

   targetUser.password = hashedPassword;
   targetUser.reset_password_token = null;
   targetUser.reset_password_expires = null;
   await targetUser.save();

   return res.status(200).send({ message: "ตั้งค่ารหัสผ่านเสร็จสิ้น" });
};

// ANCHOR - function เช็ค expired verify token >> ลบข้อมูลที่ไม่ได้ verified ทิ้ง
const verifyTokenExpiration = async () => {
   const currentDate = new Date();

   // NOTE - case เปลี่ยนที่อยู่เมล (Users.is_verified === true) >> set new_email === null
   const usersToUpdate = await db.User_Informations.findAll({
      include: [{ model: db.Users, where: { is_verified: true } }],
      where: {
         verification_token: { [Op.ne]: null },
         updatedAt: {
            [Op.lt]: new Date(currentDate - 3 * 24 * 60 * 60 * 1000),
         },
      }, // query verification_token ที่ไม่เท่ากับ (not equal, ne) null และ วันที่ก่อนหน้า (less than, lt) 3 วันที่แล้ว
   });

   usersToUpdate.forEach(async (userInfo) => {
      userInfo.new_email = null;
      userInfo.verification_token = null;
      await userInfo.save();
   });

   // NOTE - case สมัครใหม่ (Users.is_verified === false) >> delete record
   const usersToDelete = await db.User_Informations.findAll({
      include: [{ model: db.Users, where: { is_verified: false } }],
      where: {
         verification_token: { [Op.ne]: null },
         updatedAt: {
            [Op.lt]: new Date(
               currentDate - 7 * 24 * 60 * 60 * 1000 // กรณีสมัครใหม่ ให้ 7 วัน
            ),
         },
      },
   });

   usersToDelete.forEach(async (userInfo) => {
      await db.Users.destroy({ where: { user_id: userInfo.user_id } });
   });
};

module.exports = {
   verifyEmail,
   sendResetPassword,
   resetPassword,
   verifyTokenExpiration,
};