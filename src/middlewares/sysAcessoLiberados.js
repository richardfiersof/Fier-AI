const Estrutura = require("../controllers/sistema/acessos/Estruturas")
const Acessos = require("../controllers/sistema/acessos/Acessos")

module.exports.showAcessos = async function (usId) {
  const p = new Promise(async (resolve, reject) => {
    const acessoLiberado = []
    try {

      const acs =
      await Acessos
      .findAll(
        {
          include: [Estrutura],
          attributes: ["usId", "estruturaCodigo", "id"],
          where: { usId: usId, acessoLiberado: 1 },
        }
      )

      async function lerRegistros() {
        for (const registros of acs) {
          if (registros.estrutura == null || registros.estruturaCodigo == null) {
            await Acessos.destroy({ where: { id: registros.id } })
          } else await salvarEstrutura(registros.estrutura)
        }
      }

      async function salvarEstrutura(obj) {
        if (obj.estruturaAtivo == 1) {
          acessoLiberado.push(obj.estruturaCodigo)
        }
      }

      await lerRegistros()
      resolve(acessoLiberado)

    } catch (error) {
      console.log("------------Erro no acesso----------")
      console.log(error.message)
      reject(acessoLiberado)
    }
  })
  return (p)
}
