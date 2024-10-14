require("dotenv").config({ path: ".env" });
require("dotenv").config({ path: ".env.private" }); // NOTE - ต้องสร้างเพิ่มเอง โดยระบุ 2 ตัวแปร "EMAIL", "PASSWORD", "USER_EMAIL"

const cron = require("node-cron");
const { verifyTokenExpiration } = require("./controllers/verifyController");
// NOTE - ให้ verifyTokenExpiration ทำงานทุกเที่ยงคืนของวัน
cron.schedule("0 0 * * *", () => {
   console.log(
      "verifyTokenExpiration is running, data related with expired token will be removed"
   );
   verifyTokenExpiration();
});

const bcryptjs = require("bcryptjs");
const express = require("express");
const app = express();
const userRoute = require("./routes/userRoute");
const emailRoute = require("./routes/emailRoute");
const cors = require("cors");
const db = require("./models");

require("./config/passport/passport");

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/user", userRoute);
app.use("/verification", emailRoute);

db.sequelize
   .sync({ force: true })
   // SECTION - เอาไว้ทดสอบ (create user ใหม่ตอน refresh server)
   .then(async () => {
      const crypto = require("crypto");
      const usersRecord = await db.Users.findAll();

      if (usersRecord.length === 0) {
         await db.Users.bulkCreate([
            {
               user_id: 1,
               username: "admin",
               password: bcryptjs.hashSync("admin123", 12),
               user_role: process.env.ROLE_ADMIN,
               is_verified: true,
            },
            {
               user_id: 2,
               username: "user",
               password: bcryptjs.hashSync("user123", 12),
               user_role: process.env.ROLE_MEMBER,
               is_verified: false,
               reset_password_token: crypto.randomBytes(32).toString("hex"),
            },
         ]);
      }

      const informationRecord = await db.User_Informations.findAll();

      if (informationRecord.length === 0) {
         await db.User_Informations.bulkCreate([
            {
               info_id: 1,
               user_id: 1,
               name: "admin",
               email: "",
               birth_date: Date.now(),
            },
            {
               info_id: 2,
               user_id: 2,
               name: "user",
               email: process.env.USER_EMAIL,
               new_email: process.env.USER_EMAIL,
               verification_token: crypto.randomBytes(32).toString("hex"),
               birth_date: Date.now(),
            },
         ]);
      }
   })
   // !SECTION
   .then(() => {
      app.listen(process.env.PORT, () => {
         console.log(`Server is running at ${process.env.PORT}`);
      });
   });
