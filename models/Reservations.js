module.exports = (sequelize, DataType) => {
   const reservations = sequelize.define(
      "Reservations",
      {
         booking_id: {
            type: DataType.INTEGER,
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
            type: DataType.INTEGER,
            allowNull: false,
         },
         reservations_time: {
            type: DataType.DATE,
            allowNull: false,
         },
         customer_amount: {
            type: DataType.INTEGER,
            allowNull: false,
         },
         booking_detail: {
            type: DataType.STRING(255),
            allowNull: true,
         },
         cancel_detail: {
            type: DataType.STRING(255),
         },
         booking_status: {
            type: DataType.STRING(255),
            allowNull: false,
         },
         response_at: {
            type: DataType.DATE,
            allowNull: true,
         },
         finish_at: {
            type: DataType.DATE,
         },
      },
      {
         timestamps: true,
         createAt: "created_at",
         updateAt: false,
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
         through: models.Has,
      });
   };

   return reservations;
};
