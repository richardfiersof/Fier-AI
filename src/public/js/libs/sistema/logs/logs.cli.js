//----------------------------------------------------------------------------------------------
fncSetWinVars().then(async w => {

  win = Object.fromEntries(w)
  await handleStart()

})

//----------------------------------------------------------------------------------------------
async function handleStart() {

  const urlStart = window.location.pathname[window.location.pathname.length - 1] == '/' ? window.location.pathname : window.location.pathname + '/'
  const info = await getResource(`${urlStart}start`)
  sys = info.sys
  mainForm = info.mainForm

  await createTabulator(info.tableConfig)
  await getMainData(moment(new Date()).format('YYYY-MM-DD'))
  await btnMainFilter()

  for await (const btn of info.mainBtns) {
    if (win[btn.name]) {
      win[btn.name].onclick = () => {
        if (btn.type != 'voltar') fncOpenModal(btn.type, btn.modal, btn.title, btn.func)
        else history.back()
      }
    }
  }
  // if (win.btnDetalhe) {
  //   win.btnDetalhe.onclick = () => {
  //     consultDetalhe()
  //   }
  // }

  if (win.btnNewDate) {
    win.btnNewDate.onclick = () => {
      if (win.newDate.value.length > 0) getMainData(moment(win.newDate.value).format('YYYY-MM-DD'))
      else getMainData(moment(new Date()).format('YYYY-MM-DD'))
    }
  }

  win.newDate.onblur = function () {
    if (this.value.length > 0) getMainData(moment(this.value).format('YYYY-MM-DD'))
    else getMainData(moment(new Date()).format('YYYY-MM-DD'))
  }


  if (win.selectedId.value && +(win.selectedId.value) > 0) {
    if (mainTableData.find(x => x[mainId] === +(win.selectedId.value)))
      await fncSelectRow(+(win.selectedId.value))
  }
}

//----------------------------------------------------------------------------------------------
async function getMainData(data) {
  try {
    const response = await fetch(`${sys.showAll.replace(':logDate', data)}?log=false`)
    if (response.status == 200 || response.status == 404) {
      mainTableData = await response.json()
      if (mainTableData.message) mainTableData = []
      await updateTabulator(mainTableData)
      return mainTableData
    } else {
      const { message } = await response.json()
      showMessage(message, 5, true)
      return []
    }
  } catch (error) {
    showMessage(`Error Cli: ${error.message}`, 5, true)
    return []
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
  await fncBtnConfirmarContinuar(type, null, true)

  if(type == "report"){
    win.titleModal.innerText = title
    win.dataReport.max = moment().format("YYYY-MM-DD")

    win.btnSalvar.onclick = () =>{
      const data = win.dataReport.value
      if(data.length <=0) return showMessage("Favor preencher a data",3,true)
      window.open(sys.report.replace(":data",data),"_self")
    }
    return $(`#${modal}`).modal('show')
  }
  const selectedData = mainTable.getSelectedData()
  if (selectedData.length < 1) return showMessage("Selecione uma linha", 3, "alert")
  if(type == "detail"){
    const body = selectedData[0].logBody
    if (body == "{}") return showMessage("Não há informação para exibir!", 3, "alert")
    win.divModal.innerHTML = ""
    if (body.includes('{') ){
      let objetoDetalhe = JSON.parse(selectedData[0].logBody)
      if(objetoDetalhe.length >0){
        for await ( const {nome, valor} of objetoDetalhe){
          win.divModal.innerHTML += `<div class="row mt-1">
          <div class="col">
            <div class="input-group mb-3">
            <span class="input-group-text" id="basic-addon1">${nome.toUpperCase()}</span>
            <input type="text" class="form-control" value="${valor}" readonly>
          </div>
          </div>
        </div>`
        }
      }else{
        for (const [key, value] of Object.entries(objetoDetalhe)) {
          win.divModal.innerHTML += `<div class="row mt-1">
            <div class="col">
              <div class="input-group mb-3">
              <span class="input-group-text" id="basic-addon1">${key.toUpperCase()}</span>
              <input type="text" class="form-control" value="${value}" readonly>
            </div>
            </div>
          </div>`
        }
      }
    }else{
      win.divModal.innerHTML = `<div class="row mb-4"><div class="col">${body.replaceAll('"',"")}</div></div>`
    }
  }
  return $(`#${modal}`).modal('show')
}

//----------------------------------------------------------------------------------------------
function consultDetalhe() {
  const selectedData = mainTable.getSelectedData();

  if (selectedData.length <= 0) return showMessage("Selecione uma linha", 4, true)
  if (selectedData[0].logBody == '{}') return showMessage("Não há informação para exibir!", 4, true)

  win.divModal.innerHTML = ''
  if (!selectedData[0].logBody.includes('{')){
    win.divModal.innerHTML = `<div>${selectedData[0].logBody}</div></br>`
    $('#detalhes').modal('show')
    return
  }
  const divAll = document.createElement('div')
  let info = ""
  if (selectedData[0].logType != 'error') {
    const objetoDetalhe = JSON.parse(selectedData[0].logBody)
    for (const [key, value] of Object.entries(objetoDetalhe)) {
      info += `<dl class="row p-0">
        <dt class="col-sm-5 form-control-sm">${key.toUpperCase()}</dt>
        <dd class="col-sm-7 form-control-sm">${value}</dd>
      </dl>`
    }
  } else {
    info += `<dl class="row p-0">
      <dt class="col-auto form-control-sm">Erro:</dt>
      <dd class="col form-control-sm">${selectedData[0].logBody}</dd>
   </dl>`
  }
  divAll.innerHTML = info
  win.divModal.appendChild(divAll)

  $('#detalhes').modal('show')
}