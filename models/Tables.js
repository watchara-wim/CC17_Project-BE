module.exports = (sequelize, DataType) => {
   const tables = sequelize.define(
      "Table",
      {
         table_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
         },
         table_number: {
            type: DataType.INTEGER,
            allowNull: false,
         },
         capacity: {
            type: DataType.INTEGER,
            allowNull: false,
         },
         status: {
            type: DataType.STRING(255),
            allowNull: false,
         },
      },
      {
         timestamps: true,
         createAt: "created_at",
         updateAt: "last_update",
      }
   );

   tables.associate = (models) => {
      tables.belongsToMany(models.Reservations, { through: models.Has });
   };

   return tables;
};
