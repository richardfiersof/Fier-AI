//----------------------------------------------------------------------------------------------
fncSetWinVars().then(async w => {

  win = Object.fromEntries(w)
  await handleStart()
})

//----------------------------------------------------------------------------------------------
async function handleStart() {
  try {

    const mainId = 'ajudaId'
    let mainTable
    const urlStart = window.location.pathname[window.location.pathname.length-1] == '/' ? window.location.pathname : window.location.pathname+'/'
    
    const {
      sys,
      mainBtns,
      tableConfig,
    } = await getResource(`${urlStart}start`)

    await createTabulator()
    await getMainData()
    await btnMainFilter()

    tinymce.init({
      language: 'pt_BR',
      selector: "#ajudaInfo",
      plugins: [
        "advlist", "autolink", "link", "image", "imagetools",
        "lists", "print", "preview", "hr", "searchreplace",
        "wordcount", "fullscreen", "insertdatetime", "media",
        "save", "table", "paste", "Emoticons", "TextColor",
      ],
      paste_data_images: true,
      height: "400"
    })

    //Handle Buttons
    for await (const btn of mainBtns) {
      if (win[btn.name]) {
        win[btn.name].onclick = () => {
          fncOpenModal(btn.type, btn.modal, btn.title)
        }
      }
    }

    //----------------------------------------------------------------------------------------------
    async function createTabulator() { return mainTable = new Tabulator("#mainTable", tableConfig) }

    //----------------------------------------------------------------------------------------------
    async function getMainData() {
      try {
        const response = await fetch(`${sys.showAll}?log=false`)
        if (response.status == 200 || response.status == 404) {
          mainTableData = await response.json()
          if (mainTableData.message) mainTableData = []
          return await updateTabulator(mainTableData)
        } else {
          const { message } = await response.json()
          return showMessage(message, 3, true)
        }
      } catch (error) {
        return showMessage(`Error Cli: ${error.message}`, 3, true)
      }
    }

    //----------------------------------------------------------------------------------------------
    async function updateTabulator(data) { 
  if( data.length <=0 ) mainTable.options.placeholder = "Sem dados"
  return mainTable.setData(data) 
}

    //----------------------------------------------------------------------------------------------
    async function fncOpenModal(type, modal) {
      if (type === 'new') {
        modalBody(type)
        buttonConfig(type, modal,)
        return $(`#${modal}`).modal('show')
      }
      const selectedData = mainTable.getSelectedData()
      if (selectedData.length <= 0) return showMessage("Selecione uma linha", 3, "alert")
      const url = sys.show.replace(`:${mainId}`, selectedData[0][mainId])
      const data = await getResource(`${url}?log=false`)
      await modalBody(type, data)
      await buttonConfig(type, modal, data)
      return $(`#${modal}`).modal('show')
    }

    //----------------------------------------------------------------------------------------------
    async function buttonConfig(type, modal, data) {
      win.btnSalvar.disabled = type === 'show' ? true : false
      win.divBtnSalvar.hidden = type === 'show' ? true : false
      if (type === 'new') {
        win.btnSalvar.onclick = () => {
          fncBackEnd(
            sys.new,
            'post',
            bodyModal(null),
            modal,
            true,
          )
        }
      }

      if (type === 'update') {
        win.btnSalvar.onclick = () => {
          fncBackEnd(
            sys.update,
            'post',
            bodyModal(data[mainId]),
            modal,
            true,
          )
        }
      }

      if (type === 'delete') {
        win.btnDeleteModal.onclick = () => {
          fncBackEnd(
            sys.delete,
            'delete',
            `{"${mainId}": ${data[mainId]} }`,
            modal,
            false,
          )
        }
      }
    }

    //----------------------------------------------------------------------------------------------
    function bodyModal(ajudaId) {
      try {
        const ajudaTitulo = win.ajudaTitulo.value
        const ajudaModulo = win.ajudaModulo.value
        const ajudaPalavraChave = win.ajudaPalavraChave.value
        const ajudaInfo = tinymce.get('ajudaInfo').getContent()
        if (ajudaTitulo.length <= 0) {
          showMessage('Preencher título!', 3, true)
          return false
        }
        if (ajudaModulo.length <= 0) {
          showMessage('Preencher módulo!', 3, true)
          return false
        }
        if (ajudaPalavraChave.length <= 0) {
          showMessage('Preencher palavras-chave!', 3, true)
          return false
        }
        if (ajudaInfo.length <= 0) {
          showMessage('Preencher conteúdo da atualização!', 3, true)
          return false
        }

        return JSON.stringify({
          ajudaId,
          ajudaTitulo,
          ajudaInfo,
          ajudaModulo,
          ajudaPalavraChave
        })
      } catch (error) {
        return showMessage(`Error Cli: ${error.message}`, 3, true)
      }
    }

    //----------------------------------------------------------------------------------------------
    async function modalBody(type, data) {
      win.divNewUp.hidden = type == 'show' ? true : false
      win.divShow.hidden = type == 'show' ? false : true

      if ('update' == type) {
        win[mainId].textContent = data[mainId]
        win.ajudaTitulo.value = data.ajudaTitulo
        win.ajudaModulo.value = data.ajudaModulo
        win.ajudaPalavraChave.value = data.ajudaPalavraChave
        const Info = data.ajudaInfo
        if (Info != null && Info.length > 0) {
          tinymce.get('ajudaInfo').setContent(Info)
          if (tinymce.get('ajudaInfo').getContent() != Info) {
            win.ajudaInfo.innerHTML = Info
          }
        } else tinymce.get('ajudaInfo').setContent('')
      } else if (type == 'show') {
        win[mainId].textContent = data[mainId]
        win.divShow.innerHTML = `<div class="row">
          <div class="col text-center">
            <h3>${data.ajudaTitulo}</h3>
          </div>
        </div>
        <br>
        <div>${data.ajudaInfo}</div>`
      } else if (type == 'new') {
        win[mainId].textContent = ''
        win.ajudaTitulo.value = ''
        win.ajudaModulo.value = ''
        win.ajudaPalavraChave.value = ''
        win.ajudaInfo.innerHTML = ''
        tinymce.get('ajudaInfo').setContent('')
      }
    }

    //----------------------------------------------------------------------------------------------
    async function fncBackEnd(url, method, body, modal) {
      if (body == false) return
      const obj = {}
      obj.method = method
      obj.headers = { 'Content-Type': 'application/json; charset=utf-8' }
      obj.body = body
      const response = await fetch(url, obj)
      if (response.status === 200 || response.status === 201) {
        $(`#${modal}`).modal('hide')
        await getMainData()
        return showMessage("Operação realizada com sucesso.", 4, false)

      } else {
        const { message } = await response.json()
        return showMessage(message, 4, true)
      }
    }

  } catch (error) {
    return showMessage(`Error Cli: ${error.message}`, 3, true)
  }
}   