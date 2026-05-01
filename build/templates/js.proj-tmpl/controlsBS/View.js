/* Copyright (c) 2012 
	Andrey Mikhalevich, Katren ltd.
*/
/*	

	Description
*/
//ф
/** Requirements
 * @requires common/functions.js
*/

/* constructor */
function View(id,options){
	options = options || {};
	options.tagName = options.tagName || this.DEF_TAG_NAME;
	View.superclass.constructor.call(this,
		id,options.tagName,options);
		
	if (options.readController){
		this.setReadController(options.readController);
	}
	if (options.readMethodId){
		this.setReadMethodId(options.readMethodId);
	}
	if (options.titleControl){
		this.setTitle(options.titleControl);
	}
	else if (options.title){
		this.setTitle(new Control(this.getId()+"_title","h1",{"value":options.title}));
	}
	options.writeController = options.writeController || options.readController;	
	if (options.writeController){		
		this.setWriteController(options.writeController);
	}
	if (options.writeMethodId){
		this.setWriteMethodId(options.writeMethodId);
	}
	if (options.errorControl){
		this.setErrorControl(options.errorControl);
	}

	if (options.formHeight){
		this.m_formHeight = options.formHeight;
	}
	if (options.formWidth){
		this.m_formWidth = options.formWidth;
	}
	if (options.formCaption){
		this.m_formCaption = options.formCaption;
	}	
	if (options.focussedControlId){
		this.m_FocussedControlId = options.focussedControlId;
	}
	
	this.m_writeAsync = (options.writeAsync==undefined)? false:options.writeAsync;
	this.m_winObj = options.winObj;
		
	this.m_bindings = {};
	this.m_readModels = {};
	this.m_params = options.params;
}
extend(View,ControlContainer);

View.prototype.DEF_TAG_NAME = "div";
View.prototype.DEF_CALSS = "view";
View.prototype.FORMER_KEY_VAL = "old_";

View.prototype.m_bindings;
View.prototype.m_readModels;
View.prototype.m_readMethodId;
View.prototype.m_writeMethodId;
View.prototype.m_errorControl;
View.prototype.m_titleControl;
View.prototype.m_lastWriteResult;
View.prototype.m_formHeight;
View.prototype.m_formWidth;
View.prototype.m_FocussedControlId;

//Вызывался метод записать
View.prototype.m_objModified;

//readModelId,readValueFieldId,readKeyFieldIds
//options: autoFillOnInsert
View.prototype.bindControl = function(control,
	readBind,writeBind,options){
	this.m_bindings[control.getId()] =
		{"control":control,
		"readBind":readBind,
		"writeBind":writeBind,
		"options":options
		};
	if (readBind){
		if (this.m_readModels[readBind.modelId]==undefined){
			this.m_readModels[readBind.modelId] = [];
		}
		this.m_readModels[readBind.modelId].push(control.getId());
	}
}
View.prototype.addControl = function(control){
	this.addElement(control);
}
View.prototype.getControl = function(controlId){
	return this.m_elements[controlId];
}
View.prototype.getBind = function(controlId){
	if (!this.m_bindings[controlId]){
		throw new Error("View::getDataBinding control not found "+controlId);
	}
	return this.m_bindings[controlId];
}


/*Depricated*/
View.prototype.getDataControl = function(controlId){
	return this.getDataBinding(controlId);
}
View.prototype.getDataBinding = function(controlId){
	if (!this.m_bindings[controlId]){
		//console.trace();
		throw new Error("View::getDataBinding control not found "+controlId);
	}
	return this.m_bindings[controlId];
}
View.prototype.getViewControl = function(controlId){	
	return this.getDataBinding(controlId).control;
}
View.prototype.viewControlExists = function(controlId){	
	return (this.m_bindings[controlId])? true:false;
}
View.prototype.getViewControlValue = function(controlId){
	return this.getDataControlValue(controlId);
}
View.prototype.getDataControlValue = function(controlId){
	return this.getViewControl(controlId).getValue();
}
View.prototype.setDataControlValue = function(controlId,val){
	return this.getViewControl(controlId).setValue(val);
}
View.prototype.setViewControlValue = function(controlId,val){
	this.setDataControlValue(controlId,val);
}
View.prototype.getViewControlFieldValue = function(controlId,fieldId){
	return this.getViewControl(controlId).getFieldValue(fieldId);
}
/* ************* */

View.prototype.addDataControl = function(control,
	readBind,writeBind,options){
	this.addElement(control);
	this.bindControl(control,readBind,writeBind,options);
}
View.prototype.setReadController = function(readController){
	this.m_readController = readController;
}
View.prototype.getReadController = function(){
	return this.m_readController;
}

View.prototype.setWriteController = function(writeController){	
	this.m_writeController = writeController;
}
View.prototype.getWriteController = function(){
	return this.m_writeController;
}
View.prototype.setReadMethodId = function(readMethodId){
	this.m_readMethodId = readMethodId;
}
View.prototype.getReadMethodId = function(){
	return this.m_readMethodId;
}
View.prototype.setWriteMethodId = function(writeMethodId){
	this.m_writeMethodId = writeMethodId;
}
View.prototype.getWriteMethodId = function(){
	return this.m_writeMethodId;
}
View.prototype.getErrorControl = function(){
	return this.m_errorControl;
}
View.prototype.setErrorControl = function(errorControl){
	this.m_errorControl = errorControl;
}
View.prototype.setTitle = function(titleControl){
	this.m_titleControl = titleControl;
}
View.prototype.getTitleControl = function(){
	return this.m_titleControl;
}
View.prototype.getTitle = function(){
	if (this.m_titleControl){
		return this.m_titleControl.getValue();
	}
}

View.prototype.set_temp_disabled = function(cont){
	for (var id in cont){
		if(cont[id]){
			if (cont[id].m_elements){
				this.set_temp_disabled(cont[id].m_elements);
			}
			else{
				this.m_changedControls.push({"ctrl":cont[id],"enabled":cont[id].getEnabled()});
				cont[id].setEnabled(false);
			}		
		}
	}	
}

View.prototype.setTempDisabled = function(){
	this.m_changedControls=[];
	this.set_temp_disabled(this.m_elements);
}
View.prototype.setTempEnabled = function(){
	if (this.m_changedControls){
		for (var i=0;i<this.m_changedControls.length;i++){
			if (this.m_changedControls[i].enabled){
				this.m_changedControls[i].ctrl.setEnabled(true);
			}
		}
	}
}

View.prototype.readData = function(async){
	this.setTempDisabled();
	var self = this;
	this.getReadController().run(this.getReadMethodId(),{
		"func":function(resp){
			self.onGetData(resp);
		},
		"async":(async==undefined)? true:async,
		"err":function(resp,errCode,errStr){
			self.onWriteError(resp,errCode,errStr);
		}
	});
}
View.prototype.onWriteError = function(resp,errCode,errStr){
	var ctrl = this.getErrorControl();
	if (ctrl){
		ctrl.setValue(errStr);
	}
}
View.prototype.onGetData = function(resp,isNew){
	isNew = (isNew==undefined)? true:isNew;	
	this.setTempEnabled();
//debugger	
	var model,ctrl_id,ctrl_bind,val,val_key,keys;
	for (var model_id in this.m_readModels){
		model = resp.getModelById(model_id);
		model.setActive(true);
		if (model.getNextRow()){
			for (var i=0;i<this.m_readModels[model_id].length;i++){
				ctrl_id = this.m_readModels[model_id][i];
				ctrl_bind = this.m_bindings[ctrl_id];
				if (ctrl_bind.readBind.valueFieldId==undefined){
					continue;
				}
				val = model.getFieldValue(ctrl_bind.readBind.valueFieldId);
				ctrl_bind.control.setValue(val);
				keys = ctrl_bind.readBind.keyFieldIds;
				if (keys){
					for (var key_ind=0;key_ind<keys.length;key_ind++){
						val_key = model.getFieldValue(keys[key_ind]);
						//ctrl_bind.control.setAttr("fkey_"+keys[key_ind],val_key);
						//ctrl_bind.control.setAttr(this.FORMER_KEY_VAL+keys[key_ind],val_key);
						ctrl_bind.control.setFieldValue(keys[key_ind],val_key);
						if (!isNew){
							ctrl_bind.control.setFormerFieldValue(keys[key_ind],val_key);
						}
					}
				}
				else{
					//no keys
					//alert(ctrl_bind.writeBind.valueFieldId+"="+val);
					if (ctrl_bind.control.setFormerValue){
						if (!isNew){
							ctrl_bind.control.setFormerValue(ctrl_bind.writeBind.valueFieldId,val);
						}
					}
					else{
						//throw new Error("Field "+ctrl_bind.writeBind.valueFieldId+" setFormerValue not defined!");						
						if (!isNew){
							ctrl_bind.control.setAttr(this.FORMER_KEY_VAL+ctrl_bind.readBind.valueFieldId,
							val);						
						}
					}
				}
			}
		}
	}
}

View.prototype.getModified = function(){
	var contr = this.getWriteController();
	if (!contr)return;
	var meth_id = this.getWriteMethodId();
	var pm = contr.getPublicMethodById(meth_id);
	var ctrl,modif=false;
	for (var ctrl_id in this.m_bindings){
		ctrl = this.m_bindings[ctrl_id].control;
		if (!ctrl.getEnabled())continue;
		var key_field_ids = this.m_bindings[ctrl_id].writeBind.keyFieldIds;
		var field_id = this.m_bindings[ctrl_id].writeBind.valueFieldId;
		var former_val,val;
		if (key_field_ids){
			for (var i=0;i<key_field_ids.length;i++){
				former_val = ctrl.getFormerFieldValue(key_field_ids[i]);
				val = ctrl.getFieldValue(key_field_ids[i]);
				//val = ctrl.validate(val);
				if ((pm.paramExists(key_field_ids[i]))
					&& (former_val!=val||ctrl.getAlwaysUpdate())
					&& !(former_val=="null"&&val&&val.length==0)
					&& !(former_val=="null"&&val==undefined)
					){
					//alert("1. field_id="+key_field_ids[i]+" former_val="+former_val+" val="+val);
					modif=true;
					break;
				}
			}
		}
		else if (field_id){
			val = ctrl.getValue();
			//former_val = ctrl.getFormerFieldValue(this.FORMER_KEY_VAL+field_id);
			former_val = ctrl.getAttr(this.FORMER_KEY_VAL+field_id);
			if ((pm.paramExists(field_id))
				&& (former_val!=val||ctrl.getAlwaysUpdate())
				&& !(former_val==null&&val.length==0)
				&& !(former_val==null&&val=="null")
				){
				//alert("2 field_id="+field_id+" former_val="+former_val+" val="+val);
				modif=true;
				break;
			}
		}
	}	
	return modif;
}

/*
	checkRes struc incorrect_vals
					modif
*/
View.prototype.setMethodParams = function(pm,checkRes){
//debugger;
	for (var ctrl_id in this.m_bindings){
		//ctrl.getEnabled()
		var ctrl = this.m_bindings[ctrl_id].control;		
		if (!this.m_bindings[ctrl_id].writeBind)continue;
		var key_field_ids = this.m_bindings[ctrl_id].writeBind.keyFieldIds;
		var field_id = this.m_bindings[ctrl_id].writeBind.valueFieldId;
		var former_val,val;
		if (key_field_ids){
			for (var i=0;i<key_field_ids.length;i++){
				former_val = ctrl.getFormerFieldValue(key_field_ids[i]);
				val = ctrl.getFieldValue(key_field_ids[i]);
				//console.log("former_val="+former_val+" val="+val);
				//val = ctrl.validate(val);
				if (ctrl.validate){
					try{					
						val = ctrl.validate(val);
						if (ctrl.setComment){
							ctrl.setComment("");
						}
					}
					catch(e){
						if (ctrl.setComment){
							ctrl.setComment(e.message);
						}
						checkRes.incorrect_vals=true;
					}
				}
				//val = isNaN(val)? 0:val;
				if (pm.paramExists(this.FORMER_KEY_VAL+key_field_ids)){
					pm.setParamValue(this.FORMER_KEY_VAL+key_field_ids[i],former_val);
				}
				if ((pm.paramExists(key_field_ids[i]))
					&& (former_val!=val||ctrl.getAlwaysUpdate()) ){
					pm.setParamValue(key_field_ids[i],val);
					checkRes.modif=true;
				}
			}
		}
		else if (field_id){
			
			val = ctrl.getValue();
			if (ctrl.validate){
				try{
					val = ctrl.validate(val);				
					if (ctrl.setComment){
						ctrl.setComment("");
					}
				}
				catch(e){
					if (ctrl.setComment){
						ctrl.setComment(e.message);
					}
					checkRes.incorrect_vals=true;
				}
			}
			former_val = ctrl.getAttr(this.FORMER_KEY_VAL+field_id);
			//former_val = ctrl.getFormerFieldValue(this.FORMER_KEY_VAL+field_id);
			if (pm.paramExists(this.FORMER_KEY_VAL+field_id)){
				pm.setParamValue(this.FORMER_KEY_VAL+field_id,former_val);
			}		
			//alert("field_id="+field_id+" former_val="+former_val+" val="+val+" alwaysUpdate="+ctrl.alwaysUpdate);
			if ((pm.paramExists(field_id))
				&& (former_val!=val||ctrl.getAlwaysUpdate()) ){
				pm.setParamValue(field_id,val);
				checkRes.modif=true;
			}
		}
	}	
}

View.prototype.writeData = function(async){
	var contr = this.getWriteController();
	if (!contr)return;
	var meth_id = this.getWriteMethodId();
	var check_res = {
		"incorrect_vals":false,
		"modif":false
	};
	this.setMethodParams(
		contr.getPublicMethodById(meth_id),check_res);
	if (!check_res.incorrect_vals && check_res.modif){
		this.setTempDisabled();
		contr.runPublicMethod(meth_id,{},
			(async!=undefined)? async:this.getWriteAsync(),
			this.onWriteOk,this,this.onError,this.getWriteRespXML());
	}
	else if (check_res.incorrect_vals){
		this.m_errorControl.setValue("Обнаружены ошибки!");
	}
	else if (!check_res.modif){
		this.onWriteOk();
	}
}
View.prototype.removeDOM = function(){
	//remove auto complete forms
	/*
	var compl_n = nd("tat_table");
	if (compl_n){
		DOMHandler.removeNode(compl_n);
	}
	*/

	if (this.m_titleControl){
		this.m_titleControl.removeDOM();
	}
	if (this.m_errorControl){
		this.m_errorControl.removeDOM();
	}
	View.superclass.removeDOM.call(this);
}
View.prototype.onWriteOk = function(resp){
	this.m_objModified = true;
	this.m_lastWriteResult = true;
	this.setTempEnabled();
}
View.prototype.onError = function(resp,erCode,erStr){		
	this.m_lastWriteResult = false;
	
	this.setTempEnabled();
	if (this.m_errorControl){
		this.m_errorControl.setValue(erStr);
	}
	else{
		throw new Error("AJAX error: "+erStr);
	}	
}
View.prototype.toDOM = function(parent){
	if (this.m_titleControl){
		this.m_titleControl.toDOM(parent);
	}
	View.superclass.toDOM.call(this,parent);
	if (this.m_errorControl){
		this.m_errorControl.toDOM(parent);
	}
	//setting focus
	if (this.m_FocussedControlId){
		this.m_bindings[this.m_FocussedControlId].control.m_node.focus();
	}
	else{
		for (var bind in this.m_bindings){
			if (
			(this.m_bindings[bind].options==undefined
			||!this.m_bindings[bind].options.autoFillOnInsert)
			&&this.m_bindings[bind].control.getVisible()
			&&this.m_bindings[bind].control.getEnabled()
			){				
				this.m_bindings[bind].control.m_node.focus();
				break;
			}
		}
	}
}
View.prototype.getFormWidth = function(){
	return this.m_formWidth;
}
View.prototype.setFormWidth = function(formWidth){
	this.m_formWidth = formWidth;
}
View.prototype.getFormHeight = function(){
	return this.m_formHeight;
}
View.prototype.setFormHeight = function(formHeight){
	this.m_formHeight = formHeight;
}
View.prototype.getFormCaption = function(){
	return this.m_formCaption;
}
View.prototype.setFormCaption = function(s){
	this.m_formCaption = s;
}

View.prototype.getDocument = function(){
	if (this.m_winObj){
		return this.m_winObj.getWindowForm().document;
	}
	else{
		return window.document;
	}
}
View.prototype.getWriteAsync = function(){
	return this.m_writeAsync;
}
View.prototype.getWriteRespXML = function(){
	return this.m_writeRespXML;
}
View.prototype.setWriteRespXML = function(writeRespXML){
	this.m_writeRespXML = writeRespXML;
}
/*
View.prototype.setEnabled = function(enabled){
	if (!enabled){
		this.m_disabledContols={};
	}
	for (var ctrl_id in this.m_bindings){
		if (!enabled){
			if (!this.m_bindings[ctrl_id].control.getEnabled()){
				this.m_disabledContols[ctrl_id]=true;			
			}
			this.m_bindings[ctrl_id].control.setEnabled(false);
		}
		else{
			if (this.m_disabledContols&&this.m_disabledContols[ctrl_id]==undefined){
				this.m_bindings[ctrl_id].control.setEnabled(true);
			}		
		}
	}	
}
*/

