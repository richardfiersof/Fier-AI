module.exports.resposta = [
  {status: 200, message: 'Operação realizada com sucesso!'},
  {status: 201, message: 'Registro(s) criado(s) com sucesso!'},
  {status: 400, message: 'Erro ao realizar operação!'},
  {status: 401, message: 'Sem permissão para realizar operação!'},
  {status: 403, message: 'Sem acesso para realizar operação!'},
  {status: 404, message: 'Registro(s) não encontrado(s)!'},
]

module.exports.log = [
  { codigo: 'ERROR' , texto: 'erro'    },
  { codigo: 'ACCESS', texto: 'acesso'  },
  { codigo: 'NEW'   , texto: 'novo'    },
  { codigo: 'UPDATE', texto: 'editar'  },
  { codigo: 'DELETE', texto: 'deletar' },
  { codigo: 'IMPORT', texto: 'importar'},
  { codigo: 'EXPORT', texto: 'exportar'},
  { codigo: 'PRINT' , texto: 'imprimir'},
  { codigo: 'UPLOAD', texto: 'carregar arquivo'},
  { codigo: 'REMOVE', texto: 'remover arquivo'},
  { codigo: 'DUPLICATE', texto: 'duplicar'},
  { codigo: 'APPROVAL' , texto: 'aprovação'},
  { codigo: 'VERSION'  , texto: 'nova versão'},
  { codigo: 'SCHEDULE' , texto: 'agendamento'},
  { codigo: 'LOGIN' , texto: 'login'},
]
