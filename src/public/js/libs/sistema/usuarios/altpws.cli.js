//----------------------------------------------------------------------------------------------
fncSetWinVars().then(async w => {

  win = Object.fromEntries(w)
  await handleStart()

})

//----------------------------------------------------------------------------------------------
async function handleStart() {
  //Handle Buttons
  if (win.btnSalvar)
    win.btnSalvar.onclick = () => {
      fncSave()
    }
}

//----------------------------------------------------------------------------------------------
async function fncSave() {

  const isFormOK = await validate()
  if (!isFormOK) {
    return false
  }

  let url = '/alterar/senha'

  const obj = {}
  obj.method = 'post'
  obj.headers = { 'Content-Type': 'application/json; charset=utf-8' }
  obj.body = JSON.stringify({
    newPws: win.newPws.value
  })

  const response = await fetch(url, obj)

  if (response.status === 200) {
    return showMessage("Operação realizada com sucesso.", 4, false)

  } else {
    const { message } = await response.json()
    return showMessage(message, 4, true)
  }
}

//----------------------------------------------------------------------------------------------
async function validate() {
  let msmError = ''

  if (win.newPws.value.length <= 0 || win.newPws2.value.length <= 0) {
    msmError += "Preencher todos os campos.<br>"
  }
  if (win.newPws.value !== win.newPws2.value) {
    msmError += "Nova senha e confirmação são distintas.<br>"
  }

  if (msmError.length <= 0) {
    return true
  }

  showMessage(msmError, 5, true, win.message_main)
  return false

}
