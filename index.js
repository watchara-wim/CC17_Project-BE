require("dotenv").config({ path: ".env" });
require("dotenv").config({ path: ".env.email" }); // NOTE - ต้องสร้างเพิ่มเอง โดยระบุ 2 ตัวแปร "EMAIL", "PASSWORD"

const cron = require("node-cron");
const { verifyTokenExpiration } = require("./controllers/verifyController");
// NOTE - ให้ verifyTokenExpiration ทำงานทุกเที่ยงคืนของวัน
cron.schedule("0 0 * * *", () => {
   console.log(
      "verifyTokenExpiration is running, data related with expired token will be removed"
   );
   verifyTokenExpiration();
});

const express = require("express");
const app = express();
const cors = require("cors");
const db = require("./models");
const bcryptjs = require("bcryptjs");

require("./config/passport/passport");

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

db.sequelize
   .sync({ force: true })
   // TODO - เอาไว้ทดสอบ (create user ใหม่ตอน refresh server)
   .then(async () => {
      const roles = await db.Users.findAll();

      if (roles.length === 0) {
         await db.Users.bulkCreate([
            {
               username: "admin",
               password: bcryptjs.hashSync("admin123", 12),
               user_role: process.env.ROLE_ADMIN,
               is_verified: true,
            },
            {
               username: "user",
               password: bcryptjs.hashSync("user123", 12),
               user_role: process.env.ROLE_MEMBER,
               is_verified: true,
            },
         ]);
      }
   })
   .then(() => {
      app.listen(process.env.PORT, () => {
         console.log(`Server is running at port ${process.env.PORT}`);
      });
   });
