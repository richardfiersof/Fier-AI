module.exports.authLogin = () => {
  return async (req, res, next) => {
    if (req.session.isLogado) {
      next();
    } else {
      let rota = req.originalUrl
      res.render("sistema/usuarios/auth/login", {
        usNome: "",
        msgToUser: "",
        rota
      })
    }
  }
}

