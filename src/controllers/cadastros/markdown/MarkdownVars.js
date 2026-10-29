const { tabulatorConfguracoesPadrao, opYesNo } = require("../../../utilidades/utils")

module.exports.prefixId = "0001-0002-0000-"
const prefixURL = "/cadastro/markdown/"
const prefixServ = "fncMarkdown"
const prefixTitle = "Markdown"

module.exports.sysUrl = {
  main:        `${prefixURL}`,
  showAll:     `${prefixURL}visualizar/todos`,
  show:        `${prefixURL}visualizar/apenas/:markdownId`,
  new:         `${prefixURL}novo`,
  delete:      `${prefixURL}delete`,
  update:      `${prefixURL}update`,
  start:       `${prefixURL}start`,
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
    { column: "markdownId", dir: "desc" },
  ],
  columns: [
    { title: "Id", download:false , field: "markdownId", headerFilter: true, hozAlign: "center", width: 100, sorter: "number" },
    { title: "Titulo", field: "markdownTitulo", headerFilter: true },
    { title: "Ativo", download: false, field: "markdownAtivo", headerFilter: "tickCross", hozAlign: "center", headerHozAlign: "center", formatter:"tickCross", headerFilterParams:{"tristate":true},headerFilterEmptyCheck:function(value){return value === null}},
  ],
}

module.exports.mainForm = [
  { titulo: "Id", nome: "markdownId", type: "input", dataType: "number", atritubos: ["disabled=true"] },
  { titulo: "Titulo", nome: "markdownTitulo", type: "input", dataType: "text", atritubos: ["required=true focus=mainModal"] },
  { titulo: "Ativo?", nome: "markdownAtivo", type: "select", opcoes: opYesNo, atritubos: ["required=true"] },
  { titulo: "Arquivo", nome: "markdownArquivo", type: "input", dataType: 'file', atritubos: ["accept=.md"] },
]

module.exports.mainBtns = [
  { name: "btnMainNew", type: "new", modal: "mainModal", func: "main", title: "Novo" },
  { name: "btnMainUpdate", type: "update", modal: "mainModal", func: "main", title: "Editar" },
  { name: "btnMainShow", type: "show", modal: "mainModal", func: "main", title: "Consultar" },
  { name: "btnMainDelete", type: "delete", modal: "deleteModal", func: null, title: "Deletar" },
  { name: "btnMainArquivo", type: "arquivo", modal: "arquivoModal", func: null, title: "" },
]

module.exports.modalInfo = [
  {
    modalId: "arquivoModal", modalForm: "formArquivoModal", modalData: "arquivosModalBody", modalBtn: null,
    modalSize: "modal-lg", modalType: "modal-clear", modalTitle: "Arquivo",
  },
]