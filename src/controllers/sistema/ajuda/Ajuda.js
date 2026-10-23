const Sequelize = require("sequelize")
const conn = require("../../../database/conn");

const Ajuda = conn.define("ajuda", {
  ajudaId: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  ajudaTitulo: {
    type: Sequelize.STRING(60),
    defaultValue: "",
    allowNull: false
  },
  ajudaModulo: {
    type: Sequelize.STRING(60),
    defaultValue: "",
    allowNull: false
  },
  ajudaPalavraChave: {
    type: Sequelize.STRING,
    defaultValue: "",
    allowNull: false
  },
  ajudaInfo: {
    type: Sequelize.TEXT("long"),
    defaultValue: "",
    allowNull: false
  },

})

// Ajuda.sync({ force: false }).then(() => { console.log("Ajuda OK!")})

module.exports = Ajuda