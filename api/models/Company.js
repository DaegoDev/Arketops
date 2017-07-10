/**
 * Company.js
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
    // associations: function() {
    //   Company.belongsTo(User);
    // },
    // options: {
    //   // freezeTableName: true,
    //   tableName: 'company',
    //   classMethods: {},
    //   instanceMethods: {},
    //   hooks: {}
    // },
  }
};
