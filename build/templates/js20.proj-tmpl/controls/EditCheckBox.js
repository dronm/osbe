/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2012
 
 * @class
 * @classdesc Visual check box control
 
 * @extends Edit
 
 * @requires core/ValidatorBool.js
 * @requires controls/Edit.js

 * @param {string} id
 * @param {object} options
 * @param {string} [options.labelAlign=this.DEF_LABEl_ALIGN]
 * @param {string} [options.labelClassName=this.DEF_LABEL_CLASS+col-this.DEF_LABEl_COL_WD]
 * @param {string} [options.contClassName=this.DEF_EDIT_CONT_CLASS+col-this.DEF_EDIT_CONT_COL_WD]   

 */
function EditCheckBox(id,options){
	options = options || {};
	
	options.validator = options.validator || new ValidatorBool(options);

	options.cmdClear = false;

	if (options.checked!=undefined){
		options.value = options.checked;
	}

	
	var bs_col = window.getBsCol();	
	options.labelClassName = (options.labelClassName!==undefined)? options.labelClassName : (this.DEF_LABEL_CLASS+" "+bs_col+this.DEF_LABEL_COL_WD);
	options.editContClassName = (options.editContClassName!==undefined)? options.editContClassName : (this.DEF_EDIT_CONT_CLASS+" "+bs_col+this.DEF_EDIT_CONT_COL_WD);
	
	EditCheckBox.superclass.constructor.call(this,id,options);
		
}
extend(EditCheckBox,Edit);

/* constants */
EditCheckBox.prototype.DEF_INPUT_TYPE = "checkbox";
EditCheckBox.prototype.DEF_LABEL_CLASS = "control-label";
EditCheckBox.prototype.DEF_LABEL_COL_WD = "11";
EditCheckBox.prototype.DEF_EDIT_CONT_COL_WD = "1";

/* public methods */
EditCheckBox.prototype.setChecked = function(checked){
	this.m_node.checked = checked;
	if (this.m_eventFuncs && this.m_eventFuncs.change){
		this.m_eventFuncs.change();
	}	
}
EditCheckBox.prototype.getChecked = function(){
	return this.m_node.checked;
}
EditCheckBox.prototype.getValue = function(){
	return this.getChecked();
}
EditCheckBox.prototype.setValue = function(val){		
	this.setChecked(this.getValidator().correctValue(val));
}

EditCheckBox.prototype.switchValue = function(){		
	this.setValue(!this.getValue());
}

EditCheckBox.prototype.getInitValue = function(val){
	return (this.getAttr(this.VAL_INIT_ATTR)=="true");
}

