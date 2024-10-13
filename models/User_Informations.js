module.exports = (sequelize, DataType) => {
   const user_information = sequelize.define(
      "User_Information",
      {
         info_id: {
            type: DataType.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
         },
         user_id: {
            type: DataTypeataTypes.INTEGER,
            allowNull: false,
            references: {
               model: "Users",
               key: "user_id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
         },
         name: {
            type: DataType.STRING(255),
            allowNull: false,
         },
         email: {
            type: DataType.STRING(255),
            unique: true,
            allowNull: true,
         },
         new_email: {
            type: DataTypes.STRING(255),
            allowNull: true,
         },
         // NOTE - เมื่อทำการเปลี่ยน email จะต้องทำการยืนยัน email ผ่าน token ตัวนี้ทุกครั้ง (ยืนยันสำเร็จ => เอา new_email ไปแทน email)
         verification_token: {
            type: DataTypes.STRING(255),
            allowNull: true,
         },
         birth_date: {
            type: DataType.DATEONLY,
            allowNull: false,
         },
         point: {
            type: DataType.INTEGER,
         },
      },
      {
         timestamps: true,
         createAt: "created_at",
         updateAt: "last_update",
      }
   );

   user_information.associate = (models) => {
      user_information.belongsTo(models.Users, { foreignKey: "user_id" });
   };

   return user_information;
};
