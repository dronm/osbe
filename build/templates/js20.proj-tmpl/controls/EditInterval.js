/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>,2012
 
 * @class
 * @classdesc Basic visual editable control
 
 * @extends EditDate
 
 * @requires core/extend.js
 * @requires controls/EditDate.js
 * @requires core/AppWin.js     
 
 * @param string id 
 * @param {object} options
 * @param {Validator} [options.validator=ValidatorDateTime] 
 * @param {string} [options.editMask=App.getDateTimeEditMask]
 * @param {string} [options.dateFormat=App.getDateTimeFormat] 
 */
function EditInterval(id,options){
	options = options || {};
	
	options.validator = options.validator || new ValidatorInterval(options);
	options.editMask = options.editMask || this.DEF_EDIT_MASK;
	
	EditInterval.superclass.constructor.call(this,id,options);
}
extend(EditInterval,EditString);

/* constants */

EditInterval.prototype.DEF_EDIT_MASK = "99:99:99.9999";

/* public methods */

EditInterval.prototype.getModified = function(){
	return (this.getValue()!=this.getInitValue());
}

EditInterval.prototype.getValue = function(){
	return (!this.m_node.value||!this.m_node.value.length)? null:this.m_node.value;
}
EditInterval.prototype.getMiliSeconds = function(){
	return DateHelper.timeToMS(this.getValue());
}
EditInterval.prototype.getMinutes = function(){
	return this.getMiliSeconds()/1000;
}
