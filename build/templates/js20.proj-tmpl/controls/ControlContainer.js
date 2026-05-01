/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2014
 
 * @class
 * @classdesc Basic visual control, maps html tag 
 
 * @requires core/DOMHelper.js
 * @requires core/EventHelper.js
 * @requires core/CommonHelper.js    
  
 * @param {string} id - html tag id
 * @param {string} tagName - html tag name
 * @param {object} options
 * @param {Array} options.elements Array of Control
 */
function ControlContainer(id,tagName,options){
	/**
	 * Container id must be!!!
	 */
	if (!id){
		id = CommonHelper.uniqid();
	}
	options = options || {};
	ControlContainer.superclass.constructor.call(this,id,tagName,options);
	
	this.m_elements = {};
	if (options.elements&&CommonHelper.isArray(options.elements)&&options.elements.length){
		this.addElements(options.elements);
		//if (options.template){
			/**
			 * element control were created BEFORE this.m_node,
			 * but template exists and there might be this element id!
			 */
			 /*
			 var res = DOMHelper.getElementsByAttr(options.elements[i].getId(), this.getNode(), "id",true);
			 if (res.length){
			 	res[0].parentNode.replaceChild(options.elements[i].getNode(),res[0]);
			 }
			 */
		//}
	}
	if (options.addElement){
		options.addElement.call(this);
	}
}
extend(ControlContainer,Control);

/* constants */


/* private members */
ControlContainer.prototype.m_elements;

/* private methods */

/* public methods */
ControlContainer.prototype.elementExists = function(id){
	return (this.m_elements[id]!=undefined);
}
ControlContainer.prototype.checkElement = function(id){
	if (!this.elementExists(id)){
		throw new Error(CommonHelper.format(this.ER_NO_ELEMENT,Array(id,this.getId())));
	}
	return true;
}
ControlContainer.prototype.isEmpty = function(){
	return CommonHelper.isEmpty(this.m_elements);
}

ControlContainer.prototype.getElement = function(id){
	//this.checkElement(id);
	return this.m_elements[id];
}

ControlContainer.prototype.getElements = function(){
	return this.m_elements;
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

ControlContainer.prototype.setElement = function(id,elem){
	this.m_elements[id || CommonHelper.uniqid()] = elem;
}

ControlContainer.prototype.delElement = function(elName){
	var res = false;
	for (var elem_id in this.m_elements){		
		if (this.m_elements[elem_id]){
			if (this.m_elements[elem_id].getName() == elName){				
				this.m_elements[elem_id].delDOM();
				delete this.m_elements[elem_id];
				this.m_elements[elem_id] = undefined;
				res = true;
				break;
			}
		}
	}
	return res;
}

ControlContainer.prototype.addElement = function(ctrl){	
	if (ctrl&&ctrl.getName)this.setElement(ctrl.getName(),ctrl);
}

/**
 * @param {Array} a
 */
ControlContainer.prototype.addElements = function(a){
	for(var i=0;i<a.length;i++){
		//if (options.template){
			/**
			 * element control were created BEFORE this.m_node,
			 * but template exists and there might be this element id!
			 */
			 /*
			 var res = DOMHelper.getElementsByAttr(options.elements[i].getId(), this.getNode(), "id",true);
			 if (res.length){
			 	res[0].parentNode.replaceChild(options.elements[i].getNode(),res[0]);
			 }
			 */
		//}

		this.addElement(a[i]);
	}
}

ControlContainer.prototype.appendToNode = function(parent){
	for (var elem_id in this.m_elements){
		this.m_elements[elem_id].appendToNode(this.m_node);
	}
	parent.appendChild(this.m_node);
}

ControlContainer.prototype.elementsToDOM = function(){
	var elem;
	var focus_elem;
	for (var elem_id in this.m_elements){
		elem = this.m_elements[elem_id];
		if (elem){
			elem.toDOM(this.m_node);
			if (!focus_elem && elem.getAttr("autofocus")){
				focus_elem = elem;
			}
		}
	}
	return focus_elem;
}

ControlContainer.prototype.toDOMAfter = function(node){
	ControlContainer.superclass.toDOMAfter.call(this,node);
	this.elementsToDOM();
}
ControlContainer.prototype.toDOMBefore = function(node){
	ControlContainer.superclass.toDOMBefore.call(this,node);
	this.elementsToDOM();
}

ControlContainer.prototype.toDOM = function(parent){
	var focus_elem = this.elementsToDOM();
	this.nodeToDOM(parent);	
	if (focus_elem)focus_elem.focus();
	this.eventsToDOM();	
	
	this.subscribeToSrvEvents(this.m_srvEvents);		
}

ControlContainer.prototype.clear = function(){
	for (var elem_id in this.m_elements){
		if (this.m_elements[elem_id])this.m_elements[elem_id].delDOM();
	}
	this.m_elements = {};
}

ControlContainer.prototype.getCount = function(){
	var len=0;
	for (var k in this.m_elements)if(this.m_elements[k])len++;
	
	return len;
}
ControlContainer.prototype.delDOM = function(){		
	for (var elem_id in this.m_elements){
		if (this.m_elements[elem_id])this.m_elements[elem_id].delDOM();
	}
	ControlContainer.superclass.delDOM.call(this);
}

ControlContainer.prototype.setEnabled = function(v){
	for (var elem_id in this.m_elements){
		if (this.m_elements[elem_id])
			this.m_elements[elem_id].setEnabled(v);
	}		
	ControlContainer.superclass.setEnabled.call(this,v);
}

ControlContainer.prototype.setTempDisabled = function(){
	this.m_tempDisabledList = [];
	for (var elem_id in this.m_elements){
		if (this.m_elements[elem_id]&&this.m_elements[elem_id].getEnabled()){
			this.m_tempDisabledList.push(elem_id);
			this.m_elements[elem_id].setEnabled(false);
		}
	}		
}
ControlContainer.prototype.setTempEnabled = function(){
	for(i=0;i<this.m_tempDisabledList.length;i++){
		this.m_elements[this.m_tempDisabledList[i]].setEnabled(true);
	}
}

ControlContainer.prototype.setLocked = function(v){
	for (var elem_id in this.m_elements){
		if (this.m_elements[elem_id])this.m_elements[elem_id].setLocked(v);
	}		
	ControlContainer.superclass.setLocked.call(this,v);
}
/*
ControlContainer.prototype.setVisible = function(v){
	for (var elem_id in this.m_elements){
		this.m_elements[elem_id].setVisible(v);
	}		
	ControlContainer.superclass.setVisible.call(this,v);
}
*/
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

