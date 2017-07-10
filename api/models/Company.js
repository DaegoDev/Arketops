/**
 * Company.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  options: {
    tableName: 'company',
    classMethods: {},
    instanceMethods: {},
    hooks: {}
  },
  attributes: {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING,
    }
  },

  associations: function() {
    Company.belongsTo(User, {
      as: 'user',
      foreignKey: {
        name: 'user_id',
        allowNull: false
      }
    });
  }
};
