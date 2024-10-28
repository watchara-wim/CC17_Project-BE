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
const tableRoute = require("./routes/tableRoute");
const cors = require("cors");
const db = require("./models");
const { table } = require("console");

require("./config/passport/passport");

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/user", userRoute);
app.use("/verification", emailRoute);
app.use("/table", tableRoute);

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
               is_verified: true,
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
               name: "แอดมิน",
               email: "",
               tel: "098-765-4321",
               birth_date: Date.now(),
            },
            {
               info_id: 2,
               user_id: 2,
               name: "ผู้ใช้งาน",
               email: process.env.USER_EMAIL,
               new_email: process.env.USER_EMAIL,
               tel: "012-345-6789",
               birth_date: Date.now(),
            },
         ]);

         const tableRecord = await db.Tables.findAll();

         if (tableRecord.length === 0) {
            await db.Tables.bulkCreate([
               {
                  table_id: 1,
                  table_number: "1",
                  capacity: 6,
                  status: "empty",
               },
               { table_id: 2, table_number: "2", capacity: 6, status: "empty" },
               { table_id: 3, table_number: "3", capacity: 6, status: "empty" },
               { table_id: 4, table_number: "4", capacity: 4, status: "empty" },
               { table_id: 5, table_number: "5", capacity: 4, status: "empty" },
               { table_id: 6, table_number: "6", capacity: 4, status: "empty" },
               { table_id: 7, table_number: "7", capacity: 4, status: "empty" },
               { table_id: 8, table_number: "8", capacity: 4, status: "empty" },
               { table_id: 9, table_number: "9", capacity: 4, status: "empty" },
               {
                  table_id: 10,
                  table_number: "10",
                  capacity: 4,
                  status: "empty",
               },
               {
                  table_id: 11,
                  table_number: "11",
                  capacity: 4,
                  status: "empty",
               },
               {
                  table_id: 12,
                  table_number: "12",
                  capacity: 4,
                  status: "empty",
               },
               {
                  table_id: 13,
                  table_number: "13",
                  capacity: 4,
                  status: "empty",
               },
               {
                  table_id: 14,
                  table_number: "14",
                  capacity: 4,
                  status: "empty",
               },
            ]);
         }
      }
   })
   // !SECTION
   .then(() => {
      app.listen(process.env.PORT, () => {
         console.log(`Server is running at ${process.env.PORT}`);
      });
   });
