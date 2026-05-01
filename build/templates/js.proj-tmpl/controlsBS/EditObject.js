/* Copyright (c) 2012 
	Andrey Mikhalevich, Katren ltd.
*/
/*	
	Description
*/
//ф
/** Requirements
  * @requires controls/Edit.js
*/

/* constructor */
function EditObject(id,options){
	options = options || {};
	var self = this;
	
	options.noInsert = (options.noInsert==undefined)? true:options.noInsert;
	options.noUpdate = (options.noUpdate==undefined)? true:options.noUpdate;
	
	if (options.buttonSelect==undefined &&
	(options.noSelect==undefined || options.noSelect===false)){
		options.buttonSelect=
			new ButtonSelectObject(id+'_btn_select',
			{"controller":options.controller,
			"modelId":options.modelId,
			"listView":options.listView,
			"keyFieldIds":options.keyFieldIds,
			"lookupKeyFieldIds":options.lookupKeyFieldIds,
			"onSelected":options.onSelected,
			"multySelect":options.multySelect,
			"extraFields":options.extraFields,
			"controlId":id
			});
	}
	if (options.buttonOpen==undefined
	&&(options.noOpen==undefined||options.noOpen===false)
	&&options.objectView){
		options.buttonOpen=
			new ButtonOpenObject(id+'_btn_open',
			{"controller":options.controller,
			"modelId":options.modelId,
			"connect":options.connect,
			"objectView":options.objectView,
			"keyFieldIds":options.keyFieldIds,
			"lookupKeyFieldIds":options.lookupKeyFieldIds
			});			
	}
	if (options.buttonClear==undefined &&
	(options.noClear==undefined || options.noClear===false)){
		options.buttonClear = 
			new ButtonClearObject(id+'_btn_clear',
			{"keyFieldIds":options.keyFieldIds,
			"controlId":id
			});			
	}
	if (options.buttonInsert==undefined
	&&!options.noInsert){
		options.buttonInsert=
			new ButtonInsertObject(id+'_btn_insert',
			{"controller":options.controller,
			"binds":options.insertBinds,
			"afterInsert":options.afterInsert
			});			
	}
	if (options.buttonUpdate==undefined
	&&!options.noUpdate){
		options.buttonUpdate=
			new ButtonUpdateObject(id+'_btn_update',
			{"controller":options.controller,
			"binds":options.updateBinds
			});			
	}

	
	EditObject.superclass.constructor.call(
		this,id,options);
		
	if (options.buttonInsert){
		this.setButtonInsert(options.buttonInsert);
		this.m_buttons.addElement(options.buttonInsert);
	}
	if (options.buttonUpdate){
		this.setButtonUpdate(options.buttonUpdate);
		this.m_buttons.addElement(options.buttonUpdate);
	}
		
	if (options.controller){
		this.setController(options.controller);
	}
		
	if (options.methodId){
		this.setMethodId(options.methodId);
	}
	if (options.modelId){
		this.setModelId(options.modelId);
	}	
	if (options.valueFieldId){
		this.setValueFieldId(options.valueFieldId);
	}	
	if (options.keyFieldIds){
		this.setKeyFieldIds(options.keyFieldIds);
	}	
	if (options.noAutoComplete==undefined||options.noAutoComplete!==false
	&&options.keyFieldIds){
		this.m_autoComplete = new actbAJX(
		{"controller":options.lookupController || options.controller,
		"modelId":options.lookupModelId || options.modelId,
		"lookupValueFieldId":options.lookupValueFieldId,
		"methodId":options.lookupMethodId || options.methodId,
		"lookupKeyFieldIds":options.lookupKeyFieldIds,
		"keyFieldIds":options.keyFieldIds,
		"minLengthForQuery":options.minLengthForQuery,
		"patternParamId":options.patternParamId||options.lookupValueFieldId,
		"ic":options.ic,
		"mid":options.mid,
		"onSelected":options.onSelected,
		"extraFields":options.extraFields,
		"resultFieldId":options.resultFieldId,
		"fullTextSearch":options.fullTextSearch,
		"resultFieldIdsToAttr":options.resultFieldIdsToAttr,
		"queryDelay":options.queryDelay,
		"updateInputOnCursor":options.acUpdateInputOnCursor
		});
		actb(this.m_node,this.m_winObj,this.m_autoComplete);
	}	
}
extend(EditObject,Edit);

EditObject.prototype.NOT_SELECTED_DESCR = "";

/* private members */
EditObject.prototype.m_autoComplete;
EditObject.prototype.m_keyFieldIds;
EditObject.prototype.m_valueFieldId;
EditObject.prototype.m_modelId;
EditObject.prototype.m_controller;

EditObject.prototype.setValueFieldId = function(valueFieldId){
	this.m_valueFieldId = valueFieldId;
}
EditObject.prototype.getValueFieldId = function(){
	return this.m_valueFieldId;
}
EditObject.prototype.setKeyFieldIds = function(keyFieldIds){
	this.m_keyFieldIds = keyFieldIds;
}
EditObject.prototype.getKeyFieldIds = function(){
	return this.m_keyFieldIds;
}
EditObject.prototype.setModelId = function(modelId){
	this.m_modelId = modelId;
}
EditObject.prototype.getModelId = function(){
	return this.m_modelId;
}
EditObject.prototype.setMethodId = function(methodId){
	this.m_methodId = methodId;
}
EditObject.prototype.getMethodId = function(){
	return this.m_methodId;
}
EditObject.prototype.setController = function(controller){
	this.m_controller = controller;
}
EditObject.prototype.getFieldId = function(){
	if (!this.m_keyFieldIds || this.m_keyFieldIds.length==0){
		throw new Error("Ключевые поля не определены!");
	}
	else if (this.m_keyFieldIds.length==1){
		for (var id in this.m_keyFieldIds){
			return this.m_keyFieldIds[id];
			break;
		}
	}
	else{
		throw new Error("Объект имеет несколько ключевых полей!");
	}
}
EditObject.prototype.setFieldValue = function(id,value){
	if (id==undefined){
		id = this.getFieldId();
	}
	DOMHandler.setAttr(this.m_node,"fkey_"+id,value);
	DOMHandler.setAttr(this.m_node,"last_fkey_"+id,value);
	if (value){
		DOMHandler.removeAttr(this.m_node,"incorrect_obj");
	}
}
EditObject.prototype.setFormerFieldValue = function(id,value){
	if (id==undefined){
		id = this.getFieldId();
	}
	DOMHandler.setAttr(this.m_node,"old_"+id,value);
}
EditObject.prototype.getFieldValue = function(id){
	if (id==undefined){
		id = this.getFieldId();
	}
	return DOMHandler.getAttr(this.m_node,"fkey_"+id);
}
EditObject.prototype.getFormerFieldValue = function(id){
	if (id==undefined){
		id = this.getFieldId();
	}
	return DOMHandler.getAttr(this.m_node,"old_"+id);
}
EditObject.prototype.getValueAsObj= function(){
	var data = EditObject.superclass.getValueAsObj.call(this);
	var k_vals = {};
	for (var id in this.m_keyFieldIds){		
		//k_vals[id] = this.getFieldValue(this.m_keyFieldIds[id]);
		k_vals[this.m_keyFieldIds[id]] = this.getFieldValue(this.m_keyFieldIds[id]);
		//console.log("EditObject.getValueAsObj ctrlId="+this.getId()+" id="+id+" val="+k_vals[id]+"  "+this.m_keyFieldIds[id]);
	}
	data["keys"] = k_vals;
	return data;
}
EditObject.prototype.setValueFromObj= function(obj){
	EditObject.superclass.setValueFromObj.call(this,obj);
	if (obj["keys"]){
		for (var id in this.m_keyFieldIds){
			if (obj["keys"][this.m_keyFieldIds[id]]){
				//console.log("EditObject.setValueFromObj ctrlId="+this.getId()+" id="+id+" val="+obj["keys"][id]+"  "+this.m_keyFieldIds[id]);
				//this.setFieldValue(id,obj["keys"][id]);
				//this.setFormerFieldValue(id,obj["keys"][id]);
				this.setFieldValue(this.m_keyFieldIds[id],obj["keys"][this.m_keyFieldIds[id]]);
				this.setFormerFieldValue(this.m_keyFieldIds[id],obj["keys"][this.m_keyFieldIds[id]]);				
			}
		}
	}
}
EditObject.prototype.resetValue = function(){
	EditObject.superclass.resetValue.call(this);
	this.setFieldValue(null,"");
}
EditObject.prototype.setOnSelected = function(onSelected){
	if (this.m_autoComplete){		
		this.m_autoComplete.setOnSelected(onSelected);		
	}
}
EditObject.prototype.setButtonUpdate = function(btn){
	this.m_buttonUpdate = btn;
}
EditObject.prototype.getButtonUpdate = function(){
	return this.m_buttonUpdate;
}
EditObject.prototype.setButtonInsert = function(btn){
	this.m_buttonInsert = btn;
}
EditObject.prototype.getButtonInsert = function(){
	return this.m_buttonInsert;
}
