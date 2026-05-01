/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016

 * @extends ValidatorInt
 * @requires core/ValidatorInt.js

 * @class
 * @classdesc
 
 * @param {Object} options
 */

function ValidatorFloat(options){
	ValidatorFloat.superclass.constructor.call(this,options);
}
extend(ValidatorFloat,ValidatorInt);

/*
ValidatorFloat.prototype.validate = function(v){
	//if (isNaN(n)){
		//throw new Error(this.ER_INVALID);
	//}
	//v = parseFloat(v);
}
*/

ValidatorFloat.prototype.toNumber = function(v){
	return parseFloat(v);
}

ValidatorFloat.prototype.correctValue = function(v){	
	var this_dig_sep;
	var v_str = String(v);
	//possable separators: . AND ,
	if(v_str.indexOf(".")>=0){
		this_dig_sep = ".";	
	}
	else if(v_str.indexOf(",")>=0){
		this_dig_sep = ",";	
	}
	if(this_dig_sep){
		var js_sep = ".";//CommonHelper.getDecimalSeparator();	
		//change this digit decimal separator to js decimal separator
		if (js_sep!=this_dig_sep){
			v = v_str.replace(this_dig_sep,js_sep);
		}
	}
		
	return this.toNumber(v);
}
