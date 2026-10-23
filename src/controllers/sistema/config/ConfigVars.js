const prefixURL = "/sistema/configuracoes/" 
const prefixServ = "fncConfig"

module.exports.sysUrl = {
  main: `${prefixURL}`,
  update: `${prefixURL}update`,
  showAll: `${prefixURL}visualizar/todos`,
  saveFile: `${prefixURL}arquivo/:tipo`,
  start: `${prefixURL}start`,
}

module.exports.sys = {
  main: {
    cmdURL: this.sysUrl.main,
    cmdService: `${prefixServ}`,
    cmdMethod: "get",
  },
  update: {
    cmdURL: this.sysUrl.update,
    cmdService: `${prefixServ}Update`,
    cmdMethod: "post",
  },
  showAll: {
    cmdURL: this.sysUrl.showAll,
    cmdService: `${prefixServ}ShowAll`,
    cmdMethod: "get",
  },
  saveFile: {
    cmdURL: this.sysUrl.saveFile,
    cmdService: `${prefixServ}SaveFile`,
    cmdMethod: "post",
  },
  start: {
    cmdURL: this.sysUrl.start,
    cmdService: `${prefixServ}Start`,
    cmdMethod: "get",
  }
}

module.exports.mainBtns = [
  [
    { element: "label",  for:"logoFileLogin", title:"Tela inicial" },
    { element: "input",  type:"file", id:"logoFileLogin", class:"form-control form-control-sm", others:"image/*"},
    { element: "button",  type:"button", id:"btnMainShowLogin", class:"btn btn-sm btn-outline-primary", title: "Visualizar", action: "show,login"},
    { element: "button",  type:"button", id:"btnMainUpLogin", class:"btn btn-sm btn-outline-success", title: "Alterar", action: "update,login,logoFileLogin"},
  ],
  [
    { element: "label",  for:"logoFilePrint", title:"Impressão" },
    { element: "input",  type:"file", id:"logoFilePrint", class:"form-control form-control-sm", others:"image/*"},
    { element: "button",  type:"button", id:"btnMainShowPrint", class:"btn btn-sm btn-outline-primary", title: "Visualizar", action: "show,print"},
    { element: "button",  type:"button", id:"btnMainUpPrint", class:"btn btn-sm btn-outline-success", title: "Alterar", action: "update,print,logoFilePrint"},
  ]
]
