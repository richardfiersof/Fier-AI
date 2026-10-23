const { Op } = require("sequelize")
const express = require("express")
const router = express.Router()
const { authLogin } = require("../../../../middlewares/authLogin")
const fnc = require("./UsuariosAuthSv")
const { rotas } = require("./UsuariosAuthVars")

router.get("/", authLogin(), fnc.fncRender)
router.get("/home", authLogin(), fnc.fncRenderHome)

//Render Login
router.get(rotas.login, fnc.fncRenderLogin)
router.get(rotas.new, fnc.fncNovo)
router.post(rotas.first, fnc.fncFirstUser)

//Login
router.post(rotas.logar, fnc.fncLogar)
router.get(rotas.sessao, fnc.fncSessao)

// Render Alt
router.get(rotas.altRender, authLogin(), fnc.fncRenderAltSenha)

//Alt pws
router.post(rotas.altpws, authLogin(), fnc.fncAltPws)

//Sair
router.get(rotas.leave, fnc.fncLeave)

//Render Request
// router.get(rotas.requestRender, fnc.fncRenderRequest)

// //Render Reset
// router.get(rotas.resetRender, fnc.fncRenderReset)

//Request Pass
// router.post(rotas.request, fnc.fncRequestReset)

// //Reset Pass
// router.post(rotas.reset, fnc.fncResetPassword)

module.exports = router