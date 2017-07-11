/**
 * ElementProduct.js
 *
 * @description :: Modelo que representa la tabla element_product de la base de datos.
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
    main: {
      type: Sequelize.BOOLEAN,
      allowNull: false
    },
  },
  // Configuraciones y metodos del modelo.
  options: {
    tableName: 'element_product',
    timestamps: false,
    classMethods: {},
    instanceMethods: {},
    hooks: {}
  },
};
