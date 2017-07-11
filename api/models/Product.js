/**
 * Product.js
 *
 * @description :: Modelo que representa la tabla product de la base de datos.
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
    code: {
      type: Sequelize.STRING(32),
      allowNull: false,
      unique: true
    },
    imageURI: {
      type: Sequelize.STRING(512),
      allowNull: false,
      validate: {
        isUrl: true,
      }
    },
    name: {
      type: Sequelize.STRING(128),
      allowNull: false,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    price: {
      type: Sequelize.FLOAT,
      allowNull: false
    },
    available: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  },
  // Describe las asociones que tiene con los demás modelos.
  associations: function() {
    // Asociación muchos a muchos con el modelo ElementData.
    Product.belongsToMany(ElementData, {
      through: ElementProduct,
      foreignKey: {
        name: 'productId',
        allowNull: false
      }
    });
    // Asociación uno a muchos con el modelo State.
    Product.belongsTo(State, {
      foreignKey: {
        name: 'stateId',
        allowNull: false
      }
    });
    // Asociación muchos a muchos con el modelo Company.
    Product.belongsToMany(Company, {
      through: Portfolio,
      foreignKey: {
        name: 'productId',
        allowNull: false
      }
    });
  },
  // Configuraciones y metodos del modelo.
  options: {
    tableName: 'product',
    timestamps: false,
    classMethods: {},
    instanceMethods: {},
    hooks: {}
  },
};
