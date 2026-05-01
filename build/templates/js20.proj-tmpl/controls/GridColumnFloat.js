/**
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016
 * @class
 * @classdesc Grid column Float class class
 
 * @extends GridColumn
 
 * @requires core/extend.js
 * @requires controls/GridColumn.js
 
 * @param {object} options
 * @param {int} [options.precision=DEF_PRECISION]
 */
function GridColumnFloat(options){
	options = options || {};	
	
	this.m_precision = options.precision || this.DEF_PRECISION;
	
	this.setDecimalSeparator((options.decimalSeparator!=undefined)? options.decimalSeparator:CommonHelper.getDecimalSeparator());
	this.setThousandSeparator((options.thousandSeparator!=undefined)?  options.thousandSeparator:this.DEF_THOUSAND_SEPAR);
	
	GridColumnFloat.superclass.constructor.call(this,options);
}
extend(GridColumnFloat,GridColumn);

/* Constants */
GridColumnFloat.prototype.DEF_PRECISION = 2;
GridColumnFloat.prototype.DEF_THOUSAND_SEPAR = " ";

/* private members */
GridColumnFloat.prototype.m_decimalSeparator;
GridColumnFloat.prototype.m_thousandSeparator;
/* protected*/


/* public methods */
GridColumnFloat.prototype.formatVal = function(v){
	//var n = v;
	//n = CommonHelper.numberFormat(v, this.m_precision, CommonHelper.getDecimalSeparator(), this.DEF_SEPAR);
	if (isNaN(v)){
		return "";
	}
	else{
		return CommonHelper.numberFormat(v, this.m_precision, this.getDecimalSeparator(), this.getThousandSeparator());
	}
	
}

GridColumnFloat.prototype.getDecimalSeparator = function(){
	return this.m_decimalSeparator;
}
GridColumnFloat.prototype.setDecimalSeparator = function(v){
	this.m_decimalSeparator = v;
}
GridColumnFloat.prototype.getThousandSeparator = function(){
	return this.m_thousandSeparator;
}
GridColumnFloat.prototype.setThousandSeparator = function(v){
	this.m_thousandSeparator = v;
}
