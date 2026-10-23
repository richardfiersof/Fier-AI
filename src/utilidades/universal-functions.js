module.exports.makeid = async ( length ) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

module.exports.checkPassword = async ( pass ) =>{
  const pattern = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[-+_!@#$%^&*.,?]).+$")

  if (!pass || pass.length === 0)  return false;
  if (pattern.test(pass))  return true
  return false
}

module.exports.sortAlphabetically = async ( obj, campo) =>{
  obj.sort(function (a,b) {
    if(a[campo] > b[campo]) return 1
    if(a[campo] < b[campo]) return -1
    return 0
  })
  return obj
}

module.exports.sortAlphabeticallyDouble = async ( obj, campo, main) =>{
  obj.sort(function (a,b) {
    if(a[main] > b[main]) return 1
    if(a[main] < b[main]) return -1
    return 0
  })

  obj.sort(function (a,b) {
    if(a[campo] > b[campo] && a[main] == b[main]) return 1
    if(a[campo] < b[campo] && a[main] == b[main]) return -1
    return 0
  })
  return obj
}

module.exports.sortNonAlphabetically = async ( obj, campo) =>{
  obj.sort(function (a,b) {
    if(a[campo] < b[campo]) return 1
    if(a[campo] > b[campo]) return -1
    return 0
  })
  return obj
}

module.exports.sortIdiomaPadraoAlphabetically = async ( obj, idioma) =>{
  obj.sort(function (a,b) {
    if(a.idiomaId == idioma) return -1
    if(b.idiomaId == idioma) return -1
    a.idiomaId.localeCompare(b.idiomaId);
  })
  return 
}