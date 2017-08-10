/**
 * User.js
 *
 * @description :: Modelo que representa la tabla user de la base de datos.
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
    email: {
      type: Sequelize.STRING(64),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: Sequelize.STRING(256),
      allowNull: false,
      validate: {
        len: [6, 200]
      }
    },
    state: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  },
  // Describe las asociones que tiene con los demás modelos.
  associations: function () {
    // Asociación uno a muchos con el modelo ElementData.
    User.hasMany(ElementData, {
      foreignKey: {
        name: 'userId',
        allowNull: false
      }
    });
    User.hasOne(Company, {
      foreignKey: {
        name: 'userId',
        allowNull: false
      }
    })
  },
  // Configuraciones y metodos del modelo.
  options: {
    tableName: 'user',
    timestamps: false,
    classMethods: {},
    instanceMethods: {},
    hooks: {}
  },
};
