const fs = require('fs')

module.exports.extensions = ['.pdf']
module.exports.extensionsModelo = ['.xlsx', '.xls']
module.exports.pathComplete = __dirname.split('utilidades')[0].replaceAll('\\', '/') + 'safe-files/'

module.exports.anexoSave = async (database, databaseName, databaseExt, file, fileName, fileExt, fileFolder, itemId) => {
  try {
    let addFile = false
    if (!fs.existsSync(`${this.pathComplete}${fileFolder}`))
      fs.mkdirSync(`${this.pathComplete}${fileFolder}`, { recursive: true })
    
    const check = await database.findByPk(itemId)
    if (check[databaseName].length > 0 && check[databaseExt].length > 0)
      await this.anexoDelete(`${this.pathComplete}${fileFolder}${check[databaseName]}${check[databaseExt]}`)

    await file.mv(`${this.pathComplete}${fileFolder}${fileName}${fileExt}`)

    if (fs.existsSync(`${this.pathComplete}${fileFolder}${fileName}${fileExt}`)) addFile = true

    if (addFile) return { error: false, resp: 'Operação realizada com sucesso.', status: 200 }
    return { error: true, resp: 'Erro ao realizar operação.', status: 400 }

  } catch (error) {
    return { error: true, resp: error.message, status: 500 }
  }
}

module.exports.anexoSaveNoDatabase = async (file, fileName, fileExt, fileFolder) => {
  try {
    let addFile = false
    if (!fs.existsSync(`${this.pathComplete}${fileFolder}`))
      fs.mkdirSync(`${this.pathComplete}${fileFolder}`, { recursive: true })

    const fullPath = `${this.pathComplete}${fileFolder}${fileName}${fileExt}`
    await file.mv(fullPath)

    if (fs.existsSync(fullPath)) addFile = true
    if (addFile) return { error: false, status: 200, resp: fullPath }
    return { error: true, status: 400 }

  } catch (error) {
    return { error: true, resp: error.message, status: 500 }
  }
}

module.exports.anexoModelos = async (fileFolder, fileName, fileExt, file) =>{
  let addFile = false
  if (!fs.existsSync(`${this.pathComplete}${fileFolder}`))
    fs.mkdirSync(`${this.pathComplete}${fileFolder}`, { recursive: true })
  await file.mv(`${this.pathComplete}${fileFolder}${fileName}${fileExt}`)

  if (fs.existsSync(`${this.pathComplete}${fileFolder}${fileName}${fileExt}`)) addFile = true
  return addFile
}

module.exports.anexoDelete = async ( filePath ) => {
   if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
   return true
}

