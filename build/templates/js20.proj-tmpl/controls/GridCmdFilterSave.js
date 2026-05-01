/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2017

 * @requires core/extend.js
 * @requires controls/GridCmd.js     

 * @class
 * @classdesc grid command for showing dialog with name for saving tune variant
 
 * @param {string} id - Object identifier
 * @param {namespace} options
 */
function GridCmdFilterSave(id,options){
	options = options || {};	
	
	options.glyph = "glyphicon-save";
	options.showCmdControl = false;
	options.showCmdControlInPopup = false;
	
	this.m_variantStorageName = options.variantStorageName;
	this.m_dataCol = options.dataCol;
	
	GridCmdFilterSave.superclass.constructor.call(this,id,options);
}
extend(GridCmdFilterSave,GridCmd);

/* Constants */


/* private members */
GridCmdFilterSave.prototype.m_form;
GridCmdFilterSave.prototype.m_view;
GridCmdFilterSave.prototype.m_cmdFilter;
GridCmdFilterSave.prototype.m_variantStorageName;
GridCmdFilterSave.prototype.m_dataCol;
/* protected*/


/* public methods */
GridCmdFilterSave.prototype.onCommand = function(e){
	var self = this;
	this.m_cmdFilter.setFilterVisibile(false);
	(new VariantStorage({
		"afterFormClose":function(){
			self.m_cmdFilter.setFilterVisibile(true);
		},
		"variantStorageName":this.m_variantStorageName
	})).saveStorage(this.m_dataCol, this.m_cmdFilter.getFilter().getValue());
	
	/*
	this.m_view = new VariantStorageSaveView("VariantStorageSaveView",{
		"variantStorageName":this.m_variantStorageName,
		"onClose":function(){				
			self.formClose();
		}
	});
	this.m_form = new WindowFormModalBS(CommonHelper.uniqid(),{
		"cmdCancel":true,
		"controlCancelCaption":this.m_view.CMD_CANCEL_CAP,
		"controlCancelTitle":this.m_view.CMD_CANCEL_TITLE,
		"cmdOk":true,
		"controlOkCaption":this.m_view.CMD_OK_CAP,
		"controlOkTitle":this.m_view.CMD_OK_TITLE,
		"onClickOk":function(){
			self.saveVariant();
		},
		"onClickCancel":function(){
			self.formClose();
		},		
		"content":this.m_view,
		"contentHead":this.m_view.HEAD_TITLE
	});

	this.m_form.open();	
	*/
}

GridCmdFilterSave.prototype.setCmdFilter = function(v){
	this.m_cmdFilter = v;
}
/*
GridCmdFilterSave.prototype.saveVariant = function(){
	var pm = (new VariantStorage_Controller()).getPublicMethod("upsert_"+this.m_dataCol);
	pm.setFieldValue("storage_name",this.m_variantStorageName);
	pm.setFieldValue("variant_name",this.m_view.getElement("name").getValue());
	pm.setFieldValue("default_variant",this.m_view.getElement("default_variant").getValue());
	pm.setFieldValue(this.m_dataCol,this.m_cmdFilter.getFilter().serialize());
	var self = this;
	pm.run({
		"ok":function(resp){
			self.formClose();
		}
	});
}

GridCmdFilterSave.prototype.formClose = function(){
	this.m_form.close();
	this.m_cmdFilter.setFilterVisibile(true);
}
*/
