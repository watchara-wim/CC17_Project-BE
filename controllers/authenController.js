const db = require("../models");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendVerificationEmail = require("../utils/email");

// ANCHOR - Register
const registerUser = async (req, res) => {
   const { username, password, name, email, birth_date } = req.body;
   const targetUser = await db.Users.findOne({ where: { username } });
   const targetEmail = await db.User_Informations.findOne({ where: { email } });

   if (targetUser || targetEmail) {
      return res
         .status(400)
         .send({ message: "Username or Email is already taken" });
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
   });

   // ส่ง link ยืนยันไปที่ email ที่สมัคร
   sendVerificationEmail(email, verificationToken);

   return res
      .status(201)
      .send({ message: "User created. Please verify your email." });
};

// ANCHOR - Login
const loginUser = async (req, res) => {
   const { username, password } = req.body;
   const targetUser = await db.Users.findOne({ where: { username } });

   if (!targetUser) {
      return res.status(400).send("Username or password is invalid");
   }

   const isCorrectPassword = bcryptjs.compareSync(
      password,
      targetUser.password
   );
   if (!isCorrectPassword) {
      return res.status(400).send("Username or password is invalid");
   }

   if (!targetUser.is_verified) {
      return res.status(403).send("Please verify your email before login.");
   }

   const payload = {
      name: targetUser.name,
      id: targetUser.id,
   };
   const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: 3600 });

   return res.status(200).send({
      token,
      message: "Login successful",
   });
};

module.exports = {
   registerUser,
   loginUser,
};
