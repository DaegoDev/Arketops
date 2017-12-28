/**
 * PaymentForm.js
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
    name: {
      type: Sequelize.STRING(32),
      allowNull: false,
    },
  },
  // Describe las asociones que tiene con los demás modelos.
  associations: function () {
    // Asociación uno a muchos con el modelo Quotation.
    PaymentForm.hasMany(Quotation, {
      foreignKey: {
        name: 'paymentFormId',
        allowNull: true
      }
    });
    // Asociación uno a muchos con el modelo Quotation.
    PaymentForm.hasMany(QuotationAux, {
      foreignKey: {
        name: 'paymentFormId',
        allowNull: true
      }
    })
  },
  // Configuraciones y metodos del modelo.
  options: {
    tableName: 'payment_form',
    timestamps: false,
    classMethods: {},
    instanceMethods: {},
    hooks: {}
  },
};
