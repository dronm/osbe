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
*/

/* constructor */
function ControlContainer(id,tagName,options){
	options = options || {};
	
	ControlContainer.superclass.constructor.call(this,id,tagName,options);
	if (options.elements && is_array(options.elements)){
		this.m_elements = {};
		for(var i=0;i<options.elements.length;i++){
			this.addElement(options.elements[i]);
		}
	}
	else{
		this.m_elements = options.elements||{};
	}
	
	if (options.addElement){
		options.addElement.call(this);
	}	
}
extend(ControlContainer,Control);

/* constants */
ControlContainer.prototype.ER_NO_ELEMENT = "Elemnt '%s' not found.";

/* private members */
ControlContainer.prototype.m_elements;

/* private methods */

/* public methods */
ControlContainer.prototype.elementExists = function(id){
	return (this.m_elements[id]!=undefined);
}
ControlContainer.prototype.checkElement = function(id){
	if (!this.elementExists(id)){
		throw new Error(format(this.ER_NO_ELEMENT,Array(id)));
	}
	return true;
}
ControlContainer.prototype.isEmpty = function(){
	return isEmpty(this.m_elements);
}

ControlContainer.prototype.getElementById = function(id){
	return this.getElement(id);
}

ControlContainer.prototype.getElement = function(id){
	this.checkElement(id);
	return this.m_elements[id];
}

ControlContainer.prototype.getElementByIndex = function(ind){
	var i=0;
    for (var k in this.m_elements){
		if (i==ind){
			return this.m_elements[k];
		}
      i++;
	}
}

ControlContainer.prototype.setElementById = function(id, elem){
	this.m_elements[id] = elem;
}
ControlContainer.prototype.addElement = function(new_elem){	
	var id = new_elem.getId();
	if (!id){
		id = uuid();
	}
	this.setElementById(id,new_elem);
}
ControlContainer.prototype.appendToNode = function(parent){
	for (var elem_id in this.m_elements){
		if (this.m_elements[elem_id]){
			this.m_elements[elem_id].appendToNode(this.m_node);
		}
	}
	parent.appendChild(this.m_node);
}
/*
ControlContainer.prototype.setId = function(id){
	this.m_node.id = id;
}
ControlContainer.prototype.getId = function(){
	return this.m_node.id;
}
*/
ControlContainer.prototype.elementsToDOM = function(){
	var elem;
	for (var elem_id in this.m_elements){
		elem = this.m_elements[elem_id];
		if(elem){
			elem.toDOM(this.m_node);
		}
	}
}

ControlContainer.prototype.toDOMAfter = function(node){
	ControlContainer.superclass.toDOMAfter.call(this,node);
	this.elementsToDOM();
}
ControlContainer.prototype.toDOM = function(parent){
	this.elementsToDOM();
	this.nodeToDOM(parent);
	this.eventsToDOM();	
}
ControlContainer.prototype.clear = function(){
	for (var elem_id in this.m_elements){
		if (this.m_elements[elem_id])this.m_elements[elem_id].delDOM();
	}
	this.m_elements = {};
}
ControlContainer.prototype.getCount = function(){
	var len=0;
    for (var k in this.m_elements)
      len++;
  return len;
}
ControlContainer.prototype.removeDOM = function(){		
	for (var elem_id in this.m_elements){
		if(this.m_elements[elem_id]){
			this.m_elements[elem_id].removeDOM();
		}
	}
	ControlContainer.superclass.removeDOM.call(this);
}
ControlContainer.prototype.getValueAsObj= function(){
	var data={};
	for (var elem_id in this.m_elements){
		data[elem_id] = this.m_elements[elem_id].getValueAsObj();
	}	
	return data;
}
ControlContainer.prototype.setValueFromObj= function(obj){
	for (var elem_id in obj){
		if (this.m_elements[elem_id]){
			this.m_elements[elem_id].setValueFromObj(obj);
		}
	}	
}

ControlContainer.prototype.setEnabled = function(en){
	for (var elem_id in this.m_elements){
		if (this.m_elements[elem_id]){
			this.m_elements[elem_id].setEnabled(en);
		}
	}		
	ControlContainer.superclass.setEnabled.call(this,en);
}

ControlContainer.prototype.setVisible = function(v){
	for (var elem_id in this.m_elements){
		if (this.m_elements[elem_id]){
			this.m_elements[elem_id].setVisible(v);
		}
	}		
	ControlContainer.superclass.setVisible.call(this,v);
}

ControlContainer.prototype.serialize = function(){
	var o = {};
	o.elements = {};
	for (var elem_id in this.m_elements){
		if (this.m_elements[elem_id]){
			o.elements[elem_id] = this.m_elements[elem_id].serialize();
		}
	}	
	return ControlContainer.superclass.serialize.call(this,o);
}
ControlContainer.prototype.unserialize = function(str){
	var o = ControlContainer.superclass.unserialize.call(this,str);
	for (var id in o.elements){
		if (this.m_elements[id]){
			this.m_elements[id].unserialize(o.elements[id]);
		}
	}
}

ControlContainer.prototype.delElement = function(elId){
	var res = false;
	for (var elem_id in this.m_elements){		
		if (this.m_elements[elem_id]){
			if (this.m_elements[elem_id].getId() == elId){				
				this.m_elements[elem_id].removeDOM();
				delete this.m_elements[elem_id];
				this.m_elements[elem_id] = undefined;
				res = true;
				break;
			}
		}
	}
	return res;
}


