/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2017

 * @extends FieldJSON
 * @requires core/FieldJSON.js
 
 * @class
 * @classdesc
 
 * @param {string} id - Field identifier
 * @param {object} options
 */
function FieldJSONB(id,options){
	options = options || {};
	options.dataType = this.DT_JSONB;

	FieldJSONB.superclass.constructor.call(this,id,options);
}
extend(FieldJSONB,FieldJSON);
