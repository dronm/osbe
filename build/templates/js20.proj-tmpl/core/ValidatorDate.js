/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016

 * @extends Validator
 * @requires core/Validator.js

 * @class
 * @classdesc
 
 * @param {Object} options
 */
function ValidatorDate(options){	
	
	ValidatorDate.superclass.constructor.call(this,options);
}
extend(ValidatorDate,Validator);

ValidatorDate.prototype.correctValue = function(v){
	var ret = null;
	/*if (v===undefined){
		ret = DateHelper.time();
	}*/
	if (v && typeof v =="object"){
		ret = v;
	}
	else if(v){
		ret = DateHelper.strtotime(v);
	}
	return ret;
}

ValidatorDate.prototype.validate = function(val){
	ValidatorDate.superclass.validate.call(this,val);	
	if (this.getRequired() && val==undefined){
		throw new Error(this.ER_EMPTY);
	}
}

