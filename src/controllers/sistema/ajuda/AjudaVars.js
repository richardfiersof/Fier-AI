const { tabulatorConfguracoesPadrao } = require("../../../utilidades/utils")

const prefixURL = "/sistema/ajuda/"
const prefixServ = "fncAjuda"

module.exports.sysUrl = {
	main: `${prefixURL}`,
	showAll: `${prefixURL}visualizar/todos`,
	show: `${prefixURL}visualizar/apenas/:ajudaId`,
	new: `${prefixURL}novo`,
	delete: `${prefixURL}delete`,
	update: `${prefixURL}update`,
	start: `${prefixURL}start`,
}

module.exports.sys = {
	main:{
		cmdURL: this.sysUrl.main,
		cmdService: `${prefixServ}`,
		cmdMethod: "get",
	},
	showAll:{
		cmdURL: this.sysUrl.showAll,
		cmdService: `${prefixServ}ShowAll`,
		cmdMethod: "get",
	},
	show:{
		cmdURL: this.sysUrl.show,
		cmdService: `${prefixServ}ShowOnlyOne`,
		cmdMethod: "get",
	},
	new:{
		cmdURL: this.sysUrl.new,
		cmdService: `${prefixServ}New`,
		cmdMethod: "post",  
	},
	delete:{
		cmdURL: this.sysUrl.delete,
		cmdService: `${prefixServ}Delete`,
		cmdMethod: "delete",
	},
	update:{
		cmdURL: this.sysUrl.update,
		cmdService: `${prefixServ}Update`,
		cmdMethod: "post",
	},
	start:{
		cmdURL: this.sysUrl.start,
		cmdService: `${prefixServ}Start`,
		cmdMethod: "get",
	}
}

module.exports.tableConfig = {
	...tabulatorConfguracoesPadrao,
	initialSort: [
		{ column: "ajudaTitulo", dir: "asc" },
		{ column: "ajudaModulo", dir: "asc" },
	],
	columns: [
		{ title: "Id"     , field: "ajudaId"    , headerFilter: true, sorter:"number", hozAlign:"center", width:100},
		{ title: "Módulo", field: "ajudaModulo", headerFilter: true},
		{ title: "Titulo", field: "ajudaTitulo", headerFilter: true},
		{ title: "Palavra-Chave", field: "ajudaPalavraChave", headerFilter: true},
	],
}

module.exports.mainBtns = [
	{name: "btnMainNew"   , type: "new"   , modal: "mainModal"  , func: "main", title: "Novo"},
	{name: "btnMainUpdate", type: "update", modal: "mainModal"  , func: "main", title: "Editar"},
	{name: "btnMainShow"  , type: "show"  , modal: "mainModal"  , func: "main", title: "Consultar"},
	{name: "btnMainDelete", type: "delete", modal: "deleteModal", func: null  , title: "Deletar"},
]

module.exports.modalInfo = [
	{ 
		modalId: "mainModal" , modalForm: "formMainModal", modalData: "mainModalBody", modalBtn: "btnSalvar",
		modalSize: "modal-xl", modalType: "modal-clear"  , render: 1, modalTitle: "Notas"
	},
]