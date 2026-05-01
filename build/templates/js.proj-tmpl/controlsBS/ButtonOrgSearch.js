/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2017

 * @extends ButtonCtrl
 * @requires core/extend.js
 * @requires ButtonCtrl.js     

 * @class
 * @classdesc
 
 * @param {string} id - Object identifier
 * @param {namespace} options
 * @param {string} options.viewContext
 * @param {functions} options.onGetData 
 */
function ButtonOrgSearch(id,options){
	options = options || {};	
	
	options.glyph = "glyphicon-search";
	options.title = "Найти контрагента по базе ЕГРЮЛ/ЕГРИП";
	this.m_viewContext = options.viewContext;
	this.m_onGetData = options.onGetData;
	this.m_checkIfExists = options.checkIfExists;
	this.m_clientId = options.clientId;
	
	var self = this;
	
	options.onClick = options.onClick || 
		function(event){
			self.doSearch();	
		};
	
	ButtonOrgSearch.superclass.constructor.call(this,id,options);
}
extend(ButtonOrgSearch,ButtonCtrl);

/* Constants */


/* private members */

/* protected*/


/* public methods */
ButtonOrgSearch.prototype.doSearch = function(){
	var node = nd("Client_inn");
	if (!node.value || !node.value.length){
		throw new Error("Не задан параметр поиска!");
	}
	
	var contr = new ClientSearch_Controller(new ServConnector(HOST_NAME));
	var self = this;
	contr.run("search",{
		"params":{
			"query":node.value,
			"checkIfExists":this.m_checkIfExists,
			"client_id":this.m_clientId
		},
		"func":function(resp){
			var m = resp.getModelById("SearchResult_Model",true);
			while(m.getNextRow()){
				var v = m.getFieldValue("val");
				if (m.getFieldValue("param")=="Наименование"){
					nd("Client_name_full").value = v;
				}
				else if (m.getFieldValue("param")=="НаименованиеКраткое"){
					nd("Client_name").value = v;
				}				
				else if (m.getFieldValue("param")=="КПП"){
					nd("Client_kpp").value = v;
				}
				else if (m.getFieldValue("param")=="Адрес"){
					nd("Client_addr_reg").value = v;
				}
				else if (m.getFieldValue("param")=="ОГРН"){
					nd("Client_ogrn").value = v;
				}
				
			}
			//self.m_ctrlBind1cCont.setVisible(false);
		}
	});
	
	/*
	var pm = (new ClientSearch_Controller()).getPublicMethod("search");
	pm.setFieldValue("query",node.value);
	this.setEnabled(false);
	var self = this;
	pm.run({
		"ok":function(resp){
			if (resp.modelExists("SearchResult_Model")){
				var m = new ModelXML("SearchResult_Model",{
					"fields":["param","val"],
					"data":resp.getModelData("SearchResult_Model")
				});
			
				if (self.m_onGetData){
					self.m_onGetData(m);
				}
				else{
					self.applyResult(m);
				}
			}
		},
		"all":function(){
			self.setEnabled(true);
		}
	});
	*/
}
/*
ButtonOrgSearch.prototype.applyResult = function(model){
	var attr_coresp = {
		"Наименование":"name",
		"ФИО руководителя":"dir_name",
		"Должность руководителя":"dir_post",
		"ИНН":"inn",
		"КПП":"kpp",
		"ОГРН":"ogrn",
		"ОКПО":"okpo",
		"ОКВЭД":"okved"
		//"Адрес":"legal_address"
	}
	while(model.getNextRow()){
		var param = model.getFieldValue("param");
		if (attr_coresp[param]){
			var el = this.m_viewContext.getElement(attr_coresp[param]);
			if (el){
				el.setValue(model.getFieldValue("val"));
			}
		}					
	}

}
*/
