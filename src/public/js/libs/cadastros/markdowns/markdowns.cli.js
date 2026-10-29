const mainId = 'markdownId'

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
          else 
            fncOpenModal(btn.type,btn.modal,btn.title,btn.func)
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
    return showMessage("Selecione uma linha!", 3, 'alert')

  const url = sys.show.replace(`:${mainId}`, selectedData[0][mainId])
  let qry = "?log=false"
  if(type == "arquivo"){
    qry += "&arquivo=t"
  }
  const resp = await fetch(`${url}${qry}`)
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
      if (win.markdownArquivo.files[0] == null || win.markdownArquivo.files[0] == undefined) {
        return showMessage("Selecione um arquivo.", 4, true)
      }
      fncBackEnd(
        sys.new,
        'post',
        null,
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
        null,
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
    if(type == "arquivo"){
      win.arquivosModalBody.innerHTML = data.message
    }else {
      for (const item of mainForm) {
        if(item.nome != "markdownArquivo")
          win[item.nome].value = data[item.nome]
      }
    }
  }
}


//----------------------------------------------------------------------------------------------
function bodyConfig() {
  const dados = {}
  const dataObj = new FormData()
  dataObj.append(`markdownArquivo`, win.markdownArquivo.files[0])
  dados.markdownId = win.markdownId.value
  dados.markdownTitulo = win.markdownTitulo.value
  dados.markdownAtivo = win.markdownAtivo.value
  dataObj.append("dados", JSON.stringify(dados))
  return dataObj
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
  } else return showMessage(message, 4, true)

}