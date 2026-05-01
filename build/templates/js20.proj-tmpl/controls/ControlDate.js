/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2017

 * @extends Control
 * @requires core/extend.js
 * @requires Control.js     

 * @class
 * @classdesc
 
 * @param {string} id - Object identifier
 * @param {Object} options
 */
function ControlDate(id,tagName,options){
	options = options || {};	
	
	this.setDateFormat(options.dateFormat || window.getApp().getDateFormat());
	
	ControlDate.superclass.constructor.call(this,id,tagName,options);
}
extend(ControlDate,Control);

/* Constants */


/* private members */

/* protected*/
ControlDate.prototype.m_dateFormat;

/* public methods */
ControlDate.prototype.setValue = function(v){
	v = DateHelper.format(v,this.getDateFormat());	
	
	ControlDate.superclass.setValue.call(this,v);
}

ControlDate.prototype.setDateFormat = function(v){
	this.m_dateFormat = v;
}

ControlDate.prototype.getDateFormat = function(){
	return this.m_dateFormat;
}

