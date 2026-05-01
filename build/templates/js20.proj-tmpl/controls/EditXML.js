/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2017

 * @extends ControlContainer
 * @requires core/extend.js
 * @requires ControlContainer.js     

 * @class
 * @classdesc
 
 * @param {string} id - Object identifier
 * @param {object} options
 * @param {object} options.XMLNodeName 
 * @param {object} options.valueXML
 */
function EditXML(id,options){
	options = options || {};	
	
	EditXML.superclass.constructor.call(this,id,options.tagName,options);
	
	if (options.valueXML){
		this.setValueXML(options.valueXML);
	}
}
extend(EditXML,ControlContainer);

/* Constants */


/* private members */

/* protected*/


/* public methods */

EditXML.prototype.getElementValueAsString = function(val){	

	if(val!=undefined && typeof val === "object" && val.getDescr){
		return val.getDescr();
	
	}else if(val!=undefined && typeof val === "object" && DateHelper.isValidDate(val)){
		return DateHelper.format(val,"Y-m-d");
		
	}else{
		return (val!=undefined)? val:"";
	}
}

EditXML.prototype.setCtrlXMLAttrs = function(xmlNode,ctrl){	
	if(ctrl.m_xmlAttrs){
		for(var xml_a_id in ctrl.m_xmlAttrs){
			xmlNode.setAttribute(xml_a_id, ctrl.m_xmlAttrs[xml_a_id]);
		}
	}

}

/**
 * appends to xmlNode children nodes
 */
EditXML.prototype.appendChildren = function(xmlDoc,xmlNode){	

	var el_v;
	for (var elem_id in this.m_elements){
		//input elements
		if (this.m_elements[elem_id] && !this.m_elements[elem_id].getAttr("notForValue")){
			el_v = this.m_elements[elem_id].getValue();
			var constr_name = el_v? el_v.constructor.name||CommonHelper.functionName(el_v.constructor) : null;
						
			//if (el_v instanceof  XMLDocument && el_v.childNodes && el_v.childNodes.length){
			if(el_v && constr_name=="XMLDocument" && el_v.childNodes && el_v.childNodes.length){
				//structure
				this.setCtrlXMLAttrs(xmlNode,this.m_elements[elem_id]);
				
				/*if(this.m_elements[elem_id].getAttr("xmlAttr")=="true")
					var attr_v_l = el_v.childNodes[0].getElementsByTagName("attrValue");
					if(attr_v_l && attr_v_l.length){
						xmlNode.setAttribute(,attr_v_l[0].textContent);
					}
				}*/
				
				xmlNode.appendChild(el_v.childNodes[0].cloneNode(true));//				
			
			//el_v instanceof  NodeList
			}else if (el_v && constr_name=="NodeList"){
				//NodeList!!! - append all by one
				for (var i=0;i<el_v.length;i++){
					xmlNode.appendChild(el_v[i].cloneNode(true));//
				}				

			//}else if (el_v instanceof  Element){
			}else if (el_v && constr_name=="Element"){
				//structure
				this.setCtrlXMLAttrs(xmlNode,this.m_elements[elem_id]);
				xmlNode.appendChild(el_v.cloneNode(true));//				
				
				
			}else if(this.m_elements[elem_id].getAttr("xmlAttr")=="true"){
				//attribute
				var attr_v = this.getElementValueAsString(el_v);
				
				//!!!Empty nodes!!!
				if(attr_v && attr_v.length){
					xmlNode.setAttribute(elem_id, attr_v);
				}
				this.setCtrlXMLAttrs(xmlNode,this.m_elements[elem_id]);
				
			}else{
				//text node				
				var chld_n_v = this.getElementValueAsString(el_v);				
				
				//!!!Empty nodes!!!
				if(chld_n_v && (!isNaN(chld_n_v)||chld_n_v.length) ){
					var chld_n = xmlDoc.createElement(elem_id);
					chld_n.appendChild(xmlDoc.createTextNode(chld_n_v)) ;
					this.setCtrlXMLAttrs(chld_n,this.m_elements[elem_id]);
					
					xmlNode.appendChild(chld_n) ;					
				}				
			}
			
		}
	}
}

/**
 * returns DOMDocument
 */
EditXML.prototype.getValueXML = function(){	

	var xml_doc = document.implementation.createDocument(null, this.getName());
	this.appendChildren(xml_doc,xml_doc.childNodes[0]);
	return xml_doc.childNodes[0].childNodes.length? xml_doc : null;
}

/**
 * returns DOMDocument
 */
EditXML.prototype.getValue = function(){	
	return this.getValueXML();
}

EditXML.prototype.setNodeAttributes = function(xml,isInit){
	if(!xml.attributes){
		return;
	}
	for (var k=0;k<xml.attributes.length;k++){
		var attr = xml.attributes[k];
		if (this.m_elements[attr.nodeName] && (!this.m_elements[attr.nodeName].getAttr||!this.m_elements[attr.nodeName].getAttr("notForValue")) ){
			if (isInit && this.m_elements[attr.nodeName].setInitValue){
				this.m_elements[attr.nodeName].setInitValue(attr.value);
			}
			else{
				this.m_elements[attr.nodeName].setValue(attr.value);
			}
		}
	}
}

/**
 * v string or XML node
 */
EditXML.prototype.setValueOrInit = function(v,isInit){
	var xml;
	
	//if(v instanceof XMLDocument && v.childNodes){
	if(v && (v.constructor.name||CommonHelper.functionName(v.constructor)) == "XMLDocument" && v.childNodes){
		xml = v.childNodes[0];
	}
	else{
		xml = v;
	}
	
	if(!xml || !xml.childNodes|| ! xml.childNodes.length){
		return;
	}
	
	var el_id,n_val;

	//attributes
	this.setNodeAttributes(xml,isInit);
	var cont_occurances = {};
	for (var i=0;i<xml.childNodes.length;i++){
		el_id = xml.childNodes[i].nodeName;
		//console.log("EditXML.prototype.setValueOrInit XML node "+el_id)
		if (this.m_elements[el_id] && (!this.m_elements[el_id].getAttr||!this.m_elements[el_id].getAttr("notForValue")) ){
			//console.log("EditXML.prototype.setValueOrInit found controle")
			if(this.m_elements[el_id].appendValueXML){
				if(!cont_occurances[el_id]){
					this.m_elements[el_id].m_container.clear();
					cont_occurances[el_id] = true;
				}
				this.m_elements[el_id].appendValueXML(xml.childNodes[i],isInit);
				
			}else{
				if(this.m_elements[el_id].setValueXML){
					//complex structute
					n_val = xml.childNodes[i];
				}else{
					n_val = xml.childNodes[i].textContent;
				}
				
				if (isInit && this.m_elements[el_id].setInitValue){
					this.m_elements[el_id].setInitValue(n_val);
				}
				else{
					this.m_elements[el_id].setValue(n_val);
				}
			}
		}
		
		//attributes
		this.setNodeAttributes(xml.childNodes[i],isInit);
	}
	
	for(el_id in cont_occurances){
		if(CommonHelper.nd(this.m_elements[el_id].getId())){
			this.m_elements[el_id].toDOM();
		}
		/*
		try{
			this.m_elements[el_id].toDOM();
		}catch(e){
			console.log(e)
			console.log("el_id="+el_id)
		}
		*/
	}
}

EditXML.prototype.setValueXML = function(v){
	this.setValueOrInit(v&&v.cloneNode? v.cloneNode(true):v, false);
}

EditXML.prototype.setValue = function(v){
	//v.cloneNode(true)
	this.setValueXML((typeof v === "string")? DOMHelper.xmlDocFromString(v) : v);
}

EditXML.prototype.setInitValue = function(v){
	this.setValueOrInit(v,true);
}

EditXML.prototype.setValid = function(){
	var list = this.getElements();
	for(var id in list){
		if (list[id] && list[id].setValid){
			list[id].setValid();
		}
	}	
}

EditXML.prototype.getModified = function(){
	var res = false;
	var list = this.getElements();
	for(var id in list){
		if (list[id] && list[id].getModified && list[id].getModified()
		&& (!list[id].getAttr||!list[id].getAttr("notForValue"))){
			res = true;
			break;
		}
	}
	return res;
}

EditXML.prototype.isNull = function(){
	var res = true;
	var list = this.getElements();
	for(var id in list){
		if (list[id] && list[id].isNull && !list[id].isNull()){
			res = false;
			break;
		}
	}
	return res;
}

EditXML.prototype.reset = function(){	
	for (var elem_id in this.m_elements){
		//input elements		
		if (this.m_elements[elem_id] && !this.m_elements[elem_id].getAttr("notForValue") && this.m_elements[elem_id].reset){
			this.m_elements[elem_id].reset();
			/*this.m_elements[elem_id].delDOM();
			delete this.m_elements[elem_id];
			this.m_elements[elem_id] = undefined;
			*/
		}
	}
}

EditXML.prototype.validate = function(){
	var res = true;
	for (var elem_id in this.m_elements){
		//input elements		
		if (this.m_elements[elem_id] && !this.m_elements[elem_id].getAttr("notForValue") && this.m_elements[elem_id].reset){
			res = ( (!this.m_elements[elem_id].validate || this.m_elements[elem_id].validate()) && res);
		}
	}
	return res;
}

EditXML.prototype.setNotValid = function(msg){
	throw new Error(msg);
}
/*
EditXML.prototype.setNotValid = function(erStr){
	DOMHelper.addClass(this.m_node,this.INCORRECT_VAL_CLASS);
	if (this.getErrorControl()){
		this.getErrorControl().setValue(erStr);
	}
	else{
		throw new Error(erStr);
	}
}
EditXML.prototype.setValid = function(){
	DOMHelper.delClass(this.m_node,this.INCORRECT_VAL_CLASS);
	if (this.getErrorControl())this.getErrorControl().clear();
}
*/

