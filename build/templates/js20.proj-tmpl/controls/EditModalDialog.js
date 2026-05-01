/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2017

 * @extends Edit
 * @requires core/extend.js
 * @requires Edit.js     

 * @class
 * @classdesc
 
 * @param {string} id - Object identifier
 * @param {object} options
 * @param {Control} options.viewClass
 * @param {object} options.viewOptions 
 * @param {string} options.viewTemplate
 * @param {string} options.headTitle
 * @param {function} options.formatValue
 * @param {bool} [options.cmdOk=true]
 * @param {bool} [options.cmdCancel=true]
 * @param {bool} [options.strictValidation=false]   
 */
function EditModalDialog(id,options){
	options = options || {};	
	
	this.m_cmdOk = (options.cmdOk!=undefined)? options.cmdOk:true;
	this.m_cmdCancel = (options.cmdCancel!=undefined)? options.cmdCancel:true;
	this.m_dialogWidth = options.dialogWidth;
	
	this.m_viewClass = options.viewClass;
	this.m_viewOptions = options.viewOptions;
	this.m_viewTemplate = options.viewTemplate;
	this.m_headTitle = options.headTitle;
	
	this.m_strictValidation = options.strictValidation;
	
	this.m_afterOpen = options.afterOpen;
	
	var self = this;
	this.setFormatValue(
		options.formatValue ||
		function(val){
			return self.formatValue(val);
		}
	);
	
	options.tagName = "A";
	options.attrs = options.attrs || {};
	options.attrs.style = ((options.attrs.style)? options.attrs.style+" ":"") + "cursor:pointer; height:fit-content;";
	
	options.events = options.events || {};
	
	options.events.click = this.m_onClick;
	
	EditModalDialog.superclass.constructor.call(this,id,options);
}
extend(EditModalDialog,Edit);

/* Constants */


/* private members */

/* protected*/


/* public methods */

EditModalDialog.prototype.toDOM = function(parent){
	var id = this.getId();	
	
	this.m_container = new ControlContainer( ((id)? id+":cont" : null),this.m_contTagName,{
		"className":this.m_contClassName
	});	
	
	if (this.m_label && this.m_labelAlign=="left"){
		this.m_container.addElement(this.m_label);
	}

	this.m_container.toDOM(parent);
	
	EditModalDialog.superclass.toDOM.call(this,this.m_container.getNode());	
	
	if (this.m_buttons && !this.m_buttons.isEmpty()){
		this.m_buttons.toDOMAfter(this.getNode());
	}
}

EditModalDialog.prototype.m_valueJSON;//JSON value
EditModalDialog.prototype.m_viewClass;
EditModalDialog.prototype.m_viewOptions;
EditModalDialog.prototype.m_viewTemplate;
EditModalDialog.prototype.m_headTitle;
EditModalDialog.prototype.m_formatValue;

EditModalDialog.prototype.setValue = function(v){
//console.log("EditModalDialog.prototype.setValue id="+this.getId())
//console.log(v);
	if (typeof v =="object"){
		this.m_valueJSON = v;
	}
	else{
		//Date becomes DateTimeTZ!!!
		this.m_valueJSON = CommonHelper.unserialize(v);
//console.log("EditModalDialog.prototype.setValue unserialized m_valueJSON="+v)
//console.dir(this.m_valueJSON)
		
	}
	
	var v = this.m_formatValue(this.m_valueJSON);
	this.getNode().textContent = v;
}

EditModalDialog.prototype.getValue = function(){
//console.log("EditModalDialog.prototype.getValue ")
//console.dir(this.m_valueJSON)
	return CommonHelper.serialize(this.m_valueJSON);
}

EditModalDialog.prototype.getValueJSON = function(){
	return this.m_valueJSON;
}

EditModalDialog.prototype.isNull = function(){
	var res = false;
	if (this.m_valueJSON || typeof(this.m_valueJSON)=="object" || !CommonHelper.isEmpty(this.m_valueJSON)){
		res = true;
		for (var id in this.m_valueJSON){
			if (this.m_valueJSON[id]!=undefined){
				res = false;
				break;
			}
		}
	}
	return res;
}

EditModalDialog.prototype.getDefViewOptions = function(){
	return {
		"valueJSON":this.m_valueJSON,
		"template":window.getApp().getTemplate(this.m_viewTemplate)
	};

}

EditModalDialog.prototype.m_onClick = function(){

	if (!this.getEnabled()){
		return;
	}
	var v_opts = this.getDefViewOptions();
	if(this.m_viewOptions){
		CommonHelper.merge(v_opts,this.m_viewOptions);
	}
	v_opts["name"] = v_opts["name"] || "modView";
	
	this.m_view = new this.m_viewClass(this.getId()+":form:body:"+v_opts["name"],v_opts);
	
	var self = this;
	this.m_form = new WindowFormModalBS(this.getId()+":form",{
		"cmdCancel":this.m_cmdCancel,
		"controlCancelCaption":this.BTN_CANCEL_CAP,
		"controlCancelTitle":this.BTN_CANCEL_TITLE,
		"cmdOk":this.m_cmdOk,
		"controlOkCaption":this.BTN_OK_CAP,
		"controlOkTitle":this.BTN_OK_TITLE,
		"onClickCancel":function(){
			self.closeSelect(false);
		},		
		"onClickOk":function(){
			var set_val = true;
			if(self.m_strictValidation && self.m_view.validate){
				if(self.m_view.setValid){
					self.m_view.setValid();
				}
				if(!self.m_view.validate()){
					self.m_view.setNotValid(self.MSG_NOT_VALID);
					set_val = false;
				}
			}
			if(set_val){
				self.setValue(self.m_view.getValue());
				if(self.m_strictValidation){
					self.setValid();
				}
				self.closeSelect(true);
			}
		},				
		"content":this.m_view,
		"contentHead":this.m_headTitle,
		"dialogWidth":this.m_dialogWidth
	});

	this.m_form.open();
	if(this.m_afterOpen){
		this.m_afterOpen();
	}
}

EditModalDialog.prototype.closeSelect = function(modif){
	if (this.m_view){
		this.m_view.delDOM();
		delete this.m_view;
	}
	if (this.m_form){
		this.m_form.close();
		delete this.m_form;
	}
}

EditModalDialog.prototype.setFormatValue = function(v){
	this.m_formatValue = v;
}
EditModalDialog.prototype.getFormatValue = function(){
	return this.m_formatValue;
}
EditModalDialog.prototype.formatValue = function(val){
	var res = "";
	for (var id in val){
		if (val[id] && typeof(val[id])=="object" && !val[id].isNull()){
			res+= ((res=="")? "":", ") + val[id].getDescr();
		}
		else if (val[id] && val[id]!=""){
			res+= ((res=="")? "":", ") + val[id];
		}
		
	}
	return res;	
}

EditModalDialog.prototype.reset = function(){
	this.setValue({});
}

EditModalDialog.prototype.validate = function(){
	if(this.getRequired() && this.isNull()){
		this.setNotValid(Validator.prototype.ER_EMPTY);
		return false;
	}
	return true;
}

EditModalDialog.prototype.setEnabled = function(v){
	EditModalDialog.superclass.setEnabled.call(this, v);
	
	//Edit leaves open button always enabled!!!
	if (this.m_buttons){
		this.m_buttons.setEnabled(v);
	}
}



