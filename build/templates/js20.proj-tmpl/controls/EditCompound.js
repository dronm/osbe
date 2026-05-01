/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2017

 * @extends ControlContainer
 * @requires core/extend.js
 * @requires ControlContainer.js     

 * @class
 * @classdesc
 
 * @param {string} id - Object identifier
 * @param {object} options
 * @param {object} options.possibleDataTypes
 * @param {function} options.onSelect
 */
function EditCompound(id,options){
	options = options || {};	
	
	this.m_options = {};
	CommonHelper.merge(this.m_options,options);
	
	this.setPossibleDataTypes(options.possibleDataTypes || {});
	
	this.m_onSelect = options.onSelect;
	
	var tag = options.tagName || this.DEF_TAG_NAME;
	
	EditCompound.superclass.constructor.call(this,id,tag,options);
}
extend(EditCompound,ControlContainer);

/* Constants */
EditCompound.prototype.DEF_TAG_NAME = "DIV";
EditCompound.prototype.VAL_INIT_ATTR = "initValue";

/* private members */

/** dataType is a key
 * {Control} ctrlClass, {object} ctrlOptions, {string} dataType, {string} dataDescrLoc
 */
EditCompound.prototype.m_possibleDataTypes;
EditCompound.prototype.m_dataType;
EditCompound.prototype.m_control;
EditCompound.prototype.m_options;
EditCompound.prototype.m_onSelect;


/* protected*/
EditCompound.prototype.createControl = function(){
	if (this.m_control){
		this.m_control.delDOM();
		delete this.m_control;
	}	
	var tp = this.getDataType();
	var ctrl_id = this.getId()+":ctrl";
	var btn_sel = new ButtonSelectDataType(ctrl_id+":btn-select-data-type",{"compoundControl":this});
	var ctrl_opts = {};
	CommonHelper.merge(ctrl_opts,this.m_options);
	if (tp){
		CommonHelper.merge(ctrl_opts,this.m_possibleDataTypes[tp].ctrlOptions);
		ctrl_opts.onSelect = ctrl_opts.onSelect || this.m_onSelect;
		if (!this.m_possibleDataTypes[tp]){
			throw new Error(CommonHelper.format(this.ER_TYPE_NOT_FOUND,tp));
		}
		this.m_control = new this.m_possibleDataTypes[tp].ctrlClass(ctrl_id,ctrl_opts);	
		/*
		if (ctrlVal){
			this.m_control.setValue(ctrlVal);
		}
		*/
		if(this.m_control.getButtons){
			var btn_cont = this.m_control.getButtons();
			if (!btn_cont){
				this.m_control.addButtonContainer();
				btn_cont = this.m_control.getButtons();
			}
			btn_cont.addElement(btn_sel);
		}else{
			this.m_control.m_buttons = new ControlContainer(this.m_control.getId()+":btn-cont","SPAN",
				{"className":"input-group-btn",
					"enabled":this.m_control.getEnabled()
				}
			);
		}	this.m_control.m_buttons.addElement(btn_sel);	
	}
	else{		
		//ctrl_opts.inputEnabled = false;
		ctrl_opts.buttonSelect = btn_sel;
		ctrl_opts.events = {
			"click":function(){
				if (this.getEnabled())this.getButtonSelect().doSelect();	
			}
		}
		this.m_control = new Edit(ctrl_id,ctrl_opts);
	}
}

/* public methods */
EditCompound.prototype.toDOM = function(parent){
	if(!this.m_control){
		this.createControl();
	}
	this.clear();
	this.addElement(this.m_control);

	EditCompound.superclass.toDOM.call(this,parent);		
}

EditCompound.prototype.getDataTypeDescr = function(tp){
	return "";
}

/**
 * @param {object|array} t ctrlClass,dataType
 */
EditCompound.prototype.setPossibleDataTypes = function(t){
	if (CommonHelper.isArray(t)){
		this.clearPossibleDataTypes();
		for (var i=0;i<t.length;i++){
			if (t[i].dataType && t[i].ctrlClass){
				this.m_possibleDataTypes[t[i].dataType] = {
					"ctrlClass":t[i].ctrlClass,
					"ctrlOptions":t[i].ctrlOptions,
					"dataTypeDescrLoc": t[i].dataTypeDescrLoc || this.getDataTypeDescr(t[i].dataType)
				};
			}
		}
	}
	else{
		this.m_possibleDataTypes = t;
		for (var i in this.m_possibleDataTypes){
			if (this.m_possibleDataTypes[i].ctrlClass && !this.m_possibleDataTypes[i].dataTypeDescrLoc){
				this.m_possibleDataTypes[i].dataTypeDescrLoc = this.getDataTypeDescr(i);
			}
	
		}
	}
}

EditCompound.prototype.getPossibleDataTypes = function(){
	return this.m_possibleDataTypes;
}

EditCompound.prototype.clearPossibleDataTypes = function(){
	this.m_possibleDataTypes = {};
}

EditCompound.prototype.getValue = function(){
	/*
	var r;
	if (this.m_control.getKeys){
		var o = this.m_control.getValue();
		if (o){
			o.setDataType(this.getDataType());
			r = CommonHelper.serialize(o);
		}
	}
	*/
	var o = this.getRef();
	return (o? CommonHelper.serialize(o) : null); 
}

EditCompound.prototype.getRef = function(){
	var o;
	if (this.m_control.getKeys){
		o = this.m_control.getValue();
		if (o){
			o.setDataType(this.getDataType());			
		}
	}
	return o;
}

EditCompound.prototype.setValue = function(v){
	if (typeof v == "string"){
		v = CommonHelper.unserialize(v);
	}
	this.setDataType( ((typeof v == "object" && v.getDataType)? v.getDataType() : null), v);
	this.m_control.setValue(v);
}
EditCompound.prototype.setInitValue = function(v){
	if (typeof v == "string"){
		v = CommonHelper.unserialize(v);
	}
	this.setDataType( ((typeof v == "object" && v.getDataType)? v.getDataType() : null), v);
	this.m_control.setInitValue(v);
	this.setAttr(this.VAL_INIT_ATTR,v);
}
EditCompound.prototype.setDataType = function(dataType,ctrlVal){
	this.m_dataType = dataType;
	this.createControl();
	this.m_control.toDOM(this.getNode());
}
EditCompound.prototype.unsetDataType = function(){
	this.setDataType(null);
}

EditCompound.prototype.getDataType = function(){
	return this.m_dataType;
}

EditCompound.prototype.getModified = function(){
	return this.m_control.getModified();
}

EditCompound.prototype.isNull = function(){
	return (!this.m_dataType || this.m_control.isNull());
}
EditCompound.prototype.setValid = function(){
	this.m_control.setValid();
}
EditCompound.prototype.setNotValid = function(er){
	this.m_control.setNotValid(er);
}
EditCompound.prototype.setEnabled = function(v){
	EditCompound.superclass.setEnabled.call(this,v);
	this.m_options.enabled = v;
	if (this.m_control){
		this.m_control.setEnabled(v);
	}
}
EditCompound.prototype.setVisible = function(v){
	EditCompound.superclass.setVisible.call(this,v);
	this.m_options.visible = v;
	if (this.m_control){
		this.m_control.setVisible(v);
	}
	
}
EditCompound.prototype.getContTagName = function(){
	return this.m_node.nodeName;
}
EditCompound.prototype.setContTagName = function(v){
	this.m_node.nodeName = v;
}
EditCompound.prototype.setInputEnabled = function(enabled){
	EditCompound.superclass.setEnabled.call(this,enabled);
}
EditCompound.prototype.getInputEnabled = function(){
	return EditCompound.superclass.getEnabled.call(this);
}

EditCompound.prototype.reset = function(){
	this.m_dataType = null;
	this.m_control.delDOM();
	delete this.m_control;

}
