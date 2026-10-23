const keysPressed = {}
let v_obj
let v_fun
let lastUrl
let win
let sys
let mainForm
let mainTable
let mainTableData


function replaceUrlDefault(url, text, value){
  return url.replace(`:${text}`, value)
}

//----------------------------------------------------------------------------------------------
function showMessage(infoShow, seconds, isError) {
  try {

    const tagSpan = document.createElement("nav")
    tagSpan.setAttribute("class", "navbar")
    let icon
    let alert
    if (isError == true) {
      alert = "alert-danger"
      icon = "fa-times-circle-o"
    } else if (isError == false) {
      alert = "alert-success"
      icon = "fa-check-circle-o"
    } else {
      alert = "alert-warning"
      icon = "fa-exclamation-circle"
    }
    tagSpan.innerHTML = `<div class="container p-2 alert ${alert}"><i class="fa ${icon}" aria-hidden="true"></i>&nbsp${infoShow}</div>`

    const mainMessages = document.getElementById("mainMessages")
    mainMessages.appendChild(tagSpan)
    setTimeout(function () {
      mainMessages.removeChild(mainMessages.firstElementChild)
    }, (seconds * 1000));

  } catch (error) {
    console.error("sysdoclib: " + error.message)
  }
  return
}

//---------------------------------------------------------------------------------------------
function fncClearDataList(dataList) {
  const promise = new Promise((resolve, reject) => {
    try {
      if (dataList.hasChildNodes()) {
        while (dataList.firstChild) {
          dataList.removeChild(dataList.firstChild);

          if (!dataList.hasChildNodes()) {
            resolve()
          }
        }
      } else {
        resolve()
      }

    } catch (error) {
      reject()
    }
  })
  return promise
}

//----------------------------------------------------------------------------------------------
function alphabeticallySort(obj, campo) {
  obj.sort(function (a, b) {
    if (a[campo] > b[campo]) return 1
    if (a[campo] < b[campo]) return -1
    return 0
  })
  return obj
}

//----------------------------------------------------------------------------------------------
function diffEntreDatas(inicio, fim) {
  const ms = fim.diff(inicio)
  const duration = moment.duration(ms)
  return Math.floor(duration.asHours()) + moment.utc(ms).format(":mm:ss")
}

//----------------------------------------------------------------------------------------------
function iconAnimation(icon) {
  let classe = icon.firstElementChild.className
  icon.firstElementChild.className = classe === "fa fa-check-circle-o" ? "fa fa-times-circle-o" : "fa fa-check-circle-o"
}

//----------------------------------------------------------------------------------------------
function btnFilterStatus(todos, filtrado, tipo) {
  if (win.filterStatusText.textContent === "Mostrar todos") {
    win.filterStatusText.textContent = `Mostrar ${tipo}`
    return todos
  } else {
    win.filterStatusText.textContent = "Mostrar todos"
    return filtrado
  }
}

//----------------------------------------------------------------------------------------------
function btnFilterAdditional(todos, hoje, type) {
  const item = type == "Status" ? "filterStatusText" : "filterDateText"
  if (win[item].textContent === "Todos") {
    win[item].textContent = type == "Status" ? "Em andamento" : "Hoje"
    return todos
  } else {
    win[item].textContent = "Todos"
    return hoje
  }
}

//---------------------------------------------------------------------------------------------
async function fncSetWinVars() {
  const p = new Promise((resolve, reject) => {
    const elem = document.getElementsByTagName("*")
    let elemLen = elem.length
    let idTag = []
    try {
      if (elemLen > 0) {
        for (const el of elem) {

          let id = (el.id).toString()
          if (id.length > 0) {
            idTag.push([id, el])
          }

          elemLen--
          if (elemLen == 0) {
            resolve(idTag)
          }

        }
      } else {
        resolve(idTag)
      }
    } catch (error) {
      reject(error.message)
    }
  })

  return (p)
}

//----------------------------------------------------------------------------------------------
async function getResource(url, type = null) {
  try {
    const response = await fetch(url)
    if (response.status == 200 || response.status == 404) {
      const resource = await response.json()
      return resource

    } else {
      if (type == "all") return []
      const { message } = await response.json()
      showMessage(message, 3, true)
      return []
    }

  } catch (error) {
    showMessage(`Error Cli: ${error.message}`, 5, true)
    return []
  }
}

//----------------------------------------------------------------------------------------------
async function getMainData(url = lastUrl) {
  try {
    lastUrl = url
    mainTableData = await getResource(lastUrl, "all")
    if(mainTableData?.message) mainTableData = []
    return await updateTabulator(mainTableData)
  } catch (error) {
    return showMessage(`Error Cli: ${error.message}`, 3, true)
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
async function fncSelectRow(val) { return await selectRowTable(mainTable, mainId, val) }

//----------------------------------------------------------------------------------------------
async function standardPost(url, body ) {
  try {
    const obj = {
      method: "post",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body
    }

    const resp = await fetch(url, obj)
    const { message, selectedId } = await resp.json()
    return { message, selectedId, status: resp.status }

  } catch (error) {
    return {status: 500, message: error.message}
  }
}

//----------------------------------------------------------------------------------------------
async function standardDelete(url, body ) {
  try {
    const obj = {
      method: "delete",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body
    }

    const resp = await fetch(url, obj)
    const { message, selectedId } = await resp.json()
    return { message, selectedId, status: resp.status }

  } catch (error) {
    return {status: 500, message: error.message}
  }
}

//----------------------------------------------------------------------------------------------
async function formatNumberDot(num) {

  let [num1, num2] = num.replace(".", ",").split(",")

  if (num1.length <= 3) return `${num1},${num2}`
  if (num1.length >= 4) {
    let newNum1 = reverseNumber(num1)
    let groupsNum1 = newNum1.match(/.{1,3}/g)
    let dotsNum1 = ""

    for await (const item of groupsNum1) dotsNum1 += `${item}.`
    let finalNum1 = reverseNumber(dotsNum1)
    return `${finalNum1.trim().slice(1)},${num2}`
  }
}

//----------------------------------------------------------------------------------------------
async function fillSelectArray(data, id, start = true) {
  try {
    win[id].innerHTML = ""

    if(start){
      const optBase = document.createElement("option")
      optBase.value = ""
      optBase.textContent = "Selecione Um..."
      win[id].append(optBase)
    }

    for await (const item of data) {
      const opt = document.createElement("option")
      opt.value = item
      opt.textContent = item
      win[id].append(opt)
    }

  } catch (error) {
    return showMessage(`Error Cli: ${error.message}`, 3, true)
  }
}

//----------------------------------------------------------------------------------------------
async function fillSelect(data, id, text, val, start = true) {
  try {
    win[id].innerHTML = ""

    if(start){
      const optBase = document.createElement("option")
      optBase.value = ""
      optBase.textContent = "Selecione Um..."
      win[id].append(optBase)
    }
    for await (const item of data) {
      const opt = document.createElement("option")
      if (text.includes(".")) {
        let text2 = item[text.split(".")[0]]
        text2 = text2[text.split(".")[1]]
        opt.value = `${item[val]}-${text2}`
        opt.textContent = `${item[val]}-${text2}`
      } else {
        opt.value = item[val]
        opt.textContent = item[text]
      }
      win[id].append(opt)
    }

  } catch (error) {
    return showMessage(`Error Cli: ${error.message}`, 3, true)
  }
}

//----------------------------------------------------------------------------------------------
async function fillSelectBtn(data) {
  try {
    win.optClick.innerHTML = ""

    for await (const item of data) {
      if(win[item.name]){
        const opt = document.createElement("option")
        opt.value = item.name
        opt.textContent = win[item.name].innerText.trim()
        win.optClick.append(opt)
      }
    }

  } catch (error) {
    return showMessage(`Error Cli: ${error.message}`, 3, true)
  }
}

//----------------------------------------------------------------------------------------------
async function fillDataList(data, id, text, val) {
  try {
    win[id].innerHTML = ""
    const [text1, text2] = text.split("-")
    const [val1, val2] = val.split("-")
    for await (const item of data) {
      const opt = document.createElement("option")
      opt.value = `${item[text1]}-${item[text2]}`
      opt.textContent = `${item[val1]}-${item[val2]}`
      win[id].append(opt)
    }

  } catch (error) {
    return showMessage(`Error Cli: ${error.message}`, 3, true)
  }
}

//----------------------------------------------------------------------------------------------
// Data = Array de itens           , Id = id do select/input
// Text = Texto do select/datalist , Val = Valor do select/datalist
// Type = select/datalist          , Start = Selecione Um...(true/false) 
// DataType = basic/simple/complex
// Nested = Tabelas filhas (true/false)
// Positions = Nested positions (array)

// Obs.Datalist: text e val iguais
async function fillSelectComplex(data, id, text, val, type = "select", start = true, dataType = "simple", nested = false, postions) {
  try {

    win[id].innerHTML = ""
    if (start) {
      const optBase = document.createElement("option")
      optBase.value = ""
      optBase.textContent = "Selecione Um..."
      win[id].append(optBase)
    }

    for await (const item of data) {
      const opt = document.createElement("option")
      if (type == "select") {
        opt.value = item[val]
        if (dataType == "simple" && nested == false) {
          opt.textContent = item[text]
        } else if (dataType == "simple" && nested) {
          opt.textContent = item[text.split(".")[0]][text.split(".")[1]]
        } else if ( dataType == "complex"){
          const info = text.split("-")
          let textBase = ""
          let contador = 0
          for await (const dado of info) {
            contador += 1
            textBase += item[dado]
            if (contador < info.length) textBase += "-"
          }
          opt.textContent = textBase
        }
      } else if (type == "datalist") {
        if (dataType == "basic") {
          opt.value = `${item[val]}`
          opt.textContent = `${item[text]}`
        } else if (dataType == "simple" && nested == false) {
          opt.value = `${item[val]}-${item[text]}`
          opt.textContent = `${item[val]}-${item[text]}`
        } else if (dataType == "simple" && nested) {
          opt.value = `${item[val]}-${item[text.split(".")[0]][text.split(".")[1]]}`
          opt.textContent = `${item[val]}-${item[text.split(".")[0]][text.split(".")[1]]}`
        } else if (dataType == "complex" && nested == false) {
          const info = text.split("-")
          const qtd = text.split("-").length
          let textBase = ""
          let contador = 0
          for await (const dado of info) {
            contador += 1
            textBase += item[dado]
            if (contador < qtd) textBase += "-"
          }
          opt.value = textBase
          opt.textContent = textBase
        } else if (dataType == "complex" && nested) {
          const info = text.split("-")
          const qtd = text.split("-").length
          let textBase = ""
          let contador = 1
          for await (const dado of info) {
            if (postions.includes(contador)) {
              if (item[dado.split(".")[0]] == undefined) {
                textBase += "SEM DADOS"
              } else {
                textBase += item[dado.split(".")[0]][dado.split(".")[1]]
              }
            } else {
              textBase += item[dado]
            }
            if (contador < qtd) textBase += "-"
            contador += 1
          }
          opt.value = textBase
          opt.textContent = textBase
        }
      }
      if (opt.value.length > 0 && opt.textContent.length > 0)
        win[id].append(opt)
    }

  } catch (error) {
    if (error.message == "item[dado.split(...)[0]] is undefined" || error.message == "item[dado.split(...)[1]] is undefined") {
      return showMessage(`Error Cli: Dados faltantes!`, 3, true)
    } else {
      return showMessage(`Error Cli: ${error.message}`, 3, true)
    }
  }
}

//----------------------------------------------------------------------------------------------
async function fillSelectExtraItens(old, data, id, text, val) {
  try {

    const itens = Array.from(document.getElementsByClassName(`${id}-${val}`))
    if(itens.length >0) {
      for await ( const item of itens ){
        item.remove()
      }
    }
    if(!old) return
    if(data.find(x=> x[val] == old[val])) return
    
    const opt = document.createElement("option")
    opt.className = `${id}-${val}`
    opt.value = old[val]
    opt.textContent = old[text]
    win[id].append(opt)

    return
  } catch (error) {
    return showMessage(`Error Cli: ${error.message}`, 3, true)
  }
}

//----------------------------------------------------------------------------------------------
async function btnMainFilter() {
  try {

    win.btnMainFilter.onclick = async () => {
      const itens = document.getElementsByClassName("tabulator-header-filter")
      const itens2 = document.getElementsByClassName("tabulator-col tabulator-sortable")
      for await (const item of itens) {
        if (item.hidden === true) item.hidden = false
        else item.hidden = true
      }
      for await (const item2 of itens2) {
        if (itens[0].hidden) {
          document.getElementsByClassName("tabulator-headers")[0].style.height = "32px"
          item2.style.height = "40px"
        }
        else item2.style.height = "72px"
      }
    }

    win.btnMainFilter.click()

  } catch (error) {
    return showMessage(`Error Cli: ${error.message}`, 3, true)
  }
}

//----------------------------------------------------------------------------------------------
async function selectRowTable(table, text, val) {
  try {

    if (val && parseInt(val) > 0) {
      const rows = table.rowManager.activeRows
      if(rows.length >0){
        const row = rows.find(x => x.data[text] == val)
        if(typeof row == "object"){
          await table.deselectRow()
          if(table.getPageMax() > 1)
            await table.setPageToRow(row)
          await table.selectRow(row)
        }
      }
    }
    return

  } catch (error) {
    return showMessage(`Error Cli: ${error.message}`, 3, true)
  }
}

//----------------------------------------------------------------------------------------------
async function fncBtnConfirmarContinuar(type, url, valid = true) {
  if(type != "new") {
    win.btnConfirmarContinuar.hidden = true
    win.btnConfirmarContinuar.disabled = true
    return
  }
  win.btnConfirmarContinuar.hidden = false
  win.btnConfirmarContinuar.disabled = false
  win.btnConfirmarContinuar.onclick = async () =>{
    if(valid){
      const valido = await validate()
      if (valido != true) return valido
    }

    const { message, status } = await standardPost(url, bodyConfig())
    if(status == 200 || status == 201){
      formMainModal.reset()
      showMessage(message, 3, false)
      if(win.analiseFormula){
        win.analiseFormula.onchange()
      }
      await getMainData()
    }else showMessage(message, 3, true)
    
  }
}

if(document.getElementById("btnAutenticar")){

  const funcionarioIdInput = document.getElementById("funcionarioId")
  const funcionarioCodigoInput = document.getElementById("funcionarioCodigo")

  funcionarioIdInput.onkeydown = function(e){
    if(e.code == "NumpadEnter" || e.key == "Enter"){
      if(funcionarioIdInput.value.length >0 && funcionarioCodigoInput.value.length >0){
        document.getElementById("btnAutenticar").click()
      }
    }
  } 
  funcionarioCodigoInput.onkeydown = function(e){
    if(e.code == "NumpadEnter" || e.key == "Enter"){
      if(funcionarioIdInput.value.length >0 && funcionarioCodigoInput.value.length >0){
        document.getElementById("btnAutenticar").click()
      }
    }
  } 
}


//----------------------------------------------------------------------------------------------
const allModals = Array.from(document.getElementsByClassName("modal fade"))
firstItemModal(allModals)

async function firstItemModal( modals){
  if(modals.length <=0) return
  for await ( const modal of modals ){
    onClassChange(modal, (x=>{
      if(modal.classList.contains("show")){
        const ele = document.querySelector(`[focus=${modal.id}]`)
        if(ele){
          setTimeout( x=>{
            ele.focus()
          },500)
        }
      }
    }))
  }
}

function onClassChange(node, callback) {
  let lastClassString = node.classList.toString();

  const mutationObserver = new MutationObserver((mutationList) => {
    for (const item of mutationList) {
      if (item.attributeName === "class") {
        const classString = node.classList.toString();
        if (classString !== lastClassString) {
          callback(mutationObserver);
          lastClassString = classString;
          break;
        }
      }
    }
  });

  mutationObserver.observe(node, { attributes: true });
  return mutationObserver;
}

//----------------------------------------------------------------------------------------------
function numberToReal(numero) {
  var numero = numero.toFixed(2).split(".");
  numero[0] = "R$ " + numero[0].split(/(?=(?:...)*$)/).join(".");
  return numero.join(",");
}

function mascara(o,f){
  v_obj=o
  v_fun=f
  setTimeout("execmascara()",1)
}

function execmascara(){
  v_obj.value=v_fun(v_obj.value)
}

function soNumeros(v){
  return v.replace(/\D/g,"")
}

function telefone(v){
  v=v.replace(/\D/g,"")                 //Remove tudo o que não é dígito
  v=v.replace(/^(\d\d)(\d)/g,"($1) $2") //Coloca parênteses em volta dos dois primeiros dígitos
  v=v.replace(/(\d{4})(\d)/,"$1-$2")    //Coloca hífen entre o quarto e o quinto dígitos
  return v
}

function cep(v){
  v=v.replace(/D/g,"")                //Remove tudo o que não é dígito
  v=v.replace(/^(\d{5})(\d)/,"$1-$2") //Esse é tão fácil que não merece explicações
  if( v.length > 9)
    v = v.slice(0,9)
  return v
}

function cpf(v){
  if(v.length > 14){
    return cnpj(v)
  }
  v=v.replace(/\D/g,"")                    //Remove tudo o que não é dígito
  v=v.replace(/(\d{3})(\d)/,"$1.$2")       //Coloca um ponto entre o terceiro e o quarto dígitos
  v=v.replace(/(\d{3})(\d)/,"$1.$2")       //Coloca um ponto entre o terceiro e o quarto dígitos
  v=v.replace(/(\d{3})(\d{1,2})$/,"$1-$2") //Coloca um hífen entre o terceiro e o quarto dígitos
  return v
}

function cnpj(v){
  if(v.length < 14){
    return cpf(v)
  }
  v=v.replace(/\D/g,"")                           //Remove tudo o que não é dígito
  v=v.replace(/^(\d{2})(\d)/,"$1.$2")             //Coloca ponto entre o segundo e o terceiro dígitos
  v=v.replace(/^(\d{2})\.(\d{3})(\d)/,"$1.$2.$3") //Coloca ponto entre o quinto e o sexto dígitos
  v=v.replace(/\.(\d{3})(\d)/,".$1/$2")           //Coloca uma barra entre o oitavo e o nono dígitos
  v=v.replace(/(\d{4})(\d)/,"$1-$2")
  if( v.length > 18)
    v = v.slice(0,18)
  return v
}

function mdata(v){
  v=v.replace(/\D/g,"");
  v=v.replace(/(\d{2})(\d)/,"$1/$2");
  v=v.replace(/(\d{2})(\d)/,"$1/$2");

  v=v.replace(/(\d{2})(\d{2})$/,"$1$2");
  return v;
}

const reverseNumber = (num1) => num1.split("").reverse().join("")