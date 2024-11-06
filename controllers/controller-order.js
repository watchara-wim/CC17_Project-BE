const db = require("../models");
const { Op } = require("sequelize");

const startOfDay = new Date();
startOfDay.setHours(0, 0, 0, 0);

const getAllOrders = async (req, res) => {
   try {
      const orders = await db.Orders.findAll({
         where: {
            created_at: {
               [Op.gte]: startOfDay,
            },
         },
         order: [["created_at", "DESC"]],
      });

      if (orders.length === 0) {
         return res.status(204).send({ message: "ไม่พบออร์เดอร์" });
      }

      const ordersWithDetails = await Promise.all(
         orders.map(async (order) => {
            const customerId = order.customer_id;

            const orderData = order.toJSON();
            orderData.customer_detail = {}; // Default

            if (!customerId) {
               return orderData;
            }

            const targetCustomer = await db.User_Informations.findOne({
               where: { user_id: customerId },
            });

            if (targetCustomer) {
               orderData.customer_detail = {
                  customer_name: targetCustomer.name,
                  customer_tel: targetCustomer.tel,
               };
            } else {
               orderData.customer_detail = {
                  customer_name: "-",
                  customer_tel: "-",
               };
            }

            return orderData;
         })
      );

      return res.status(200).send({ orders: ordersWithDetails });
   } catch (error) {
      console.error(error);
      return res.status(500).send({ message: "เกิดความผิดพลาดของเซิร์ฟเวอร์" });
   }
};

const createOrder = async (req, res) => {
   try {
      const staff_id = req.user.user_id;
      const {
         customer_id,
         product_id,
         table_id,
         product_sweetness,
         product_milk_type,
         product_quality,
         net_price,
         reservation_id,
      } = req.body;

      const newOrder = await db.Orders.create({
         customer_id,
         staff_id,
         product_id,
         table_id,
         product_sweetness,
         product_milk_type,
         product_quality,
         net_price,
         reservation_id,
         order_status: "pending",
      });

      for (const targetId of table_id) {
         const table = await db.Tables.findOne({
            where: { table_id: targetId },
         });

         table.update({ status: "full" });
      }

      return res
         .status(201)
         .send({ order: newOrder, message: "สร้างรายการสำเร็จ" });
   } catch (error) {
      console.error(error);
      return res.status(500).send({ message: "เกิดความผิดพลาดของเซิร์ฟเวอร์" });
   }
};

const updateOrder = async (req, res) => {
   try {
      const {
         product_id,
         table_id,
         product_sweetness,
         product_milk_type,
         product_quality,
         net_price,
         order_status,
         finish_at,
      } = req.body;
      const orderId = req.params.id;
      const staff_id = req.user.user_id;

      const order = await db.Orders.findByPk(orderId);
      if (!order) {
         return res.status(404).send({ message: "ไม่พบรายการสั่งซื้อ" });
      }

      await order.update({
         product_id,
         table_id,
         product_sweetness,
         product_milk_type,
         product_quality,
         net_price,
         order_status,
         staff_id,
      });

      if (finish_at) {
         for (const targetId of table_id) {
            const table = await db.Tables.findOne({
               where: { table_id: targetId },
            });

            table.update({ status: "empty" });
         }
      }

      return res.status(200).send({ order });
   } catch (error) {
      console.error(error);
      return res.status(500).send({ message: "เกิดความผิดพลาดของเซิร์ฟเวอร์" });
   }
};

module.exports = {
   getAllOrders,
   createOrder,
   updateOrder,
};
