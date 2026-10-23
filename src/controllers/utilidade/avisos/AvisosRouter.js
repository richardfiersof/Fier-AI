const express = require("express")
const router = express.Router()
const fnc = require("./AvisosSv")
const { sys } = require("./AvisosVars")
const { accessAdmin } = require("../../../middlewares/accessAdmin")

for (const modulo in sys) {
  const { cmdURL, cmdService, cmdMethod } = sys[modulo]
  router[cmdMethod](cmdURL, accessAdmin(), fnc[cmdService])
}

module.exports = router