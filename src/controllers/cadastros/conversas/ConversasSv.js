const { Op } = require("sequelize")
const fs = require("fs")
const { Ollama } = require("ollama")
const {
  sys,
  sysUrl,
  mainForm,
  mainBtns,
  tableConfig,
  modalInfo
} = require("./ConversasVars")

const Conversas = require("./Conversas")
const { defaultResponseJson, defaultResponseSend, defaultResponseRender } = require("../../../utilidades/respostas")
const { reqRender } = require("../../../utilidades/utils");
const { fncMarkdownData } = require("../markdown/MarkdownSv")
const { pathComplete, anexoSaveNoDatabase, anexoDelete } = require("../../../utilidades/anexo")
const Markdown = require("../markdown/Markdown")
const path = require("path")
const logText = "conversas"
const mainId = "conversaId"
const io = require("../../../server")
// Inicializa o cliente apontando para o Docker da Hostinger
const ollama = new Ollama({ 
  host: "http://localhost:32768/" // Altere pelo IP da VPS ou localhost
});

module.exports[sys.main.cmdService] = async (req, res) => {
  try {

    const sessionObj = await reqRender(req)

    let selectedId = 0
    const { selected } = req.query
    if (!isNaN(parseInt(selected))) {
      selectedId = parseInt(selected)
    }

    const canCreate = sessionObj.acessos.includes(sys.new.cmdId)
    const canDelete = sessionObj.acessos.includes(sys.delete.cmdId)
    const canUpdate = sessionObj.acessos.includes(sys.update.cmdId)

    return await defaultResponseRender(req, res, "ACCESS", logText, "cadastros/conversas/conversas", {
      ...sessionObj,
      sysTitle: "Conversas",
      selectedId,
      canCreate,
      canDelete,
      canUpdate,
      mainForm,
      canFilterStatus: true,
      modalInfo
    })

  } catch (error) {
    return await defaultResponseJson(req, res, "ERROR", logText, 500, error.message)
  }
}

module.exports[sys.showAll.cmdService] = async (req, res) => {
  try {
    const sessionObj = await reqRender(req)
    const where = req.query
    const log = where.log
    if ( where.log ) delete where.log
    where.usId = sessionObj.sessionUsId
    const qry = await this.fncConversasData(where)

    if (qry.length > 0) 
      return await defaultResponseSend(req, res, !log?"ACCESS": null, !log? logText: null, 200, qry )
    return await defaultResponseJson(req, res, "ERROR", logText, 404)

  } catch (error) {
    return await defaultResponseJson(req, res, "ERROR", logText, 500, error.message)
  }
}

module.exports[sys.show.cmdService] = async (req, res) => {
  try {
    const sessionObj = await reqRender(req)
    const log = req.query.log
    const { conversaId } = req.params

    const qry =
    await Conversas
    .findOne(
      {
        where: {
          conversaId,
          usId: sessionObj.sessionUsId
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
    const sessionObj = await reqRender(req)
    const { 
      conversaTitulo,
      conversaModelo,
      // conversaConteudo,
      markdownId
    } = req.body
    // const conversaResposta = await fncGerenciarConteudoIA(conversaConteudo, markdownId)
    const qry =
    await Conversas
    .create(
      {
        conversaTitulo,
        conversaModelo,
        // conversaConteudo,
        // conversaResposta,
        usId: sessionObj.sessionUsId,
        markdownId: markdownId ? markdownId:null
      }
    )

    if (qry) 
      return await defaultResponseJson(req, res, "NEW", logText, 201, null, qry[mainId] )
      // return await defaultResponseJson(req, res, "NEW", logText, 201, null, {id: qry[mainId], conversaResposta} )
    return await defaultResponseJson(req, res, "ERROR", logText, 400)

  } catch (error) {
    return await defaultResponseJson(req, res, "ERROR", logText, 500, error.message)
  }
}

module.exports[sys.delete.cmdService] = async (req, res) => {
  try {

    const sessionObj = await reqRender(req)
    const { conversaId } = req.body

    const qry =
    await Conversas
    .destroy(
      {
        where:{
          conversaId,
          usId: sessionObj.sessionUsId
        }
      }
    )

    if (qry) 
      return await defaultResponseJson(req, res, "DELETE", logText, 200)
    return await defaultResponseJson(req, res, "ERROR", logText, 400)
    
  } catch (error) {
    return await defaultResponseJson(req, res, "ERROR", logText, 500, error.message)
  }
}

module.exports[sys.update.cmdService] = async (req, res) => {
  try {
    const sessionObj = await reqRender(req)

    const {
      conversaId,
      conversaTitulo,
      conversaModelo,
      // conversaConteudo,
      markdownId
    } = req.body

    const [qry] =
    await Conversas
    .update(
      {
        conversaTitulo,
        conversaModelo,
        // conversaConteudo,
        markdownId: markdownId ? markdownId:null
      },
      {
        where:{
          conversaId,
          usId: sessionObj.sessionUsId
        }
      }
    )

    if (qry > 0) 
      return await defaultResponseJson(req, res, "UPDATE", logText, 200, null, conversaId )
    return await defaultResponseJson(req, res, "ERROR", logText, 400)

  } catch (error) {
    return await defaultResponseJson(req, res, "ERROR", logText, 500, error.message)
  }
}

module.exports[sys.pergunta.cmdService] = async (req, res) => {
  try {
    const sessionObj = await reqRender(req)
    const arquivo = req.files?.conversaArquivo
    let localArquivo = ""
    let extensao = ""
    const { 
      conversaId,
      conversaConteudo,
    } = JSON.parse(req.body.dados)

    const check = await this.fncConversasData({conversaId})
    if(arquivo) {
      extensao = `.${arquivo.name.split(".").pop()}`
      const resp = await anexoSaveNoDatabase(markdownArquivo, `markdown${qry[mainId]}`, extensao, [`arquivo`, conversaId])
      
      if(resp.status == 400)
        return await defaultResponseJson(req, res, "ERROR", logText, 400)
      if(resp.status == 500)
        return await defaultResponseJson(req, res, "ERROR", logText, 500, resp.resp)
      else localArquivo = resp.resp
    }
    const [qry] =
    await Conversas
    .update(
      {
        conversaConteudo,
      },{
        where:{
          conversaId,
          usId: sessionObj.sessionUsId
        }
      }
    )
    fncGerenciarConteudoIA(conversaConteudo, check[0].markdownId, {localArquivo, extensao}, check.conversaModelo).then(x=> {
      Conversas
      .update(
        {
          conversaResposta: x,
        },{
          where:{
            conversaId,
            usId: sessionObj.sessionUsId
          }
        }
      )
      io.to(`us${sessionObj.sessionUsId}`).emit('updateChat', {
        conversaId,
        conversaResposta: x,
        usId: sessionObj.sessionUsId
      })
    })
    if(qry > 0)
      return await defaultResponseJson(req, res, "UPDATE", logText, 200, null, {conversaId, conversaResposta: "A resposta será gerada em breve!"}  )
    return await defaultResponseJson(req, res, "ERROR", logText, 400)

  } catch (error) {
    return await defaultResponseJson(req, res, "ERROR", logText, 500, error.message)
  }
}

module.exports[sys.start.cmdService] = async (req, res) => {
  try {
    const sessionObj = await reqRender(req)
    const markdowns = await fncMarkdownData({markdownAtivo:1})

    return res
    .status(200)
    .json(
      {
        sys: sysUrl,
        tableConfig,
        mainForm,
        mainBtns,
        markdowns,
        usId: sessionObj.sessionUsId
      }
    )

  } catch (error) {
    return await defaultResponseJson(req, res, "ERROR", logText, 500, error.message)
  }
}

module.exports.fncConversasData = async (where = {}, full = false) =>{
  if(full){
    return await Conversas.findAll({where,
      include:[
        {
          model:Markdown,
          attributes:["markdownTitulo"]
        }
      ]
    })
  }
  return await Conversas.findAll({where,
    attributes:[
      "conversaId",
      "conversaTitulo",
      "conversaConteudo",
      "conversaData",
      "conversaStatus",
      "conversaModelo",
      "markdownId",
    ],
    include:[
      {
        model:Markdown,
        attributes:["markdownTitulo"]
      }
    ]
  })
}

async function fncGerenciarConteudoIA(content, markdownId = null, arquivo = {localArquivo: "", extensao: ""}, model) {
  try {
    console.log("Conectando ao Ollama...");
    if(markdownId){
      const markdownPath = path.join(pathComplete, "markdown", String(markdownId), `markdown${markdownId}.md`);
      const markdownBruto = fs.readFileSync(markdownPath, "utf8");
      content = `${content}\n--- MANUAL ---\n${markdownBruto}\n--- FIM DO MANUAL ---\n`
    }
    if(arquivo.localArquivo.length >0){
      if(arquivo.extensao == ".json"){
        const dadosJsonBruto = fs.readFileSync(arquivo.localArquivo, "utf8");
        const dadosJson = JSON.parse(dadosJsonBruto);
        content = `${content}\n--- DADOS JSON ---\n${JSON.stringify(dadosJson, null, 2)}\n--- FIM DOS DADOS JSON ---\n`;
        anexoDelete(arquivo.localArquivo)
      }else if ([".csv", ".txt", ".md"].includes(arquivo.extensao)){
        const dadosTexto = fs.readFileSync(arquivo.localArquivo, "utf8");
        content = `${content}\n--- DADOS DO ARQUIVO (${arquivo.extensao}) ---\n${dadosTexto}\n--- FIM DOS DADOS ---\n`;
        anexoDelete(arquivo.localArquivo)
      }
    }
    return await fncPerguntarParaAI(content, model)
  } catch (error) {
    console.error("Erro ao conectar ou processar:", error);
    throw error;
  }
}

async function fncPerguntarParaAI(content, model = "llama3.1") {
  const response = await ollama.chat({
    model, 
    messages: [{ role: "user", content }],
  });
  return response.message.content
}