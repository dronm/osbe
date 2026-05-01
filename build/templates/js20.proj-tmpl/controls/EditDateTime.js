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
function EditDateTime(id,options){
	options = options || {};
	
	options.validator = options.validator || new ValidatorDateTime(options);
	options.editMask = options.editMask || window.getApp().getDateTimeEditMask();
	options.dateFormat = options.dateFormat || window.getApp().getDateTimeFormat();
	//console.log("EditDateTime options.editMask="+options.editMask+" options.dateFormat="+options.dateFormat)
	//options.editContClassName = options.editContClassName || "input-group "+options.app.getBsCol()+"4";
	
	EditDateTime.superclass.constructor.call(this,id,options);
}
extend(EditDateTime,EditDate);

/* constants */

/* public methods */
