module.exports = (sequelize, DataTypes) => {
   const reservations = sequelize.define(
      "Reservations",
      {
         reservation_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
         },
         customer_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
         },
         staff_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
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
         capacity: { type: DataTypes.INTEGER, allowNull: false },
         reservation_time: {
            type: DataTypes.STRING(255),
            allowNull: false,
         },
         customer_amount: {
            type: DataTypes.INTEGER,
            allowNull: false,
         },
         reservation_detail: {
            type: DataTypes.STRING(255),
            allowNull: true,
         },
         cancel_detail: {
            type: DataTypes.STRING(255),
         },
         reservation_status: {
            type: DataTypes.STRING(255),
            allowNull: false,
         },
         response_at: {
            type: DataTypes.DATE,
            allowNull: true,
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

   reservations.associate = (models) => {
      reservations.belongsTo(models.Users, {
         foreignKey: "customer_id",
         as: "customer",
         constraints: false,
      });

      reservations.belongsTo(models.Users, {
         foreignKey: "staff_id",
         as: "staff",
         constraints: false,
      });

      reservations.belongsToMany(models.Tables, {
         through: models.TablesReservation,
      });

      reservations.hasOne(models.Orders, { foreignKey: "reservation_id" });
   };

   return reservations;
};
