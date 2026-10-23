const moment = require("moment")
const fs = require("fs")
const {
  sys,
  mainBtns,
  sysUrl
} = require("./ConfigVars")
const Config = require("./Config")
const pathFile = "./src/public/images/"
const { defaultResponseJson, defaultResponseSend, defaultResponseRender } = require("../../../utilidades/respostas")
const { reqRender } = require("../../../utilidades/utils")
const logText = "configurações do sistema"

module.exports[sys.main.cmdService] = async (req, res) => {
  try {

    //Dados da Sessao
    const sessionObj = await reqRender(req)

    return await defaultResponseRender(req, res, "ACCESS", logText, "sistema/configuracoes/configuracoes", {
      ...sessionObj,
      sysTitle: "Configurações do sistema",
      moment,
      canRead: true,
      mainBtns,
    })
  } catch (error) {
    return await defaultResponseJson(req, res, "ERROR", logText, 500, error.message)
  }
}

module.exports[sys.showAll.cmdService] = async (req, res) => {
  try {

    const querys = req.query
    const log = querys.log

    let where = {}
    if ( querys ) where = querys
    if ( where.log ) delete where.log

    const qry =
    await Config
    .findAll({where,raw:true})

    if (qry.length > 0) 
      return await defaultResponseSend(req, res, !log?"ACCESS": null, !log? logText: null, 200, qry )
    return await defaultResponseJson(req, res, "ERROR", logText, 404)

  } catch (error) {
    return await defaultResponseJson(req, res, "ERROR", logText, 500, error.message)
  }
}

module.exports[sys.update.cmdService] = async (req, res) => {
  try {

    const {
      configId,
      configValor,
    } = req.body

    const [qry] =
    await Config
    .update(
      {
        configValor,

      }, {
        where: {
          configId
        }
      }
    )
    if (qry > 0) 
      return await defaultResponseJson(req, res, "UPDATE", logText, 200 )
    return await defaultResponseJson(req, res, "ERROR", logText, 400)


  } catch (error) {
    return await defaultResponseJson(req, res, "ERROR", logText, 500, error.message)
  }
}

module.exports[sys.saveFile.cmdService] = async (req, res) => {
  const { tipo } = req.params
  try {
    const imagem = req.files.anexo
    let nome = ""
    if (tipo === "login") nome = "logoLogin"
    else nome = "logoImpressao"
    const fullName = `${nome}.png`

    await imagem.mv(`${pathFile}${fullName}`)
    return await defaultResponseJson(req, res, "UPLOAD", logText, 200 )

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
        mainBtns
      }
    )

  } catch (error) {
    return await defaultResponseJson(req, res, "ERROR", logText, 500, error.message)
  }
}