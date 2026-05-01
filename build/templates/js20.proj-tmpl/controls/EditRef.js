/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>,2014
 
 * @class
 * @classdesc Basic visual editable control
 
 * @extends Control
 
 * @requires controls/Control.js
 * @requires controls/ControlContainer.js
 * @requires controls/ButtonOpen.js  
 * @requires controls/ButtonSelect.js    
 * @requires controls/ButtonClear.js  
 * @requires controls/Label.js    
 
 * @param string id 
 * @param {Object} options
 * @param {bool} [options.cmdAutoComplete=true]
 
 * @param {WindowFormObject} options.selectWinClass
 * @param {string} options.selectWinParams
 * @param {string} options.selectWinEditViewOptions  
 * @param {array} options.selectDescrIds
 * @param {array} options.selectKeyIds
 * @param {function} options.selectFormatFunction
 * @param {bool} [options.selectMultySelect=false]
 * @param {string} options.insertModelId
 * @param {string} options.insertDescrFieldId
 * @param {object|function} options.insertWinEditViewOptions
  * @param {function} options.insertOnClick              
 
 * @param {function} options.onClear  deprecated use Edit.onReset
 */
function EditRef(id,options){
	options = options || {};

	if(options.keys){
		this.setKeys(options.keys);
	}
	
	if(options.keyIds){
		this.setKeyIds(options.keyIds);
	}
	
	var w = window.getWidthType();
	options.cmdInsert = (options.cmdInsert!=undefined)? options.cmdInsert:true;
	options.cmdSelect = (options.cmdSelect!=undefined)? options.cmdSelect:true;
	options.cmdOpen = (options.cmdOpen!=undefined)? options.cmdOpen:true;
	options.cmdClear = (options.cmdClear!=undefined)? options.cmdClear:true;
	options.cmdAutoComplete = (options.cmdAutoComplete!=undefined)? options.cmdAutoComplete:true;	

	if ((w=="sm" && options.cmdSmInsert) || (w!="sm" && options.cmdInsert) ){
		//!!!insertModelId!!!
		//insertDescrFieldId
		if(!options.insertWinEditViewOptions && options.insertModelId && options.insertDescrFieldId){
			//default options
			options.insertWinEditViewOptions = function(){
				var v = self.m_node.value;
				var opts = {"models": {}}
				opts.models[options.insertModelId] = new window[options.insertModelId]();
				opts.models[options.insertModelId].setFieldValue(options.insertDescrFieldId, v);
				opts.models[options.insertModelId].recInsert();				
				opts.onClose = function(res){
					if(res && res.newKeys){
						self.setValue(new RefType({
							"keys": res.newKeys,
							"descr": this.getElement(options.insertDescrFieldId).getValue()}
						));
						DOMHelper.delClass(self.m_node, "null-ref");
						self.onSelectValue(null);
					}
					if(res.window){
						res.window.closeResult = res;
						res.window.close();				
					}
				}
				return opts;
			}
		}
		options.buttonInsert = options.buttonInsert ||
			new ButtonInsert(id+":btn_insert",{
				"editControl":this,
				"editWinClass":options.editWinClass,
				"editViewOptions": options.insertWinEditViewOptions,
				"onClick":options.insertOnClick
			});
	}

	if (
	!options.buttonSelect && options.selectWinClass
	&&( 
		(w=="sm" && options.cmdSmSelect) || (w!="sm" && options.cmdSelect)
	)
	){
		var self = this;
		options.buttonSelect = new ButtonSelectRef(id+":btn_select",
			{"winClass":options.selectWinClass,
			"winParams":options.selectWinParams,
			"winEditViewOptions":options.selectWinEditViewOptions,
			"descrIds":options.selectDescrIds,
			"keyIds":options.selectKeyIds,
			"control":this,
			"onSelect":function(fields){
				self.onSelectValue(fields);
			},
			"formatFunction":options.selectFormatFunction,
			"multySelect":options.selectMultySelect,
			"enabled":options.enabled
			});
	}
	
	if (
	!options.buttonOpen && options.editWinClass
	&&( 
		(w=="sm" && options.cmdSmOpen) || (w!="sm" && options.cmdOpen)
	)	
	){
		/*
		options.editWinParams = options.editWinParams || "";
		options.editWinParams+= ((options.editWinParams=="")? "":"&") + "mode=edit";
		*/
		options.buttonOpen = new ButtonOpen(id+':btn_open',
			{"winClass":options.editWinClass,
			"winParams":options.editWinParams,
			"keyIds":options.openKeyIds,
			"control":this
			});			
	}
	
	if ((w=="sm" && options.cmdSmClear) || (w!="sm" && options.cmdClear) ){		
		this.m_onClear = options.onClear;
		options.buttonClear = options.buttonClear || new ButtonClear(id+":btn_clear",{
				"editControl":this,
				"enabled":options.enabled,
				"onClear":options.onClear
			});
	}
		
	this.setButtonInsert(options.buttonInsert);	
	
	EditRef.superclass.constructor.call(this, id, options);
	
	if (!this.getKeyIds().length){
		throw Error(CommonHelper.format(this.ER_NO_KEY,Array[this.getName()]));
	}
	
}
extend(EditRef,Edit);

/* constants */
EditRef.prototype.KEY_ATTR = "keys";
EditRef.prototype.KEY_INIT_ATTR = "initKeys";

EditRef.prototype.ATTR_DISABLED = "readOnly";//

/* private members */
EditRef.prototype.m_buttonInsert;
EditRef.prototype.m_keyIds;//array of key identifiers


EditRef.prototype.addButtonControls = function(){
	if (this.m_buttonInsert) this.m_buttons.addElement(this.m_buttonInsert);
	if (this.m_buttonOpen) this.m_buttons.addElement(this.m_buttonOpen);
	if (this.m_buttonSelect) this.m_buttons.addElement(this.m_buttonSelect);
	if (this.m_buttonClear) this.m_buttons.addElement(this.m_buttonClear);
}

EditRef.prototype.keys2Str = function(keys){
	return CommonHelper.array2json(keys);
}

EditRef.prototype.str2Keys = function(str){
	return CommonHelper.json2obj(str);
}


/* public methods */
EditRef.prototype.setButtonInsert = function(v){
	this.m_buttonInsert = v;
}
EditRef.prototype.getButtonInsert = function(){
	return this.m_buttonInsert;
}

EditRef.prototype.setKeys = function(keys){
	if (!CommonHelper.isEmpty(keys)){
		this.m_keyIds = [];
		for (var keyid in keys){
			this.m_keyIds.push(keyid);
		}		
	}
	else if (!this.m_keyIds){
		this.m_keyIds = [];
	}
	this.setAttr(this.KEY_ATTR,this.keys2Str(keys));
	
	if (this.m_onValueChange){
		this.m_onValueChange.call(this);
	}	
}

EditRef.prototype.setKeyIds = function(v){	
	this.m_keyIds = v;
}

EditRef.prototype.getKeyIds = function(){	
	return this.m_keyIds;
}


EditRef.prototype.getKeys = function(){
	return this.str2Keys( this.getAttr(this.KEY_ATTR) );
}

EditRef.prototype.setInitKeys = function(keys){
	this.setAttr(this.KEY_INIT_ATTR,this.keys2Str(keys));
}

EditRef.prototype.getInitKeys = function(){
	return this.str2Keys( this.getAttr(this.KEY_INIT_ATTR) );
}

EditRef.prototype.getIsRef = function(){
	return true;
}

EditRef.prototype.getModified = function(){
	var key = this.getAttr(this.KEY_ATTR);
	//if no key it is not modified
	return (key && key!="{}" && (key!=this.getAttr(this.KEY_INIT_ATTR)) );
}

EditRef.prototype.isNull = function(){
	var res = true;
	var keys = this.getKeys();
	if(keys){
		for(id in keys){
			if(keys[id]==undefined||keys[id]=="null"){
				res = true;
				break;
			}
			res = false;
		}
	}
	return res;
}

EditRef.prototype.resetKeys = function(){
	var do_reset = false;
	var keys = this.getKeys();
	if (keys){
		for(var k in keys){
			//if(keys[k]!="null"){
			if(keys[k]!=undefined){
				keys[k] = null;//???
				do_reset = true;
			}
		}	
	}
	if(do_reset){
		this.setKeys(keys);
	}
}

EditRef.prototype.reset = function(){	
	this.setValue("");
	this.focus();	
	this.resetKeys();
	
	if(this.m_onReset)this.m_onReset();
}

EditRef.prototype.setValue = function(val){
	var descr;	
	if (val && typeof val == "object" && val.getKeys && val.getDescr){
		this.setKeys(val.getKeys());
		descr = val.getDescr(); 
	}
	else if (val && typeof val == "object" && val.keys && val.descr){
		this.setKeys(val.keys);
		descr = val.descr; 
	}
	else if (val && typeof val == "object" && val.m_keys && val.m_descr){
		this.setKeys(val.m_keys);
		descr = val.m_descr; 
	}			
	else if (val && typeof val != "object"){
		descr = val;
	}
	else{
		descr = "";
	}
	if(!descr){
		descr = "";
	}
	EditRef.superclass.setValue.call(this,descr);
}

EditRef.prototype.getValue = function(){
	var descr = EditRef.superclass.getValue.call(this);
	var res = (
		new RefType({"keys":this.getKeys(),"descr":descr,"dataType":undefined})
	);
//console.dir(res)
	return res;
}

EditRef.prototype.getKeyValue = function(key){
	return this.getValue().getKey(key);
}

EditRef.prototype.setInitValue = function(val){
	this.setValue(val);
	if (typeof val == "object" && val.getKeys){
		this.setInitKeys(val.getKeys());
	}	
	else if (typeof val == "object" && val.keys){
		this.setInitKeys(val.keys);
	}	
	
	//EditRef.superclass.setInitValue.call(this,this.getValue().descr);
}

EditRef.prototype.setOnValueChange = function(v){
	this.m_onValueChange = v;
}

EditRef.prototype.onSelectValue = function(v){
	if(this.m_onSelect)this.m_onSelect(v);
}

EditRef.prototype.validate = function(){
	if(!EditRef.superclass.validate.call(this)){
		return false;
	}
	if(this.getRequired() && this.isNull()){
		this.setNotValid(Validator.prototype.ER_EMPTY);
	}
	return true;
}
