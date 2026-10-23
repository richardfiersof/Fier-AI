const { Op } = require("sequelize")
const moment = require("moment")

const Acessos = require("./Acessos")
const Estruturas = require("./Estruturas")
const { sys, sysUrl } = require("./AcessosVars")
const { createAcessos } = require("../../../middlewares/createAcessos")
const { defaultResponseJson, defaultResponseRender } = require("../../../utilidades/respostas")
const { reqRender } = require("../../../utilidades/utils")
const logText = "acessos"

//----------------------------------------------------------------------------------------------------
module.exports[sys.main.cmdService] = async (req, res) => {
  try {

    const sessionObj = await reqRender(req)
    const { usId } = req.params

    const estruturas = 
    await Estruturas
    .findAll(
      {
        where:{
          estruturaAtivo:1
        },
        raw:true
      }
    )

    for await ( const estrutura of estruturas){
      const checkItem = 
      await Acessos
      .findOne(
        { 
          where:{ 
            usId, 
            estruturaCodigo: estrutura.estruturaCodigo
          },
        }
      )
      if(!checkItem){
        await Acessos
        .create(
          {
            usId, 
            estruturaCodigo: estrutura.estruturaCodigo,
            acessoLiberado: 0
          }
        )
      }
    }

    const qry = 
    await Acessos
    .findAll(
      {
        where:{
          usId, 
        },
        include:[
          {
            model: Estruturas,
            where:{
              estruturaAtivo:1
            }
          }
        ]
      }
    )

    const geral = qry.filter(x=> x.estrutura.estruturaTipo != "nav")
    const navs = qry.filter(x=> x.estrutura.estruturaTipo == "nav")
    // return res.send(navs)
    return await defaultResponseRender(req, res, "ACCESS", logText, "sistema/acessos/acessos", {
      ...sessionObj,
      usId,
      mainData: geral,
      navs
    })
    // },1000)

  } catch (error) {
    return await defaultResponseJson(req, res, "ERROR", logText, 500, error.message)
  }
}

//----------------------------------------------------------------------------------------------------
module.exports[sys.updateOne.cmdService] = async (req, res) => {
  try {

    const {
      usId,
      estruturaCodigo,
      acessoLiberado
    } = req.body

    const [qry] =
    await Acessos
    .update(
      {
        acessoLiberado
      }, {
        where:{
          usId,
          estruturaCodigo
        }
      }
    )
    
    if (qry > 0) {
      if( usId == req.session.usId){
        if(acessoLiberado >0)
          req.session.acessos.push(estruturaCodigo)
        else
          req.session.acessos = req.session.acessos.filter(x=> x != estruturaCodigo)
      }
      return await defaultResponseJson(req, res, "UPDATE", logText, 200 )
    }
    return await defaultResponseJson(req, res, "ERROR", logText, 400)

  } catch (error) {
    return await defaultResponseJson(req, res, "ERROR", logText, 500, error.message)
  }
}

//----------------------------------------------------------------------------------------------------
module.exports[sys.updateAll.cmdService] = async (req, res) => {
  try {

    const {
      usId,
      acessoLiberado,
    } = req.body

    let novos = []
    if( usId == req.session.usId && acessoLiberado == 1){
      novos = 
      await Acessos
      .findAll(
        {
          where:{
            acessoLiberado: 0,
            usId: req.session.usId
          },
          attributes:["estruturaCodigo"],
          raw:true
        }
      )
      novos = novos.map(x=> x.estruturaCodigo)
    }

    const [qry] = await Acessos.update({ acessoLiberado }, { where: { usId } })

    if (qry > 0) {
      if( usId == req.session.usId && acessoLiberado == 1){
        req.session.acessos = [...req.session.acessos, ...novos]
      }
      return await defaultResponseJson(req, res, "UPDATE", logText, 200 )
    }
    return await defaultResponseJson(req, res, "ERROR", logText, 400)

  } catch (error) {
    return await defaultResponseJson(req, res, "ERROR", logText, 500, error.message)
  }
}

//----------------------------------------------------------------------------------------------------
module.exports[sys.start.cmdService] = async (req, res) => {
  try {

    return res
    .status(200)
    .json(
      {
        sys: sysUrl
      }
    )

  } catch (error) {
    return await defaultResponseJson(req, res, "ERROR", logText, 500, error.message)
  }
}