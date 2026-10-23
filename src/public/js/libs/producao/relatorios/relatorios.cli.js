const mainId = 'andonTiposId'
let tipos
let maquinaGrupo

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
    tipos = info.tipos
    maquinaGrupo = info.maquinaGrupo

    await fncItensModal()

    //Handle Buttons
    for await (const btn of info.mainBtns) {
      if(win[btn.name]){
        win[btn.name].onclick = () =>{
          if(btn.type != 'voltar') 
            fncOpenModal(btn.type,btn.modal,btn.title,btn.func)
        }
      }
    }

  } catch (error) {
    return showMessage(`Error Cli: ${error.message}`, 3, true)
  }
}

//----------------------------------------------------------------------------------------------
async function fncItensModal() {
  win.divandonTipo.firstElementChild.removeChild(win.divandonTipo.firstElementChild.lastElementChild)
  win.divandonTipo.firstElementChild.innerHTML += `<br><div class="form-check form-check-inline">
    <input class="form-check-input" type="checkbox" name="andonTipos" id="andonTipoTodos" value="Todos">
    <label class="form-check-label" for="andonTipoTodos">Todos</label>
  </div>`
  for await ( const { andonTiposId, andonTiposDescricao } of tipos){
    win.divandonTipo.firstElementChild.innerHTML += `<div class="form-check form-check-inline">
    <input class="form-check-input" type="checkbox" name="andonTipos" id="andonTipo${andonTiposId}" value="${andonTiposId}">
    <label class="form-check-label" for="andonTipo${andonTiposId}">${andonTiposDescricao}</label>
  </div>`
  }
  win.divmaquinaGrupo.firstElementChild.removeChild(win.divmaquinaGrupo.firstElementChild.lastElementChild)
  win.divmaquinaGrupo.firstElementChild.innerHTML += `<br><div class="form-check form-check-inline">
    <input class="form-check-input" type="checkbox" name="maquinasGrupos" id="maquinaGrupoTodos" value="Todos">
    <label class="form-check-label" for="maquinaGrupoTodos">Todos</label>
  </div>`
  for await ( const { maquinaGrupoCodigo, maquinaGrupoDescricao } of maquinaGrupo){
    win.divmaquinaGrupo.firstElementChild.innerHTML += `<div class="form-check form-check-inline">
    <input class="form-check-input" type="checkbox" name="maquinasGrupos" id="maquinaGrupo${maquinaGrupoCodigo}" value="${maquinaGrupoCodigo}">
    <label class="form-check-label" for="maquinaGrupo${maquinaGrupoCodigo}">${maquinaGrupoDescricao}</label>
  </div>`
  }

  await fncCheckboxCheck("andonTipos")
  await fncCheckboxCheck("maquinasGrupos")
}

//----------------------------------------------------------------------------------------------
async function fncCheckboxCheck(type) {
  const itens = Array.from(document.getElementsByName(`${type}`))
  const normais = itens.filter(x=> x.value != "Todos")
  const todos = itens.find(x=> x.value == "Todos")
  for await ( const item of itens){
    item.onclick = async function (){
      if(this.value == "Todos"){
        normais.map(x=> x.checked = false)
      }else{
        if(normais.every(x=> x.checked)){
          todos.click()
        }else todos.checked = false
      }
    }
  }
}

//----------------------------------------------------------------------------------------------
async function fncOpenModal(type, modal, title) {
  await fncBtnConfirmarContinuar(false, sys.new, true)
  formMainModal.reset()
  win.titleModal.innerText = title
  await buttonConfig(type, modal)
  await modalBody(type)
  
  return $(`#${modal}`).modal('show')
}

//----------------------------------------------------------------------------------------------
async function modalBody(type) {
  win.divhoraInicial.hidden = type == "calendario"
  win.divhoraFinal.hidden = type == "calendario"
  win.divrelatorioTipo.hidden = type == "calendario"
  win.horaInicial.value = "00:00"
  win.horaFinal.value = "23:59"
  win.dataInicial.value = "2026-08-01"
  win.dataFinal.value = "2026-08-31"
}

//----------------------------------------------------------------------------------------------
async function buttonConfig(type, modal, data) {
  if (type === 'andon') {
    win.btnSalvar.onclick = async () => {
      const data = await fncCheckData()
      if(data.error) return showMessage("Favor preencher todos os campos!",3,"alert")
      if(data.obj.method == "get"){
        window.open(
          sys.andon.replace(":tipo", data.obj.tipo)
          .replace(":dataInicial", data.obj.dataInicial)
          .replace(":dataFinal", data.obj.dataFinal)
          .replace(":horaInicial", data.obj.horaInicial)
          .replace(":horaFinal", data.obj.horaFinal),
          "_blank"
        )
      }else {
        win.formMainModal.method = data.obj.method
        win.formMainModal.action = sys.andonPost
        win.formMainModal.target = '_blank'
        win.formMainModal.submit()
      }
    }
  }
  if (type === 'indicador') {
    win.btnSalvar.onclick = async () => {
      const data = await fncCheckData()
      if(data.error) return showMessage("Favor preencher todos os campos!",3,"alert")
      win.formMainModal.method = "post"
      win.formMainModal.action = sys.indicador
      win.formMainModal.target = '_blank'
      win.formMainModal.submit()
    }
  }
  if (type === 'calendario') {
    win.btnSalvar.onclick = async () => {
      const data = await fncCheckData()
      if(data.error) return showMessage("Favor preencher todos os campos!",3,"alert")
      win.formMainModal.method = "post"
      win.formMainModal.action = sys.calendario
      win.formMainModal.target = '_blank'
      win.formMainModal.submit()
    }
  }
}

//----------------------------------------------------------------------------------------------
async function fncCheckData() {
  const obj = {
    dataInicial: win.dataInicial.value,
    dataFinal: win.dataFinal.value,
    horaInicial: win.horaInicial.value.length == 0 ? "00:00" : win.horaInicial.value,
    horaFinal: win.horaFinal.value.length == 0 ? "23:59" : win.horaFinal.value,
    tipo: win.relatorioTipo.value,
    andonTipos: Array.from(document.querySelectorAll('input[name="andonTipos"]:checked')),
    maquinasGrupos: Array.from(document.querySelectorAll('input[name="maquinasGrupos"]:checked')),
    method: "get"
  }
  if(obj.andonTipos.length >0){
    const itens = obj.andonTipos.map(x=> x.value)
    obj.andonTipos = itens[0] == "Todos" ? itens[0] : itens
  }
  if(obj.maquinasGrupos.length >0){
    const itens = obj.maquinasGrupos.map(x=> x.value)
    obj.maquinasGrupos = itens[0] == "Todos" ? itens[0] : itens
  }
  if (typeof obj.maquinasGrupos == "object"|| typeof obj.andonTipos == "object")
    obj.method = "post"
  console.log(obj)
  return { obj, error: obj.dataInicial.length <=0 || obj.dataFinal.length <=0 }
}