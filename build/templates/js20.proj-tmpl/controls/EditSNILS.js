/** Copyright (c) 2022
	Andrey Mikhalevich, Katren ltd.
 */
function EditSNILS(id,options){
	options = options || {};
	if(options.labelCaption!=""){
		options.labelCaption = options.labelCaption || "СНИЛС:";
	}
	options.title = options.title || "СНИЛС физического лица в формате ХХХ-ХХХ-ХХХ XX";	
	options.maxLength = 14;
	options.placeholder = options.placeholder || "ХХХ-ХХХ-ХХХ XX";
	
	options.formatterGetRawValue = true;
	options.formatterOptions = {
		"delimiters": ['-', '-', ' '],
		"blocks": [3, 3, 3, 2],
		"numericOnly": true
	};
	//options.editMask = "999-999-999 99";
	options.regExpression = /\d{3}-\d{3}-\d{3} \d{2}/;
	options.regExpressionInvalidMessage = "Не соответствует шаблону ХХХ-ХХХ-ХХХ XX";
	
	options.events = options.events || {};
	options.events.focus = function(){
		this.setValid();
	};
	options.events.blur = function(){
		var v = this.getValue();
		if(v && v.length && v.length!=11){
			this.setNotValid(this.getRegExpressionInvalidMessage());
		}else{
			this.setValid();
		}
	};
	
	EditSNILS.superclass.constructor.call(this,id,options);	
}
extend(EditSNILS, EditString);

