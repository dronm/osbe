/** 
 * @author Andrey Mikhalevich <katrenplus@mail.ru>,2012,2019
 * @class
 * @classdesc phone edit control
 
 * @extends EditString

 * @requires controls/EditString.js

 * @param {string} id 
 * @param {Object} options
 * @param {string} options.editMask
 */
 
function EditPhone(id,options){
	options = options || {};
	
	options.editMask = options.editMask || window.getApp().getPhoneEditMask();
	
	options.events = options.events || {};
	
	options.formatterGetRawValue = true;
	options.formatterOptions = {
		"prefix": "+7",
		"delimiter": "-",
		"phone": true,
		"phoneRegionCode": "ru"			
	};	
	
	var self = this;
	options.events.paste = function(e){
		self.correctPastedData(e);
	}
	
	this.m_validPrefixes = options.validPrefixes;
	
	EditPhone.superclass.constructor.call(this,id,options);
}
extend(EditPhone,EditString);
/* constants */

/* public methods */

/**
 * @param {Event} e
 */
EditPhone.prototype.correctPastedData = function(e){
	e.stopPropagation();
	e.preventDefault();					

	var pasted_data;
	var cur_val;
	var clipboard_data = e.clipboardData || window.clipboardData;
	if(!clipboard_data){
		cur_val = this.getValue();
		pasted_data = cur_val;
	}
	else{
		pasted_data = clipboard_data.getData("Text").match(/\d+/g).map(Number).join("");//only numbers
		if(pasted_data.length>10 && (pasted_data[0]=="8"||pasted_data[0]=="7")){
			pasted_data = pasted_data.substring(1);
		}
		if(pasted_data.length>10){
			pasted_data = pasted_data.substring(0,10);
		}

		if(pasted_data.length<10){
			//append
			pasted_data = this.getValue()+pasted_data;
		}
	}
	if(!cur_val){
		cur_val = this.getValue();
	}
	if(cur_val!=pasted_data){
		this.setValue(pasted_data);
	}
}
/*
EditPhone.prototype.applyMask = function(){
	if(window["Cleave"]){
		this.m_cleave = new Cleave(this.m_node, {
			prefix: "+7-",
			delimiter: "-",
			phone: true,
			phoneRegionCode: "ru"		
		});
	}
	else{
		EditPhone.superclass.toDOM.call(this);
	}	
}

EditPhone.prototype.getValue = function(){
	if(this.m_cleave){
		if (this.m_node){
			var v = this.m_cleave.getRawValue();
			
			if (!v || v.length==0){
				return null;
			}		
			else if (this.m_validator){
				return this.m_validator.correctValue(v);
			}
			else{
				return v;
			}
		}
	}
	else{
		EditPhone.superclass.getValue.call(this);
	}
}

EditPhone.prototype.setValue = function(val){
	if (this.m_validator){
		val = this.m_validator.correctValue(val);
	}
	
	if(this.m_cleave){	
		this.m_cleave.setRawValue("+7-"+val);
	}else{
		this.getNode().value = this.formatOutputValue(val);	
		this.applyMask();
	}	
	
	if (this.m_eventFuncs && this.m_eventFuncs.change){
		this.m_eventFuncs.change();
	}
	
}
*/
