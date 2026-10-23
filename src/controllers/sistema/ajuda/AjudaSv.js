const { Op } = require("sequelize")
const moment = require("moment")
const {
  sys,
  sysUrl,
  mainBtns,
  tableConfig,
  modalInfo,
} = require("./AjudaVars")

const Ajuda = require("./Ajuda")
const { defaultResponseJson, defaultResponseSend, defaultResponseRender } = require("../../../utilidades/respostas")
const { reqRender } = require("../../../utilidades/utils")
const logText = "ajuda"

//-------------------------------------------------------------------------------------------------
module.exports[sys.main.cmdService] = async (req, res) => {
  try {

    const { selectedId } = req.query
    //Dados da Sessao
    const sessionObj = await reqRender(req)

    return await defaultResponseRender(req, res, "ACCESS", logText, "sistema/ajuda/ajuda", {
      ...sessionObj,
      sysTitle: "Ajuda",
      canCreate: sessionObj.usNome.includes(".fiersof") ? true : false,
      canDelete: sessionObj.usNome.includes(".fiersof") ? true : false,
      canUpdate: sessionObj.usNome.includes(".fiersof") ? true : false,
      selectedId,
      modalInfo
    })
  } catch (error) {
    return await defaultResponseJson(req, res, "ERROR", logText, 500, error.message)
  }
}

//-------------------------------------------------------------------------------------------------
module.exports[sys.show.cmdService] = async (req, res) => {
  try {

    const log = req.query.log
    const { ajudaId } = req.params

    const qry =
    await Ajuda
    .findOne(
      {
        where: { ajudaId },
        raw: true
      }
    )
    if (qry) 
      return await defaultResponseSend(req, res, !log?"ACCESS": null, !log? logText: null, 200, qry )
    return await defaultResponseJson(req, res, "ERROR", logText, 404)

  } catch (error) {
    return await defaultResponseJson(req, res, "ERROR", logText, 500, error.message)
  }
}

//-------------------------------------------------------------------------------------------------
module.exports[sys.showAll.cmdService] = async (req, res) => {
  try {
    const log = req.query.log

    const qry =
    await Ajuda
    .findAll(
      {
        attributes:[
          "ajudaId",
          "ajudaTitulo",
          "ajudaModulo",
          "ajudaPalavraChave"
        ],
        raw:true
      }
    )

    if (qry.length > 0) 
      return await defaultResponseSend(req, res, !log?"ACCESS": null, !log? logText: null, 200, qry )
    return await defaultResponseJson(req, res, "ERROR", logText, 404)

  } catch (error) {
    return await defaultResponseJson(req, res, "ERROR", logText, 500, error.message)
  }

}

//-------------------------------------------------------------------------------------------------
module.exports[sys.new.cmdService] = async (req, res) => {
  try {

    const {
      ajudaInfo,
      ajudaModulo,
      ajudaTitulo,
      ajudaPalavraChave,
    } = req.body

    const qry =
    await Ajuda
    .create(
      {
        ajudaInfo,
        ajudaModulo,
        ajudaTitulo,
        ajudaPalavraChave,
      }
    )

    if (qry) 
      return await defaultResponseJson(req, res, "NEW", logText, 201, null, qry.ajudaId )
    return await defaultResponseJson(req, res, "ERROR", logText, 400)

  } catch (error) {
    return await defaultResponseJson(req, res, "ERROR", logText, 500, error.message)
  }
}

//-------------------------------------------------------------------------------------------------
module.exports[sys.update.cmdService] = async (req, res) => {
  try {

    const {
      ajudaId,
      ajudaInfo,
      ajudaModulo,
      ajudaTitulo,
      ajudaPalavraChave,
    } = req.body

    const [qry] =
    await Ajuda
    .update(
      {
        ajudaInfo,
        ajudaModulo,
        ajudaTitulo,
        ajudaPalavraChave,
      }, {
        where: { ajudaId }
      }
    )


    if (qry > 0) 
      return await defaultResponseJson(req, res, "UPDATE", logText, 200, null, ajudaId )
    return await defaultResponseJson(req, res, "ERROR", logText, 400)

  } catch (error) {
    return await defaultResponseJson(req, res, "ERROR", logText, 500, error.message)
  }
}

//-------------------------------------------------------------------------------------------------
module.exports[sys.delete.cmdService] = async (req, res) => {
  try {
    const { ajudaId } = req.body

    const qry =
    await Ajuda
    .destroy(
      {
        where: { ajudaId }
      }
    )


    if (qry) 
      return await defaultResponseJson(req, res, "DELETE", logText, 200)
    return await defaultResponseJson(req, res, "ERROR", logText, 400)

  } catch (error) {
    return await defaultResponseJson(req, res, "ERROR", logText, 500, error.message)
  }
}

//-------------------------------------------------------------------------------------------------
module.exports[sys.start.cmdService] = async (req, res) => {
  try {

    return res
    .status(200)
    .json(
      {
        sys: sysUrl,
        tableConfig,
        mainBtns,
        modalInfo
      }
    )

  } catch (error) {
    return await defaultResponseJson(req, res, "ERROR", logText, 500, error.message)
  }
}
