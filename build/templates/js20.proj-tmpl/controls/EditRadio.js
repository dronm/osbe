/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>,2016

 * @class
 * @classdesc grid object
 
 * @extends EditString

 * @requires core/extend.js  
 * @requires controls/WindowQuestion.js
 * @requires controls/EditString.js     
 
 * @param {string} id Object identifier
 * @param {object} options
 * @param {string} [options.labelClassName=control-label col-lg-11]
 * @param {string} [options.editContClassName=input-group col-lg-1]
 * @param {bool} [options.checked=false] 
 */
function EditRadio(id,options){
	options = options || {};
	
	options.type = options.type || "radio";
	options.cmdClear = false;
	
	
	var bs_col = window.getApp().getBsCol();	
	options.labelClassName = (options.labelClassName!=undefined)? options.labelClassName : ("control-label "+(bs_col+"11"));	
	options.editContClassName = (options.editContClassName!=undefined)? options.editContClassName : ("input-group "+bs_col+"1");
	
	EditRadio.superclass.constructor.call(this,id,options);
	
	
	if (options.value && CommonHelper.isIE()){
		//ie hack
		this.m_node.value = options.value;
	}
	
	if (options.checked){
		this.setChecked(options.checked);
	}
	
}
extend(EditRadio,EditString);

/* constants */
EditRadio.prototype.ATTR_DISABLED = "disabled";//

/* public */
EditRadio.prototype.setChecked = function(checked){
	this.m_node.checked = checked;
}
EditRadio.prototype.getChecked = function(){
	return this.m_node.checked;
}
