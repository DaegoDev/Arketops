/**
 * Company.js
 *
 * @description :: Modelo que representa la tabla company de la base de datos.
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
      type: Sequelize.STRING(256),
      allowNull: false,
      unique: true,
    },
    nit: {
      type: Sequelize.STRING(32),
      allowNull: false,
      unique: true,
    },
    imageURI: {
      type: Sequelize.STRING(512),
      allowNull: false,
      validate: {
        isUrl: true,
      }
    },
    businessOverview: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    website: {
      type: Sequelize.STRING(64),
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    quotationValidityPeriod: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: {
        isNumeric: true,
      }
    },
    paymentForm: {
      type: Sequelize.STRING(32),
      allowNull: false,
    },
  },
  // Describe las asociones que tiene con los demás modelos.
  associations: function() {
    // Asociación  uno a uno con el modelo User.
    Company.belongsTo(User, {
      foreignKey: {
        name: 'userId',
        allowNull: false
      }
    });
    // Asociación uno a muchos con el modelo Headquarters.
    Company.hasMany(Headquarters,{
      foreignKey: {
        name: 'companyId',
        allowNull: false
      }
    });
    // Asociación muchos a muchos con el modelo Product.
    Company.belongsToMany(Product, {
      through: Portfolio,
      foreignKey: {
        name: 'companyId',
        allowNull: false
      }
    });
    // Asociación muchos a muchos con el modelo Company.
    Company.belongsToMany(Company, {
      as: 'clients',
      through: ClientSupplier,
      foreignKey: {
        name: 'supplierId',
        allowNull: false
      },
      otherKey: {
        name: 'clientId',
        allowNull: false
      }
    });
  },
  // Configuraciones y metodos del modelo.
  options: {
    tableName: 'company',
    timestamps: false,
    classMethods: {},
    instanceMethods: {},
    hooks: {}
  },
};
