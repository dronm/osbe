/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2017

 * @extends EditInt
 
 * @requires core/extend.js
 * @requires controls/EditInt.js     

 * @class
 * @classdesc
 
 * @param {string} id - Object identifier
 * @param {Object} options
 */
function EditKPP(id,options){
	options = options || {};	
	
	options.type = "text";	
	options.cmdSelect = false;
	options.maxLength =  this.LEN;
	//options.regExpression = /^[0-9]+$/;
	options.fixLength = true;
	options.events = options.events || {};
	
	var self = this;
	options.events.change = function(){
		self.validate();
	}
	
	EditKPP.superclass.constructor.call(this,id,options);
}
extend(EditKPP,EditNum);

/* Constants */
EditKPP.prototype.m_isEnterprise;

/* private members */
EditKPP.prototype.LEN = 9;

/* protected*/


/* public methods */
/*
EditKPP.prototype.validate = function(){
	var v = this.getValue();
	if (v && v.length && !/^[0-9]+$/.test(v)){
		this.setNotValid("Неверное значение!");
	}
	else{
		this.setValid();
	}
}
*/
