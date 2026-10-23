let usId

//----------------------------------------------------------------------------------------------
fncSetWinVars().then(async w => {

  win = Object.fromEntries(w)
  await handleStart()

})


//----------------------------------------------------------------------------------------------
async function handleStart() {
  usId = +(win.usId.value)

  const urlStart = window.location.pathname[window.location.pathname.length - 1] == '/' ? window.location.pathname : window.location.pathname + '/'
  const { sys } = await getResource(`${urlStart.split('usuario')[0]}start`)

  win.btnUnblock.onclick = () => {
    return fncBackEnd(sys.updateAll, JSON.stringify({ usId, acessoLiberado: 1 }))
  }
  win.btnBlock.onclick = () => {
    return fncBackEnd(sys.updateAll, JSON.stringify({ usId, acessoLiberado: 0 }))
  }

  const inputs = document.getElementsByClassName('acessoUnico')
  for await (const input of inputs) {
    input.onchange = () => {
      const url = sys.updateOne
      const acessoLiberado = input.checked === true ? 1 : 0
      const estruturaCodigo = input.id
      return fncBackEnd(url, JSON.stringify({ usId, estruturaCodigo, acessoLiberado }))
    }
  }

  const btnPai = Array.from(document.getElementsByClassName("btnPai"))
  for await ( const element of btnPai){
    element.onclick = () =>{
      win[`filho${element.name}`].hidden = !win[`filho${element.name}`].hidden
    }
  }
}

//----------------------------------------------------------------------------------------------
async function fncBackEnd(url, body) {

  const obj = {}
  obj.method = 'post'
  obj.headers = { 'Content-Type': 'application/json; charset=utf-8' }
  obj.body = body

  const response = await fetch(url, obj)
  if (response.status === 200 || response.status === 201) {
    return showMessage("Operação realizada com sucesso.", 4, false)

  } else {
    const { message } = await response.json()
    return showMessage(message, 4, true)
  }
}