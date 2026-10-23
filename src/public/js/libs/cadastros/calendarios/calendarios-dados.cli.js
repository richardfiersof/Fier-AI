const mainId = 'calendarioDadosId'
let calendariosId
let dados

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
    dados = info.dados
    calendariosId = info.calendariosId

    await createTabulator(info.tableConfig)
    await getMainData(`${replaceUrlDefault(sys.showAll, "calendariosId", calendariosId)}?log=false`)
    await btnMainFilter()

    await fillSelectComplex(await alphabeticallySort(info.turnos, 'turnoNome'), 'turnoId', 'turnoNome', 'turnoId', 'select', false)
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
          else 
            fncOpenModal(btn.type,btn.modal,btn.title,btn.func)
        }
      }
    }

    win.calendarioDadosInicio.onblur = function(){
      if (this.value.length >0) 
        fncTotal()
    }
    win.calendarioDadosTermino.onblur = function(){
      if (this.value.length >0) 
        fncTotal()
    }
    win.calendarioDadosAbono.onblur = function(){
      if (this.value.length >0) 
        fncTotal()
    }

  } catch (error) {
    return showMessage(`Error Cli: ${error.message}`, 3, true)
  }
}

function fncTotal(){
  try {

    const calendarioDadosInicio = win.calendarioDadosInicio.value
    const calendarioDadosTermino = win.calendarioDadosTermino.value
    const calendarioDadosAbono = win.calendarioDadosAbono.value

    if(calendarioDadosInicio.length <=0 || calendarioDadosTermino.length <=0 || calendarioDadosAbono.length <=0)
      return
    const minutosInicio = moment.duration(calendarioDadosInicio).asMilliseconds()
    const minutosTermino = moment.duration(calendarioDadosTermino).asMilliseconds()
    const minutosAbono = moment.duration(calendarioDadosAbono).asMilliseconds()
    const total = (Number(minutosTermino) - Number(minutosInicio)) - Number(minutosAbono)
    win.calendarioDadosTotal.value = moment.utc(total).format('HH:mm');
    
  } catch (error) {
    
  }
}

//----------------------------------------------------------------------------------------------
async function fncOpenModal(type, modal, title) {
  await fncBtnConfirmarContinuar(type, replaceUrlDefault(sys.new, "calendariosId", calendariosId), true)
  if (type === 'new') {
    formMainModal.reset()
    modalBody(type, title)
    buttonConfig(type, modal)
    win.calendarioDadosInicio.value = "06:00"
    win.calendarioDadosTermino.value = "14:00"
    win.calendarioDadosAbono.value = "00:30"
    win.calendarioDadosTotal.value = "07:30"
    return $(`#${modal}`).modal('show')
  }

  const selectedData = mainTable.getSelectedData()
  if (selectedData.length < 1) 
    return showMessage("Selecione uma linha!", 3, 'alert')
  if ( type == "data" ){
    return window.open(dados.replace(`:${mainId}`, selectedData[0][mainId]),"_blank")
  }
  const url = replaceUrlDefault(sys.show.replace(`:${mainId}`, selectedData[0][mainId]), "calendariosId", calendariosId)
  const resp = await fetch(`${url}?log=false`)
  console.log(url)
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
  const response = await fetch( replaceUrlDefault(url, "calendariosId", calendariosId), obj)
  const { message, selectedId } = await response.json()
  if (response.status === 200 || response.status === 201) {
    $(`#${modal}`).modal('hide')
    await getMainData()
    await fncSelectRow(selectedId)
    return showMessage("Operação realizada com sucesso.", 4, false)
  } else return showMessage(message, 4, true)

}