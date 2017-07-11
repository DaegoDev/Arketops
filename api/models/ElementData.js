/**
 * ElementData.js
 *
 * @description :: Modelo que representa la tabla element_data de la base de datos.
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
    },
    discount: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: {
        isNumeric: true,
        min: 0,
        max: 100
      }
    }
  },
  // Describe las asociones que tiene con los demás modelos.
  associations: function() {
    // Asociación muchos a muchos con el modelo Product.
    ElementData.belongsToMany(Product, {
      through: ElementProduct,
      foreignKey: {
        name: 'elementId',
        allowNull: false
      }
    });
    // Asociación uno a muchos con el modelo Element.
    ElementData.belongsTo(Element, {
      foreignKey: {
        name: 'elementId',
        allowNull: false
      }
    });
    // Asociación muchos a muchos con el modelo ElementData.
    ElementData.belongsToMany(ElementData, {
      as: 'elementsChildren',
      through: ElementLink,
      foreignKey: {
        name: 'elementFatherId',
        allowNull: false
      },
      otherKey: {
        name: 'elementChildId',
        allowNull: false
      }
    });
    // Asociación muchos a muchos con el modelo ClientSupplier.
    ElementData.belongsToMany(ClientSupplier, {
      through: ClientDiscount,
      foreignKey: {
        name: 'elementId',
        allowNull: false
      }
    });
    // Asociación uno a muchos con el modelo User.
    ElementData.belongsTo(User, {
      foreignKey: {
        name: 'userId',
        allowNull: false
      }
    })
  },
  // Configuraciones y metodos del modelo.
  options: {
    tableName: 'element_data',
    timestamps: false,
    classMethods: {},
    instanceMethods: {},
    hooks: {}
  },
};
