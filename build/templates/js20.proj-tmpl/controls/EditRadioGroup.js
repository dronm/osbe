/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2012
 
 * @class
 * @classdesc 
 
 * @requires core/extend.js
 * @requires core/ControlContainer.js
 * @requires core/CommonHelper.js    
  
 * @param {string} id
 * @param {namespace} options
 * @param {bool} [options.addNotSelected=false]
 * @param {Edit} [options.optionClass=EditRadio]
 */
function EditRadioGroup(id,options){
	options = options || {};
	
	options.tagName = options.tagName || this.DEF_TAG_NAME;
	options.optionClass = options.optionClass || EditRadio;
	
	options.addNotSelected = (options.addNotSelected!=undefined)? options.addNotSelected:false;
	options.className = options.className || "row";
	
	EditRadioGroup.superclass.constructor.call(this,id, options);

}
extend(EditRadioGroup,EditContainer);

EditRadioGroup.prototype.m_label;

/* constants */
EditRadioGroup.prototype.DEF_TAG_NAME = "div";

EditRadioGroup.prototype.addElement = function(ctrl){	
	this.setElement(ctrl.getId(),ctrl);
}

/**
 * Возвращает порядковый номер выбранного элемента
 */
EditRadioGroup.prototype.getIndex = function(){
	var i = 0;
	for (var elem_id in this.m_elements){
		if (this.m_elements[elem_id].m_node.nodeName.toLowerCase()=="input"
		&& this.m_elements[elem_id].m_node.checked){
			return i;
		}
	}
}

/*
Выбирает элемент с заданным ID, с остальных выбор снимается
*/

EditRadioGroup.prototype.setValue = function(id){
	for (var elem_id in this.m_elements){
		//if (this.m_elements[elem_id].m_node.nodeName.toLowerCase()=="input"){
		this.m_elements[elem_id].getNode().checked = (this.m_elements[elem_id].getNode().value==id);
		//}
	}
}

/**
 * Выбирает элемент с заданным порядковым номером, с остальных выбор снимается
 */
EditRadioGroup.prototype.setValueByIndex = function(ind){
	var i=0;
	for (var elem_id in this.m_elements){
		if (this.m_elements[elem_id].m_node.nodeName.toLowerCase()=="input"){
			this.m_elements[elem_id].m_node.checked = (i==ind);
			i++;			
		}
	}
}

/**
 * Возвращает value выбранного элемента
 */
EditRadioGroup.prototype.getValue = function(){
	var res = null;
	for (var elem_id in this.m_elements){
		if (this.m_elements[elem_id].m_node.nodeName.toLowerCase()=="input"
		&& this.m_elements[elem_id].m_node.checked){
			res = this.m_elements[elem_id].m_node.value;
			break;
		}
	}
	return res;
}

/**
 * Возвращает descr выбранного элемента
 */
EditRadioGroup.prototype.getValueDescr = function(){
	for (var elem_id in this.m_elements){
		if (this.m_elements[elem_id].m_node.nodeName.toLowerCase()=="input"
		&& this.m_elements[elem_id].m_node.checked){
			return this.m_elements[elem_id].m_node.nodeValue;
		}
	}
}

