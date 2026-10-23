const { Op } = require("sequelize")
const express = require("express")
const router = express.Router()
const fnc = require("./LogsSv")
const { sys, prefixId } = require("./LogsVars")
const Estrutura = require("../acessos/Estruturas")
const { accessControl } = require("../../../middlewares/accessControl")

for (const modulo in sys) {
    
  const {
    cmdId, cmdURL,
    cmdService, cmdType,
    cmdMethod, cmdAtivo, cmdIgnore,
    cmdTitle
  } = sys[modulo]
  
  if(fnc[cmdService])
    router[cmdMethod](cmdURL, accessControl(cmdId,cmdType), fnc[cmdService])
  
    if(((cmdId.slice(-4) == "0001" && cmdType != "menu") || cmdIgnore) || cmdId == "0000-0000-0000-000")  continue
  createUpdate()

  async function createUpdate(){
    const check = 
    await Estrutura
    .findByPk(cmdId,{raw:true})
  
    if(!check){
      await Estrutura.create(
        {
          estruturaCodigo: cmdId,
          estruturaNome: cmdTitle,
          estruturaTipo: cmdType,
          estruturaAtivo: cmdAtivo,
        }
      )
    }else{
      if(check.estruturaNome != cmdTitle || check.estruturaTipo != cmdType || check.estruturaAtivo != cmdAtivo){
        await Estrutura
        .update(
          {
            estruturaNome: cmdTitle,
            estruturaTipo: cmdType,
            estruturaAtivo: cmdAtivo,
          },{
            where:{
              estruturaCodigo: cmdId
            }
          }
        )
      }
    }
  }
}

checkEstruturas()

async function checkEstruturas(){
  try {
    const estruturas = 
    await Estrutura
    .findAll(
      {
        where:{
          estruturaCodigo: {
            [Op.like] : `${prefixId}%`
          }
        },
        raw:true
      }
    )
    const ids = []
    for (const modulo in sys) {
      ids.push(sys[modulo].cmdId)
    }
    for await ( const item of estruturas){
      if(ids.includes(item.estruturaCodigo)) continue
      await Estrutura.destroy(
        {
          where:{
            estruturaCodigo: item.estruturaCodigo
          }
        }
      )
    }
    
  } catch (error) {
    console.error(`Error Estrutura Acessos ${prefixId}: ${error.message}`)
  }
}

module.exports = router 