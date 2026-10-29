const { tabulatorConfguracoesPadrao, opYesNo } = require("../../../utilidades/utils")

module.exports.prefixId = "0001-0001-0000-"
const prefixURL = "/cadastro/conversas/"
const prefixServ = "fncConversas"
const prefixTitle = "Conversas"

module.exports.sysUrl = {
  main:        `${prefixURL}`,
  showAll:     `${prefixURL}visualizar/todos`,
  show:        `${prefixURL}visualizar/apenas/:conversaId`,
  new:         `${prefixURL}novo`,
  delete:      `${prefixURL}delete`,
  update:      `${prefixURL}update`,
  pergunta:      `${prefixURL}pergunta`,
  start:       `${prefixURL}start`,
}

module.exports.sys = {
  menu:{
    cmdId: `0001-0000-0000-0000`,   
    cmdURL: `/cadastro/`,
    cmdService: ``,
    cmdType: "nav",
    cmdMethod: "get",
    cmdTitle: `Cadastro`,
    cmdIgnore: false,
    cmdAtivo: "1",
  },
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
  delete: {
    cmdId: `${this.prefixId}0030`,
    cmdURL: this.sysUrl.delete,
    cmdService: `${prefixServ}Delete`,
    cmdType: "botao",
    cmdMethod: "delete",
    cmdTitle: `Deletar`,
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
  pergunta: {
    cmdId: `${this.prefixId}0040`,
    cmdURL: this.sysUrl.pergunta,
    cmdService: `${prefixServ}Pergunta`,
    cmdType: "botao",
    cmdMethod: "post",
    cmdTitle: `Alterar`,
    cmdIgnore: true,
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
  initialSort: [
    { column: "conversaId", dir: "desc" },
  ],
  columns: [
    { title: "Id", download:false , field: "conversaId", headerFilter: true, hozAlign: "center", width: 100, sorter: "number" },
    { title: "Titulo", field: "conversaTitulo", headerFilter: true },
    { title: "Data", field: "conversaData", headerFilter: true },
    { title: "Markdown", field: "markdown.markdownTitulo", headerFilter: true },
    { title: "Status", field: "conversaStatus", headerFilter: true },
  ],
}

module.exports.mainForm = [
  { titulo: "Id", nome: "conversaId", type: "input", dataType: "number", atritubos: ["disabled=true"] },
  { titulo: "Titulo", nome: "conversaTitulo", type: "input", dataType: "text", atritubos: ["required=true focus=mainModal"] },
  { titulo: "Markdown", nome: "markdownId", type: "select", opcoes: "", atritubos: [""] },
  // { titulo: "Conteudo", nome: "conversaConteudo", type: "textarea", atritubos: ["required=true"] },
  // { titulo: "Resposta", nome: "conversaResposta", type: "textarea", atritubos: ["readonly=true"] },
]

module.exports.mainBtns = [
  { name: "btnMainNew", type: "new", modal: "mainModal", func: "main", title: "Novo" },
  { name: "btnMainUpdate", type: "update", modal: "mainModal", func: "main", title: "Editar" },
  { name: "btnMainShow", type: "show", modal: "mainModal", func: "main", title: "Consultar" },
  { name: "btnMainDelete", type: "delete", modal: "deleteModal", func: null, title: "Deletar" },
  { name: "btnMainConversa", type: "conversa", modal: "conversaModal", func: null, title: "" },
]

module.exports.conversaForm = [
  { titulo: "Pergunta", nome: "conversaConteudo", type: "textarea", atritubos: ["required=true"] },
  { titulo: "Arquivo", nome: "conversaArquivo", type: "input", dataType: 'file', atritubos: ["accept=.json,.txt,.md,.csv"] },
  { titulo: "Resposta", nome: "conversaResposta", type: "textarea", atritubos: ["readonly=true"] },
]

module.exports.modalInfo = [
  {
    modalId: "conversaModal", modalForm: "formConversaModal", modalData: this.conversaForm, modalBtn: "btnConfirma",
    modalSize: "modal-xl", modalType: "modal-multi-use", modalTitle: "Conversa", modalRowCols: "row-cols-1"
  },
]