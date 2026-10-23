//----------------------------------------------------------------------------------------------
fncSetWinVars().then(async w => {

  win = Object.fromEntries(w)
  await handleStart()
})

//----------------------------------------------------------------------------------------------
async function handleStart() {
  try {

    const mainId = 'patchNoteId'
    let mainTable
    let mainTableData
    const urlStart = window.location.pathname[window.location.pathname.length - 1] == '/' ? window.location.pathname : window.location.pathname + '/'
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
      selector: "#patchNoteInfo",
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
    
    if (win.selectedId.value.length > 0 && win.selectedId.value != 0) {
      if (mainTableData.find(x => x[mainId] === +(win.selectedId.value)))
        await fncSelectRow(+(win.selectedId.value))
    }
    //----------------------------------------------------------------------------------------------
    async function createTabulator() { return mainTable = new Tabulator("#mainTable", tableConfig) }

    //----------------------------------------------------------------------------------------------
    async function getMainData() {
      try {
        const response = await fetch(`${sys.showAll}?log=false`)
        if (response.status == 200 || response.status == 404) {
          mainTableData = await response.json()
          if(mainTableData.message) mainTableData = []
          return await updateTabulator(mainTable, mainTableData)
        } else {
          const { message } = await response.json()
          return showMessage(message, 3, true)
        }
      } catch (error) {
        return showMessage(`Error Cli: ${error.message}`, 3, true)
      }
    }

    //----------------------------------------------------------------------------------------------
    async function updateTabulator(table, data) { return table.setData(data) }

    //----------------------------------------------------------------------------------------------
    async function fncSelectRow(val) { return await selectRowTable(mainTable, mainId, val) }

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
    function bodyModal(patchNoteId) {
      try {
        const patchNoteDate = win.patchNoteDate.value
        const patchNoteInfo = tinymce.get('patchNoteInfo').getContent()
        if (patchNoteDate.length <= 0) {
          showMessage('Preencher data!', 3, true)
          return false
        }
        if (patchNoteInfo.length <= 0) {
          showMessage('Preencher conteúdo da atualização!', 3, true)
          return false
        }

        return JSON.stringify({
          patchNoteId,
          patchNoteInfo,
          patchNoteDate
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
        win.patchNoteDate.value = data.patchNoteDate
        const Info = data.patchNoteInfo
        if (Info != null && Info.length > 0) {
          tinymce.get('patchNoteInfo').setContent(Info)
          if (tinymce.get('patchNoteInfo').getContent() != Info) {
            win.patchNoteInfo.innerHTML = Info
          }
        } else tinymce.get('patchNoteInfo').setContent('')
      } else if (type == 'show') {
        win[mainId].textContent = data[mainId]
        win.divShow.innerHTML = `<div class="row">
               <div class="col text-center">
                  <h3>Alterações</h3>
               </div>
            </div>
            <br>
            <div>${data.patchNoteInfo}</div>`
      } else if (type == 'new') {
        win[mainId].textContent = ''
        win.patchNoteDate.value = moment().format('YYYY-MM-DD')
        win.patchNoteInfo.innerHTML = ''
        tinymce.get('patchNoteInfo').setContent('')
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
      const { message, selectedId } = await response.json()
      if (response.status === 200 || response.status === 201) {
        $(`#${modal}`).modal('hide')
        await getMainData()
        if(mainTableData.find(x=> x[mainId] == selectedId)) await fncSelectRow(selectedId)
        return showMessage(message, 4, false)

      } else {
        return showMessage(message, 4, true)
      }
    }

  } catch (error) {
    return showMessage(`Error Cli: ${error.message}`, 3, true)
  }
}   