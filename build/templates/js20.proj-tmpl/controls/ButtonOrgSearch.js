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
	options.title = this.TITLE;
	this.m_viewContext = options.viewContext;
	this.m_onGetData = options.onGetData;
	this.m_onGetAttrs = options.onGetAttrs;
	
	var self = this;
	
	options.onClick = options.onClick || 
		function(event){
			self.doSearch();	
		};
	
	ButtonOrgSearch.superclass.constructor.call(this,id,options);
}
extend(ButtonOrgSearch,ButtonCtrl);

/* Constants */
ButtonOrgSearch.prototype.DEF_ATTRS = 	{
		"Наименование":"name",
		"Наименование полное":"name_full",
		"ФИО руководителя":"dir_name",
		"Должность руководителя":"dir_post",
		"ИНН":"inn",
		"КПП":"kpp",
		"ОГРН":"ogrn",
		"ОКПО":"okpo",
		"ОКВЭД":"okved",
		"ОКАТО":"okato"
		//"Адрес":"legal_address"
	};


/* private members */

/* protected*/


/* public methods */
ButtonOrgSearch.prototype.doSearch = function(){
	var q = this.getEditControl().getValue();
	if (!q || !q.length){
		throw new Error("Не задан параметр поиска!");
	}
	var pm = (new ClientSearch_Controller()).getPublicMethod("search");
	pm.setFieldValue("query",q);
	
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
}

ButtonOrgSearch.prototype.applyResult = function(model){
	var attr_coresp;
	if(this.m_onGetAttrs){
		attr_coresp = this.m_onGetAttrs();
	}else{
		attr_coresp = this.DEF_ATTRS;
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
