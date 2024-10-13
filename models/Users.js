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
            allowNull: false,
         },
         user_role: {
            type: DataTypes.STRING(20),
            allowNull: false,
         },
         // NOTE - จะต้องยืนยัน email (ครั้งแรก) ก่อน จึงจะเปลี่ยนเป็น verified
         is_verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
         },
         // NOTE - สำหรับการ reset password
         reset_password_token: {
            type: DataTypes.STRING(255),
            allowNull: true,
         },
         reset_password_expires: {
            type: DataTypes.DATE,
            allowNull: true,
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
