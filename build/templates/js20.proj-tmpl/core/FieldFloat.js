/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016

 * @extends Field
 * @requires core/Field.js
 * @requires core/ValidatorFloat.js   
 
 * @class
 * @classdesc
 
 * @param {string} id - Field identifier
 * @param {Object} options
 */
function FieldFloat(id,options){
	options = options || {};
	options.validator = options.validator || new ValidatorFloat(options);
	options.dataType = options.dataType || this.DT_FLOAT;
	
	FieldFloat.superclass.constructor.call(this,id,options);
}
extend(FieldFloat,Field);
