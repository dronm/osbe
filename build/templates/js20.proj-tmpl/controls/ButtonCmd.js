/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>,2012

 * @class
 * @classdesc Basic command button

 * @extends Button

 * @requires core/extend.js  
 * @requires controls/Button.js

 * @param {string} id Object identifier
 * @param {namespace} options
 * @param {string} [options.caption=this.DEF_CAPTION]
 * @param {string} [options.title=this.DEF_HINT]
*/
function ButtonCmd(id,options){
	options = options || {};
	
	options.colorClass = options.colorClass || "btn-primary";
	options.className = "btn "+options.colorClass+" btn-cmd";
	
	options.caption = options.caption || this.DEF_CAPTION;	

	ButtonCmd.superclass.constructor.call(this,id,options);
}
extend(ButtonCmd,Button);

ButtonCmd.prototype.DEF_CAPTION = "";
