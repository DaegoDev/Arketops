/**
 * ClientSupplier.js
 *
 * @description :: Modelo que representa la tabla client_supplier de la base de datos.
 * @autors      :: Jonnatan Rios Vasquez- jrios328@gmail.com    Diego Alvarez-daegoudea@gmail.com
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  // Campos de la tabla con sus atributos.
  attributes: {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      unique: true
    },
  },
  // Describe las asociones que tiene con los demás modelos.
  associations: function () {
    // Asociación muchos a muchos con el modelo ElementData.
    ClientSupplier.belongsToMany(ElementData, {
      through: ClientDiscount,
      foreignKey: {
        name: 'clientSupplierId',
        allowNull: false
      }
    });
    // Asociación uno a muchos con el model Quotation.
    ClientSupplier.hasMany(Quotation, {
      foreignKey: {
        name: 'clientSupplierId',
        allowNull: false
      }
    })
  },
  // Configuraciones y metodos del modelo.
  options: {
    tableName: 'client_supplier',
    timestamps: false,
    classMethods: {},
    instanceMethods: {},
    hooks: {}
  },
};
