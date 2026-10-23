let win

//----------------------------------------------------------------------------------------------
fncSetWinVars().then(async w => {

  win = Object.fromEntries(w)
  await handleStart()

})

async function handleStart() {
  //------------------------------------------------------------
  //Logar
  win.formlogin.addEventListener('keypress', event => {
    if (event.charCode == 13) {
      win.enviar.click()
    }
  })

  if (win.msgToUser.value.length > 0) {
    show_message(win.msgToUser.value, 5)
  }
}

//----------------------------------------------------------------------------
// Mensagem para usuario
function show_message(msg, seconds) {

  seconds = seconds * 1000

  win.errorMsg.innerHTML = msg
  win.errorMsg.style.display = "block"

  setTimeout(function () {
    win.errorMsg.style.display = "none"
  }, seconds);
}

