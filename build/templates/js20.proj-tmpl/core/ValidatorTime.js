/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016

 * @extends ValidatorDate
 * @requires core/ValidatorDate.js

 * @class
 * @classdesc
 
 * @param {Object} options
 */
function ValidatorTime(options){
	ValidatorTime.superclass.constructor.call(this,options);
}
extend(ValidatorTime,ValidatorDate);

ValidatorTime.prototype.correctValue = function(v){
	if (v instanceof Date) return v;
	return DateHelper.strtotime("1970-01-01T"+v);
}

/*
ValidatorTime.prototype.validate = function(v){
	if (v instanceof Date) return v;

	var time_ar = timeStr.split(":");
	var h = 0,m = 0, s = 0, ms = 0;
	if (time_ar.length>=1){
		h = parseInt(time_ar[0][0],10)*10+parseInt(time_ar[0][1],10);
	}
	if (h>=24){
		throw Error(this.ER_INVALID);
	}	
	
	if (time_ar.length>=2){
		m = parseInt(time_ar[1][0],10)*10+parseInt(time_ar[1][1],10);
	}
	if (m>=60){
		throw Error(this.ER_INVALID);
	}	
	
	if (time_ar.length>=3){
		s = parseInt(time_ar[2][0],10)*10+parseInt(time_ar[2][1],10);
	}
	if (s>=60){
		throw Error(this.ER_INVALID);
	}	
	
	if (time_ar.length>=4){
		ms = parseInt(time_ar[3][0],10)*10+parseInt(time_ar[3][1],10);
	}
	if (ms>=1000){
		throw Error(this.ER_INVALID);
	}	
	
	return v;
}
*/
