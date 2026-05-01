/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016

 * @extends GridColumn
 * @requires core/extend.js 
 * @requires GridColumn.js

 * @class
 * @classdesc
 
 * @param {int} {options.precision=DEF_PRECISION}
 */
function GridColumnByte(options){
	options = options || {};	
	
	this.m_precision = options.precision || this.DEF_PRECISION;
	GridColumnByte.superclass.constructor.call(this,options);
}
extend(GridColumnByte,GridColumn);

/* Constants */
GridColumnByte.prototype.DEF_PRECISION = 2;

/* private members */

/* protected*/


/* public methods */
GridColumnByte.prototype.formatVal = function(v){
	//var n = v;
	//n = CommonHelper.numberFormat(v, this.m_precision, CommonHelper.getDecimalSeparator(), this.DEF_SEPAR);
	if (isNaN(v)){
		return "";
	}
	else{
		return CommonHelper.byteForamt(v, this.m_precision);
	}
	
}
