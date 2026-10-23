const { Op } = require("sequelize")
const moment = require("moment")

const Usuarios = require("../Usuarios")
const sysAcessoLiberados = require("../../../../middlewares/sysAcessoLiberados")
const { createAcessos } = require("../../../../middlewares/createAcessos")
const { rotas } = require("./UsuariosAuthVars")
const { sysLogs } = require("../../../../middlewares/sysLogs")
const { checkPassword } = require("../../../../utilidades/universal-functions")
const { defaultResponseJson, defaultResponseRender } = require("../../../../utilidades/respostas")
const { reqRender, gerarHash, verificarSenha } = require("../../../../utilidades/utils")
const logText = "autenticação"
let msgToUser = ""

module.exports.fncRender = async (req, res) => {
  try {

    const sessionObj = await reqRender(req)
  
    return res.render("home", {
      ...sessionObj,
      moment
    })

  } catch (error) {
    return await defaultResponseJson(req, res, "ERROR", logText, 500, error.message)
  }
}

module.exports.fncRenderHome = async (req, res) => {
  try {

    const sessIdUser = req.session.usId
    if (sessIdUser) {
      const us = await Usuarios.findAll({ raw: true })
      if (us.length <= 0) {
        const newUser = 1
        const usNome = ""
        return res.redirect(rotas.new)
      }
    }
    return res.redirect("/")

  } catch (error) {
    return await defaultResponseJson(req, res, "ERROR", logText, 500, error.message)
  }
}

//-------------------------------------------------------------------------------------------------
module.exports.fncRenderLogin = async (req, res) => {
  try {
    let rota = ""
    let usNome = ""
    let newUser = 0
    const us = await Usuarios.findAll({ raw: true })
    if (us.length <= 0) newUser = 1
    if(req.session.isLogado){
      return res.redirect("/")
    }
    sysLogs(
      "ACCESS",
      "---",
      req.url,
      req.params,
      req.body,
      logText
    )
    return res.render("sistema/usuarios/auth/login", {
      usNome,
      msgToUser,
      rota,
      newUser
    })

  } catch (error) {
    return await defaultResponseJson(req, res, "ERROR", logText, 500, error.message)
  }
}

//-------------------------------------------------------------------------------------------------
module.exports.fncNovo = async (req, res) => {
  try {

    let rota = ""
    let usNome = ""
    let newUser = false

    const us = await Usuarios.findAll({ raw: true })
    if (us.length > 0) return res.redirect(rotas.home)

    sysLogs(
      "ACCESS",
      "---",
      req.url,
      req.params,
      req.body,
      logText
    )
    return res.render("sistema/usuarios/auth/novo", {
      usNome,
      msgToUser,
      rota,
      newUser
    })

  } catch (error) {
    return await defaultResponseJson(req, res, "ERROR", logText, 500, error.message)
  }
}

//-------------------------------------------------------------------------------------------------
module.exports.fncFirstUser = async (req, res) => {
  try {

    let {
      login,
      nome,
      email,
      senha,
      senhaConfirmacao,
    } = req.body

    const us = await Usuarios.findAll({ raw: true })
    if (us.length > 0) return res.redirect(rotas.home)

    senha = senha.toString().trim()
    senhaConfirmacao = senhaConfirmacao.toString().trim()
    if (senha != senhaConfirmacao) {
      msgToUser = "A senha e sua confirmação são diferentes!"
      return res.redirect(rotas.new)
    }
    if (senha.length <= 7) {
      msgToUser = "A senha deve conter ao menos 8 carácteres!"
      return res.redirect(rotas.new)
    }
    const resposta = await checkPassword(senha)
    if (!resposta) {
      msgToUser = "A senha deve conter: letras maiúsculas, minusculas, números e carácteres especiais!"
      return res.redirect(rotas.new)
    }


    const hash = await gerarHash(senha)

    const newUser =
    await Usuarios
    .create(
      {
        usNome: login.toLowerCase(),
        usNomeCompleto: nome,
        usEmail: email,
        usSenha: hash,
        usMaster: 1,
        usAtivo: 1
      }
    )
    if (newUser) {

      const { createAcessos } = require("../../../../middlewares/createAcessos")
      await createAcessos(newUser.usId)

      const Acessos = require("../../acessos/Acessos")
      await Acessos
      .update(
        {
          acessoLiberado: 1
        }, {
          where: {
            usId: newUser.usId
          }
        }
      )

      sysLogs(
        "NEW",
        nome,
        req.url,
        req.params,
        "---",
        "---"
      )
      msgToUser = ""
      return res.status(200).redirect(rotas.home)
    }
    msgToUser = "Fala ao realiza cadastro"
    return res.redirect(rotas.login)
  } catch (error) {
    return await defaultResponseJson(req, res, "ERROR", logText, 500, error.message, null, true)
  }
}

//-------------------------------------------------------------------------------------------------
module.exports.fncLogar = async (req, res) => {
  let {
    nome,
    senha,
    rota
  } = req.body
  try {

    msgToUser = ""

    //Validacao dos campos
    if (typeof nome === "string" && typeof senha === "string") {
      if (nome.length <= 0 || senha.length <= 0) {
        msgToUser = "Usuário e/ou senha não foram definidos."
      }
    } else msgToUser = "Usuário e/ou senha não foram definidos."

    if (msgToUser.length <= 0) {

      nome = nome.toLowerCase()
      const qry =
      await Usuarios
      .findOne(
        {
          where: {
            usNome: nome
          },
          raw: true
        }
      )

      if (qry == undefined) {
        msgToUser = "Usuário não foi localizado."
        sysLogs(
          "LOGIN",
          '---',
          req.url,
          req.params,
          nome,
          msgToUser
        )
        return res.redirect(rotas.login)
      } else if (qry.usAtivo == "Inativo") {
        msgToUser = "Usuário inativado."
        sysLogs(
          "LOGIN",
          '---',
          req.url,
          req.params,
          nome,
          msgToUser
        )
        return res.redirect(rotas.login)
      }

      if (await verificarSenha(senha, qry.usSenha)) {

        async function inicializacao() {
          await createAcessos(qry.usId)
          const acessos = await sysAcessoLiberados.showAcessos(qry.usId)

          //Variaveis de sessao
          req.session.acessos = acessos
          req.session.usId = qry.usId
          req.session.usNome = qry.usNome
          req.session.usNomeCompleto = qry.usNomeCompleto
          req.session.isAdm = qry.usMaster > 0
          req.session.isLogado = true
          req.session.docType = process.env.TYPE_DOC
          return true
        }

        const OK = await inicializacao()
        if (OK) {
          if (rota.length <= 0) return res.redirect(rotas.home)
          return res.redirect(rota)
        }
      } else {
        sysLogs(
          "LOGIN",
          '---',
          req.url,
          req.params,
          nome,
          'Senha inválida.'
        )
        msgToUser = "Senha inválida."
        return res.redirect(rotas.login)
      }

    }
    sysLogs(
      "LOGIN",
      '---',
      req.url,
      req.params,
      nome,
      msgToUser
    )
    return res.redirect(rotas.login)

  } catch (error) {
    sysLogs(
      "LOGIN",
      '---',
      req.url,
      req.params,
      nome,
      error.message
    )
    msgToUser = error.message
    res.redirect(rotas.login)
  }
}

//-------------------------------------------------------------------------------------------------
module.exports.fncRenderAltSenha = async (req, res) => {
  try {

    //Dados da Sessao
    const sessionObj = await reqRender(req)

    return await defaultResponseRender(req, res, "ACCESS", logText, "sistema/usuarios/auth/altpws", {
      ...sessionObj,
      rotas
    })

  } catch (error) {
    return await defaultResponseJson(req, res, "ERROR", logText, 500, error.message)
  }
}

//-------------------------------------------------------------------------------------------------
module.exports.fncAltPws = async (req, res) => {
  try {

    let {
      newPws,
    } = req.body
    const usId = req.session.usId
    newPws = newPws.toString().trim()
    if (newPws.length <= 7) return await defaultResponseJson(req, res, "ERROR", logText, 400, "A senha deve conter ao menos 8 carácteres!", null, true)
    const resposta = await checkPassword(newPws)
    if (!resposta) return await defaultResponseJson(req, res, "ERROR", logText, 400, "A senha deve conter: letras maiúsculas, minusculas, números e carácteres especiais!", null, true)

    const check = await Usuarios.findByPk(usId)
    if (await verificarSenha(newPws, check.usSenha))
      return await defaultResponseJson(req, res, "ERROR", logText, 400, "Favor não colocar uma senha deferente!", null, true)
    const hash = await gerarHash(newPws)

    const [user] =
    await Usuarios
    .update(
      {
        usSenha: hash
      }, {
        where:{
          usId
        }
      }
    )

    if (user > 0)
      return await defaultResponseJson(req, res, "NEW", logText, 201, null, null, true)
    return await defaultResponseJson(req, res, "ERROR", logText, 400, null, null, true)

  } catch (error) {
    return await defaultResponseJson(req, res, "ERROR", logText, 500, error.message, null, true)
  }
}

//-------------------------------------------------------------------------------------------------
module.exports.fncLeave = async (req, res) => {
  if ( req.session && req.session.usNome && !req.session.usNome.includes(".fiersof")){
    sysLogs(
      "ACCESS",
      req.session == undefined ? "---" : req.session.usNomeCompleto,
      req.url,
      req.params,
      req.body,
      "Sair"
    )
  }
  req.session.destroy(function (err) {
    res.redirect(rotas.login)
  })
}

module.exports.fncSessao = async (req, res) => {
  return res.status(!req.session.isLogado ? 401 : 200).send(req.session.isLogado != undefined)
}