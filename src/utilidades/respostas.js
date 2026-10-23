const { sysLogs } = require('../middlewares/sysLogs')
const { resposta } = require('./textos')

module.exports.defaultResponseJson = async (req, res, logType, logText, status, message = null, selectedId = null, noBody = false) =>{
  const registro  = resposta.find(x=> x.status == status)
  if(!req.session.usNome.includes(".fiersof") || process.env.TYPE_DEV == 1){
    if( (logType && logText) && !(logType == "ERROR" && status == 404 && req.url.includes("?log") ) ){
      sysLogs(
        logType,
        req.session.usNomeCompleto,
        req.url.split("?log")[0].split("&log")[0],
        req.params,
        noBody ? '' : req.body,
        logType == "ERROR" || logType == "ERRO" ? `${message} - ${logText}` : logText
      )
    }
  }

  const obj = {}
  if(selectedId) obj.selectedId = selectedId
  if(message) obj.message = message
  else obj.message = registro.message
  return res.status(status).json(obj) 
}

module.exports.defaultResponseSend = async (req, res, logType, logText, status,  data = {}) =>{
  if(!req.session.usNome.includes(".fiersof") || process.env.TYPE_DEV == 1){
    if( logType && logText){
      sysLogs(
        logType,
        req.session.usNomeCompleto,
        req.url.split("?log")[0].split("&log")[0],
        req.params,
        req.body,
        logType == "ERROR" || logType == "ERRO" ? `${message} - ${logText}` : logText
      )
    }
  }
  return res.status(status).send(data)
}

module.exports.defaultResponseRender = async (req, res, logType, logText, filePath, data = {}) =>{
  if(!req.session.usNome.includes(".fiersof") || process.env.TYPE_DEV == 1){
    sysLogs(
      logType,
      req.session.usNomeCompleto,
      req.url.split("?log")[0].split("&log")[0],
      req.params,
      req.body,
      logText
    )
  }
  return res.render(filePath,data)
}

module.exports.defaultResponseErrorExternal = async (funcao, parametros, corpo, error) =>{
  sysLogs(
    "ERROR",
    "SISTEMA",
    funcao,
    parametros,
    corpo,
    error = error
  )
}
