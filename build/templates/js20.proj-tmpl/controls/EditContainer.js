/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2012
 
 * @class
 * @classdesc 
 
 * @requires core/extend.js
 * @requires core/ControlContainer.js
 * @requires core/CommonHelper.js    
 * @requires controls/ButtonOpen.js  
 * @requires controls/ButtonSelect.js    
 * @requires controls/ButtonClear.js   
  
 * @param {string} id
 * @param {namespace} options
 * @param {string} options.tagName
 * @param {string} options.optionClass
 * @param {array} options.elements - Array of object{string||bool value, string descr, bool checked}
 * @param {bool} [options.addNotSelected=true]
 * @param {bool} [options.notSelectedLast=false]
 * @param {array} options.options
 * @param {Button} options.buttonOpen
 * @param {Button} options.buttonSelect
 * @param {Button} options.buttonClear
 
 * @param {function} options.onReset fired when reset() is called   
 */
function EditContainer(id,options){
	options = options || {};
		
	if (!options.optionClass){
		throw Error(this.ER_NO_OPT_CLASS);
	}

	if (!options.tagName){
		throw Error(this.ER_NO_TAG);
	}
	
	/* if node exists it will be a container!!!*/
	var n = CommonHelper.nd(id,this.getWinObjDocument());
	if (n){
		n.id = n.id + ":cont";
	}		
	
	if (options.inline===true){
		options.contClassName = "";
		options.editContClassName = "";
		options.className = "";
		options.btnContClassName = "";
		options.contTagName = "SPAN";
		options.editContTagName = "SPAN";	
	}
	
	options.className = (options.className!==undefined)? options.className:this.DEF_CLASS;	
	
	this.setValidator(options.validator || new ValidatorString(options));
	
	//buttons
	this.setButtonOpen(options.buttonOpen);
	this.setButtonSelect(options.buttonSelect);
	this.setButtonClear(options.buttonClear);		
	this.setBtnContClassName((options.btnContClassName!=undefined)? options.btnContClassName:this.BTNS_CONTAINER_CLASS);		
	/*
	 * if there is any option starting with button~
	 */
	var btn_opt = "button";
	for (opt in options){
		if (opt.substring(0,btn_opt.length)==btn_opt && opt.length>btn_opt.length){
			this.addButtonContainer();
			break;
		}
	}
	
	
	options.elements = options.elements || [];
	
	this.setAddNotSelected((options.addNotSelected!=undefined)? options.addNotSelected:true);
	this.setNotSelectedLast((options.notSelectedLast!=undefined)? options.notSelectedLast:false);
	this.setOptionClass(options.optionClass);
	
	this.setOnSelect(options.onSelect);
		
	this.m_initValue = options.value;	
	//console.log("EditContainer")
	//console.dir(this.m_initValue)
	if (this.m_initValue && this.m_initValue.getKeys && !this.m_initValue.isNull()){
		options.attrs = options.attrs || {};
		options.attrs.keys = CommonHelper.serialize(this.m_initValue.getKeys());
	}
	options.value = undefined;
		
	var opt_selected = false;
	if (this.m_addNotSelected){
		var def_opt_opts = {"value":this.NOT_SELECTED_VAL,"descr":this.NOT_SELECTED_DESCR};
	}
	
	if (options.options){
		for (var i=0;i<options.options.length;i++){
			if (options.options[i]!=undefined && options.options[i].checked==true){
				opt_selected = true;
				break;
			}
		}	
	}
	
	var opt_ind = 0;
	
	if (this.m_addNotSelected && !this.m_notSelectedLast){
		if (!opt_selected){
			opt_selected.checked = true;
		}
		options.elements.push(new options.optionClass(id+":"+opt_ind,def_opt_opts));	
		opt_ind++;
	}

	if (options.options){		
		for (var i=0;i<options.options.length;i++){
			options.elements.push(new options.optionClass(id+":"+opt_ind,options.options[i]))	
			opt_ind++;
		}	
	}
	
	if (this.m_addNotSelected && this.m_notSelectedLast){
		if (!opt_selected){
			opt_selected.checked = true;
		}
		options.elements.push(new options.optionClass(id+":"+opt_ind,def_opt_opts));	
	}
	
	//CONSTRUCTOR	
	EditContainer.superclass.constructor.call(this, id, options.tagName, options);
		
	if (options.label){
		this.setLabel(options.label);
	}
	else if (options.labelCaption){
		this.setLabel(new Label(id+":label",
			{"value":options.labelCaption,
			"className":options.labelClassName,
			"visible":this.getVisible()
			}
		));
	}
		
	this.setContClassName( (options.contClassName!==undefined)? options.contClassName:this.DEF_CONT_CLASS );	
	this.setContTagName(options.contTagName || this.DEF_CONT_TAG);	
	this.setEditContClassName( (options.editContClassName!==undefined)? options.editContClassName : (this.DEF_EDIT_CONT_CLASS +" "+ window.getBsCol(8)) );
	this.setEditContTagName(options.editContTagName || this.DEF_EDIT_CONT_TAG);
	
	this.setErrorControl(options.errorControl || new ErrorControl(id+":error") );
	
	this.setOnReset(options.onReset);
}
extend(EditContainer,ControlContainer);

EditContainer.prototype.m_label;
EditContainer.prototype.m_buttons;
EditContainer.prototype.m_errorControl;
EditContainer.prototype.m_editContainer;
EditContainer.prototype.m_container;

EditContainer.prototype.m_addNotSelected;
EditContainer.prototype.m_notSelectedLast;
EditContainer.prototype.m_optionClass;
EditContainer.prototype.m_formatFunction;

EditContainer.prototype.m_initValue;

EditContainer.prototype.m_buttonOpen;
EditContainer.prototype.m_buttonSelect;
EditContainer.prototype.m_buttonClear;
EditContainer.prototype.m_btnContClassName;

/* constants */
EditContainer.prototype.DEF_CONT_TAG = "DIV";//
EditContainer.prototype.DEF_EDIT_CONT_TAG = "DIV";
EditContainer.prototype.DEF_CLASS = "form-control";
EditContainer.prototype.DEF_CONT_CLASS = "form-group";
EditContainer.prototype.BTNS_CONTAINER_CLASS="input-group-btn";
EditContainer.prototype.INCORRECT_VAL_CLASS="error";
EditContainer.prototype.DEF_EDIT_CONT_CLASS = "input-group";
EditContainer.prototype.VAL_INIT_ATTR = "initValue";
EditContainer.prototype.NOT_SELECTED_VAL = "null";
EditContainer.prototype.BTNS_CONTAINER_CLASS="input-group-btn";//input-group-btn

EditContainer.prototype.addButtonContainer = function(){
	this.m_buttons = new ControlContainer(this.getId()+":btn-cont","SPAN",
		{"className":this.m_btnContClassName,
			"enabled":this.getEnabled()
		}
	);	
	this.addButtonControls();
}

/*derived classes can change contol order*/
EditContainer.prototype.addButtonControls = function(){
	if (this.m_buttonOpen) this.m_buttons.addElement(this.m_buttonOpen);
	if (this.m_buttonSelect) this.m_buttons.addElement(this.m_buttonSelect);
	if (this.m_buttonClear) this.m_buttons.addElement(this.m_buttonClear);
}

EditContainer.prototype.addOption = function(opt){
	this.addElement(opt);
}

EditContainer.prototype.getIndex = function(){
	if (this.m_node.options && this.m_node.options.length){
		return this.m_node.selectedIndex;
	}
}

EditContainer.prototype.setIndex = function(ind){
	if (this.m_node.options && this.m_node.options.length>ind){
		this.m_node.selectedIndex = ind;
		this.valueChanged();
	}
}

EditContainer.prototype.getOption = function(){
	var i = this.getIndex();
	if (i>=0){
		return this.getElementByIndex(i);
	}
}

EditContainer.prototype.setValue = function(val){
	this.setAttr("value",val);	
}

EditContainer.prototype.getValue = function(){
	var v = EditContainer.superclass.getValue.call(this);
	if (v==this.NOT_SELECTED_VAL){
		v = null;
	}
	return v;
}

EditContainer.prototype.setInitValue = function(val){
	this.setAttr(this.VAL_INIT_ATTR,val);
	this.setValue(val);
}

EditContainer.prototype.getInitValue = function(){
	var v = this.getAttr(this.VAL_INIT_ATTR);
	if (v==this.NOT_SELECTED_VAL){
		v = null;
	}
	return v;	
}

EditContainer.prototype.setLabel = function(label){
	this.m_label = label;
}

EditContainer.prototype.getLabel = function(){
	return this.m_label;
}

EditContainer.prototype.setValidator = function(v){
	this.m_validator = v;
}
EditContainer.prototype.getValidator = function(){
	return this.m_validator;

}

EditContainer.prototype.getButtons = function(){
	return this.m_buttons;
}

EditContainer.prototype.setNotValid = function(erStr){
	DOMHelper.addClass(this.m_node,this.INCORRECT_VAL_CLASS);
	this.getErrorControl().setValue(erStr);
}
EditContainer.prototype.setValid = function(){
	DOMHelper.delClass(this.m_node,this.INCORRECT_VAL_CLASS);
	if(this.getErrorControl())this.getErrorControl().clear();
}

EditContainer.prototype.toDOM = function(parent){	

	var id = this.getId();	

	this.m_container = new ControlContainer(( id? id+":cont" : null),this.m_contTagName,{
		"className":this.m_contClassName,
		"visible":this.getVisible()
		});	
	
	if (this.m_label){
		this.m_container.addElement(this.m_label);
	}

	this.m_editContainer = new Control(( id? id+":edit-cont" : null),this.m_editContTagName,{
			"className":this.m_editContClassName
			});	
	this.m_container.addElement(this.m_editContainer);
	this.m_container.toDOM(parent);
	
	EditContainer.superclass.toDOM.call(this,this.m_editContainer.getNode());
	
	//error
	this.m_errorControl = new ErrorControl( id? id+":error" : null);
	this.m_errorControl.toDOM(this.m_editContainer.getNode());
	
	if (this.m_buttons && !this.m_buttons.isEmpty()){
		this.m_buttons.toDOMAfter(this.getNode());
	}
}

EditContainer.prototype.delDOM = function(){
	EditContainer.superclass.delDOM.call(this);
	
	if (this.m_buttons){
		this.m_buttons.delDOM();
	}
	if (this.m_errorControl){
		this.m_errorControl.delDOM();
	}
	
	if (this.m_editContainer){
		this.m_editContainer.delDOM();
	}
	
	if (this.m_container){
		this.m_container.delDOM();
	}
}

EditContainer.prototype.setVisible = function(visible){
	if (this.m_container){
		this.m_container.setVisible(visible);
	}
	if (this.m_edit_container){
		this.m_edit_container.setVisible(visible);
	}

	if (this.m_label){
		this.m_label.setVisible(visible);
	}
	if (this.m_buttons){
		this.m_buttons.setVisible(visible);
	}
	EditContainer.superclass.setVisible.call(this,visible);
}

EditContainer.prototype.setEnabled = function(enabled){
	if (this.m_buttons){
		this.m_buttons.setEnabled(enabled);
	}
	EditContainer.superclass.setEnabled.call(this,enabled);
}

EditContainer.prototype.reset = function(){
	var i = 0;
	if (this.getNotSelectedLast()){
		i = this.getCount()-1;
	}
	this.setIndex(i);
	if(this.m_onReset)this.m_onReset();
}

EditContainer.prototype.isNull = function(){
	var v = this.getValue();
	return (!v || v==this.NOT_SELECTED_VAL);
}

EditContainer.prototype.getModified = function(){
	return (this.getValue() != this.getInitValue());
}

EditContainer.prototype.clear = function(){
	for (var id in this.m_elements){
		DOMHelper.delNode(this.m_elements[id].m_node);
	}
	this.m_elements = {};
}

EditContainer.prototype.getAddNotSelected = function(){
	return this.m_addNotSelected;
}
EditContainer.prototype.setAddNotSelected = function(v){
	this.m_addNotSelected = v;
}

EditContainer.prototype.getNotSelectedLast = function(){
	return this.m_notSelectedLast;
}
EditContainer.prototype.setNotSelectedLast = function(v){
	this.m_notSelectedLast = v;
}

EditContainer.prototype.getOptionClass = function(){
	return this.m_optionClass;
}
EditContainer.prototype.setOptionClass = function(v){
	this.m_optionClass = v;
}

EditContainer.prototype.getIsRef = function(){
	return false;
}

EditContainer.prototype.getFormatFunction = function(){
	return this.m_formatFunction;
}
EditContainer.prototype.setFormatFunction = function(v){
	this.m_formatFunction = v;
}
EditContainer.prototype.getContTagName = function(){
	return this.m_contTagName;
}
EditContainer.prototype.setContTagName = function(v){
	this.m_contTagName = v;
}
EditContainer.prototype.getContClassName = function(){
	return this.m_contClassName;
}
EditContainer.prototype.setContClassName = function(v){
	this.m_contClassName = v;
}
EditContainer.prototype.getEditContClassName = function(){
	return this.m_editContClassName;
}
EditContainer.prototype.setEditContClassName = function(v){
	this.m_editContClassName = v;
}
EditContainer.prototype.getEditContTagName = function(){
	return this.m_editContTagName;
}
EditContainer.prototype.setEditContTagName = function(v){
	this.m_editContTagName = v;
}

EditContainer.prototype.getOnSelect = function(){
	return this.m_onSelect;
}
EditContainer.prototype.setOnSelect = function(v){
	this.m_onSelect = v;
}
EditContainer.prototype.getInputEnabled = function(){
	return this.getEnabled();
}
EditContainer.prototype.setInputEnabled = function(v){
	this.setEnabled(v);
}

/*
stub
*/
EditContainer.prototype.valueChanged = function(){
}

EditContainer.prototype.setButtonOpen = function(v){
	this.m_buttonOpen = v;
	if (this.m_buttonOpen && this.m_buttonOpen.setEditControl){
		this.m_buttonOpen.setEditControl(this);
	}
}
EditContainer.prototype.getButtonOpen = function(){
	return this.m_buttonOpen;
}

EditContainer.prototype.setButtonClear = function(v){
	this.m_buttonClear = v;
	if (this.m_buttonClear && this.m_buttonClear.setEditControl){
		this.m_buttonClear.setEditControl(this);
	}	
}
EditContainer.prototype.getButtonClear = function(){
	return this.m_buttonClear;
}

EditContainer.prototype.setButtonSelect = function(v){
	this.m_buttonSelect = v;
	if (this.m_buttonSelect && this.m_buttonSelect.setEditControl){
		this.m_buttonSelect.setEditControl(this);
	}		
}
EditContainer.prototype.getButtonSelect = function(){
	return this.m_buttonSelect;
}

EditContainer.prototype.getButtons = function(){
	return this.m_buttons;
}

EditContainer.prototype.getErrorControl = function(){
	return this.m_errorControl;
}
EditContainer.prototype.setErrorControl = function(v){
	this.m_errorControl = v;
}

EditContainer.prototype.setBtnContClassName = function(v){
	this.m_btnContClassName = v;
}
EditContainer.prototype.getBtnContClassName = function(){
	return this.m_btnContClassName;
}

EditContainer.prototype.setOnReset = function(v){
	this.m_onReset = v;
}
EditContainer.prototype.getOnReset = function(){
	return this.m_onReset;
}

EditContainer.prototype.validate = function(){
	var res = true;
	if(this.m_validator){
		try{
			this.setValid();
			var v = this.getValue();
			this.m_validator.validate(v);
		}
		catch(e){
			this.setNotValid(e.message);
			res = false;
		}
	}
	return res;
}
