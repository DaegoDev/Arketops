/**
 * QuotationAux.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

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
    date: {
      type: Sequelize.DATE,
      allowNull: false,
      validate: {
        isDate: true,
      }
    },
    fileURI: {
      type: Sequelize.STRING(512),
      allowNull: false,
    },
    ClientNit: {
      type: Sequelize.STRING(32),
      allowNull: false,
      unique: true,
    },
    ClientEmail: {
      type: Sequelize.STRING(64),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    quotationValidityPeriod: {
      type: Sequelize.STRING(8),
      allowNull: true
    }
  },
  // Describe las asociones que tiene con los demás modelos.
  associations: function () {
    // Asociación uno a muchos con el modelo PaymentForm.
    QuotationAux.belongsTo(PaymentForm, {
      foreignKey: {
        name: 'paymentFormId',
        allowNull: true
      }
    });
    // Asociación uno a muchos con el modelo company.
    QuotationAux.belongsTo(Company, {
      foreignKey: {
        name: 'supplierId',
        allowNull: false
      }
    });
  },
  // Configuraciones y metodos del modelo.
  options: {
    tableName: 'quotation_aux',
    timestamps: false,
    classMethods: {},
    instanceMethods: {},
    hooks: {}
  },
};
