/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2017

 * @requires core/extend.js
 * @requires controls/GridCmd.js     

 * @class
 * @classdesc grid command for showing dialog with name for saving tune variant
 
 * @param {string} id - Object identifier
 * @param {namespace} options
 */
function GridCmdFilterOpen(id,options){
	options = options || {};	
	
	options.glyph = "glyphicon-open";
	options.showCmdControl = false;
	options.showCmdControlInPopup = false;
	
	this.m_variantStorageName = options.variantStorageName;
	this.m_dataCol = options.dataCol;
	
	GridCmdFilterOpen.superclass.constructor.call(this,id,options);
}
extend(GridCmdFilterOpen,GridCmd);

/* Constants */


/* private members */
GridCmdFilterOpen.prototype.m_cmdFilter;
GridCmdFilterOpen.prototype.m_variantStorageName;
GridCmdFilterOpen.prototype.m_form;
GridCmdFilterOpen.prototype.m_dataCol;

/* protected*/


/* public methods */
GridCmdFilterOpen.prototype.onCommand = function(e){
	var self = this;
	this.m_cmdFilter.setFilterVisibile(false);
	(new VariantStorage({
		"afterFormClose":function(val){
			if(val)self.m_cmdFilter.getFilter().setValue(val);
			self.m_cmdFilter.setFilterVisibile(true);
		},
		"variantStorageName":this.m_variantStorageName
	})).openStorage(this.m_dataCol);
	
	/*
	this.m_view = new VariantStorageOpenView("VariantStorageOpenView",{
		"variantStorageName":this.m_variantStorageName,
		"onClose":function(){				
			self.closeForm();
		},
		"onSelect":function(fields){
			self.loadVariant(fields);
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
			self.loadVariant(self.m_view.getElement("variants").getModelRow());
		},
		"onClickCancel":function(){
			self.closeForm();
		},				
		"content":this.m_view,
		"contentHead":this.m_view.HEAD_TITLE
	});

	this.m_form.open();
	*/
}

GridCmdFilterOpen.prototype.setCmdFilter = function(v){
	this.m_cmdFilter = v;
}
/*
GridCmdFilterOpen.prototype.loadVariant = function(fields){
	var pm = (new VariantStorage_Controller()).getPublicMethod("get_"+this.m_dataCol);
	pm.setFieldValue("storage_name",this.m_variantStorageName);
	pm.setFieldValue("variant_name",fields.variant_name.getValue());
	var self = this;
	pm.run({
		"ok":function(resp){
			var m = new VariantStorage_Model({"data":resp.getModelData("VariantStorage_Model")});
			if (m.getNextRow()){
				self.m_cmdFilter.getFilter().unserialize(m.getFieldValue(self.m_dataCol));
				self.closeForm();
			}
		}
	});	
}

GridCmdFilterOpen.prototype.closeForm = function(){
	this.m_form.close();
	this.m_cmdFilter.setFilterVisibile(true);
}
*/
