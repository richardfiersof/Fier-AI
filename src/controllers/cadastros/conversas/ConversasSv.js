const { Op } = require("sequelize")
const { Ollama } = require("ollama")
const {
  sys,
  sysUrl,
  mainForm,
  mainBtns,
  tableConfig,
} = require("./ConversasVars")

const Conversas = require("./Conversas")
const { defaultResponseJson, defaultResponseSend, defaultResponseRender } = require("../../../utilidades/respostas")
const { reqRender } = require("../../../utilidades/utils");
const logText = "conversas"
const mainId = "conversaId"

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
      conversaConteudo 
    } = req.body
    const conversaResposta = await rodarIA(conversaConteudo)
    const qry =
    await Conversas
    .create(
      {
        conversaTitulo,
        conversaConteudo,
        conversaResposta,
        usId: sessionObj.sessionUsId
      }
    )

    if (qry) 
      return await defaultResponseJson(req, res, "NEW", logText, 201, null, {id: qry[mainId], conversaResposta} )
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
      conversaConteudo
    } = req.body

    const [qry] =
    await Conversas
    .update(
      {
        conversaTitulo,
        conversaConteudo
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
      }
    )

  } catch (error) {
    return await defaultResponseJson(req, res, "ERROR", logText, 500, error.message)
  }
}

module.exports.fncConversasData = async (where = {}) =>{
  return await Conversas.findAll({where,raw:true})
}



// Inicializa o cliente apontando para o Docker da Hostinger
const ollama = new Ollama({ 
  host: 'http://72.62.101.250:32768/' // Altere pelo IP da VPS ou localhost
});

async function rodarIA(content) {
  try {
    console.log("Conectando ao Ollama na Hostinger...");
    
    // Altere "llama3" pelo modelo que você baixou no Docker da Hostinger
    const response = await ollama.chat({
      model: 'ollama', 
      messages: [{ role: 'user', content }],
    });
    return response.message.content
  } catch (error) {
    console.error("Erro ao conectar ou processar:", error);
  }
}