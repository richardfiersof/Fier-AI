const Sequelize = require("sequelize")
const conn = require("../../../database/conn")

const Estruturas = conn.define("estruturas", {
  estruturaCodigo: {
    type: Sequelize.STRING(19),
    primaryKey: true,
    unique: true,
    allowNull: false
  },
  estruturaNome: {
    type: Sequelize.STRING(50),
    defaultValue: "",
    allowNull: false
  },
  estruturaTipo: {
    type: Sequelize.STRING(10),
    defaultValue: "botao",
    allowNull: false
  },
  estruturaAtivo: {
    type: Sequelize.INTEGER(1),
    defaultValue: 1,
    allowNull: false
  },
}, {
  indexes: [
    { name:"estruturaAtivo", unique: false, fields: ["estruturaAtivo"] },
  ]
});

// Estruturas.sync({ force: false }).then(() => { console.log("Estrutura OK!")})

module.exports = Estruturas