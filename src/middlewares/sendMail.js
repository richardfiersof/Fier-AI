const Config = require("../controllers/sistema/config/Config")
const { sysLogs } = require("./sysLogs")
const nodemailer = require("nodemailer")

module.exports.sendMail = async (from, to, subject, text, html) => {
  try {
    const qry =
    await Config
    .findAll(
      {
        where: {
          configSubgrupo: "EMAIL-SMTP"
        },
        order: ["configSequencia"],
        raw: true
      }
    )
    if (qry[4].configValor.length <= 0) return { error: true, resp: "Nenhum email adicionado!" }
    const tls = qry[3].configValor.length <= 0 ? qry[3].configValorPadrao : qry[3].configValor
    const transp = nodemailer.createTransport({
      host: qry[1].configValor.length <= 0 ? qry[1].configValorPadrao : qry[1].configValor,
      port: qry[2].configValor.length <= 0 ? qry[2].configValorPadrao : qry[2].configValor,
      auth: {
        user: qry[4].configValor,
        pass: qry[5].configValor
      },
      tls: {
        rejectUnauthorized: [true, false].includes(tls) ? tls : false
      }
    })

    transp.sendMail({
      from,
      to,
      subject, // Subject line
      text,    // plain text body
      html     //body
    }, (err) => {
      if (err) {
        sysLogs("ERROR", "sistema", "---", "---", err.message, "enviar email")
        return { error: true, resp: err }
      }
      return { error: false, resp: "Email enviado com sucesso." }
    })

  } catch (error) {
    sysLogs("ERROR", "sistema", "---", "---", error.message, "enviar email")
    return { error: true, resp: error }
  }
}