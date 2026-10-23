let sysMaquina
const mainId = 'maquinaGrupoId'

//----------------------------------------------------------------------------------------------
fncSetWinVars().then(async w => {
  win = Object.fromEntries(w)
  await handleStart()
})

//----------------------------------------------------------------------------------------------
async function handleStart() {
  try {

    const urlStart = window.location.pathname[window.location.pathname.length - 1] == '/' ? window.location.pathname : window.location.pathname + '/'
    const info = await getResource(`${urlStart}start`)
    sys = info.sys
    mainForm = info.mainForm
    sysMaquina = info.sysMaquina
    await createTabulator(info.tableConfig)
    await getMainData(`${sys.showAll}?log=false`)
    await btnMainFilter()

    if (win.selectedId.value && +(win.selectedId.value) > 0) {
      if (mainTableData.find(x => x[mainId] === +(win.selectedId.value)))
        await fncSelectRow(+(win.selectedId.value))
    }

    //Handle Buttons
    for await (const btn of info.mainBtns) {
      if (win[btn.name]) {
        win[btn.name].onclick = () => {
          if (btn.type == 'voltar')
            history.back()
          else if (btn.type == 'down')
            mainTable.download("xlsx", "Grupo de maquinas.xlsx", { sheetName: "Grupo de maquinas" })
          else
            fncOpenModal(btn.type, btn.modal, btn.title, btn.func)
        }
      }
    }

  } catch (error) {
    return showMessage(`Error Cli: ${error.message}`, 3, true)
  }
}

//----------------------------------------------------------------------------------------------
async function fncOpenModal(type, modal, title) {
  await fncBtnConfirmarContinuar(type, sys.new, true)

  if (type === 'new') {
    formMainModal.reset()
    modalBody(type, title)
    buttonConfig(type, modal)
    return $(`#${modal}`).modal('show')
  }
  const selectedData = mainTable.getSelectedData()
  if (selectedData.length < 1)
    return showMessage("Selecione uma linha", 3, "alert")
  if (type == 'maquina') return window.open(`${sysMaquina}?b=t&m=${selectedData[0][mainId]}`, '_self')

  const data = await getResource(sys.show.replace(`:${mainId}`, selectedData[0][mainId])+'?log=false')
  await modalBody(type, title, data)
  await buttonConfig(type, modal, data)

  return $(`#${modal}`).modal('show')
}

//----------------------------------------------------------------------------------------------
async function buttonConfig(type, modal, data) {

  if (type === 'show') win.btnSalvar.disabled = true
  else win.btnSalvar.disabled = false
  if (type === 'new') {
    win.btnSalvar.onclick = () => {
      fncBackEnd(
        sys.new,
        'post',
        bodyConfig(type),
        modal,
        true
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
        true
      )
    }
  }

  if (type === 'delete') {
    win.btnDeleteModal.onclick = () => {
      fncBackEnd(
        sys.delete,
        'delete',
        `{"${mainId}": ${data[mainId]} }`,
        modal,
        false
      )
    }
  }
}

//----------------------------------------------------------------------------------------------
async function modalBody(type, title, data, func) {
  win.titleModal.innerText = title
  if (type != 'new') {
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
    body[item.nome] = itemValue.type == 'text' ? itemValue.value.toUpperCase().trim() : itemValue.value
  }
  return JSON.stringify(body)

}

//----------------------------------------------------------------------------------------------
async function fncBackEnd(url, method, body, modal, checar) {
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
    await fncSelectRow(selectedId)
    return showMessage("Operação realizada com sucesso.", 4, false)

  } else return showMessage(message, 4, true)
}