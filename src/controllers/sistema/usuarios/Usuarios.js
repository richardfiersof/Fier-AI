const Sequelize = require("sequelize")
const conn = require("../../../database/conn")

const Usuarios = conn.define("usuarios", {
  usId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  usNome: {
    type: Sequelize.STRING(40),
    allowNull: false,
  },
  usNomeCompleto: {
    type: Sequelize.STRING(60),
    allowNull: false,
  },
  usEmail: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false
  },
  usSenha: {
    type: Sequelize.STRING,
    allowNull: false
  },
  usMaster: {
    type: Sequelize.INTEGER,
    defaultValue: "0",
    allowNull: false
  },
  usAtivo: {
    type: Sequelize.TINYINT(1),
    defaultValue: 1,
    allowNull: false
  },
  usToken: {
    type: Sequelize.STRING,
    defaultValue: "",
    allowNull: false
  },
  usTokenValidade: {
    type: Sequelize.DATEONLY,
    defaultValue: null,
    allowNull: true
  },
}, {
  indexes:[
    { name: "usNome", unique: true, fields: ["usNome"] },
    { name: "usNomeCompleto", unique: false, fields: ["usNomeCompleto"] },
    { name: "usAtivo", unique: false, fields: ["usAtivo"] },
    { name: "usToken", unique: false, fields: ["usToken"] },
    { name: "usTokenValidade", unique: false, fields: ["usTokenValidade"] },
  ]
});

// Usuarios.sync({ force: false }).then(() => { console.log("Usuarios OK!")})

module.exports = Usuarios