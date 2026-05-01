/* Copyright (c) 2022
 *	Andrey Mikhalevich, Katren ltd.
 */
function EditComplete(id,options){
	options = options || {};	
	
	EditComplete.superclass.constructor.call(this,id,options);
}
extend(EditComplete, EditRef);//

/* Constants */


/* private members */

/* protected*/


/* public methods */

EditComplete.prototype.getIsRef = function(){
	return false;
}

EditComplete.prototype.getValue = function(){
	return this.getNode().value;
}

EditComplete.prototype.setInitValue = function(val){
	this.setValue(val);
	this.setAttr(this.VAL_INIT_ATTR, this.getValue());
}

EditComplete.prototype.getModified = function(){
	var init_val = this.getInitValue();
	var val = this.getValue();	
	if(typeof(val) == "string" && val =="" && !init_val){
		return false;
	}
	return (val != init_val);
}

