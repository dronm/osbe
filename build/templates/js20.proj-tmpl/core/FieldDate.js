/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016
 
 * @extends Field
 * @requires core/Field.js
 * @requires core/ValidatorDate.js  
 
 * @class
 * @classdesc
 
 * @param {string} id - Field identifier
 * @param {namespace} options
 */
function FieldDate(id,options){
	options = options || {};
	options.validator = options.validator || new ValidatorDate(options);
	options.dataType = options.dataType || this.DT_DATE;
	
	FieldDate.superclass.constructor.call(this,id,options);
}
extend(FieldDate,Field);

FieldDate.prototype.XHR_FORMAT = "Y-m-d";

FieldDate.prototype.getValueXHR = function(){
	var v = this.getValue();
	return v? DateHelper.format(v, this.XHR_FORMAT):null;
}
