module.exports.prefixId = "9000-0002-0000-"
const prefixURL = "/sistema/usuarios/"
const prefixServ = "fncUsuarios"
const prefixTitle = "Usuários"

const { tabulatorConfguracoesPadrao, opYesNo, opNoYes } = require("../../../utilidades/utils")

module.exports.sysUrl = {
  main: `${prefixURL}`,
  showAll: `${prefixURL}visualizar/todos`,
  show: `${prefixURL}visualizar/apenas/:usId`,
  new: `${prefixURL}novo`,
  resetPws: `${prefixURL}reset/pws`,
  update: `${prefixURL}update`,
  start: `${prefixURL}start`,
}

module.exports.sys = {
  main: {
    cmdId: `${this.prefixId}0001`,
    cmdURL: this.sysUrl.main,
    cmdService: `${prefixServ}`,
    cmdType: "menu",
    cmdMethod: "get",
    cmdTitle: `${prefixTitle}`,
    cmdIgnore: false,
    cmdAtivo: "1",
  },
  showAll: {
    cmdId: `${this.prefixId}0001`,
    cmdURL: this.sysUrl.showAll,
    cmdService: `${prefixServ}ShowAll`,
    cmdType: "botao",
    cmdMethod: "get",
    cmdTitle: `Consultar`,
    cmdIgnore: true,
    cmdAtivo: "1",
  },
  show: {
    cmdId: `${this.prefixId}0001`,
    cmdURL: this.sysUrl.show,
    cmdService: `${prefixServ}ShowOnlyOne`,
    cmdType: "botao",
    cmdMethod: "get",
    cmdTitle: `Consultar`,
    cmdIgnore: true,
    cmdAtivo: "1",
  },
  new: {
    cmdId: `${this.prefixId}0020`,
    cmdURL: this.sysUrl.new,
    cmdService: `${prefixServ}New`,
    cmdType: "botao",
    cmdMethod: "post",
    cmdTitle: `Criar`,
    cmdIgnore: false,
    cmdAtivo: "1",
  },
  resetPws: {
    cmdId: `${this.prefixId}0030`,
    cmdURL: this.sysUrl.resetPws,
    cmdService: `${prefixServ}ResetPws`,
    cmdType: "botao",
    cmdMethod: "post",
    cmdTitle: `Resetar Senha`,
    cmdIgnore: false,
    cmdAtivo: "1",
  },
  update: {
    cmdId: `${this.prefixId}0040`,
    cmdURL: this.sysUrl.update,
    cmdService: `${prefixServ}Update`,
    cmdType: "botao",
    cmdMethod: "post",
    cmdTitle: `Alterar`,
    cmdIgnore: false,
    cmdAtivo: "1",
  },
  start: {
    cmdId: `${this.prefixId}0001`,
    cmdURL: this.sysUrl.start,
    cmdService: `${prefixServ}Start`,
    cmdType: "botao",
    cmdMethod: "get",
    cmdTitle: `${prefixTitle}`,
    cmdIgnore: true,
    cmdAtivo: "1",
  }
}


module.exports.tableConfig = {
  ...tabulatorConfguracoesPadrao,
  columns: [
    { title: "Id", download:false , field: "usId", sorter: "number", headerFilter: true, hozAlign: "center" },
    { title: "Nome", field: "usNomeCompleto", headerFilter: true },
    { title: "E-mail", field: "usEmail", headerFilter: true },
    { title: "Ativo", download: false, field: "usAtivo", headerFilter: "tickCross", hozAlign: "center", headerHozAlign: "center", formatter:"tickCross", headerFilterParams:{"tristate":true},headerFilterEmptyCheck:function(value){return value === null}},

    // { title: "Data Admissão", field: "usDataAdmissao", width: 155, hozAlign: "center", headerHozAlign: "center", headerFilter: "date", formatter:"datetime", formatterParams:{
      // inputFormat:"yyyy-MM-dd", outputFormat:"dd/MM/yyyy", invalidPlaceholder:"", timezone:"America/Sao_Paulo" }  },
  ],
}

module.exports.mainForm = [
  { titulo: "Id" , nome: "usId", type: "input", dataType: "number", atritubos: ["disabled=true"] },
  { titulo: "Email", nome: "usEmail", type: "input", dataType: "text", atritubos: ["required=true focus=mainModal"] },
  { titulo: "Login", nome: "usNome", type: "input", dataType: "text", atritubos: ["required=true"] },
  { titulo: "Nome Completo", nome: "usNomeCompleto", type: "input", dataType: "text", atritubos: ["required=true"] },
  { titulo: "Senha", nome: "usSenha", type: "input", dataType: "password", atritubos: ["required=true"] },
  { titulo: "Administrador do Sistema?", nome: "usMaster", type: "select", opcoes: opNoYes, atritubos: [""] },
  { titulo: "Ativo?", nome: "usAtivo", type: "select", opcoes: opYesNo, atritubos: ["required=true"] },
]

module.exports.mainBtns = [
  { name: "btnMainNew", type: "new", modal: "mainModal", func: "main", title: "Novo" },
  { name: "btnMainUpdate", type: "update", modal: "mainModal", func: "main", title: "Editar" },
  { name: "btnMainShow", type: "show", modal: "mainModal", func: "main", title: "Consultar" },
  { name: "btnMainAcessos", type: "acessos", modal: null, func: "acessos" },
  { name: "btnMainDepartamentos", type: "departamentos", modal: null, func: "departamentos" },
  { name: "btnMainResetPws", type: "pws", modal: "mainModal", func: "main", title: "Resetar Senha" },
  { name: "btnMainNewToken", type: "newToken", modal: "tokenModal", func: "token" },
  { name: "btnMainDelToken", type: "delToken", modal: "avisoModal", func: "aviso" },
]