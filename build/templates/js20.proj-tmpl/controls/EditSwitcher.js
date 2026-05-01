/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2024
 
 * @class
 * @classdesc Visual switcher control
 
 * @extends Edit
 
 * @requires core/ValidatorBool.js
 * @requires controls/Edit.js

 * @param {string} id
 * @param {object} options
 * @param {bool} options.checked
 * @param {bool} options.value alias of checked
 * @param {string} [options.switchAlign=this.DEF_SWITCH_ALIGN] left|right
 * @param {string} [options.switchSize=this.DEF_SWITCH_SIZE] xl | lg |  md | sm
 * @param {string} options.labelCaption
 * @param {string} [options.labelClassName=this.DEF_LABEL_CLASS with substitutions: {{ALIGN}} && {{SIZE}}
 * @param {string} [options.contClassName=this.DEF_EDIT_CONT_CLASS+col-this.DEF_EDIT_CONT_COL_WD]   

 */

function EditSwitcher(id,options){
	options = options || {};
	
	if (options.checked === true || options.value === true){
		options.value = "checked";
	}else {
		options.value = undefined;
	}

	options.switchAlign = options.switchAlign || this.DEF_SWITCH_ALIGN;
	options.switchSize = options.switchSize || this.DEF_SWITCH_SIZE;
	let labelClassName = (options.labelClassName!==undefined)?
		options.labelClassName :
		this.DEF_LABEl_CLASS.replace("{{ALIGN}}", options.switchAlign).replace("{{SIZE}}", options.switchSize);

	options.templateOptions = options.templateOptions ||  {};
	options.templateOptions.LABEL_CAPTION = options.labelCaption;
	options.templateOptions.CHECKED = options.value;
	options.templateOptions.LABEL_CLASS_NAME = labelClassName;
	options.templateOptions.CONT_CLASS_NAME = options.contClassName!=undefined? options.contClassName : this.DEF_CONT_CLASS;
	options.templateOptions.TITLE = options.title;
	options.templateOptions.CLASS_NAME = options.className || this.DEF_CLASS;

	this.m_switchColor = options.switchColor || this.DEF_SWITCH_COLOR;
	
	EditSwitcher.superclass.constructor.call(this, id, "INPUT", options);
		
}
extend(EditSwitcher, Control);

EditSwitcher.prototype.DEF_SWITCH_ALIGN = "right";
EditSwitcher.prototype.DEF_SWITCH_SIZE = "xl";
EditSwitcher.prototype.DEF_CONT_CLASS = "form-group";
EditSwitcher.prototype.DEF_CLASS = "switcher";
EditSwitcher.prototype.DEF_LABEl_CLASS = "checkbox-inline checkbox-switchery checkbox-{{ALIGN}} switchery-{{SIZE}}";
EditSwitcher.prototype.DEF_TAG_NAME = "DIV";
EditSwitcher.prototype.VAL_INIT_ATTR = "initValue";
EditSwitcher.prototype.DEF_SWITCH_COLOR = "#2196F3";

EditSwitcher.prototype.setTitle = function(val){
	document.getElementById(this.getId()+":cont").setAttribute("title", val);
} 

EditSwitcher.prototype.setAttr = function(attrName, attrVal){
	// if(attrName == "title"){
	// 	this.setTitle(attrVal);
	// 	return;
	// }
	EditSwitcher.superclass.setAttr.call(this, attrName, attrVal);
} 

EditSwitcher.prototype.toDOM = function(parent){
	EditSwitcher.superclass.toDOM.call(this, parent);

	let id = this.getId();
	let contNode = document.getElementById(id);
	let inputs = DOMHelper.getElementsByAttr("switcher", contNode, "class", true, "input");
	if(!inputs || !inputs.length){
		throw new Error("input with switcher class not found for id:"+ this.getId());
	}
	this.m_node = inputs[0];
	let nodeName;
	let idParts = id.split(Control.prototype.NAMESPACE_SEP);
	if (idParts.length){
		nodeName = idParts[idParts.length-1];
	}else{
		nodeName = id;
	}
	this.m_node.setAttribute("name", nodeName);
	this.m_switcher = new Switchery(this.m_node, {
		"color": this.m_switchColor,
		"checked":false
	});
}

EditSwitcher.prototype.reset = function(){
	this.setValue(false);
	this.focus();
	// this.valueChanged();
	if(this.m_onReset){
		this.m_onReset();
	}
}

EditSwitcher.prototype.isNull = function(){
	return false;
}
EditSwitcher.prototype.getModified = function(){
	return (this.getValue()!=this.getInitValue());
}

EditSwitcher.prototype.getIsRef = function(){
	return false;
}

EditSwitcher.prototype.getValue = function(){
	return this.m_node.checked;
}

EditSwitcher.prototype.setValue = function(val){
	if(this.m_switcher){
		this.m_node.checked = !val;
		this.m_switcher.setPosition(true);
		if (this.m_eventFuncs && this.m_eventFuncs.change){
			this.m_eventFuncs.change();
		}	
	}
}

EditSwitcher.prototype.setInitValue = function(val){
	this.setValue(val);
	this.setAttr(this.VAL_INIT_ATTR, val);
}

EditSwitcher.prototype.getInitValue = function(){
	return this.getAttr(this.VAL_INIT_ATTR);
}

EditSwitcher.prototype.switchValue = function(){		
	this.setValue(!this.getValue());
}

EditSwitcher.prototype.setValid = function(v){
}

EditSwitcher.prototype.setNotValid = function(){
}

EditSwitcher.prototype.getValid = function(){
	return true;
}
