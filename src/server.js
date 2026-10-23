require("dotenv").config()
const express = require("express")
const session = require("express-session")
const fileUpload = require("express-fileupload")
const conn = require("./database/conn")
const fs = require("fs")
const path = require("path")
const moment = require("moment")
const timeout = require("connect-timeout")
const configViewEngine = require("./config/viewEngine")
const { accessAdmin } = require("./middlewares/accessAdmin")
const { authLogin } = require("./middlewares/authLogin")
const app = express()
const http = require("http")
const server = http.createServer(app)
const { Server } = require("socket.io")
const { reqRender } = require("./utilidades/utils")
const io = new Server(server)
const PORT = 8091
module.exports = io

//------------------------------------------------------------------------------------------------
//sessoes
app.use(session({
  secret: "x1x1x1x1x1x1x1x1",
  proxy: true,
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: null
  }
}))

app.use(express.urlencoded({
  limit: "100mb",
  extended: true
}))

app.use(express.json({
  limit: "100mb",
  extended: true
}))

app.use(timeout("360s"))
app.use(fileUpload())

configViewEngine(app)

conn.authenticate().then(async () => {
  try {

    console.log("Banco de dados conectados!!!")    
    await checkStructure()

    io.on("connection", (socket) => {
      try {

        socket.emit("servidor_reiniciado", { timestamp: Date.now() });

        socket.data.info = {}
        socket.on("using", (name, route) => {
          if (name == undefined && name.length <= 0) return
          socket.data.info = {
            name: name,
            time: moment().format("HH:mm:ss"),
            date: moment().format("DD/MM/YYYY"),
            route: route.href
          }
        })

      } catch (error) {
        console.error("Error io "+error)
      }
    })

    app.get("/sistema/controle/usuarios/online", accessAdmin(), async (req, res) => {
      try {

        const sessionObj = await reqRender(req)
        const logados = []
        const registrados = []
        const dados = await io.fetchSockets();
        // const mainData = dados?.data?.info.reverse()
        for await (const dado of dados) {
          if (dado.data.info.name === undefined) continue
          if (dado.data.info.name.includes(logados.name)) continue
          logados.push(dado.data.info)
        }

        const check = logados.find(x => x.name === sessionObj.usNome)
        if (!check) {
          const protocol = req.protocol;
          const host = req.hostname;
          const url = req.originalUrl;
          const fullUrl = `${protocol}://${host}${url}`
          logados.push(
            {
              name: sessionObj.usNome,
              time: moment().format("HH:mm:ss"),
              date: moment().format("DD/MM/YYYY"),
              route: fullUrl
            }
          )
        }

        let dataTable = ``
        for await (const logado of logados) {
          if (logado.name === undefined) continue
          if (registrados.includes(logado.name)) continue
          else registrados.push(logado.name)

          dataTable += `<tr>
            <td> ${logado.name} </td>
            <td> ${logado.date} ${logado.time} </td>
            <td> ${logado.route} </td>
          </tr>`
        }

        return res.render("sistema/utilidades/utilidades-controle", {
        ...sessionObj,
          dataTable,
          sysTitle: "Usuários online",
          moment
        })
      } catch (error) {
        console.error(error)
      }
    })

    app.use(authLogin(), async function (req, res) {
      try {
        const sessionObj = await reqRender(req)

        return res.render("sistema/utilidades/utilidades-not-found", {
          url: req.url,
          ...sessionObj
        })
      } catch (error) {
        console.error(error)
      }
    })

    server.listen(process.env.PORT || PORT, () => {
      console.log(`App rodando! Porta ${process.env.PORT || PORT}`)
    })

  } catch (error) {
    console.log("Error tryCatch"+error)
  }
}).catch((erro) => {
  console.log("Erro DB:" + erro)
})

async function checkStructure() {
  try {
    const eS = require("./controllers/sistema/acessos/Estruturas")
    await eS.sync({ force: false })
  
    await walkSync("./src/controllers/", "Base", function (filePath, stat) {
      let correto = ""
      try {
        correto = filePath.replace(/\\/g, "/")
        if (correto.includes("src")) {
          correto = correto.replace("src", ".")
        }
        if(!correto.includes("Config.js") && !correto.includes("Estruturas.js")) {
          require(correto)
        }
      } catch (error) {
        console.error("Error checkStructure "+ correto + error)
      }
    })

    await conn.sync({ force: false })

    await walkSync("./src/controllers/", "Router", function (filePath, stat) {
      let correto = ""
      try {
        correto = filePath.replace(/\\/g, "/")
        if (correto.includes("src")) {
          correto = correto.replace("src", ".")
        }
        const model = require(correto)
        app.use("/", model)
      } catch (error) {
        console.error("Error checkStructure "+ correto + error)
      }
    })
  
  } catch (error) {
    console.error("Error checkStructure"+error)
  }
}

async function walkSync(currentDirPath, item, callback) {
  try {
    const adicionais = [
      "Router.js",
      "Sv.js",
      "Vars.js",
    ];
    fs.readdirSync(currentDirPath).forEach(function (name) {
      const filePath = path.join(currentDirPath, name);
      const stat = fs.statSync(filePath);

      if (stat.isFile()) {
        let encontrado = false;

        if (item === "Router") {
          encontrado = name.endsWith("Router.js");
        } else if (item === "Base") {
          // Somente arquivos como Cargo.js, Produto.js
          if (
            stat.isFile() &&
            name.endsWith(".js") &&
            !adicionais.some(sufixo => name.endsWith(sufixo))
          ) {
            callback(filePath, item, stat);
          }
        }

        if (encontrado) {
          callback(filePath, item, stat);
        }
      } else if (stat.isDirectory()) {
        walkSync(filePath, item, callback);
      }
    });
  } catch (error) {
    console.error("Error walkSync " + error);
  }
}