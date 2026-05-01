/* Copyright (c) 2012 
	Andrey Mikhalevich, Katren ltd.
*/
/*	
	Description
*/
//ф
/** Requirements
  * @requires common/functions.js
  * @requires controls/Control.js
  * @requires controls/ControlContainer.js
  * @requires controls/ButtonOpen.js  
  * @requires controls/ButtonSelect.js    
  * @requires controls/ButtonClear.js  
  * @requires controls/LabelField.js    
*/

/* constructor */
function Edit(id,options){
	options = options || {};
	options.className = options.className || this.DEF_CLASS;
	options.attrs=options.attrs||{};
	var disabled = (options.attrs.disabled);
	//oera hack
	/*
	if (disabled
	&& navigator.appName.toLowerCase()=='opera'){
		options.attrs["disabled"] = '';
		delete options.attrs["disabled"];
	}
	*/
	
	Edit.superclass.constructor.call(this,
		id,this.DEF_TAG_NAME,options);
	if (options.editMask!=undefined){
		this.setEditMask(options.editMask);
	}
	var name = options.name;
	if (name==undefined && options.attrs && options.attrs.name){
		name = options.attrs.name;
	}	
	this.setAttr("name",name || id);
	
	this.m_tableLayout = (options.tableLayout==undefined)? true:options.tableLayout;
	if (options.label){
		this.setLabel(options.label);
	}	
	else if (options.labelCaption){
		this.setLabel(new LabelField(this.getId(),
			options.labelCaption,
			{"className":options.labelClassName,
			"visible":this.getVisible(),
			"enabled":this.getEnabled(),
			"readOnly":this.getVisible()})
		);		
	}
	
	this.m_buttons = new ControlContainer(this.getId()+this.BTNS_CONTAINER_ID,
		"span",{"className":this.BTNS_CONTAINER_CLASS,
			"visible":this.getVisible(),
			"enabled":this.getEnabled()
			//"readOnly":this.getVisible()
			}
		);
	
	if (options.buttonOpen){
		this.m_buttons.addElement(options.buttonOpen);
	}
	if (!disabled && options.buttonSelect){
		this.m_buttons.addElement(options.buttonSelect);
	}
	if (!disabled && options.buttonClear){
		this.m_buttons.addElement(options.buttonClear);
	}
	
	if (options.attrs.maxlength){
		this.m_maxLength=options.attrs.maxlength;
	}
	if (options.minLength){
		this.m_minLength=options.minLength;
	}
	if (options.fixedLength){
		this.m_maxLength=options.attrs.maxlength;
		this.m_fixedLength=options.attrs.maxlength;
	}
	
	if (options.validator){
		this.setValidator(options.validator);
	}
	if (options.value){
		this.setValue(options.value);
	}
	this.setInputType(options.inputType || this.DEF_INPUT_TYPE);
	
	this.m_winObj = options.winObj;
	
	this.m_contClassName = options.contClassName||this.DEF_CONT_CLASS;
	this.m_editContClassName = options.editContClassName||("input-group "+get_bs_col()+"8");
}
extend(Edit,Control);

/* constants */
Edit.prototype.DEF_TAG_NAME = 'input';
Edit.prototype.DEF_INPUT_TYPE = 'text';
Edit.prototype.DEF_CLASS = "form-control";
Edit.prototype.BTNS_CONTAINER_ID = "Btns";
Edit.prototype.BTNS_CONTAINER_CLASS="input-group-btn";
Edit.prototype.INCORRECT_VAL_CLASS="incorrect_val";
Edit.prototype.DEF_CONT_CLASS = "form-group";

/* private members */
Edit.prototype.m_editMask;
Edit.prototype.m_buttons;
Edit.prototype.m_validator;
Edit.prototype.m_value;
Edit.prototype.m_label;//Object Lable
Edit.prototype.m_container;

/* private methods */

/* public methods */
Edit.prototype.setEditMask = function(editMask){
	this.m_editMask = editMask;
}
Edit.prototype.getEditMask = function(){
	return this.m_editMask;
}
Edit.prototype.setMaxLength = function(maxLength){
	this.setAttr("maxlength",maxLength);
}
Edit.prototype.getMaxLength = function(){
	return this.getAttr("maxlength");
}
Edit.prototype.setInputType = function(inputType){
	this.setAttr("type",inputType);
}
Edit.prototype.getInputType = function(){
	return this.getAttr("type");
}
Edit.prototype.getButtons = function(){
	return this.m_buttons;
}
Edit.prototype.setValidator = function(validator){
	this.m_validator = validator;
}
Edit.prototype.getValidator = function(){
	return this.m_validator;
}
Edit.prototype.getValue = function(){
	if (this.m_node){
		var mask = this.getEditMask();
		var val = this.m_node.value;
		if (mask){
			var mask_view=mask.replace(/\$d/g,"_");
			if (mask_view==val){
				val="";
			}
			else{
				val=val.replace(/_/g,"");
			}
		}
		return val;
	}
}
Edit.prototype.setValue = function(newValue){
	var v = (newValue!=undefined)? newValue:"";
	if (v.length||(!v.length&&!this.m_editMask)){
		this.m_node.value = v;
	}
}
Edit.prototype.isEmpty = function(val){
	return (val==undefined || val.length==0);
}
Edit.prototype.isTooLong = function(val){
	return (val&&this.m_maxLength&&val.length&&val.length>this.m_maxLength);
}
Edit.prototype.isTooShort = function(val){
	return (val&&this.m_minLength&&val.length&&val.length<this.m_minLength);
}
Edit.prototype.isNotFixed = function(val){
	return (val&&this.m_fixedLength&&val.length&&val.length!=this.m_maxLength);
}

Edit.prototype.setNotValid = function(erStr){
	DOMHandler.addClass(this.m_node,this.INCORRECT_VAL_CLASS);
	throw new Error(erStr);
}
Edit.prototype.setValid = function(){
	DOMHandler.removeClass(this.m_node,this.INCORRECT_VAL_CLASS);
}

Edit.prototype.validate = function(val){
	this.setValid();
	if (this.m_node.getAttribute("required")=="required"
	&& this.isEmpty(val)){
		this.setNotValid("Пустое значение");
	}
	/*
	if (this.m_validator){
		val=this.m_validator.validate(val);
	}
	*/
	if (this.isTooLong(val)){
		this.setNotValid("Слишком длинное значение");
	}
	if (this.isTooShort(val)){
		this.setNotValid("Слишком короткое значение");
	}	
	if (this.isNotFixed(val)){
		this.setNotValid("Не равно "+this.m_maxLength+" симв.");
	}	
	
	return val;
}
/*
Edit.prototype.applyEditMask = function(){	
	if (this.m_editMask){
		MaskEdit(this.m_node,this.m_editMask);
		//TipEdit(this.m_node.id,"Тест проверка");
	}
}
*/
Edit.prototype.toDOM = function(parent){	
	var edit_container_node = parent;
	if (this.m_label){
		//replaceChild()
		this.m_container = new Control(uuid(),"div",{"className":this.m_contClassName,
			visible:this.getVisible()});
		if (!parent){
			var dom_n = nd(this.getId());
			if(!dom_n){
				throw new Exception("DOM node not found!");
			}
			var par = dom_n.parentNode;
			par.replaceChild(this.m_container.m_node,dom_n);
		}
		else{
			this.m_container.toDOM(parent);
		}		
		this.m_label.toDOM(this.m_container.m_node);
		this.m_edit_container = new Control(uuid(),"div",{"className":this.m_editContClassName});
		this.m_edit_container.setVisible(this.getVisible());
		this.m_edit_container.setEnabled(this.getEnabled());
		this.m_edit_container.toDOM(this.m_container.m_node);		
		edit_container_node = this.m_edit_container.m_node;
	}
	/*
	else if (this.m_node.size
	&&edit_container_node
	&&edit_container_node.nodeName.toLowerCase()=="td"){
		var b_cnt = 0;
		if (this.m_buttons){
			b_cnt = this.m_buttons.getCount();
		}
		DOMHandler.addAttr(edit_container_node,"style",
			"width:"+(this.m_node.size+b_cnt*2+6)+"ch;");
	}	
	*/
	Edit.superclass.toDOM.call(this,edit_container_node);
	
	if (this.m_editMask){
		MaskEdit(this.m_node,this.m_editMask);
		//TipEdit(this.m_node.id,"Тест проверка");
	}
	
	if (this.m_buttons && !this.m_buttons.isEmpty()){
		this.m_buttons.toDOMAfter(this.m_node);
	}
}
Edit.prototype.setLabel = function(label){
	this.m_label = label;
}
Edit.prototype.getLabel = function(){
	return this.m_label;
}
Edit.prototype.removeDOM = function(){
	if (this.m_container){
		this.m_container.removeDOM();
	}
	if (this.m_buttons){
		this.m_buttons.removeDOM();
	}
	if (this.m_editMask){
		RemoveMaskEdit(this.m_node);
		//TipEdit(this.m_node.id,"Тест проверка");
	}
	
	Edit.superclass.removeDOM.call(this);
}
Edit.prototype.getValueForDb = function(){
	return this.validate(this.getValue());
}

Edit.prototype.setVisible = function(visible){
	if (this.m_label){
		this.m_label.setVisible(visible);
		if (this.m_container){
			this.m_container.setVisible(visible);
		}
		if (this.m_edit_container){
			this.m_edit_container.setVisible(visible);
		}
	}
	if (this.m_buttons){
		this.m_buttons.setVisible(visible);
	}
	Edit.superclass.setVisible.call(this,visible);
}
Edit.prototype.setReadOnly = function(readOnly){
	if (this.m_label){
		this.m_label.setReadOnly(readOnly);
	}
	if (this.m_buttons){
		this.m_buttons.setReadOnly(readOnly);
	}
	Edit.superclass.setReadOnly.call(this,readOnly);
}
Edit.prototype.setEnabled = function(enabled){
	if (this.m_label){
		this.m_label.setEnabled(enabled);
	}
	if (this.m_buttons){
		this.m_buttons.setEnabled(enabled);
	}
	Edit.superclass.setEnabled.call(this,enabled);
}
Edit.prototype.setFormerValue = function(id,value){
	if (value==null){
		v="";
	}
	else{
		v=value;
	}
	DOMHandler.setAttr(this.m_node,"old_"+id,v);
}
Edit.prototype.setComment = function(com){
	//&&this.m_node&&this.m_node.parentNode
	if (this.m_comment==undefined){
		this.m_comment=new Control(this.getId()+"_comment_","div",{visible:true,"className":"form-control-static ctrl_comment"});
		this.m_comment.toDOM(this.m_container? this.m_container.getNode():this.m_node.parentNode);
	}
	this.m_comment.setValue(com);
	this.m_comment.setVisible(true);	
}
Edit.prototype.getFormerFieldValue = function(id){
	return DOMHandler.getAttr(this.m_node,id);
}
Edit.prototype.setFocus = function(){
	this.m_node.focus();
}
Edit.prototype.resetValue = function(){
	this.m_node.value = "";
	this.setFocus();
	var mask = this.getEditMask();
	if (mask){
		MaskEdit(this.m_node,mask);
	}
	
}
