mainId = 'usId'

//----------------------------------------------------------------------------------------------
fncSetWinVars().then(async w => {
  win = Object.fromEntries(w)
  await handleStart()
})

//----------------------------------------------------------------------------------------------
async function handleStart() {
  //Handle Buttons
  const urlStart = window.location.pathname[window.location.pathname.length-1] == '/' ? window.location.pathname : window.location.pathname+'/'
  const info = await getResource(`${urlStart}start`)
  sys = info.sys
  mainForm = info.mainForm
  acessosVars = info.acessosVars
  const baseUrl = `${sys.showAll}?log=false&usAtivo=1`
  lastUrl = baseUrl
  await createTabulator(info.tableConfig)
  await getMainData()
  await btnMainFilter()

  win.btnMainFilterStatus.onclick = async () => {
    const returnedUrl = await btnFilterStatus(`${sys.showAll}?log=false`, baseUrl, "ativos")
    return await getMainData(returnedUrl)
  }

  if (win.selectedId.value.length > 0 && win.selectedId.value != 0) {
    if (mainTableData.find(x => x[mainId] === +(win.selectedId.value)))
      await fncSelectRow(+(win.selectedId.value))
  }

  for await (const btn of info.mainBtns) {
    if (win[btn.name]) {
      win[btn.name].onclick = () => {
        fncOpenModal(btn.type, btn.modal, btn.title, btn.func)
      }
    }
  }
  win.modalMainOutros.innerHTML = `<small class="from-text text-muted" >A senha deve conter: ao menos 8 carácteres, letras maiúsculas, minusculas, números e carácteres especiais!</small>`

}

//----------------------------------------------------------------------------------------------
async function fncOpenModal(type, modal, title, func) {
  await fncBtnConfirmarContinuar(false)
  if (type === 'new') {
    modalBody(func, type, title)
    buttonConfig(type, modal)
    return $(`#${modal}`).modal('show')
  }

  let selectedData = mainTable.getSelectedData()
  if (selectedData.length < 1) return showMessage("Selecione uma linha", 4, true)
  if (type === 'acessos') {
    window.open(acessosVars.replace(':usId', selectedData[0].usId), '_self')
  }

  modalBody(func, type, title, selectedData[0])
  buttonConfig(type, modal, selectedData[0])

  return $(`#${modal}`).modal('show')
}

//----------------------------------------------------------------------------------------------
function modalBody(func, type, title, data) {
  if (func === 'main') {
    win.modalMainOutros.hidden = ['show','update'].includes(type) ? true : false
    win.usSenha.value = ""
    win.titleModal.innerText = title
    if (type === 'new') {
      formMainModal.reset()
      win.usSenha.disabled = false
      win.divusSenha.hidden = false
      win.divusAtivo.hidden = false
      win.divusEmail.hidden = false
      win.divusMaster.hidden = false
      win.usNome.disabled = false
      win.divusNomeCompleto.hidden = false
      return
    } else if (type === 'pws') {
      win.usSenha.disabled = false
      win.divusSenha.hidden = false
      win.divusAtivo.hidden = true
      win.divusEmail.hidden = true
      win.usNome.value = data.usNome
      win.usNomeCompleto.value = data.usNomeCompleto
      win.usId.value = data.usId
      win.divusMaster.hidden = true
      win.usNome.disabled = true
      win.divusNomeCompleto.hidden = true
      return
    } else {
      win.usNome.disabled = true
      win.usId.value = data.usId
      win.usAtivo.value = data.usAtivo
      win.usNome.value = data.usNome
      win.usNomeCompleto.value = data.usNomeCompleto
      win.usEmail.value = data.usEmail
      win.usMaster.value = data.usMaster
      win.divusMaster.hidden = false
      win.divusAtivo.hidden = false
      win.divusEmail.hidden = false
      win.divusSenha.hidden = true
      win.usSenha.disabled = true
      win.divusNomeCompleto.hidden = false
      return
    }
  }
}

//----------------------------------------------------------------------------------------------
async function buttonConfig(type, modal, data) {

  if (type === 'show') win.btnSalvar.disabled = true
  else win.btnSalvar.disabled = false

  if (type === 'new') {
    win.btnSalvar.onclick = () => {
      return fncBackEnd(
        sys.new,
        'post',
        bodyConfig(),
        modal,
        true,
        null
      )
    }
  }

  if (type === 'update') {
    win.btnSalvar.onclick = () => {
      return fncBackEnd(
        sys.update,
        'post',
        bodyConfig(),
        modal,
        true,
        null
      )
    }
  }

  if (type === 'pws') {
    win.btnSalvar.onclick = () => {
      return fncBackEnd(
        sys.resetPws,
        'post',
        bodyConfig(),
        modal,
        false,
        null
      )
    }
  }

  if (type === 'newToken') {
    win.btnTokenModal.onclick = () => {
      return showMessage('Sem utilização!', 3, true)
      //       return fncBackEnd(
      //          sys.createToken,
      //          'post',
      //          JSON.stringify({usId: data.usId}),
      //          modal,
      //          false,
      //          fncTokenToModal
      //       )
    }
  }


  if (type === 'delToken') {
    win.btnAviso.onclick = () => {
      return showMessage('Sem utilização!', 3, true)

      return fncBackEnd(
        sys.deleteToken,
        'post',
        JSON.stringify({ usId: data.usId }),
        modal,
        false,
        null
      )
    }
  }

  return
}

//----------------------------------------------------------------------------------------------
function bodyConfig() {
  let body = {}
  for (const item of mainForm) {
    const itemValue = win[item.nome]
    body[item.nome] = itemValue.value
  }

  return JSON.stringify(body)
}

//----------------------------------------------------------------------------------------------
async function fncBackEnd(url, method, body, modal, checar, bonus = null) {

  if (checar) {
    const valido = await validate()
    if (valido != true) return valido
  }

  const obj = {}
  obj.method = method
  obj.headers = { 'Content-Type': 'application/json; charset=utf-8' }
  obj.body = body

  const response = await fetch(url, obj)
  const { message, selectedId } = await response.json()
  if (response.status === 200 || response.status === 201) {
    $(`#${modal}`).modal('hide')
    await getMainData()
    if(mainTableData.find(x=> x[mainId] == selectedId)) await fncSelectRow(selectedId)
    return showMessage("Operação realizada com sucesso.", 4, false)

  } else {
    return showMessage(message, 4, true)
  }
}