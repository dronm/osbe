/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016

 * @extends EditRadioGroup
 * @requires core/extend.js
 * @requires EditRadioGroup.js     

 * @class
 * @classdesc
 
 * @param {string} id - Object identifier
 * @param {object} options
 * @param {bool} options.cashable
 * @param {Model} options.model
 * @param {PublicMethod} options.readPublicMethod
 * @param {Field} options.keyField
 * @param {string} options.keyFieldId
 * @param {Field} options.descrField
 * @param {string} options.descrFieldId
 * @param {string} [options.notSelectedValue=DEF_NOT_SELECTED_VAL]
 * @param {string} [options.notSelectedCaption=DEF_NOT_SELECTED_CAP]
 * @param {int} [options.colCount=1]
 * @param {string} options.modelDataStr      
 */
function EditRadioGroupRef(id,options){
	options = options || {};	
		
	this.setCashable((options.cashable!=undefined)? options.cashable:true);
	this.setModel(options.model);
	this.setReadPublicMethod(options.readPublicMethod);
	
	this.setKeyField(options.keyField);
	this.setKeyFieldId(options.keyFieldId);	
	this.setDescrField(options.descrField);
	this.setDescrFieldId(options.descrFieldId);
	
	this.setNotSelectedValue(options.notSelectedValue || this.DEF_NOT_SELECTED_VAL);
	this.setNotSelectedCaption(options.notSelectedCaption || this.DEF_NOT_SELECTED_CAP);
	
	this.setColCount(options.colCount || 1);
	
	EditRadioGroupRef.superclass.constructor.call(this,id,options);
	
	if (options.modelDataStr && this.m_model){		
		if (this.getCashable()){
			window.getApp().setCashData(this.m_model.getId(),options.modelDataStr);
		}
		else{
			this.m_model.setDate(options.modelDataStr);
		}		
	}		
	
}
extend(EditRadioGroupRef,EditRadioGroup);

/* Constants */
EditRadioGroupRef.prototype.DEF_NOT_SELECTED_VAL = "null";

/* private members */
EditRadioGroupRef.prototype.m_oldEnabled;
EditRadioGroupRef.prototype.m_cashable;
EditRadioGroupRef.prototype.m_readPublicMethod;
EditRadioGroupRef.prototype.m_model;
EditRadioGroupRef.prototype.m_keyFieldId;
EditRadioGroupRef.prototype.m_keyField;

EditRadioGroupRef.prototype.m_notSelectedCaption;
EditRadioGroupRef.prototype.m_notSelectedValue;

/* protected*/


/* public methods */
EditRadioGroupRef.prototype.getCashable = function(){
	return this.m_cashable;
}
EditRadioGroupRef.prototype.setCashable = function(v){
	this.m_cashable = v;
}

EditRadioGroupRef.prototype.setReadPublicMethod = function(v){
	this.m_readPublicMethod = v;
}
EditRadioGroupRef.prototype.getReadPublicMethod = function(){
	return this.m_readPublicMethod;
}

EditRadioGroupRef.prototype.setModel = function(v){
	this.m_model = v;
}
EditRadioGroupRef.prototype.getModel = function(){
	return this.m_model;
}

EditRadioGroupRef.prototype.getKeyFieldId = function(){
	return this.m_keyFieldId;
}
EditRadioGroupRef.prototype.setKeyFieldId = function(v){
	this.m_keyFieldId = v;
}

EditRadioGroupRef.prototype.getKeyField = function(){
	return this.m_keyField;
}
EditRadioGroupRef.prototype.setKeyField = function(v){
	this.m_keyField = v;
}

EditRadioGroupRef.prototype.getDescrFieldId = function(){
	return this.m_descrFieldId;
}
EditRadioGroupRef.prototype.setDescrFieldId = function(v){
	this.m_descrFieldId = v;
}

EditRadioGroupRef.prototype.getDescrField = function(){
	return this.m_descrField;
}
EditRadioGroupRef.prototype.setDescrField = function(v){
	this.m_descrField = v;
}

EditRadioGroupRef.prototype.getNotSelectedValue = function(){
	return this.m_notSelectedValue;
}

EditRadioGroupRef.prototype.setNotSelectedValue = function(v){
	this.m_notSelectedValue = v;
}

EditRadioGroupRef.prototype.getNotSelectedCaption = function(){
	return this.m_notSelectedCaption;
}

EditRadioGroupRef.prototype.setNotSelectedCaption = function(v){
	this.m_notSelectedCaption = v;
}

EditRadioGroupRef.prototype.getColCount = function(){
	return this.m_colCount;
}

EditRadioGroupRef.prototype.setColCount = function(v){
	this.m_colCount = v;
}

EditRadioGroupRef.prototype.onRefresh = function(){	
	if (this.getCashable() && this.m_model){
		var cash = window.getApp().getCashData(this.getName());
		if (cash){
			this.m_model.setDate(cash);
			this.onGetData();
			return;		
		}
	}

	this.m_oldEnabled = this.getEnabled();	
	this.setEnabled(false);
	var self = this;
	this.getReadPublicMethod().run({
		"async":false,
		"ok":function(resp){			
			self.onGetData(resp);
		},
		"fail":function(resp,erCode,erStr){
			self.setEnabled(self.m_oldEnabled);
			self.getErrorControl().setValue(window.getApp().formatError(erCode,erStr));
		}
	});
}

EditRadioGroupRef.prototype.toDOM = function(parent){
	EditRadioGroupRef.superclass.toDOM.call(this,parent);
		
	this.onRefresh();
}


EditRadioGroupRef.prototype.onGetData = function(resp){
	if (!this.m_model) return;
	
	if (resp && this.m_model){
		this.m_model.setData(resp.getModelData(this.m_model.getId()));
		
		if (this.getCashable()){
			window.getApp().setCashData(this.m_model.getId(),resp.getModelData(this.m_model.getId()));
		}
	}
	
	var old_key_val = this.getValue() || this.m_defaultValue;
	
	//lookup field
	var f = this.getKeyField();
	if (!f && this.getKeyFieldId() && this.m_model.fieldExists(this.getKeyFieldId())){
		this.setKeyField(this.m_model.getField(this.getKeyFieldId()));
	}
	else if (!f){
		//first key field
		var fields = this.m_model.getFields();
		for (var id in fields){
			if (fields[id].getPrimaryKey()){
				this.setKeyField(fields[id]);
				break;
			}
		}
	}
	if (!this.getKeyField()){
		throw Error(CommonHelper.format(this.ER_NO_LOOKUP,Array(this.getName())));
	}
	//****************

	//descr field
	var f = this.getDescrField();
	if (!f && this.getDescrFieldId() && this.m_model.fieldExists(this.getDescrFieldId())){
		this.setDescrField(this.m_model.getField(this.getDescrFieldId()));
	}
	else if (!f){
		//first NOT key field
		var fields = this.m_model.getFields();
		for (var id in fields){
			if (!fields[id].getPrimaryKey()){
				this.setDescrField(fields[id]);
				break;
			}
		}
		if (!this.getDescrField()){
			for (var id in fields){
				if (fields[id].getPrimaryKey()){
					this.setDescrField(fields[id]);
					break;
				}
			}		
		}
	}
	if (!this.getDescrField()){
		throw Error(CommonHelper.format(this.ER_NO_RESULT,Array(this.getName())));
	}
	//****************

	var self = this;

	this.clear();
	var opt_class = this.getOptionClass();
	
	if (this.getAddNotSelected()){
		var def_opt_opts = {
			"className":"a",
			"value":this.getNotSelectedValue(),
			"labelCaption":this.getNotSelectedCaption(),
			"name":this.getId(),
			"events":{"onclick":function(){
				if (self.m_onSelect){
					self.m_onSelect();
				}
			}}
		};//"NaN"
	}
	
	if (this.getAddNotSelected() && !this.getNotSelectedLast()){
		this.addElement(new opt_class(this.getId()+":not_selected",def_opt_opts));	
	}
	
	var opt_checked = false;
	while (this.m_model.getNextRow()){
		var key_val = this.getKeyField().getValue();
		opt_checked = opt_checked || (key_val==old_key_val);
		this.addElement(new opt_class(this.getId()+":id_"+key_val,{
			"className":"a",
			"checked":(key_val==old_key_val),
			"value":key_val,
			"labelCaption":this.getDescrField().getValue(),
			"name":this.getId(),
			"events":{"click":function(){
				if (self.m_onSelect){
					self.m_onSelect();
				}
			}}			
		}));	
	}
	
	if (this.getAddNotSelected() && this.getNotSelectedLast()){
		if (!opt_checked){
			def_opt_opts.checked = true;
			opt_checked = true;
		}
		this.addElement(new opt_class(this.getId()+":not_selected",def_opt_opts));	
	}
	
	if (!opt_checked && this.getCount()){
		this.setIndex(0);
	}
	
	/*
	for (var elem_id in this.m_elements){
		this.m_elements[elem_id].toDOM(this.m_node);
	}
	*/
	
	/*!!! В НЕСКОЛЬКО КОЛОНОК!!! */
	var columns = [];	
	var col_w = 12/this.m_colCount;
	var bs = window.getApp().getBsCol()+col_w;
	for (var n=0;n<this.m_colCount;n++){
		columns.push(new Control(CommonHelper.uniqid(),"div",{"className":bs}));
	}
	
	var elem;
	var n = 0;
	for (var elem_id in this.m_elements){
		elem = this.m_elements[elem_id];
		if (n==this.m_colCount)n=0;
		elem.toDOM(columns[n].getNode());
		n++;
	}
	for (var n=0;n<this.m_colCount;n++){
		columns[n].toDOM(this.m_node);
	}
	/* ***************** */
	
	this.setEnabled(this.m_oldEnabled);
}
