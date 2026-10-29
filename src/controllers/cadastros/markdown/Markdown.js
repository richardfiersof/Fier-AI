const Sequelize = require("sequelize")
const conn = require("../../../database/conn")

const Markdown = conn.define("markdown", {
  markdownId: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  markdownTitulo: {
    type: Sequelize.STRING(60),
    defaultValue: "",
    allowNull: false
  },
  markdownAtivo: {
    type: Sequelize.TINYINT(1),
    defaultValue: 1,
    allowNull: false
  },
}, {
  indexes: [
    { name:"markdownAtivo", unique: false, fields: ["markdownAtivo"] },
  ]
})

// Markdown.sync({ force: false }).then(() => { console.log("Markdown OK!") })

module.exports = Markdown