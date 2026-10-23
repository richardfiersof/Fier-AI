const Sequelize = require("sequelize")
const conn = require("../../../database/conn")

const Estrutura = require("./Estruturas")
const Usuarios = require("../usuarios/Usuarios")

const Acessos = conn.define("acessos", {
  acessoLiberado: {
    type: Sequelize.INTEGER(1),
    defaultValue: 0,
    allowNull: false
  },
  estruturaCodigo: {
    type: Sequelize.STRING(19),
    allowNull: false
  },
  usId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
}, {
  indexes: [{ name:"usEstrutura", unique: true, fields: ["usId", "estruturaCodigo"] }]
});

Acessos.belongsTo(Estrutura, { foreignKey: "estruturaCodigo" })
Acessos.belongsTo(Usuarios, { foreignKey: "usId" })
Usuarios.hasMany(Acessos, { foreignKey: "usId" })
Estrutura.hasMany(Acessos, { foreignKey: "estruturaCodigo" })


// Acessos.sync({ force: false }).then(() => { console.log("Acessos OK!")})

module.exports = Acessos