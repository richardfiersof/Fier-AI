let produtoGrupo
let qry
const mainId = 'produtoId'

//----------------------------------------------------------------------------------------------
fncSetWinVars().then(async w => {
  win = Object.fromEntries(w)
  await handleStart()
})

//----------------------------------------------------------------------------------------------
async function handleStart() {
  try {

    qry = window.location.search.split('m=')
    qry = qry[qry.length - 1]
    const urlStart = window.location.pathname[window.location.pathname.length - 1] == '/' ? window.location.pathname : window.location.pathname + '/'
    const info = await getResource(`${urlStart}start`)
    sys = info.sys
    mainForm = info.mainForm
    produtoGrupo = info.produtoGrupo

    const filtrados = qry ? produtoGrupo.filter(x=> x.produtoGrupoId == qry) : produtoGrupo
    await createTabulator(info.tableConfig)
    await getMainData(`${sys.showAll}?log=false${qry.length > 0 ? '&produtoGrupoId=' + qry : ''}`)
    await btnMainFilter()
    
    await alphabeticallySort(filtrados, 'produtoGrupoDescricao')
    await fillSelectComplex(filtrados, 'produtoGrupoId', 'produtoGrupoDescricao', 'produtoGrupoId', 'select', false)
   
    if(qry){
      win.produtoGrupoId.value = qry
      win.produtoGrupoId.disabled = true
    }

    if (win.selectedId.value && +(win.selectedId.value) > 0) {
      if (mainTableData.find(x => x[mainId] === +(win.selectedId.value)))
        await fncSelectRow(+(win.selectedId.value))
    }


    win.modeloExcel.setAttribute('class', 'btn btn-sm btn-success mt-2')
    win.modeloExcel.onclick = async () =>{
      window.open(`${sys.downExcel}?modelo=Produtos`)
    }

    win.modeloExcelDescricao.setAttribute('class', 'btn btn-sm btn-success mt-2')
    win.modeloExcelDescricao.onclick = async () =>{
      window.open(`${sys.downExcel}?modelo=ProdutosDescricao`)
    }

    //Handle Buttons
    for await (const btn of info.mainBtns) {
      if (win[btn.name]) {
        win[btn.name].onclick = () => {
          if (btn.type == 'voltar') {
            history.back()
          } else if (btn.type == 'down') {
            mainTable.download("xlsx", "Produtos.xlsx", { sheetName: "Produtos" })
          } else fncOpenModal(btn.type, btn.modal, btn.title, btn.func)
        }
      }
    }

  } catch (error) {
    return showMessage(`Error Cli: ${error.message}`, 3, true)
  }
}

//----------------------------------------------------------------------------------------------
async function fncOpenModal(type, modal, title, func) {
  await fncBtnConfirmarContinuar(type, sys.new, true)
  if (type === 'new') {
    formMainModal.reset()
    modalBody(type, title)
    buttonConfig(type, modal)
    return $(`#${modal}`).modal('show')
  } else if (func === 'excel') {
    win.modaluploadModalOutros.innerHTML = ""
    win.modaluploadDescricaoModalOutros.innerHTML = ""
    win.excelFile.value = ''
    win.excelFileDescricao.value = ''
    await buttonConfig(type, modal)
    return $(`#${modal}`).modal('show')
  }

  const selectedData = mainTable.getSelectedData()
  if (selectedData.length < 1)
    return showMessage("Selecione uma linha", 3, true)
  if (type == 'produto') return window.open(`${sysProduto}?${mainId}=${selectedData[0][mainId]}`)
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
  if (type === 'excel2') {
    win.btnUploadDescricaoModal.onclick = () => {
      if (win.excelFileDescricao.files[0] == null || win.excelFileDescricao.files[0] == undefined) {
        return showMessage("Selecione um arquivo.", 4, true)
      }
      const dataAnexo = new FormData()
      dataAnexo.append('anexo', win.excelFileDescricao.files[0])
      fncBackEnd(
        sys.atualizarDescricao,
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
    body[item.nome] = itemValue.value
  }
  return JSON.stringify(body)
}

//----------------------------------------------------------------------------------------------
async function validate() {
  let msmError = 'Erro no(s) campo(s):'

  for (const data of mainForm) {
    if (data.titulo != 'Id') {
      const itemModal = win[data.nome]
      msmError += itemModal.validity.valid ? '' : ` ${data.titulo},`
    }
  }

  if (msmError.length == 20) return true
  else {
    msmError = msmError.substring(0, msmError.length - 1)
    msmError += '.'
  }

  return showMessage(msmError, 3, true)
}

//----------------------------------------------------------------------------------------------
async function fncBackEnd(url, method, headers, body, modal, checar) {
  if (checar) {
    const valido = await validate()
    if (valido != true) return valido
  }
  const obj = {}
  obj.method = method
  if (headers) obj.headers = headers
  obj.body = body
  const response = await fetch(url, obj)
  const { message, selectedId } = await response.json()
  if (response.status === 200 || response.status === 201) {
    $(`#${modal}`).modal('hide')
    await getMainData()
    await fncSelectRow(selectedId)
    return showMessage("Operação realizada com sucesso.", 4, false)
  } else if (response.status == 401) {
    win.modaluploadModalOutros.innerHTML = message
    win.modaluploadDescricaoModalOutros.innerHTML = message
    await getMainData()
  } else return showMessage(message, 4, true)
}