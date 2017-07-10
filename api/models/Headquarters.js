/**
 * Headquarters.js
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
    country: {
      type: Sequelize.STRING(64),
      allowNull: false,
    },
    department: {
      type: Sequelize.STRING(64),
      allowNull: false,
    },
    city: {
      type: Sequelize.STRING(64),
      allowNull: false,
    },
    nomenclature: {
      type: Sequelize.STRING(64),
      allowNull: false
    },
    phonenumber: {
      type: Sequelize.STRING(32),
      allowNull: false
    },
    contact: {
      type: Sequelize.STRING(256),
      allowNull: false
    },
    contactPhonenumber: {
      type: Sequelize.STRING(32),
      allowNull: true
    },
    main: {
      type: Sequelize.BOOLEAN,
      allowNull: false
    },
    associations: function() {
      Headquarters.belongsTo(Company);
    },
    options: {
      tableName: 'headquarters',
      classMethods: {},
      instanceMethods: {},
      hooks: {}
    },
  }
};
