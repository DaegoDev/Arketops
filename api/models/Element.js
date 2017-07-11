/**
 * Element.js
 *
 * @description :: Modelo que representa la tabla element de la base de datos.
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
      type: Sequelize.STRING(64),
      allowNull: false,
      unique: true,
    },
  },
  // Describe las asociones que tiene con los demás modelos.
  associations: function () {
    // Asociación uno a muchos con el modelo ElementData.
    Element.hasMany(ElementData, {
      foreignKey: {
        name: 'elementId',
        allowNull: false
      }
    });
  },
  // Configuraciones y metodos del modelo.
  options: {
    tableName: 'element',
    timestamps: false,
    classMethods: {},
    instanceMethods: {},
    hooks: {}
  },
};
