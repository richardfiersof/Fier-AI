const Sequelize = require("sequelize")
const conn = require("../../../database/conn")

const Avisos = conn.define("avisos", {
  avisoId: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  avisoTexto: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  avisoData: {
    type: Sequelize.DATEONLY,
    allowNull: false
  },
  avisoHora: {
    type: Sequelize.TIME,
    allowNull: false
  },
})

// Avisos.sync({ force: false }).then(() => { console.log("Avisos OK!") })

module.exports = Avisos