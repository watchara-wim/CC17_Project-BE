module.exports = (sequelize, DataTypes) => {
   const users = sequelize.define(
      "Users",
      {
         user_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
         },
         username: {
            type: DataTypes.STRING(255),
            unique: true,
         },
         password: {
            type: DataTypes.STRING(255),
         },
         user_role: {
            type: DataTypes.STRING(20),
         },
      },
      {
         timestamps: true,
         createAt: "created_at",
         updateAt: false,
      }
   );

   users.associate = (models) => {
      users.hasOne(models.User_Informations, { foreignKey: "user_id" });

      users.hasMany(models.Reservations, {
         foreignKey: "customer_id",
         as: "reservation_customer",
      });

      users.hasMany(models.Reservations, {
         foreignKey: "staff_id",
         as: "reservation_staff",
      });
   };

   return users;
};
