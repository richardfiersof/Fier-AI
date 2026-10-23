module.exports.accessAdmin = () => {
  return async (req, res, next) => {
    if (req.session.isLogado) {
      if (req.session.isAdm) next();
      else res.redirect("/")
    } else {
      let rota = req.originalUrl
      res.render("sistema/usuarios/auth/login", {
        usNome: '',
        msgToUser: '',
        rota
      })
    }
  }
}

