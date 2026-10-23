const { Op } = require("sequelize")
const { sys } = require("./AvisosVars")
const Aviso = require("./Avisos")
const moment = require("moment")

module.exports[sys.show.cmdService] = async (req, res) => {
  try {

    const data = moment().format("YYYY-MM-DD")
    const hora = moment().format("HH:mm")
    
    const qry =
    await Aviso
    .findAll(
      {
        where:{
          avisoData: data,
        },
        raw:true
      }
    )
    const dados = []
    if( qry.length > 0 ) {
      for await ( const item of qry){
        const check = (moment(`${data} ${item.avisoHora}`).isAfter(`${data} ${hora}`))
        if(check) dados.push(item)
      } 
    }

    return res.send(dados)

  } catch (error) {
    console.error(error)
  }
}
