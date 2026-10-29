const Sequelize = require("sequelize")
const conn = require("../../../database/conn")
const Usuarios = require("../../sistema/usuarios/Usuarios")
const Markdown = require("../markdown/Markdown")

const Conversas = conn.define("conversas", {
  conversaId: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  conversaTitulo: {
    type: Sequelize.STRING(60),
    defaultValue: "",
    allowNull: false
  },
  conversaConteudo: {
    type: Sequelize.TEXT("large"),
    defaultValue: "",
    allowNull: false
  },
  conversaResposta: {
    type: Sequelize.TEXT("large"),
    defaultValue: "",
    allowNull: false
  },
  conversaData: {
    type: Sequelize.DATEONLY,
    defaultValue: Sequelize.NOW,
    allowNull: false
  },
  conversaStatus: {
    type: Sequelize.STRING(20),
    defaultValue: "Aberto",
    allowNull: false
  },
  usId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  markdownId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
}, {
  indexes: [
    { name:"conversaData", unique: false, fields: ["conversaData"] },
    { name:"conversaStatus", unique: false, fields: ["conversaStatus"] },
  ]
})

Conversas.belongsTo(Usuarios, { foreignKey: "usId" })
Usuarios.hasMany(Conversas, { foreignKey: "usId" })
Conversas.belongsTo(Markdown, { foreignKey: "markdownId" })
Markdown.hasMany(Conversas, { foreignKey: "markdownId" })
//DROP TABLE `conversas`
//npm install marked
// Conversas.sync({ force: false }).then(() => { console.log("Conversas OK!") })

module.exports = Conversas