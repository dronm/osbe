/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2017
 
 * @extends Field
 * @requires core/Field.js
 * @requires core/ValidatorXML.js 
 
 * @class
 * @classdesc
 
 * @param {string} id - Field identifier
 * @param {namespace} options
 */
function FieldXML(id,options){
	options = options || {};
	options.validator = options.validator || new ValidatorXML(options);
	options.dataType = this.DT_XML;

	FieldXML.superclass.constructor.call(this,id,options);
}
extend(FieldXML,Field);

FieldXML.prototype.getValueXHR = function(){
	var xml = this.getValue();
	if(xml){
		var serializer = new XMLSerializer();
		return serializer.serializeToString(xml);
	}
}

FieldXML.prototype.setValue = function(id,v){
	if (!v && typeof(id)=="object"){
		this.m_value = id;
		
	}else if (!v && typeof(id)=="string" && id.length){		
		this.m_value = DOMHelper.xmlDocFromString(id);
	}
	else if (v){
		this.m_value = v;
	}
}

FieldXML.prototype.isEmpty = function(val,checkNull){

	return !(typeof val === "object" && val instanceof EditXML && val.childNodes && val.childNodes[0].childNodes && val.childNodes[0].childNodes.length);
}

