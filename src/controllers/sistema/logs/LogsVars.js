const { tabulatorConfguracoesPadrao } = require("../../../utilidades/utils")

module.exports.prefixId = "9000-0003-0000-"
const prefixURL = "/sistema/logs/"
const prefixServ = "fncLogs"
const prefixTitle = "Logs"

module.exports.sysUrl = {
  main: `${prefixURL}`,
  showAll: `${prefixURL}visualizar/todos/:logDate`,
  report: `${prefixURL}relatorio/dia/:data`,
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
  report: {
    cmdId: `${this.prefixId}0020`,
    cmdURL: this.sysUrl.report,
    cmdService: `${prefixServ}Report`,
    cmdType: "botao",
    cmdMethod: "get",
    cmdTitle: `Relatório`,
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
  layout:"",
  initialSort: [             //set the initial sort order of the data
    { column: "logTime", dir: "desc" }
  ],
  columns: [
    { title: "Usuário", field: "logUser", headerFilter: true },
    {
      title: "Data", field: "logDate", width: 155, hozAlign: "center", headerHozAlign: "center", headerFilter: "date", formatter:"datetime", formatterParams:{
        inputFormat:"yyyy-MM-dd", outputFormat:"dd/MM/yyyy", invalidPlaceholder:"", timezone:"America/Sao_Paulo" } 
    },
    { title: "Hora", field: "logTime", headerFilter: true },
    { title: "Tipo", field: "logType", headerFilter: true },
    { title: "Descrição", field: "logInfo", headerFilter: true },
    { title: "Url", field: "logRoute", headerFilter: true },
    { title: "Detalhe", field: "logBody", headerFilter: true },
  ],
}

module.exports.mainForm = [
  {titulo: "Data", nome: "dataReport", type: "input", dataType: "date", atritubos: ["required=true focus=mainModal"]},
]

module.exports.mainBtns = [
  {name: "btnMainDetail", type: "detail", modal: "detailModal", func: "", title: "Novo"},
  {name: "btnMainReport", type: "report", modal: "mainModal"  , func: "", title: "Registro de atividades"},
]