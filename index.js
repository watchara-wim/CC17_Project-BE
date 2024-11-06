require("dotenv").config({ path: ".env" });
require("dotenv").config({ path: ".env.private" }); // NOTE - ต้องสร้างเพิ่มเอง โดยระบุ 2 ตัวแปร "EMAIL", "PASSWORD", "USER_EMAIL"

const cron = require("node-cron");
const {
   verifyTokenExpiration,
} = require("./controllers/controller-verification");
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
const userRoute = require("./routes/route-user");
const emailRoute = require("./routes/route-email");
const tableRoute = require("./routes/route-table");
const reservationRoute = require("./routes/route-reservation");
const orderRoute = require("./routes/route-order");
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
app.use("/reservation", reservationRoute);
app.use("/order", orderRoute);

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
               username: "user1",
               password: bcryptjs.hashSync("user123", 12),
               user_role: process.env.ROLE_MEMBER,
               is_verified: true,
            },
            {
               user_id: 3,
               username: "user2",
               password: bcryptjs.hashSync("user123", 12),
               user_role: process.env.ROLE_MEMBER,
               is_verified: true,
            },
            {
               user_id: 4,
               username: "user3",
               password: bcryptjs.hashSync("user123", 12),
               user_role: process.env.ROLE_MEMBER,
               is_verified: true,
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
               name: "ผู้ใช้งาน1",
               email: "-",
               tel: "012-345-6789",
               birth_date: Date.now(),
            },
            {
               info_id: 3,
               user_id: 3,
               name: "ผู้ใช้งาน2",
               email: "--",
               tel: "012-345-6789",
               birth_date: Date.now(),
            },
            {
               info_id: 4,
               user_id: 4,
               name: "ผู้ใช้งาน3",
               email: "---",
               tel: "012-345-6789",
               birth_date: Date.now(),
            },
         ]);

         const reservationRecord = await db.Reservations.findAll();

         if (reservationRecord.length === 0) {
            await db.Reservations.bulkCreate([
               {
                  reservation_id: 1,
                  customer_id: 3,
                  table_id: [1, 2],
                  capacity: 16,
                  create_at: Date.now(),
                  reservation_time: "17:00",
                  customer_amount: 7,
                  reservation_status: "pending",
               },
               {
                  reservation_id: 2,
                  customer_id: 3,
                  staff_id: 1,
                  table_id: [6],
                  capacity: 8,
                  create_at: Date.now(),
                  reservation_time: "17:00",
                  customer_amount: 3,
                  reservation_status: "accepted",
                  response_at: Date.now(),
               },
               {
                  reservation_id: 3,
                  customer_id: 4,
                  staff_id: 1,
                  table_id: [12],
                  capacity: 4,
                  create_at: Date.now(),
                  reservation_time: "17:00",
                  customer_amount: 3,
                  reservation_status: "arrive",
                  response_at: Date.now(),
               },
            ]);
         }
      }

      const tableRecord = await db.Tables.findAll();

      if (tableRecord.length === 0) {
         await db.Tables.bulkCreate([
            {
               table_id: 1,
               table_number: "1",
               capacity: 6,
               status: "onHold",
            },
            {
               table_id: 2,
               table_number: "2",
               capacity: 6,
               status: "onHold",
            },
            { table_id: 3, table_number: "3", capacity: 6, status: "empty" },
            { table_id: 4, table_number: "4", capacity: 4, status: "empty" },
            { table_id: 5, table_number: "5", capacity: 4, status: "empty" },
            {
               table_id: 6,
               table_number: "6",
               capacity: 4,
               status: "reserved",
            },
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
               status: "full",
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

      const productRecord = await db.Products.findAll();

      if (productRecord.length === 0) {
         await db.Products.bulkCreate([
            {
               product_id: 1,
               product_name: "Americano",
               price: 50,
               sweetness: [0, 25, 50, 75, 100],
               milk_type: [],
               type: ["hot", "iced"],
            },
            {
               product_id: 2,
               product_name: "Espresso",
               price: 50,
               sweetness: [0, 25, 50, 75, 100],
               milk_type: [],
               type: ["hot", "iced"],
            },
            {
               product_id: 3,
               product_name: "Latte",
               price: 70,
               sweetness: [0, 25, 50, 75, 100, 125],
               milk_type: ["whole", "low-fat", "non-fat", "oat", "soy"],
               type: ["hot", "iced", "frappe"],
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
