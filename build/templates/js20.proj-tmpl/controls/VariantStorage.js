/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2018

 * @requires controls/VariantStorageOpenView.js

 * @class
 * @classdesc
 
 * @param {Object} options
 */
function VariantStorage(options){
	options = options || {};	
	
	this.m_afterFormClose = options.afterFormClose;
	this.m_variantStorageName = options.variantStorageName;
}

/* Constants */


/* private members */

/* protected*/


/* public methods */
VariantStorage.prototype.openStorage = function(dataCol){
	var self = this;
	this.m_dataCol = dataCol;
	this.m_view = new VariantStorageOpenView("VariantStorageOpenView",{
		"variantStorageName":this.m_variantStorageName,
		"onClose":function(){				
			self.closeOpenForm();
		},
		"onSelect":function(fields){
			self.loadVariant(fields.variant_name.getValue(),self.m_dataCol);
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
			self.loadVariant(self.m_view.getElement("variants").getFieldValue("variant_name"),self.m_dataCol);
		},
		"onClickCancel":function(){
			self.formClose();
		},				
		"content":this.m_view,
		"contentHead":this.m_view.HEAD_TITLE
	});

	this.m_form.open();
}

VariantStorage.prototype.loadVariant = function(variantName,dataCol){
	var pm_id = dataCol? "get_"+dataCol : "get_all_data";
	var pm = (new VariantStorage_Controller()).getPublicMethod(pm_id);
	pm.setFieldValue("storage_name",this.m_variantStorageName);
	pm.setFieldValue("variant_name",variantName);
	var self = this;
	pm.run({
		"ok":function(resp){
			var m = new VariantStorage_Model({"data":resp.getModelData("VariantStorage_Model")});
			if (m.getNextRow()){				
				self.formClose(dataCol? m.getFieldValue(dataCol) : m);
			}
		}
	});	
}

VariantStorage.prototype.saveStorage = function(dataCol,dataColVal){
	var self = this;
	this.m_dataCol = dataCol;
	this.m_dataColVal = dataColVal;
	this.m_view = new VariantStorageSaveView("VariantStorageSaveView",{
		"variantStorageName":this.m_variantStorageName,
		"onClose":function(){				
			self.form();
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
			self.saveVariant(self.m_dataCol, self.m_dataColVal, self.m_view.getElement("name").getValue());
		},
		"onClickCancel":function(){
			self.formClose();
		},		
		"content":this.m_view,
		"contentHead":this.m_view.HEAD_TITLE
	});

	this.m_form.open();	
}

VariantStorage.prototype.saveVariant = function(dataCol,dataColVal,variantName){
	var pm = (new VariantStorage_Controller()).getPublicMethod("upsert_"+dataCol);
	pm.setFieldValue("storage_name",this.m_variantStorageName);
	pm.setFieldValue("variant_name", variantName);
	pm.setFieldValue("default_variant",this.m_view.getElement("default_variant").getValue());
	dataColVal = (typeof(dataColVal)=="string")? dataColVal:CommonHelper.serialize(dataColVal);
	//dataColVal is JSON!!!
	//console.log("dataColVal=")
	//console.log(dataColVal)
	pm.setFieldValue(dataCol,dataColVal);
	var self = this;
	pm.run({
		"ok":function(resp){
			self.formClose();
		}
	});
}

VariantStorage.prototype.formClose = function(val){
	this.m_form.close();
	delete this.m_form;
	if (this.m_afterFormClose)this.m_afterFormClose.call(this,val);
}

