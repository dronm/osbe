/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2017

 * @requires core/extend.js  

 * @class
 * @classdesc
 
 * @param {string} id - Object identifier
 * @param {object} options
 * @param {string} [options.tagName=DEF_TAG_NAME]
 * @param {Object} [options.optionClass=EditSelectOption]
 * @param {function} options.onSelect
 */
function EditSelect(id,options){
	options = options || {};
	
	options.tagName = options.tagName || this.DEF_TAG_NAME;
	options.optionClass = options.optionClass || EditSelectOption;
	
	options.events = options.events || {};
	this.m_origOnChange = options.events.change;
	var self = this;
	options.events.change = function(){
		self.callOnSelect();
		if(self.m_origOnChange)self.m_origOnChange();
	}			
	this.m_initValue = options.value;
	EditSelect.superclass.constructor.call(this, id, options);
	if(this.m_initValue){
		this.setValue(this.m_initValue);
	}
}
extend(EditSelect,EditContainer);

/* constants */
EditSelect.prototype.DEF_TAG_NAME = "select";

EditSelect.prototype.selectOptionById = function(optId){
	this.m_elements[optId].getNode().selected = true;
}


EditSelect.prototype.getIndex = function(){
	if (this.m_node.options && this.m_node.options.length){
		return this.m_node.selectedIndex;
	}
}

EditSelect.prototype.setValue = function(val){
	if (val==null) val = this.NOT_SELECTED_VAL;
	
	EditSelect.superclass.setValue.call(this,val);	
	
	for(var id in this.m_elements){
		if (this.m_elements[id].getValue() == val){
			this.selectOptionById(id);
			break;
		}
	}
}

EditSelect.prototype.setIndex = function(ind){
	EditSelect.superclass.setIndex.call(this,ind);

	var i = 0;
	for(var id in this.m_elements){
		if (i == ind){
			this.selectOptionById(id);
			break;
		}
		i++;
	}		
}

/*
EditSelect.prototype.setValueByIndex = function(ind){
	var i=0;
	for(var id in this.m_elements){
		if (i==ind){
			this.setIndex(id,i);
			break;
		}
		i++;
	}
}
*/
/*
EditSelect.prototype.setValueById = function(searchId){
	var i=0;
	for(var id in this.m_elements){
		if (id==searchId){
			this.setIndex(id,i);
			break;
		}
		i++;
	}
}
*/

EditSelect.prototype.getValue = function(){	
	var v;
	if (this.getIndex()>=0){		
		var el = this.getElement(this.getIndex());
		if (el){
			v = el.getValue();			
		}
		else{
			v = this.getNode().options[this.m_node.selectedIndex].value;
		}
	}
	else{
		v = this.getAttr("value");//??? if node is not attached to DOM it returns no selectedIndex!
	}
	return (!v || v==this.NOT_SELECTED_VAL)? null:v;
}

/*
EditSelect.prototype.getValueDescr = function(){
	if (this.getIndex()>=0){
		var n = this.getNode().options[this.m_node.selectedIndex];
		if (n.childNodes && n.childNodes.length){
			return n.childNodes[0].nodeValue;
		}
	}
}
*/

/*
EditSelect.prototype.getOptionList = function(){
	var res_list = {};
	for(var id in this.m_elements){
		res_list[this.m_elements[id].getValue()] = this.m_elements[id].getDescr();
	}
	return res_list;
}
*/

EditSelect.prototype.callOnSelect = function(){
	if (this.getOnSelect()){
		this.getOnSelect().call(this);
	}
}

/**
 * Overridden
 * Select's behaviour is diferent from EditRadioGroup, since by default blocking main container element you also block all children
 * id disable Select main element children are not disabled
 */
EditSelect.prototype.setEnabled = function(v){
	if (v){
		DOMHelper.delAttr(this.getNode(),this.ATTR_DISABLED);
	}
	else{
		DOMHelper.setAttr(this.getNode(),this.ATTR_DISABLED,this.ATTR_DISABLED);
	}
}

