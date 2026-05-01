/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2012
 
 * @class
 * @classdesc Visual Edit string control
 
 * @extends Edit
 
 * @requires core/ValidatorString.js
 * @requires controls/Edit.js
 * @requires controls/ButtonClear.js 

 * @param {string} id
 * @param {object} options
 * @param {Validator} [options.validator=ValidatorString] 
 * @param {boolean} [options.cmdClear=true]
 * @param {boolean} [options.cmdSmClear=false] 
 * @param {Button} [options.buttonClear=ButtonClear]

 */
function EditString(id,options){
	options = options || {};
	options.validator = options.validator || new ValidatorString(options);
	
	var w = window.getWidthType();
	if (
	(w=="sm" && options.cmdSmClear===true)
	|| (w!="sm" && options.cmdClear!==false)
	){
		options.buttonClear = options.buttonClear || new ButtonClear(id+":btn_clear",{
				"editControl":this,
				"enabled":options.enabled,
				"onClear":options.onClear
		});
	}
	EditString.superclass.constructor.call(this,id,options);
}
extend(EditString,Edit);

/* constants */
EditString.prototype.ATTR_DISABLED = "readOnly";//


/* public methods */
EditString.prototype.setValue = function(val){
	if (val==undefined)return;
	EditString.superclass.setValue.call(this,val);
}

