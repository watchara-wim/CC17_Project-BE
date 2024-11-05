const db = require("../models");
const { Op } = require("sequelize");

const startOfDay = new Date();
startOfDay.setHours(0, 0, 0, 0);

const getAllReservations = async (req, res) => {
   try {
      const reservations = await db.Reservations.findAll({
         where: {
            created_at: {
               [Op.gte]: startOfDay,
            },
         },
         order: [["created_at", "DESC"]],
      });

      if (reservations.length === 0) {
         return res.status(204).send({ message: "ไม่มีข้อมูลรายการจอง" });
      }

      const reservationsWithDetails = await Promise.all(
         reservations.map(async (reservation) => {
            const customerId = reservation.customer_id;

            // NOTE: แปลง reservation ให้เป็น JSON ก่อน เพราะ sequelize object ไม่แก้ไขได้
            const reservationData = reservation.toJSON();

            reservationData.customer_detail = {}; // default

            if (!customerId) {
               return reservationData;
            }

            const targetCustomer = await db.User_Informations.findOne({
               where: { user_id: customerId },
            });

            if (targetCustomer) {
               reservationData.customer_detail = {
                  customer_name: targetCustomer.name,
                  customer_tel: targetCustomer.tel,
               };
            } else {
               reservationData.customer_detail = {
                  customer_name: "-",
                  customer_tel: "-",
               };
            }

            return reservationData;
         })
      );

      return res.status(200).send({ reservations: reservationsWithDetails });
   } catch (error) {
      console.error(error);
      return res.status(500).send({ message: "เกิดความผิดพลาดของเซิร์ฟเวอร์" });
   }
};

const getReservationById = async (req, res) => {
   try {
      const { id } = req.params;

      const reservation = await db.Reservations.findOne({
         where: { reservation_id: id },
      });

      if (
         !reservation ||
         ["finish", "cancel"].includes(reservation.reservation_status)
      ) {
         return res.status(404).send({ message: "ไม่พบรายการจองดังกล่าว" });
      }

      const tableIds = reservation.table_id;

      if (tableIds.length === 0) {
      }

      return res.status(200).send({ reservation });
   } catch (error) {
      console.error(error);
      return res.status(500).send({ message: "เกิดความผิดพลาดของเซิร์ฟเวอร์" });
   }
};

const getReservationByUser = async (req, res) => {
   try {
      const userId = req.user.user_id;

      const reservation = await db.Reservations.findOne({
         where: {
            customer_id: userId,
            created_at: {
               [Op.gte]: startOfDay,
            },
         },
      });

      if (reservation.length === 0) {
         return res.status(204).send({ reservation: null });
      }

      return res.status(200).send({ reservation });
   } catch (error) {
      console.error(error);
      return res.status(500).send({ message: "เกิดความผิดพลาดของเซิร์ฟเวอร์" });
   }
};

const createReservation = async (req, res) => {
   try {
      const { table_id, capacity, reservation_time, customer_amount } =
         req.body;
      const customer_id = req.user.user_id;

      if (!Array.isArray(table_id)) {
         return res.status(400).send({ message: "รูปแบบข้อมูลไม่ถูกต้อง" });
      }

      const tableId = table_id.join(",");

      const newReservation = await db.Reservations.create({
         customer_id,
         table_id: tableId,
         capacity,
         reservation_time,
         customer_amount,
         reservation_status: "pending",
      });

      // NOTE: อัพเดต status ของทุก table ใน table_id
      for (const targetId of table_id) {
         const table = await db.Tables.findOne({
            where: { table_id: targetId },
         });

         table.update({ status: "onHold" });
      }

      return res
         .status(201)
         .send({ reservation: newReservation, message: "บันทึกสำเร็จ" });
   } catch (error) {
      console.error(error);
      return res.status(500).send({ message: "เกิดความผิดพลาดของเซิร์ฟเวอร์" });
   }
};

const updateReservation = async (req, res) => {
   try {
      const {
         // table_id,
         // reservation_time,
         // customer_amount,
         reservation_status,
         response_at,
         finish_at,
      } = req.body;
      const staff_id = req.user.user_id;
      const reservationId = req.params.id;

      let updatedTableStatus = "onHold";
      switch (reservation_status) {
         case "accepted":
            updatedTableStatus = "reserved";
            break;
         case "arrive":
            updatedTableStatus = "full";
            break;
         case "finish":
            updatedTableStatus = "empty";
            break;
         case "cancel":
            updatedTableStatus = "empty";
            break;
         default:
            updatedTableStatus = "onHold";
            break;
      }
      const reservation = await db.Reservations.findByPk(reservationId);
      if (!reservation) {
         return res.status(404).send({ message: "ไม่พบรายการจอง" });
      }

      // const oldTableIds = reservation.table_id.split(",");
      // const oldTableIdsString = oldTableIds.join(",");
      // const newTableIdsString = Array.isArray(table_id)
      //    ? table_id.join(",")
      //    : table_id;

      // if (oldTableIdsString !== newTableIdsString) {
      //    await db.Tables.update(
      //       { status: "empty" },
      //       { where: { table_id: oldTableIds } }
      //    );

      //    await db.Tables.update(
      //       { status: "reserved" },
      //       { where: { table_id } }
      //    );
      // }

      await reservation.update({
         reservation_status, // ค่าพื้นฐานที่ต้องส่งเข้ามาเสมอ
         staff_id,
         // table_id,
         // reservation_time,
         // customer_amount,
         ...(response_at && { response_at }),
         ...(finish_at && { finish_at }),
      });

      for (const targetId of reservation.table_id) {
         const table = await db.Tables.findOne({
            where: { table_id: targetId },
         });

         table.update({ status: updatedTableStatus });
      }

      return res.status(200).send({ reservation });
   } catch (error) {
      console.error(error);
      return res.status(500).send({ message: "เกิดความผิดพลาดของเซิร์ฟเวอร์" });
   }
};

module.exports = {
   getAllReservations,
   getReservationById,
   getReservationByUser,
   createReservation,
   updateReservation,
};
