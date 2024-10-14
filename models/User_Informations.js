module.exports = (sequelize, DataTypes) => {
   const user_informations = sequelize.define(
      "User_Informations",
      {
         info_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
         },
         user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
               model: "Users",
               key: "user_id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
         },
         name: {
            type: DataTypes.STRING(255),
            allowNull: false,
         },
         email: {
            type: DataTypes.STRING(255),
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
         verification_token_expires: {
            type: DataTypes.DATE,
            allowNull: true,
         },
         birth_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
         },
         point: {
            type: DataTypes.INTEGER,
         },
      },
      {
         timestamps: true,
         createAt: "created_at",
         updateAt: "last_update",
      }
   );

   user_informations.associate = (models) => {
      user_informations.belongsTo(models.Users, { foreignKey: "user_id" });
   };

   return user_informations;
};
