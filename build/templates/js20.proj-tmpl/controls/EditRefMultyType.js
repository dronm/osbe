/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2017

 * @extends EditRef
 * @requires core/extend.js
 * @requires EditRef.js     

 * @class
 * @classdesc
 
 * @param {string} id - Object identifier
 * @param {object} options
 * @param {object} options.dataTypes
 */
function EditRefMultyType(id,options){
	options = options || {};	
	
	this.m_dataTypes = options.dataTypes;
	
	EditRefMultyType.superclass.constructor.call(this,id,options);
}
extend(EditRefMultyType,EditRef);

/* Constants */


/* private members */
EditRefMultyType.prototype.m_dataType;
EditRefMultyType.prototype.m_dataTypes;

/* protected*/


/* public methods */
EditRefMultyType.prototype.setValue = function(v){
	EditRefMultyType.superclass.setValue(this,v);
}

EditRefMultyType.prototype.setDataType = function(v){
	if (!this.m_dataTypes[v]){
		throw new Error(CommonHelper.format(this.ER_TYPE_NOT_FOUND,v));
	}
	
	this.m_dataType = v;
	this.m_dataTypes[v];
	
}
