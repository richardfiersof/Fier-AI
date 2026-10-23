//-------------------------------------------------------------------------------------------------
//middlewares
//Verifica acesso
const Usuarios = require("../controllers/sistema/usuarios/Usuarios")
const Acessos = require("../controllers/sistema/acessos/Acessos")
const { errorPage } = require("./errorPage")

module.exports.accessControl = await = (cmd, type) => {
  return async (req, res, next) => {
    const isLogado = req.session.isLogado
    if (isLogado) {
      const autorizado = await req.session.acessos.includes(cmd)
      if (autorizado) {
        return next()
      } else {
        return errorPage(req,res,"Sem autorização!")
      }
    } else if (req.headers.authorization != undefined) {

      const { authorization } = req.headers

      const user =
      await Usuarios
      .findOne(
        {
          where: {
            usToken: authorization,
            usAtivo: 1
          },
          attributes: ["usId", "usNomeCompleto"],
          raw: true
        }
      )
      if (user !== null) {
        if(type == "API") return next()
        const acesso = 
        await Acessos
        .findOne({
          where: {
            usId: user.usId,
            estruturaCodigo: cmd,
            acessoLiberado: 1
          }
        })
        if (acesso !== null) return next()
        return res.status(401).json({ auth: false, message: "Sem autorização." })
      } return res.status(404).json({ auth: false, message: "Usuário não encontrado" })
        
    } else {
      const rota = req.originalUrl
      return res
      .status(401)
      .render("sistema/usuarios/auth/login",
        {
          usNome: "",
          msgToUser: "",
          rota
        }
      )
    }
  }
} 
