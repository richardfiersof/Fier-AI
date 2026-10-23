const mainId = 'maquinasVisualizacaoId'
let maquinas
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
    maquinas = info.maquinas

    await createTabulator(info.tableConfig)
    await getMainData(`${sys.showAll}?log=false`)
    await btnMainFilter()
    if (win.selectedId.value.length > 0 && win.selectedId.value != 0) {
      if (mainTableData.find(x => x[mainId] === +(win.selectedId.value)))
        await fncSelectRow(+(win.selectedId.value))
    }
    await createModalBody()

    //Handle Buttons
    for await (const btn of info.mainBtns) {
      if(win[btn.name]){
        win[btn.name].onclick = () =>{
          if(btn.type == 'voltar') 
            history.back()
          else 
            fncOpenModal(btn.type,btn.modal,btn.title,btn.func)
        }
      }
    }


  } catch (error) {
    return showMessage(`Error Cli: ${error.message}`, 3, true)
  }
}

async function createModalBody() {
  try {
    win.maquinasModalBody.innerHTML = ""
    if(maquinas.length <=0)
      return showMessage("Favor realizar o cadastro de máquinas para fazer o agrupamento.",3, "alert")
    win.maquinasModalBody.setAttribute("class","row row-cols-2")
    for await (const {maquinaId, maquinaIdentificacao} of maquinas ){
      win.maquinasModalBody.innerHTML += `<div class="col">
      <div class="form-check form-switch">
        <input class="form-check-input" type="checkbox" id="maquina${maquinaId}" onclick="fncAgrupamento('${maquinaId}')">
        <label class="form-check-label" for="maquina${maquinaId}">${maquinaIdentificacao}</label>
      </div>
    </div>`
    }

  } catch (error) {
    return showMessage(`Error Cli: ${error.message}`, 3, true)
  }
}

async function fncSetMaquinas() {
  try {
    const maquinaInput = Array.from(document.getElementsByClassName("form-check-input"))
    maquinaInput.map(x=> x.checked == true ?  x.checked = false : "")
    const maquinas = await getResource(sys.maquina.replace(`:${mainId}`,win[mainId].value),"all")
    if(maquinas?.message) return
    for await ( const { maquinaId } of maquinas){
      document.getElementById(`maquina${maquinaId}`).checked = true
    }
    
  } catch (error) {
    return showMessage(`Error Cli: ${error.message}`, 3, true)
  }
}

async function fncAgrupamento(maquinaId) {
  try {
    const maquina = document.getElementById(`maquina${maquinaId}`)
    const obj = {
      maquinaId
    }
    obj[mainId] = win[mainId].value
    const { message, status} = await standardPost(sys.maquina, JSON.stringify(obj))
    if(status == 200 || status == 201)
      return showMessage(message,3,false)
    return showMessage(message,3,true)
    
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
}

//----------------------------------------------------------------------------------------------
async function modalBody(type, title, data) {
  win.titleModal.innerText = title
  if (type != 'new') {
    for (const item of mainForm) {
      win[item.nome].value = data[item.nome]
    }
    if(type == "maquina"){
      await fncSetMaquinas()
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
  }
  return showMessage(message, 4, true)
}