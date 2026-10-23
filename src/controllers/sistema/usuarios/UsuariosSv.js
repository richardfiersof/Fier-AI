const { Op } = require("sequelize")
const moment = require("moment")

const {
  sys,
  mainForm,
  sysUrl,
  mainBtns,
  tableConfig
} = require("./UsuariosVars")

const Usuarios = require("./Usuarios")
const acessosVars = require("../acessos/AcessosVars").sys
const { checkPassword } = require("../../../utilidades/universal-functions")
const { defaultResponseJson, defaultResponseSend, defaultResponseRender } = require("../../../utilidades/respostas")
const { createAcessos } = require("../../../middlewares/createAcessos")
const { reqRender, gerarHash, verificarSenha } = require("../../../utilidades/utils")
const logText = "usuários"

module.exports[sys.main.cmdService] = async (req, res) => {
  try {

    //Dados da Sessao
    const sessionObj = await reqRender(req)

    const canCreate = sessionObj.acessos.includes(sys.new.cmdId)
    const canUpdate = sessionObj.acessos.includes(sys.update.cmdId)
    const canReset = sessionObj.acessos.includes(sys.resetPws.cmdId)
    const canAcesso = sessionObj.acessos.includes(acessosVars.main.cmdId)

    let selectedId = 0
    const { selected } = req.query
    if (!isNaN(parseInt(selected))) {
      selectedId = parseInt(selected)
    }

    return await defaultResponseRender(req, res, "ACCESS", logText, "sistema/usuarios/usuarios", {
      ...sessionObj,
      sysTitle: "Controle de Usuários",
      selectedId,
      canCreate,
      canUpdate,
      canReset,
      canAcesso,
      moment,
      mainForm,
      canFilterStatus:true
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
    await Usuarios
    .findAll(
      {
        where,
        attributes: {
          exclude: ["usSenha","usToken"]
        },
      }
    )

    if (qry.length > 0) 
      return await defaultResponseSend(req, res, !log?"ACCESS": null, !log? logText: null, 200, 
    !req.session.usNome.includes(".fiersof") ? qry.filter(x=> !x.usNome.includes("fiersof")) : qry )
    return await defaultResponseJson(req, res, "ERROR", logText, 404)

  } catch (error) {
    return await defaultResponseJson(req, res, "ERROR", logText, 500, error.message)
  }
}

module.exports[sys.show.cmdService] = async (req, res) => {
  try {

    const log = req.query.log
    const { usId } = req.params

    const qry =
    await Usuarios
    .findOne(
      {
        where: { usId },
        attributes: {
          exclude: ["usSenha"]
        },
        raw:true
      }
    )
    if (qry) 
      return await defaultResponseSend(req, res, !log?"ACCESS": null, !log? logText: null, 200, qry )
    return await defaultResponseJson(req, res, "ERROR", logText, 404)

  } catch (error) {
    return await defaultResponseJson(req, res, "ERROR", logText, 500, error.message)
  }
}

module.exports[sys.new.cmdService] = async (req, res) => {
  try {

    let {
      usNome,
      usNomeCompleto,
      usEmail,
      usSenha,
      usMaster,
      usAtivo,
    } = req.body

    if(usNome.includes(".fiersof") && !req.session.usNome.includes(".fiersof") )
      return await defaultResponseJson(req, res, "ERROR", logText, 401, null, null, true)

    usSenha = usSenha.toString().trim()      
    if(usSenha.length <= 7) return await defaultResponseJson(req, res, "ERROR", logText, 400, "A senha deve conter ao menos 8 carácteres!", null, true)
    const resposta = await checkPassword(usSenha)
    if(!resposta) return await defaultResponseJson(req, res, "ERROR", logText, 400, "A senha deve conter: letras maiúsculas, minusculas, números e carácteres especiais!", null, true)
    usNome = usNome.toLowerCase()

    const checkUser =
    await Usuarios
    .findOne(
      {
        where:{
          usNome,
        }
      }
    )
    if (checkUser) return await defaultResponseJson(req, res, "ERROR", logText, 400, "Login já cadastrado.", null, true)

    const qry =
    await Usuarios
    .create( 
      {
        usNome,
        usNomeCompleto,
        usEmail,
        usSenha: await gerarHash(usSenha),
        usMaster,
        usAtivo,
      }
    )

    if (qry){
      await createAcessos(qry.usId)
      return await defaultResponseJson(req, res, "NEW", logText, 201, null, qry.usId, true )
    }
    return await defaultResponseJson(req, res, "ERROR", logText, 400, null, null, true)

  } catch (error) {
    return await defaultResponseJson(req, res, "ERROR", logText, 500, error.message, null, true)
  }
}

module.exports[sys.update.cmdService] = async (req, res) => {
  try {

    const {
      usId,
      usNomeCompleto,
      usAtivo,
      usMaster,
      usEmail,
    } = req.body
    
    const [qry] =
    await Usuarios
    .update(
      {
        usNomeCompleto,
        usAtivo,
        usMaster,
        usEmail,
      }, {
        where: { usId }
      }
    )

    if (qry > 0) 
      return await defaultResponseJson(req, res, "UPDATE", logText, 200, null, usId )
    return await defaultResponseJson(req, res, "ERROR", logText, 400)

  } catch (error) {
    return await defaultResponseJson(req, res, "ERROR", logText, 500, error.message)
  }
}

module.exports[sys.resetPws.cmdService] = async (req, res) => {
  try {

    let {
      usId,
      usSenha
    } = req.body

    usSenha = usSenha.toString().trim()      
    if(usSenha.length <= 7) return await defaultResponseJson(req, res, "ERROR", logText, 404, "A senha deve conter ao menos 8 carácteres!", null, true)
    const resposta = await checkPassword(usSenha)
    if(!resposta) return await defaultResponseJson(req, res, "ERROR", logText, 404, "A senha deve conter: letras maiúsculas, minusculas, números e carácteres especiais!", null, true)
    const hash = await gerarHash(usSenha)
    const [qry] =
    await Usuarios
    .update(
      {
        usSenha: hash
      },
      {
        where:{
          usId
        }
      }
    )
    if (qry)
      return await defaultResponseJson(req, res, "UPDATE", logText, 200, null, qry.usId, true )
    return await defaultResponseJson(req, res, "ERROR", logText, 400, null, null, true)

  } catch (error) {
    return await defaultResponseJson(req, res, "ERROR", logText, 500, error.message, null, true)
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
        mainBtns,
        acessosVars: acessosVars.main.cmdURL,
      }
    )

  } catch (error) {
    return await defaultResponseJson(req, res, "ERROR", logText, 500, error.message)
  }
}