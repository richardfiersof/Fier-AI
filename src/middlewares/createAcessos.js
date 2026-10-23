const Estrutura = require("../controllers/sistema/acessos/Estruturas")
const Acessos = require("../controllers/sistema/acessos/Acessos")

module.exports.createAcessos = async (usId) => {
  try {

    const estruturas = await fSelEstrutura()

    for await (const estrutura of estruturas) {
      await fSelAcessos(estrutura.estruturaCodigo)
    }

    async function fSelEstrutura() {
      return Estrutura.findAll({ raw: true, order: ["estruturaCodigo"], where: { estruturaAtivo: 1 } })
    }

    async function fSelAcessos(estruturaCodigo) {
      const acessos = Acessos.findOrCreate({ where: { usId, estruturaCodigo }, defaults: { acessoLiberado: 0 }, raw: true })
      return (acessos)
    }

  } catch (error) {
    console.error("Error createAcessos "+error.message)
  }
}