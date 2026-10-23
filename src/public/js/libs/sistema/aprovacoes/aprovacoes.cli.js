let users

const mainId = 'aprovCod'

//----------------------------------------------------------------------------------------------
fncSetWinVars().then(async w => {

  win = Object.fromEntries(w)
  await handleStart()

})

//----------------------------------------------------------------------------------------------
async function handleStart() {

  const urlStart = window.location.pathname[window.location.pathname.length - 1] == '/' ? window.location.pathname : window.location.pathname + '/'
  const info = await getResource(`${urlStart}start`)
  const mainBtns = info.mainBtns
  sys = info.sys
  mainForm = info.mainForm
  users = info.users

  await createTabulator(info.tableConfig)
  await getMainData()

  //Handle Buttons
  for await (const btn of mainBtns) {
    if (win[btn.name]) {
      win[btn.name].onclick = () => {
        fncOpenModal(btn.type, btn.modal, btn.title)
      }
    }
  }

  await alphabeticallySort(users, 'usNomeCompleto')
  await btnMainFilter()

  if (win.selectedId.value.length > 0 && win.selectedId.value != 0) {
    if (mainTableData.find(x => x[mainId] === +(win.selectedId.value)))
      await fncSelectRow(+(win.selectedId.value))
  }

}

//----------------------------------------------------------------------------------------------
async function getMainData() {
  try {
    const response = await fetch(`${sys.showAll}?log=false`)
    if (response.status == 200 || response.status == 404) {
      mainTableData = await response.json()
      if(mainTableData.message) mainTableData = []
      return await updateTabulator(mainTableData)
    } else {
      const { message } = await response.json()
      return showMessage(message, 3, true)
    }
  } catch (error) {
    return showMessage(`Error Cli: ${error.message}`, 4, true)
  }
}

//----------------------------------------------------------------------------------------------
async function createTabulator(tableConfig) { return mainTable = new Tabulator("#mainTable", tableConfig) }

//----------------------------------------------------------------------------------------------
async function updateTabulator(data) { 
  if( data.length <=0 ) mainTable.options.placeholder = "Sem dados"
  return mainTable.setData(data) 
}

//----------------------------------------------------------------------------------------------
async function fncSelectRow(val) { return await selectRowTable(mainTable, mainId, val) }

//----------------------------------------------------------------------------------------------
async function fncOpenModal(type, modal, title) {
  await fncBtnConfirmarContinuar(false)
  if (type === 'new') {
    formMainModal.reset()
    win.titleModal.innerText = title
    buttonConfig(type, modal)
    return $(`#${modal}`).modal('show')
  }

  const selectedData = mainTable.getSelectedData()
  if (selectedData.length < 1) 
    return showMessage("Selecione uma linha!", 3, 'alert')
  const url = sys.show.replace(`:${mainId}`, selectedData[0][mainId])
  const resp = await fetch(`${url}?log=false`)

  if (resp.status != 200) return
  const data = await resp.json()

  if (type === 'user' && data.aprovAcao === 'Ativo') userBody(data[mainId])
  else if (type === 'user') return showMessage('Apenas registros de ação "Ativo" podem conter aprovadores.', 3, true)

  await buttonConfig(type, modal, data)
  await modalBody(type, title, data)

  return $(`#${modal}`).modal('show')
}

//----------------------------------------------------------------------------------------------
async function buttonConfig(type, modal, data) {

  if (type === 'show') win.btnSalvar.disabled = true
  else {
    win.btnSalvar.disabled = false
    win.btnDeleteModal.disabled = false
  }

  if (type === 'new') {
    win.btnSalvar.onclick = () => {
      fncBackEnd(
        sys.new,
        'post',
        bodyConfig(type),
        modal,
        true,
        win.btnSalvar
      )
    }
  }

  if (type === 'update') {
    win.btnSalvar.onclick = () => {
      fncBackEnd(
        sys.update,
        'post',
        bodyConfig(type),
        modal,
        true,
        win.btnSalvar
      )
    }
  }

  if (type === 'delete') {
    win.btnDeleteModal.onclick = () => {
      fncBackEnd(
        sys.delete,
        'delete',
        JSON.stringify({ aprovCod: data[mainId] }),
        modal,
        false,
        win.btnDeleteModal
      )
    }
  }
}

//----------------------------------------------------------------------------------------------
async function modalBody(type, title, data) {
  win.titleModal.innerText = title

  if (type === 'update' || type === 'show') {
    for (const item of mainForm) {
      win[item.nome].value = data[item.nome]
    }
  }
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
async function validate() {

  let msg = 'Erro no(s) campo(s):'

  for (const data of mainForm) {
    const itemModal = win[data.nome]
    msg += itemModal.validity.valid ? '' : ` ${data.titulo},`
  }

  if (msg.length == 20) return true 
  else 
    msg = msg.substring(0, msg.length - 1) + '.'

  return showMessage(msg, 3, true)

}

//----------------------------------------------------------------------------------------------
async function userBody(aprovCod) {
  try {

    const data = await getResource(sys.showUser.replace(':aprovCod', aprovCod))
    win.userBody.innerHTML = ``
    for await (const user of users) {
      const check = data.find(x => x.usId === user.usId)
      win.userBody.innerHTML += `<div class=" col-4">
          <div class="custom-control custom-switch">
            <input type="checkbox" class="custom-control-input" id="user${user.usId}" onchange="userAprov(${aprovCod},${user.usId})" 
            ${check != undefined ? 'checked' : ''}>
            <label class="custom-control-label" for="user${user.usId}">${user.usNomeCompleto}</label>
        </div>
      </div>`
    }

  } catch (error) {
    return showMessage(`Error Cli: ${error.message}`, 4, true)
  }
}

//----------------------------------------------------------------------------------------------
async function userAprov(aprovCod, usId) {
  try {

    const obj = {}
    obj.method = 'post'
    obj.headers = { 'Content-Type': 'application/json; charset=utf-8' }
    obj.body = JSON.stringify(
      {
        aprovCod,
        usId
      }
    )
    const response = await fetch(sys.user, obj)
    const { message } = await response.json()
    if (response.status === 200 || response.status === 201)
      return showMessage(message, 4, false)
    return showMessage(message, 4, true)

  } catch (error) {
    return showMessage(`Error Cli: ${error.message}`, 4, true)
  }
}

//----------------------------------------------------------------------------------------------
async function fncBackEnd(url, method, body, modal, checar, btn) {
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
    btn.disabled = false
    return showMessage(message, 4, true)
  }
}
