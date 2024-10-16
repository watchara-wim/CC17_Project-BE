module.exports = (sequelize, DataTypes) => {
   const tables = sequelize.define(
      "Tables",
      {
         table_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
         },
         table_number: {
            type: DataTypes.INTEGER,
            allowNull: false,
         },
         capacity: {
            type: DataTypes.INTEGER,
            allowNull: false,
         },
         status: {
            type: DataTypes.STRING(255),
            allowNull: false,
         },
      },
      {
         timestamps: true,
         createdAt: "created_at",
         updatedAt: "last_update",
      }
   );

   tables.associate = (models) => {
      tables.belongsToMany(models.Reservations, { through: models.Has });
   };

   return tables;
};
