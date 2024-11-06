module.exports = (sequelize, DataTypes) => {
   const product = sequelize.define("Products", {
      product_id: {
         type: DataTypes.INTEGER,
         autoIncrement: true,
         primaryKey: true,
         allowNull: false,
      },

      // catagories_id: {
      //      type: DataTypes.INTEGER,
      //      allowNull: false,
      // },

      product_name: {
         type: DataTypes.STRING(255),
         allowNull: false,
      },

      price: {
         type: DataTypes.INTEGER,
         allowNull: false,
      },

      sweetness: {
         type: DataTypes.STRING(255),
         allowNull: true,
         defaultValue: "",
         get() {
            const rawValue = this.getDataValue("sweetness");
            return rawValue ? rawValue.split(",") : [];
         },
         set(value) {
            this.setDataValue(
               "sweetness",
               Array.isArray(value) ? value.join(",") : value
            );
         },
      },

      milk_type: {
         type: DataTypes.STRING(255),
         allowNull: true,
         defaultValue: "",
         get() {
            const rawValue = this.getDataValue("milk_type");
            return rawValue ? rawValue.split(",") : [];
         },
         set(value) {
            this.setDataValue(
               "milk_type",
               Array.isArray(value) ? value.join(",") : value
            );
         },
      },

      type: {
         type: DataTypes.STRING(255),
         allowNull: true,
         defaultValue: "",
         get() {
            const rawValue = this.getDataValue("type");
            return rawValue ? rawValue.split(",") : [];
         },
         set(value) {
            this.setDataValue(
               "type",
               Array.isArray(value) ? value.join(",") : value
            );
         },
      },

      image: {
         type: DataTypes.STRING(255),
         allowNull: true,
      },
   });

   product.associate = (models) => {
      product.belongsToMany(models.Orders, {
         through: "ProductOrders",
      });

      // product.belongsTo(models.Catagories, {
      //    foreignKey: "catagories_id",
      // });
   };

   return product;
};
