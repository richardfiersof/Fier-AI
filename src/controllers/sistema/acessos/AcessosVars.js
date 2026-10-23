module.exports.prefixId = "9000-0001-0000-"
const prefixURL = "/sistema/acessos/"
const prefixServ = "fncAcessos"
const prefixTitle = "Acessos "

module.exports.sysUrl = {
  main: `${prefixURL}usuario/:usId`,
  updateOne: `${prefixURL}update/one`,
  updateAll: `${prefixURL}update/all`,
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
  updateOne: {
    cmdId: `${this.prefixId}0010`,
    cmdURL: this.sysUrl.updateOne,
    cmdService: `${prefixServ}ShowAll`,
    cmdType: "botao",
    cmdMethod: "post",
    cmdTitle: `Liberar/Bloquear`,
    cmdIgnore: false,
    cmdAtivo: "1",
  },
  updateAll: {
    cmdId: `${this.prefixId}0010`,
    cmdURL: this.sysUrl.updateAll,
    cmdService: `${prefixServ}ShowOnlyOne`,
    cmdType: "botao",
    cmdMethod: "post",
    cmdTitle: `Liberar/Bloquear`,
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