const { reqRender } = require("../utilidades/utils")

module.exports.errorPage = (req, res, message) => {
  if (req.session.isLogado) {
    reqRender(req).then(sessionObj =>{
        return res.render("sistema/utilidades/utilidades-error-message", {
        ...sessionObj,
        message
      })
    })
  } else {
    return res.render("sistema/usuarios/auth/login", {
      usNome: "",
      msgToUser: "",
      rota: req.originalUrl
    })
  }
} 
