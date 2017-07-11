/**
 * State.js
 *
 * @description :: Modelo que representa la tabla state de la base de datos.
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
    name: {
      type: Sequelize.STRING(32),
      allowNull: false,
    },
  },
  // Describe las asociones que tiene con los demás modelos.
  associations: function () {
    // Asociación uno a muchos con el modelo Product.
    State.hasMany(Product, {
      foreignKey: {
        name: 'stateId',
        allowNull: false
      }
    })
  },
  // Configuraciones y metodos del modelo.
  options: {
    tableName: 'state',
    timestamps: false,
    classMethods: {},
    instanceMethods: {},
    hooks: {}
  },
};
