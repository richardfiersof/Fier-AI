const prefixURL = "/utilidade/avisos/"
const prefixServ = "fncAvisos"

module.exports.sysUrl = {
  show:    `${prefixURL}show`,
}

module.exports.sys = {
  show: {
    cmdURL: this.sysUrl.show,
    cmdService: `${prefixServ}Show`,
    cmdMethod: "get",
  },
}