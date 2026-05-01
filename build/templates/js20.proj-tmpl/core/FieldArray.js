/**	
 * Array data type field
 
 * @author Andrey Mikhalevich <katrenplus@mail.ru>,2017
 
 * @class

 * @requires core/extend.js
 * @requires core/Field.js 
 * @requires core/ValidatorArray.js 

 * @param {string} id - html tag id
 * @param {Object} options
 * @param {string} options.validator

 */
function FieldArray(id,options){
	options = options || {};
	options.validator = options.validator || new ValidatorArray(options);
	options.dataType = this.DT_ARRAY;

	FieldArray.superclass.constructor.call(this,id,options);
}
extend(FieldArray,Field);

FieldArray.prototype.getValueXHR = function(){
	return ( CommonHelper.serialize(this.getValue()));
}
