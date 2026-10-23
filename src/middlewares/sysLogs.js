const Sysdatalog = require("../controllers/sistema/logs/Logs")
const moment = require("moment")
const { log } = require("../utilidades/textos")

module.exports.sysLogs = (logType, logUser, logRoute, params, logBody, logInfo) => {
  logUser = logUser ? logUser : "---"
  const agora = new Date()
  const logDate = moment(agora).format("YYYY-MM-DD")
  const logTime = moment(agora).format("HH:mm:ss")
  const text = log.find(x => x.codigo == logType).texto
  if (text == "erro") {
    console.error(moment(logDate).format("DD/MM/YYYY"), logTime, logUser, logRoute, logInfo, logBody)
    return Sysdatalog.create({ logType: text, logDate, logTime, logUser, logRoute, logBody: JSON.stringify(logBody), logInfo: `${text} ${logInfo}` })
  } else {
    console.log(moment(logDate).format("DD/MM/YYYY"), logTime, logUser, logRoute, params, logBody)
    return Sysdatalog.create({ logType: text, logDate, logTime, logUser, logRoute, logBody: JSON.stringify(logBody), logInfo: `${text} ${logInfo}` })
  }
}
