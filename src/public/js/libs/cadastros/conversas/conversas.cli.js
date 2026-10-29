const mainId = 'conversaId'

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
    const baseUrl = `${sys.showAll}?log=false`

    await createTabulator(info.tableConfig)
    await getMainData(baseUrl)
    await btnMainFilter()

    if (win.selectedId.value.length > 0 && win.selectedId.value != 0) {
      if (mainTableData.find(x => x[mainId] === +(win.selectedId.value)))
        await fncSelectRow(+(win.selectedId.value))
    }

    if(info.markdowns && info.markdowns.length >0){
      await fillSelectComplex(await alphabeticallySort(info.markdowns, 'markdownTitulo'), 'markdownId', 'markdownTitulo', 'markdownId')
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

    if(win.btnMainFilterStatus){
      win.btnMainFilterStatus.onclick = async () => {
        const returnedUrl = await btnFilterStatus(`${sys.showAll}?log=false`, baseUrl, "ativos")
        return await getMainData(returnedUrl)
      }
    }

    if(win.conversaResposta)
      win.conversaResposta.style.height = "400px"

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

  if (type === 'conversa') {
    win.btnConfirma.onclick = () => {
      const dataObj = new FormData()
      const obj = {}
      obj[mainId] = data[mainId]
      obj.conversaConteudo = win.conversaConteudo.value
      if(obj.conversaConteudo.length <=0)
        return showMessage("Favor preencher uma pergunta!",3,true)
      dataObj.append(`conversaArquivo`, win.conversaArquivo.files[0])
      dataObj.append("dados", JSON.stringify(obj))
      fncBackEnd(
        sys.pergunta,
        'post',
        null,
        dataObj,
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
    if(type == "conversa"){
      win.conversaConteudo.value = data.conversaConteudo
      win.conversaResposta.value = data.conversaResposta
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
    if(selectedId?.conversaResposta){
      win.conversaResposta.value = selectedId.conversaResposta
    }else {
      $(`#${modal}`).modal('hide')
      await getMainData()
      await fncSelectRow(selectedId[mainId])
    }
    return showMessage("Operação realizada com sucesso.", 4, false)
  } else return showMessage(message, 4, true)

}