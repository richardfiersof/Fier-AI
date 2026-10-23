const Sequelize = require("sequelize")
const conn = require("../../../database/conn");

const Logs = conn.define("logs", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  logDate: {
    type: Sequelize.DATEONLY,
    allowNull: false,
  },
  logTime: {
    type: Sequelize.STRING(8),
    allowNull: false,
  },
  logUser: {
    type: Sequelize.STRING(80),
    allowNull: false,
  },
  logType: {
    type: Sequelize.STRING(50),
    allowNull: false,
  },
  logInfo: {
    type: Sequelize.STRING(100),
    allowNull: false,
  },
  logRoute: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  logBody: {
    type: Sequelize.TEXT,
    allowNull: true,
  },

}, {
  indexes: [
    { name:"logDate", unique: false, fields: ["logDate"] },
    { name:"logType", unique: false, fields: ["logType"] },
    { name:"logUser", unique: false, fields: ["logUser"] },
  ]
});

// Logs.sync({ force: false }).then(() => { console.log("Logs OK!")})

module.exports = Logs


