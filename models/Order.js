module.exports = (sequelize, DataTypes) => {
   const orders = sequelize.define(
      "Orders",
      {
         order_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
         },

         customer_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
         },

         staff_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
         },

         // promotion_id: {
         //    type: DataTypes.INTEGER,
         //    allowNull: true,
         // },

         product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
         },

         order_status: {
            type: DataTypes.STRING(255),
            allowNull: false,
            defaultValue: "pending",
         },

         table_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
            defaultValue: "",
            get() {
               const rawValue = this.getDataValue("table_id");
               return rawValue ? rawValue.split(",").map(Number) : [];
            },
            set(value) {
               this.setDataValue(
                  "table_id",
                  Array.isArray(value) ? value.join(",") : value
               );
            },
         },

         reservation_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
         },

         product_sweetness: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: "",
            get() {
               const rawValue = this.getDataValue("product_sweetness");
               return rawValue ? rawValue.split(",").map(Number) : [];
            },
            set(value) {
               this.setDataValue(
                  "product_sweetness",
                  Array.isArray(value) ? value.join(",") : value
               );
            },
         },

         product_milk_type: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: "",
            get() {
               const rawValue = this.getDataValue("product_milk_type");
               return rawValue ? rawValue.split(",") : [];
            },
            set(value) {
               this.setDataValue(
                  "product_milk_type",
                  Array.isArray(value) ? value.join(",") : value
               );
            },
         },

         product_quality: {
            type: DataTypes.STRING(255),
            allowNull: false,
            defaultValue: "",
            get() {
               const rawValue = this.getDataValue("product_quality");
               return rawValue ? rawValue.split(",").map(Number) : [];
            },
            set(value) {
               this.setDataValue(
                  "product_quality",
                  Array.isArray(value) ? value.join(",") : value
               );
            },
         },

         net_price: {
            type: DataTypes.INTEGER,
            allowNull: false,
         },

         finish_at: {
            type: DataTypes.DATE,
         },
      },
      {
         timestamps: true,
         createdAt: "created_at",
         updatedAt: false,
      }
   );

   orders.associate = (models) => {
      orders.belongsTo(models.Users, {
         foreignKey: "customer_id",
         as: "customer",
         constraints: false,
      });

      orders.belongsTo(models.Users, {
         foreignKey: "staff_id",
         as: "staff",
         constraints: false,
      });

      // สำหรับโยงไปที่ promotions

      orders.belongsTo(models.Products, {
         through: models.ProductsOrders,
      });

      orders.belongsToMany(models.Tables, {
         through: models.TablesOrders,
      });

      orders.belongsTo(models.Reservations, {
         foreignKey: "reservation_id",
         constraints: false,
      });
   };

   return orders;
};
