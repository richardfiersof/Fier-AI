const { Op } = require("sequelize")
const fs = require("fs")
const marked = require("marked")
const {
  sys,
  sysUrl,
  mainForm,
  mainBtns,
  tableConfig,
  modalInfo
} = require("./MarkdownVars")

const Markdown = require("./Markdown")
const { defaultResponseJson, defaultResponseSend, defaultResponseRender } = require("../../../utilidades/respostas")
const { reqRender } = require("../../../utilidades/utils");
const { anexoSaveNoDatabase, pathComplete } = require("../../../utilidades/anexo");
const { fncConversasData } = require("../conversas/ConversasSv")
const logText = "markdowns"
const mainId = "markdownId"

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

    return await defaultResponseRender(req, res, "ACCESS", logText, "cadastros/markdowns/markdowns", {
      ...sessionObj,
      sysTitle: "Markdown",
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
    const where = req.query
    const log = where.log
    if ( where.log ) delete where.log
    const qry = await this.fncMarkdownData(where)

    if (qry.length > 0) 
      return await defaultResponseSend(req, res, !log?"ACCESS": null, !log? logText: null, 200, qry )
    return await defaultResponseJson(req, res, "ERROR", logText, 404)

  } catch (error) {
    return await defaultResponseJson(req, res, "ERROR", logText, 500, error.message)
  }
}

module.exports[sys.show.cmdService] = async (req, res) => {
  try {

    const { log, arquivo } = req.query
    const { markdownId } = req.params

    if(arquivo){
      const arquivoBruto = fs.readFileSync(`${pathComplete}markdown\\${markdownId}\\markdown${markdownId}.md`, 'utf8');
      return await defaultResponseJson(req, res, !log?"ACCESS": null, !log? logText: null, 200, await marked.parse(arquivoBruto) )
    }

    const qry =
    await Markdown
    .findOne(
      {
        where: {
          markdownId,
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

    const markdownArquivo = req.files.markdownArquivo
    if(!markdownArquivo) 
      return await defaultResponseJson(req, res, "ERROR", logText, 400, "Anexo é obrigatório!")
    const ext = `.${markdownArquivo.name.split(".").pop()}`
    if(ext != ".md")
      return await defaultResponseJson(req, res, "ERROR", logText, 400, "Arquivo .md obrigatório!")
    const { 
      markdownTitulo, 
      markdownStatus 
    } = JSON.parse(req.body.dados)

    const qry =
    await Markdown
    .create(
      {
        markdownTitulo,
        markdownStatus,
      }
    )

    if (qry) {
      const resp = await anexoSaveNoDatabase(markdownArquivo, `markdown${qry[mainId]}`, ext, `markdown\\${qry[mainId]}\\`)
      if(resp.status == 200)
        return await defaultResponseJson(req, res, "NEW", logText, 201, null, qry[mainId])
      else if (resp.status == 500)
        return await defaultResponseJson(req, res, "ERROR", logText, 500, resp.resp)
      return await defaultResponseJson(req, res, "ERROR", logText, 400, "Erro ao salvar anexo!")
    }
    return await defaultResponseJson(req, res, "ERROR", logText, 400)

  } catch (error) {
    return await defaultResponseJson(req, res, "ERROR", logText, 500, error.message)
  }
}

module.exports[sys.delete.cmdService] = async (req, res) => {
  try {

    const { markdownId } = req.body

    const conversa = await fncConversasData({markdownId})
    if(conversa.length >0)
      return await defaultResponseJson(req, res, "ERROR", logText, 400, "Existem conversas linkadas a este markdown!")

    const qry =
    await Markdown
    .destroy(
      {
        where:{
          markdownId,
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

    const { markdownArquivo } = req.files
    if(markdownArquivo){
      const ext = `.${markdownArquivo.name.split(".").pop()}`
      if(ext != ".md")
        return await defaultResponseJson(req, res, "ERROR", logText, 400, "Arquivo .md obrigatório!")
    }
    const {
      markdownId,
      markdownTitulo,
      markdownStatus
    } = JSON.parse(req.body.dados)

    const [qry] =
    await Markdown
    .update(
      {
        markdownTitulo,
        markdownStatus
      },
      {
        where:{
          markdownId,
        }
      }
    )

    if (qry > 0) {
      if(markdownArquivo) {
        const resp = await anexoSaveNoDatabase(markdownArquivo, `markdown${qry[mainId]}`, ext, `markdown\\${qry[mainId]}\\`)
        if(resp.status == 200)
          return await defaultResponseJson(req, res, "UPDATE", logText, 200, null, markdownId )
        else if (resp.status == 500)
          return await defaultResponseJson(req, res, "ERROR", logText, 500, resp.resp)
        return await defaultResponseJson(req, res, "ERROR", logText, 400, "Erro ao salvar anexo!")
      }else {
        return await defaultResponseJson(req, res, "UPDATE", logText, 200, null, markdownId )
      }
    }
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

module.exports.fncMarkdownData = async (where = {}) =>{
  return await Markdown.findAll({where,raw:true})
}
