/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016

 * @extends EditSelectOption
 * @requires core/extend.js
 * @requires EditSelectOption.js     

 * @class
 * @classdesc
 
 * @param {object} options
 */
function EditSelectOptionRef(id,options){
	options = options || {};	
	
	EditSelectOptionRef.superclass.constructor.call(this,id,options);
}
extend(EditSelectOptionRef,EditSelectOption);

/* Constants */


/* private members */

/* protected*/


/* public methods */
EditSelectOptionRef.prototype.getValue = function(){
	var str = EditSelectOptionRef.superclass.getValue.call(this);
	return CommonHelper.unserialize(str);
}
EditSelectOptionRef.prototype.setValue = function(keys){
	var str = CommonHelper.serialize(keys);
	EditSelectOptionRef.superclass.setValue.call(this,str);
}


