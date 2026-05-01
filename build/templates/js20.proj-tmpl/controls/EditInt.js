/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>
 
 * @class
 * @classdesc 
 
 * @extends EditNum
  
 * @requires core/DOMHelper.js
 * @requires core/EventHelper.js
 * @requires controls/EditString.js

 * @param {string} id Object identifier
 * @param {object} options
 * @param {int} options.attrs.min
 * @param {int} options.attrs.max
 * @param {bool} options.cmdSelect|options.cmdCalc=false
 */
function EditInt(id,options){
	options = options||{};
		
	options.validator = options.validator || new ValidatorInt(options);

	options.attrs = options.attrs || {};
	
	if (options.minValue){
		options.attrs.min = options.minValue;
	}

	if (options.maxValue){
		options.attrs.max = options.maxValue;
	}
	
	options.cmdClear = (options.cmdClear!=undefined)? options.cmdClear:false;
	
	options.cmdSelect = (options.cmdSelect!=undefined)? options.cmdSelect : options.cmdCalc;
//console.log("EditInt id="+id + " cmdSelect="+ options.cmdSelect)	
	if (options.cmdSelect==undefined || options.cmdSelect===true){
		options.buttonSelect = options.buttonSelect || new ButtonCalc(id+":btn_open",
		{"winObj":options.winObj,
		"enabled":options.enabled,
		"editControl":this
		});
	}
	
	EditInt.superclass.constructor.call(this,id,options);	
		
	if (this.m_validator && !this.m_validator.getUnsigned()){
		this.m_allowedChars.push(45);//Sign
	}
	
}

extend(EditInt,EditNum);

/* constants */


