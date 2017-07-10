/**
 * User.js
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
        len: [6,20]
      }
    },
    state: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  },
  associations: function() {
    User.hasOne(Company, {
      as : 'user',
      foreignKey: {
        name: 'userId',
        allowNull: false
      }
    });
  },
  options: {
    // freezeTableName: true,
    tableName: 'user',
    classMethods: {},
    instanceMethods: {},
    hooks: {}
  },
};
