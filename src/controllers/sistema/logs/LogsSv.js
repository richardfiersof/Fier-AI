const moment = require("moment")
const Sequelize = require("sequelize")
const Op = Sequelize.Op
const Logs = require("./Logs")

const {
  sys,
  tableConfig,
  sysUrl,
  mainForm,
  mainBtns
} = require("./LogsVars")
const { defaultResponseJson, defaultResponseSend, defaultResponseRender } = require("../../../utilidades/respostas")
const { errorPage } = require("../../../middlewares/errorPage")
const { reqRender } = require("../../../utilidades/utils")
const logText = "logs"

module.exports[sys.main.cmdService] = async (req, res) => {
  try {

    const sessionObj = await reqRender(req)
    let selectedId = 0
    const { selected } = req.query
    if (!isNaN(parseInt(selected))) {
      selectedId = parseInt(selected)
    }

    const canReport = sessionObj.acessos.includes(sys.report.cmdId)

    return await defaultResponseRender(req, res, "ACCESS", logText, "sistema/logs/logs", {
      ...sessionObj,
      sysTitle: "Logs",
      selectedId,
      canRead: true,
      canReport,
      mainForm
    })
  } catch (error) {
    return await defaultResponseJson(req, res, "ERROR", logText, 500, error.message)
  }
}

module.exports[sys.showAll.cmdService] = async (req, res) => {
  try {

    const { logDate } = req.params
    const querys = req.query
    const log = querys.log

    let where = {}
    if ( querys ) where = querys
    if ( where.log ) delete where.log
    if(!req.session.usNome.includes(".fiersof")){
      where.logUser = {
        [Op.ne]: "SISTEMA"
      }
    }
    where.logDate = logDate
    const qry =
    await Logs
    .findAll(
      {
        where,
        raw: true
      }
    )

    if (qry.length > 0) 
      return await defaultResponseSend(req, res, !log?"ACCESS": null, !log? logText: null, 200, qry )
    return await defaultResponseJson(req, res, "ERROR", logText, 404)

  } catch (error) {
    return await defaultResponseJson(req, res, "ERROR", logText, 500, error.message)
  }
}

module.exports[sys.report.cmdService] = async (req, res) => {
  try {

    const usuario = []
    const acoes = []
    const mainArr = []

    const { data } = req.params

    const qry =
    await Logs
    .findAll(
      {
        where:{
          logDate: data,
          logType: {
            [Op.ne]: 'acesso'
          }
        },
        raw: true
      }
    )

    if(qry.length <=0)
      return errorPage(req,res,`Sem registros no dia: ${moment(data).format("DD/MM/YYYY")}`)
    const filteredData = qry.filter(x=> x.logType != "error" && !x.logRoute.includes("visualizar/todos"))
    if(filteredData.length <=0)
      return errorPage(req,res,`Sem registros no dia: ${moment(data).format("DD/MM/YYYY")}`)

    for await ( const item of filteredData){
      if(item.logUser == "---") continue
      if(!usuario.includes(item.logUser))
        usuario.push(item.logUser)
      if(!acoes.includes(item.logType))
        acoes.push(item.logType)
    }

    for await ( const user of usuario){
      const mainObj = {
        usuario: user,
        acoes: []
      }
      for await( const item of acoes){
        const fData2 = filteredData.filter(x=> x.logUser == user && x.logType == item)
        if(fData2.length >0){
          mainObj.acoes.push(
            {
              acao: item,
              qtd: fData2.length
            }
          )
        }
      }
      if(mainObj.acoes.length >0)
        mainArr.push(mainObj)
    }

    const sessionObj = await reqRender(req)

    return await defaultResponseRender(req, res, "ACCESS", logText, "sistema/logs/relatorio", {
      ...sessionObj,
      moment,
      mainArr,
      data,
      canRead: true,
      canVoltar: true
    })
  } catch (error) {
    return await defaultResponseJson(req, res, "ERROR", logText, 500, error.message)
  }
}

module.exports[sys.start.cmdService] = async (req, res) => {
  try {

    return res
    .status(200)
    .json(
      {
        sys: sysUrl,
        tableConfig,
        mainForm,
        mainBtns
      }
    )
  } catch (error) {
    return await defaultResponseJson(req, res, "ERROR", logText, 500, error.message)
  }
}
