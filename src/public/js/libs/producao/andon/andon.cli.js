let maquinaParadaTipo
let paradas
let larguraTela
let alturaTela
let subitrairAltura = 10
let subitrairLargura = 20
let inResize = false
const asyncComunicationModule = io()
const maquinasCalendarios = []
moment.locale('pt-BR')

fncSetWinVars().then(async w => {
  win = Object.fromEntries(w)
  await handleStart()
})

async function handleStart() {
  try {

    const urlStart = window.location.pathname[window.location.pathname.length-1] == '/' ? window.location.pathname : window.location.pathname+'/'
    const info = await getResource(`${urlStart.split("grupo")[0]}start`)
    sys = info.sys
    paradas = info.paradas
    maquinaParadaTipo = info.maquinaParadaTipo
    await fncStartCronometros("andonDataInicial")
    await setMainData(true)
    await ajustarFontes()
    window.onresize = async () =>{
      if(inResize) return
      setTimeout(async () =>{
        if(inResize) return
        await setMainData(false)
        await ajustarFontes()
        inResize = false
      },1500)
    }
    win.carregando.hidden = true
    win.andons.classList = "m-0 p-0"

    await modalBody(info.andonsTipo,info.defeitos)

    asyncComunicationModule.on('updateAndonMaquina', async (data) => {
			const response = await fetch(sys.show.replace(":maquinaId",data.maquinaId))
			if (!response.ok) {
				throw new Error('Erro ao carregar o item');
			}
		
			const html = await response.text();
			document
			.querySelector(`#maquina${data.maquinaId}`)
			?.replaceWith(
				document.createRange().createContextualFragment(html)
			);
			await ajustarFonte(document.getElementById([`maquina${data.maquinaId}`]).firstElementChild.children[1])
      if(data.tipo == "NEW"){
        setTimeout( async ()=>{
          await fncSoloCrono(moment(`${data.maquinaParadaData} ${data.maquinaParadaHora}`), data.maquinaId)
        },1000)
      }
		})

    asyncComunicationModule.on('updateAndonMaquinaSchedules', async (maquinaId) => {
      console.log(`${maquinaId}, entrou`)
			const response = await fetch(sys.show.replace(":maquinaId",maquinaId))
			if (!response.ok) {
				throw new Error('Erro ao carregar o item');
			}
		
			const html = await response.text();
			document
			.querySelector(`#maquina${maquinaId}`)
			?.replaceWith(
				document.createRange().createContextualFragment(html)
			);
			const responseObj = await fetch(`${sys.show.replace(":maquinaId",maquinaId)}?objOnly=true`)
      await ajustarFonte(document.getElementById([`maquina${maquinaId}`]).firstElementChild.children[1])
      if(responseObj.parada){
        setTimeout( async ()=>{
          await fncSoloCrono(moment(`${responseObj.parada.maquinaParadaDataInicial} ${responseObj.parada.maquinaParadaHoraInicial}`), maquinaId)
        },1000)
      }
		})

    await fncCalendarioDatas()

  } catch (error) {
    return showMessage(`Error Cli: ${error.message}`, 4, true)
  }
}

// Ajustar tela
async function setMainData(initial = false) {
  try {
    if(inResize) return
    else inResize = true
    const data = Array.from(document.getElementsByClassName("andonCard"))
    let numeroMaquinas = data.length
    larguraTela = window.innerWidth - subitrairLargura
    alturaTela = window.innerHeight - subitrairAltura
    let numeroColunas = await fncNumeroColunas(larguraTela)
    if (numeroColunas != 1 && data.length <= 6) numeroColunas = 2
    let numeroLinhas = Math.ceil(numeroMaquinas / numeroColunas)
    let gapColuna = 2
    let gapLinha = 4

    let laguraDiv = (Math.ceil(larguraTela / numeroColunas)) - gapColuna
    let alturaDiv = (Math.ceil(alturaTela / numeroLinhas)) - gapLinha
    alturaDiv = alturaDiv < 145 ? 145 : alturaDiv
    if (numeroColunas != 1) win.andons.style.gridTemplateColumns = `repeat(${numeroColunas}, ${laguraDiv}px)`
    if (numeroColunas != 1) win.andons.style.gridTemplateRows = `repeat(${numeroLinhas}, ${alturaDiv}px)`
    win.andons.style.gridColumnGap = `${gapColuna}px`
    win.andons.style.gridRowGap = `${gapLinha}px`
    win.andons.style.padding = `${gapColuna}px`
    if(initial) inResize = false
  } catch (error) {
    return showMessage(`Error Cli: ${error.message}`, 4, true)
  }
}

async function fncNumeroColunas(larguraTela) {
  try {

    if (larguraTela <= 500) return 1
    if (larguraTela > 500 && larguraTela <= 750) return 2
    if (larguraTela > 760 && larguraTela <= 1000) return 3
    if (larguraTela >= 1900) return 5
    return 4

  } catch (error) {
    return showMessage(`Error Cli: ${error.message}`, 4, true)
  }
}

async function ajustarFontes(){
  document.querySelectorAll('.andonBodyStatus').forEach(ajustarFonte);
}

async function ajustarFonte(elemento) {
  let tamanho = 20; 
  elemento.style.fontSize = `${tamanho}px`;
  
  while (
    elemento.scrollWidth <= elemento.clientWidth &&
    elemento.scrollHeight <= elemento.clientHeight
  ) {
    tamanho++;
    elemento.style.fontSize = `${tamanho}px`;
  }
  elemento.style.fontSize = `${tamanho == 20 ? tamanho : tamanho - 5}px`;
}

// Cronometros
async function fncStartCronometros(grupo) {
  try {

    const spans = Array.from(document.getElementsByClassName(`${grupo}`))
    for await (const span of spans) {
      const [data,hora] = span.innerText.split(" ")
      const [dia,mes,ano] = data.split("/")
      await fncSoloCrono(moment(`${ano}-${mes}-${dia} ${hora}`), span.id.split("cronometroInicio")[1])
    }

  } catch (error) {
    return showMessage(`Error Cli: ${error.message}`, 4, true)
  }
}

async function fncSoloCrono(data, itemId) {
  try {
    const agora = moment()
    const inicio = moment(data)
    const ms = agora.diff(inicio)
  
    const duration = moment.duration(ms)
  
    let hh = Math.floor(duration.asHours())
    let mm = duration.minutes()
    let ss = duration.seconds()
  
    let interval
    const atualizar = () => {
      const item = document.getElementById(`cronometro${itemId}`)
      if (!item) {
        clearInterval(interval)
        return
      }
      item.textContent = ` ${hh}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
      ss++
      if (ss === 60) {
        ss = 0
        mm++
      }
      if (mm === 60) {
        mm = 0
        hh++
      }
    }
    // Cria o intervalo
    interval = setInterval(atualizar, 1000)
    // Mostra o valor imediatamente
    atualizar()
  } catch (error) {
    return showMessage(`Error Cli: ${error.message}`, 4, true)
  }
}

// Calendario
async function fncCalendarioDatas() {
  try {
    console.log('fncCalendarioDatas')

    const calendarios = Array.from(document.getElementsByClassName("calendarioItem"))
    const dados = []

    for await ( const item of calendarios){
      const calendariosId = item.className.split("calendarioItem")[1].trim()
      maquinasCalendarios.push(
        {
          maquinaId: item.parentElement.id.split("maquina")[1],
          calendariosId,
          calendarioDadosId: item.attributes.dado.value,
        }
      )
      if(dados.find(x=> x.calendariosId == calendariosId && x.calendarioDadosId == item.attributes.dado.value)) continue
      dados.push({calendariosId,calendarioDadosId:item.attributes.dado.value})
    }
    const resp = await standardPost(sys.calendarios, JSON.stringify({dados}))
    if(resp.status == 200){
      const agora =  moment().diff(moment().startOf('day'), 'seconds');
      const fututo =  moment(resp.selectedId.calendarioDadosInicio, "HH:mm").diff(moment().startOf('day'), 'seconds');
      const segundos = (fututo - agora)
      console.log(segundos)
      setTimeout( async () =>{
        const maquinasSelecionadas = maquinasCalendarios.filter( x=> x.calendariosId == resp.selectedId.calendariosId) 
        for await ( const { maquinaId } of maquinasSelecionadas){
          asyncComunicationModule.emit("updateAndonMaquinaSchedule", maquinaId)
          console.log(`${maquinaId}, emit`)
        }
      }, segundos * 1000)

      setTimeout( async () =>{
        await fncCalendarioDatas()
      }, ( segundos + 30) * 1000)

    }

  } catch (error) {
    return showMessage(`Error Cli: ${error.message}`, 4, true)
  }
}

// Modal
async function modalBody(andonsTipo,defeitos) {
  try {
    win.mainModalBody.innerHTML = ""
    let opts = ""
    for await ( const { valor, nome } of maquinaParadaTipo){
      opts += `<option value="${valor}"> ${nome}</option>`
    }
    win.mainModalBody.innerHTML += `<div class="row">
    <div class="col">
      <div class="form-group">
        <label for="maquinaParadaData">Data</label>
        <input type="date" class="form-control form-control-sm" id="maquinaParadaData" name="maquinaParadaData" required="true" focus="mainModal">
      </div>
    </div>
    <div class="col">
    <div class="form-group">
      <label for="maquinaParadaHora">Hora</label>
      <input type="time" class="form-control form-control-sm" id="maquinaParadaHora" name="maquinaParadaHora" required="true">
    </div></div>
    <div class="col">
      <div class="form-group">
        <label for="maquinaParadaTipo">Tipo de parada</label>
        <select id="maquinaParadaTipo" class="form-control form-control-sm" name="maquinaParadaTipo" required="true">${opts}</select>
      </div>
    </div></div>`
    if(andonsTipo.length >0){
      const row = document.createElement("div")
      row.setAttribute("class","row mt-1")
      row.setAttribute("id","divandonsTipo")
      row.innerHTML += `<div class="col-12"> Tipo de parada </div>`
      for await ( const { andonTiposId, andonTiposDescricao } of andonsTipo){
        row.innerHTML += `<div class="col-auto">
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" id="andonTipo${andonTiposId}" value="${andonTiposId}" name="andonTipoRadio">
            <label class="form-check-label" for="andonTipo${andonTiposId}">${andonTiposDescricao}</label>
          </div>
        </div>`
      }
      win.mainModalBody.append(row)
    }

    if(defeitos.length >0){
      const row = document.createElement("div")
      row.setAttribute("class","row mt-1")
      row.setAttribute("id","divdefeitos")
      row.innerHTML += `<div class="col-12"> Motivo de parada </div>`
      for await ( const { defeitoId, defeitoNome } of defeitos){
        row.innerHTML += `<div class="col-auto">
          <div class="form-check form-check-inline">
            <input class="form-check-input" type="radio" id="andonDefeito${defeitoId}" value="${defeitoId}" name="andonDefeitoRadio">
            <label class="form-check-label" for="andonDefeito${defeitoId}">${defeitoNome}</label>
          </div>
        </div>`
      }
      win.mainModalBody.append(row)
    }
    
    win.mainModalBody.innerHTML += `<div class="row mt-1"><div class="col"><div class="form-group"><label for="maquinaParadaObservacao">Observação</label><textarea class="form-control form-control-sm" id="maquinaParadaObservacao" name="maquinaParadaObservacao"></textarea></div></div></div>`

  } catch (error) {
    return showMessage(`Error Cli: ${error.message}`, 4, true)
  }
}

async function fncAutenticarFuncionario(maquinaId, funcao) {
  try {

    win.funcionarioId.value = ""
    win.funcionarioCodigo.value = ""

    $('#autenticarModal').modal('show')
    win.btnAutenticar.onclick = async () =>{
      const funcionarioId = win.funcionarioId.value
      const funcionarioCodigo = win.funcionarioCodigo.value
      if(funcionarioId.length <= 0 || funcionarioCodigo.length <= 0)
        return showMessage("Favor preencher ambos os campos com dados válidos.",3,"alert")
      if(Number(funcionarioId).isNaN)
        return showMessage(`Faver digitar um número no campo "Identificador"!`,3,"alert")
      const resp = await standardPost(
        sys.autenticar, 
        JSON.stringify(
          {
            funcionarioId,
            funcionarioCodigo
          }
        )
      )
      if(resp.status == 200){
        return fncAtualizarMaquina(maquinaId, funcionarioId, funcao)
      }
      return showMessage(resp.message,3,true)
    }

  } catch (error) {
    return showMessage(`Error Cli: ${error.message}`, 4, true)
  }
}

async function fncAtualizarMaquina(maquinaId, funcionarioId, funcao){
  try {
    $('#autenticarModal').modal('hide')
    win.formmainModal.reset()
    const divandonsTipo = document.getElementById("divandonsTipo")
    if (divandonsTipo) divandonsTipo.hidden = funcao != "new"
    else return showMessage(`Favor cadastrar "Andon tipo" para realizar uma parada!`,3,true)
    const divdefeitos = document.getElementById("divdefeitos")
    if (divdefeitos) divdefeitos.hidden = funcao != "new"
    else return showMessage(`Favor cadastrar "Defeitos" para realizar uma parada!`,3,true)
    document.getElementById("maquinaParadaData").disabled = funcao != "new"
    document.getElementById("maquinaParadaHora").disabled = funcao != "new"
    document.getElementById("maquinaParadaData").value = moment().format("YYYY-MM-DD")
    document.getElementById("maquinaParadaHora").value = moment().format("HH:mm")

    $('#mainModal').modal('show')
    win.btnSalvar.onclick = async () =>{
      const body = await fncParadaBody(maquinaId, funcionarioId, funcao)
      if(body.error) return showMessage(body.resp,3,true)
      const resp = await standardPost(paradas[funcao], JSON.stringify(body.resp))
      if(resp.status == 200 || resp.status == 201 ){
        $('#mainModal').modal('hide')
        asyncComunicationModule.emit('updateAndon', resp.selectedId)
        return showMessage(resp.message,3,false)
      }
      return showMessage(resp.message,3,true)
    }
  } catch (error) {
    return showMessage(`Error Cli: ${error.message}`, 4, true)
  }
}

async function fncParadaBody(maquinaId, funcionarioId, funcao){
  const obj = {
    andonTiposId: document.querySelector('input[name="andonTipoRadio"]:checked')?.value,
    defeitoId: document.querySelector('input[name="andonDefeitoRadio"]:checked')?.value,
    maquinaParadaData: document.getElementById("maquinaParadaData").value,
    maquinaParadaHora: document.getElementById("maquinaParadaHora").value,
    maquinaParadaObservacao: document.getElementById("maquinaParadaObservacao").value,
    maquinaId, 
    funcionarioId
  }
  try {
    if( obj.maquinaParadaData.length <=0 || obj.maquinaParadaHora.length <=0  ){
      return {error: true, resp: "Favor preencher todos os campos obrigatórios!"} 
    }
    if(funcao == "new"){
      if(obj.andonTiposId.length <=0 || obj.defeitoId.length <=0)
        return {error: true, resp: "Favor preencher todos os campos obrigatórios!"} 
    }
    return {error: false, resp: obj }
  } catch (error) {
    return {error: true, resp: error.message}
  }
}