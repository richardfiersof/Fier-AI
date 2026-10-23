const mainId = 'TurnoId'
let turnos
//----------------------------------------------------------------------------------------------
fncSetWinVars().then(async w => {

  win = Object.fromEntries(w)
  await handleStart()

})

//----------------------------------------------------------------------------------------------
async function handleStart() {

  try {

    const urlStart = window.location.pathname[window.location.pathname.length-1] == '/' ? window.location.pathname : window.location.pathname+'/'
    const info = await getResource(`${urlStart}start`)
    sys = info.sys
    mainForm = info.mainForm
    turnos = info.turnos

    await createTabulator(info.tableConfig)
    await getMainData(`${sys.showAll}?log=false`)
    await btnMainFilter()
    if (win.selectedId.value.length > 0 && win.selectedId.value != 0) {
      if (mainTableData.find(x => x[mainId] === +(win.selectedId.value)))
        await fncSelectRow(+(win.selectedId.value))
    }

    //Handle Buttons
    for await (const btn of info.mainBtns) {
      if(win[btn.name]){
        win[btn.name].onclick = () =>{
          if(btn.type == 'voltar') 
            history.back()
          else if(btn.type == 'down')
            mainTable.download("xlsx", "Turnos.xlsx", {sheetName:"Turnos"})
          else 
            fncOpenModal(btn.type,btn.modal,btn.title,btn.func)
        }
      }
    }

    win.modeloExcel.setAttribute('class', 'btn btn-sm btn-success mt-2')
    win.modeloExcel.onclick = async () =>{
      window.open(sys.downExcel)
    }
    const div = document.createElement('div')
    div.setAttribute('id', 'divErrorExcel')
    win.formUploadModal.childNodes[1].append(div)

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

  } else if (type === 'excel') {
    const divErro = document.getElementById('divErrorExcel')
    if (divErro) divErro.innerHTML = ""
    win.excelFile.value = ''
    await buttonConfig(type, modal)
    return $(`#${modal}`).modal('show')
  }

  const selectedData = mainTable.getSelectedData()
  if (selectedData.length < 1) 
    return showMessage("Selecione uma linha!", 3, 'alert')

  const url = sys.show.replace(`:${mainId}`, selectedData[0][mainId])
  const resp = await fetch(`${url}?log=false`)

  if (resp.status != 200) return

  const data = await resp.json()
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
        { 'Content-Type': 'application/json; charset=utf-8' },
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
        { 'Content-Type': 'application/json; charset=utf-8' },
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
        { 'Content-Type': 'application/json; charset=utf-8' },
        `{"${mainId}": ${data[mainId]} }`,
        modal,
        false
      )
    }
  }

  if (type === 'excel') {
    win.btnUploadModal.onclick = () => {
      if (win.excelFile.files[0] == null || win.excelFile.files[0] == undefined) {
        return showMessage("Selecione um arquivo.", 4, true)
      }
      const dataAnexo = new FormData()
      dataAnexo.append('anexo', win.excelFile.files[0])

      fncBackEnd(
        sys.importExcel,
        'post',
        null,
        dataAnexo,
        modal,
        false
      )
    }
  }
}

//----------------------------------------------------------------------------------------------
async function modalBody(type, title, data) {
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
    body[item.nome] = itemValue.value
  }
  return JSON.stringify(body)
}

//----------------------------------------------------------------------------------------------
async function fncBackEnd(url, method, headers, body, modal, checar) {
  if (checar) {
    const valido = await validate()
    if (valido != true) return valido
  }
  const obj = {}
  obj.method = method
  if (headers != null) obj.headers = headers
  obj.body = body
  const response = await fetch(url, obj)
  const { message, selectedId } = await response.json()
  if (response.status === 200 || response.status === 201) {
    $(`#${modal}`).modal('hide')
    await getMainData()
    await fncSelectRow(selectedId)
    return showMessage("Operação realizada com sucesso.", 4, false)
  } else if (response.status == 401) {
    const divErro = document.getElementById('divErrorExcel')
    if (divErro) divErro.innerHTML = message
  } else return showMessage(message, 4, true)

}