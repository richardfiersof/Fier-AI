module.exports.opYesNo = [
  {valor: 1, nome: "Sim"},
  {valor: 0, nome: "Não"},
]

module.exports.opNoYes = [
  {valor: 0, nome: "Não"},
  {valor: 1, nome: "Sim"},
]

module.exports.requireEnumValue = async (mainForm, name, text) =>{
  const fs = require("fs")
  const pathFile = __dirname.replaceAll("\\", "/")
  const data = fs.readFileSync(`${pathFile}/enum/${name}.txt`, (err) =>{
    if(err) console.error(err)
  })
  const opt = JSON.parse(data)
  const form = mainForm.find(x=> x.nome == text)
  if(form.opcoes == null) form.opcoes = opt
  return mainForm
}

module.exports.requireEnumJson = async (name) =>{
  const fs = require("fs")
  const pathFile = __dirname.replaceAll("\\", "/")
  const data = fs.readFileSync(`${pathFile}/enum/${name}`, (err) =>{
    if(err) console.error(err)
  })
  return JSON.parse(data)
}

module.exports.tabulatorConfguracoesPadrao = {
  data: [],
  // height: "80vh",
  pagination: "local", 
  paginationSize: 10,
  paginationSizeSelector:[10, 15, 20, 30],
  selectableRows: 1,
  placeholder: "Carregando...",
  layout: "fitColumns",
  locale:true,
  langs: {
    "pt-br":{
      "pagination":{
          "page_size":"Tamanho da página", //label for the page size select element
          "page_title":"Mostrar Página",//tooltip text for the numeric page button, appears in front of the page number (eg. "Show Página" will result in a tool tip of "Show Página 1" on the page 1 button)
          "first":"Primeira", //text for the first page button
          "first_title":"Primeira Página", //tooltip text for the first page button
          "last":"Ultima",
          "last_title":"Ultima Página",
          "prev":"Anterior",
          "prev_title":"Página Anterior",
          "next":"Próxima",
          "next_title":"Próxima Página",
      },
    }
  }
}

module.exports.tabulatorPT = {
  locale:true,
  langs: {
    "pt-br":{
      "pagination":{
          "page_size":"Tamanho da página", //label for the page size select element
          "page_title":"Mostrar Página",//tooltip text for the numeric page button, appears in front of the page number (eg. "Show Página" will result in a tool tip of "Show Página 1" on the page 1 button)
          "first":"Primeira", //text for the first page button
          "first_title":"Primeira Página", //tooltip text for the first page button
          "last":"Ultima",
          "last_title":"Ultima Página",
          "prev":"Anterior",
          "prev_title":"Página Anterior",
          "next":"Próxima",
          "next_title":"Próxima Página",
      },
    }
  }
}

module.exports.reqRender = async ( req ) =>{
  return {
    acessos: req.session.acessos,
    usNome: req.session.usNome,
    usNomeCompleto: req.session.usNomeCompleto,
    sessionUsId: req.session.usId,
    isAdm: req.session.isAdm,
  }
}

const {
    randomBytes,
    scrypt,
    timingSafeEqual
} = require('node:crypto');

const { promisify } = require('node:util');
const scryptAsync = promisify(scrypt);

module.exports.gerarHash = async (senha) =>{
  const salt = randomBytes(16).toString('hex');

  const hash = await scryptAsync(senha, salt, 64);

  return `${salt}:${hash.toString('hex')}`;
}

module.exports.verificarSenha = async (senhaInformada, senhaArmazenada) =>{
  const [salt, hashArmazenado] = senhaArmazenada.split(':');

  if (!salt || !hashArmazenado || !/^[a-f0-9]{128}$/i.test(hashArmazenado)) {
    return false;
  }

  const hashInformado = await scryptAsync(senhaInformada, salt, 64);

  return timingSafeEqual(
    Buffer.from(hashArmazenado, 'hex'),
    hashInformado
  );
}