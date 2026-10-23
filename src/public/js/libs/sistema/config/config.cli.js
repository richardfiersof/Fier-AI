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

  for await (const btns of info.mainBtns) {
    for await (const btn of btns) {
      if (btn.element === 'button') {
        if (win[btn.id]) {
          win[btn.id].onclick = () => {
            fncActions(btn.action)
          }
        }
      }
    }
  }

  await emailBody()
}

//----------------------------------------------------------------------------------------------
async function fncActions(arr) {
  try {

    const [action, tipo, valor] = arr.split(',')
    if (action === 'show') {
      const name = tipo === 'login' ? 'logoLogin' : 'logoImpressao'
      if (tipo === 'login') {
        win.imageLogo.alt = 'Imagem da tela de login'
      } else {
        win.imageLogo.alt = 'Imagem para impressão'
      }
      win.imageLogo.src = `/images/${name}.png`
      return $(`#showModal`).modal('show')
    }

    if (win[valor].files[0] == null || win[valor].files[0] == undefined) {
      return showMessage("Selecione um arquivo.", 4, true)
    }
    const form_data = new FormData()
    form_data.append('anexo', win[valor].files[0])
    const obj = {
      method: 'POST',
      // headers : { 'encType': 'multipart/form-data' },
      body: form_data
    }
    const url = sys.saveFile.replace(':tipo', tipo)
    const response = await fetch(url, obj)
    const { message } = await response.json()
    if (response.status === 200) 
      return showMessage(message, 3, false)
    return showMessage(message, 3, true)
    

  } catch (error) {
    return showMessage(`Error Cli: ${error.message}`, 3, true)
  }
}

//----------------------------------------------------------------------------------------------
async function emailBody() {
  try {

    const data = await getResource(`${sys.showAll}?configGrupo=EMAIL&log=false`)
    await alphabeticallySort(data, 'configSequencia')
    win.emailbody.innerHTML = `<input type="password" hidden="true" disabled="true"> <input type="email" hidden="true" disabled="true">`
    const booleans = []
    for await (const dado of data) {
      let input = ''
      if (dado.configDados == 'boolean') {
        booleans.push(
          {
            id: `${dado.configId}-${dado.configSequencia}`,
            value: dado.configValor
          }
        )
        input = `<select type="${dado.configDados}" class="form-control" id="${dado.configId}-${dado.configSequencia}" value="${dado.configValor}">
        <option value="false">Não</option>
        <option value="true">Sim</option>
        </select> `
      } else {
        input = `<input type="${dado.configDados}" class="form-control" id="${dado.configId}-${dado.configSequencia}"
        placeholder="${(dado.configSequencia.substr(-1)) == 5 ? 'Por motivos se segurança, a senha não ficará à mostra.' : dado.configValorPadrao} " 
        value="${dado.configValor.length <= 0 ? '' : (dado.configSequencia.substr(-1)) == 5 ? '' : dado.configValor}">`
      }
      win.emailbody.innerHTML += `<div class="col-${(dado.configSequencia.substr(-1)) > 3 ? '6' : '4'}">
        <div class="input-group mb-2">
          <button class="btn btn-outline-dark" type="button" disabled="true">${dado.configDescricao}</button>
          ${input}
          <button class="btn btn-outline-success" type="button" onclick="updateInfo('${dado.configId}', '${dado.configSequencia}')" >Alterar</button>
        </div>
      </div>`
    }
    for await (const { id, value } of booleans) {
      document.getElementById(id).value = value
    }
  } catch (error) {
    return showMessage(`Error Cli: ${error.message}`, 3, true)
  }
}

//----------------------------------------------------------------------------------------------
async function updateInfo(configId, configSequencia) {
  const configValor = document.getElementById(`${configId}-${configSequencia}`).value
  const obj = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(
      {
        configId,
        configValor
      }
    )
  }
  const url = sys.update
  const response = await fetch(url, obj)
  const { message } = await response.json()
  if (response.status === 200) return showMessage(message, 3, false)
  return showMessage(message, 3, true)
}