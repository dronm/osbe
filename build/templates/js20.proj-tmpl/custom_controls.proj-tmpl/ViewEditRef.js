/**
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016
 
 * @class
 * @classdesc
	
 * @param {string} id view identifier
 * @param {namespace} options
 */	
function ViewEditRef(id,options){
	options = options || {};	
	if (options.labelCaption!=""){
		options.labelCaption = options.labelCaption || this.LABEL_CAPTION;
	}
	options.cmdInsert = (options.cmdInsert!=undefined)? options.cmdInsert:false;
	
	options.keyIds = options.keyIds || ["viewId"];
	
	options.selectWinClass = ViewList_Form;
	options.selectDescrIds = options.selectDescrIds || ["user_descr"];
	
	options.editWinClass = null;
	
	options.acMinLengthForQuery = 1;
	options.acController = new View_Controller();
	options.acModel = new ViewList_Model();
	options.acPatternFieldId = options.acPatternFieldId || "user_descr";
	options.acKeyFields = options.acKeyFields || [options.acModel.getField("id")];
	options.acDescrFields = options.acDescrFields || [options.acModel.getField("user_descr")];
	options.acICase = options.acICase || "1";
	options.acMid = options.acMid || "1";	
	
	this.m_menuTree = options.menuTree;
	var self = this;
	
	this.m_origOnSelect = options.onSelect;
	options.onSelect = function(fields){
		if(self.m_menuTree){
			self.m_menuTree.m_editViewDescr = fields.user_descr.getValue();	
		}
		
		if(self.m_origOnSelect){
			self.m_origOnSelect.call(self,fields);
		}
	}
		
	ViewEditRef.superclass.constructor.call(this,id,options);
}
extend(ViewEditRef,EditRef);

/* Constants */


/* private members */

/* protected*/


/* public methods */

