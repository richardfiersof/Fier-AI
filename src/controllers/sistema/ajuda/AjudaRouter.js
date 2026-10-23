const express = require("express")
const router = express.Router()
const fnc = require("./AjudaSv")
const { sys } = require("./AjudaVars")
const { authLogin } = require("../../../middlewares/authLogin")

for (const modulo in sys) {
  const { cmdURL, cmdService, cmdMethod } = sys[modulo]
  router[cmdMethod](cmdURL, authLogin(), fnc[cmdService])
}

module.exports = router