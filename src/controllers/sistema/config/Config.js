const Sequelize = require("sequelize")
const conn = require("../../../database/conn");

const Configs = conn.define("configs", {
  configId: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  configGrupo: {
    type: Sequelize.STRING(30),
    defaultValue: "",
    allowNull: false,
  },
  configDescricao: {
    type: Sequelize.STRING(100),
    defaultValue: "",
    allowNull: false,
  },
  configValor: {
    type: Sequelize.STRING,
    defaultValue: "",
    allowNull: false,
  },
  configValorPadrao: {
    type: Sequelize.STRING,
    defaultValue: "",
    allowNull: false,
  },
  configDados: {
    type: Sequelize.STRING(20),
    defaultValue: "",
    allowNull: false,
  },
  configSubgrupo: {
    type: Sequelize.STRING(10),
    defaultValue: "",
    allowNull: false,
  },
  configSequencia: {
    type: Sequelize.STRING(10),
    defaultValue: "",
    allowNull: false,
  },

})


Configs.sync({ force: false }).then(async () => {
  const check =
  await Configs
  .findAll({raw:true})
  if (check.length <= 0) {
    const valores = [
      {
        configGrupo: "EMAIL", configDescricao: "SMTP: Servidor",
        configValor: "", configValorPadrao: "smtp.gmail.com",
        configDados: "text", configSubgrupo: "EMAIL-SMTP",
        configSequencia: "SMTP-0001"
      },
      {
        configGrupo: "EMAIL", configDescricao: "SMTP: Porta",
        configValor: "", configValorPadrao: "587",
        configDados: "number", configSubgrupo: "EMAIL-SMTP",
        configSequencia: "SMTP-0002"
      },
      {
        configGrupo: "EMAIL", configDescricao: "SMTP: Conexão Segura",
        configValor: "false", configValorPadrao: "false",
        configDados: "boolean", configSubgrupo: "EMAIL-SMTP",
        configSequencia: "SMTP-0003"
      },
      {
        configGrupo: "EMAIL", configDescricao: "SMTP: Email/Usuário",
        configValor: "", configValorPadrao: "",
        configDados: "email", configSubgrupo: "EMAIL-SMTP",
        configSequencia: "SMTP-0004"
      },
      {
        configGrupo: "EMAIL", configDescricao: "SMTP: Senha",
        configValor: "", configValorPadrao: "",
        configDados: "password", configSubgrupo: "EMAIL-SMTP",
        configSequencia: "SMTP-0005"
      }
    ]
    await Configs.bulkCreate(valores)
  }
  console.log("Configurações OK!")
})


module.exports = Configs