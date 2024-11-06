const db = require("../models");

const getTables = async (req, res) => {
   try {
      const tables = await db.Tables.findAll();

      return res.status(200).send({ tables });
   } catch (error) {
      console.error(error);

      return res.status(500).send({ message: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
   }
};

module.exports = { getTables };
