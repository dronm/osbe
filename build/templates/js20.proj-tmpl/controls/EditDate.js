/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2012
 
 * @class
 * @classdesc object dialog view
 
 * @extends EditString
 
 * @requires core/extend.js
 * @requires controls/EditString.js       
 * @requires core/AppWin.js      
 
 * @param string id 
 * @param {namespace} options
 * @param {Validator} [options.validator=ValidatorDate] 
 * @param {string} [options.editMask=window.getApp().getDateEditMask()]
 * @param {string} [options.dateFormat=window.getApp().getDateFormat()]
 * @param {string} options.timeValueStr
 * @param {bool} [options.cmdSelect=true]
 * @param {bool} [options.fourYearDigit=true] 
 */
function EditDate(id,options){
	options = options || {};
	
	options.validator = options.validator || new ValidatorDate(options);
	options.editMask = options.editMask || window.getApp().getDateEditMask();

	this.setDateFormat(options.dateFormat || window.getApp().getDateFormat());
	
	options.attrs = options.attrs || {};
	//options.editContClassName = options.editContClassName || "input-group "+window.getApp().getBsCol()+"2";
	
	options.cmdSelect = (options.cmdSelect!=undefined)? options.cmdSelect:true;
	
	this.setTimeValueStr(options.timeValueStr);
	
	if (options.cmdSelect){
		options.buttonSelect = options.buttonSelect ||
			new ButtonCalendar(id+':btn_calend',{
				"dateFormat":this.getDateFormat(),
				"editControl":this,
				"timeValueStr":this.getTimeValueStr(),
				"enabled":options.enabled
			});
				/*,
				"onSelect":function(){
					self.onSelectValue();
				}*/		
	}

	if (options.cmdNext || options.buttonNext){
		options.buttonNext = options.buttonNext ||
			new ButtonDateNext(id+':btn_next',{
				"editControl":this
			});
	}
	if (options.cmdPrev || options.buttonPrev){
		options.buttonPrev = options.buttonPrev ||
			new ButtonDatePrev(id+':btn_prev',{
				"editControl":this
			});
	}

	this.setButtonNext(options.buttonNext);
	this.setButtonPrev(options.buttonPrev);

	this.m_fourYearDigit = (options.fourYearDigit!=undefined)? options.fourYearDigit : true;
	
	EditDate.superclass.constructor.call(this,id,options);
}
extend(EditDate,EditString);

/* constants */

EditDate.prototype.TIME_SEP = "T";
EditDate.prototype.m_timeValueStr;
EditDate.prototype.m_prevValid;

EditDate.prototype.addButtonControls = function(){
	if(!this.m_buttonsBefore){
		this.m_buttonsBefore = new ControlContainer(this.getId()+":btn-before-cont","SPAN",
			{"className":this.m_btnContClassName,
				"enabled":this.getEnabled()
			}
		);	
	}
	if(this.m_buttonPrev){
		this.m_buttonsBefore.addElement(this.m_buttonPrev);
	}
	if (this.m_buttonOpen) this.m_buttons.addElement(this.m_buttonOpen);
	if (this.m_buttonSelect) this.m_buttons.addElement(this.m_buttonSelect);
	if (this.m_buttonClear) this.m_buttons.addElement(this.m_buttonClear);
	if (this.m_buttonNext) this.m_buttons.addElement(this.m_buttonNext);
}
/* public methods */

EditDate.prototype.setDateFormat = function(v){
	this.m_dateFormat = v;
}

EditDate.prototype.getDateFormat = function(){
	return this.m_dateFormat;
}

/*
 * 0000-00-00TIME_SEP00:00:00.00000
 */
EditDate.prototype.toISODate = function(str){
	//four digit year
	if (str=="") return "";
	
	k = this.m_fourYearDigit? 2:0;
	
	var t = (this.m_fourYearDigit? "":"20") + str.substr(4,2+k) +"-"+str.substr(2,2)+"-"+str.substr(0,2);
	if (str.length>(6+k)){
		t+= this.TIME_SEP+ str.substr(6+k,2);
	}
	if (str.length>(8+k)){
		t+= ":"+str.substr(8+k,2);
	}
	if (str.length>(10+k)){
		t+= ":"+str.substr(10+k,2);
	}
	
	/*var t = str.substr(4,4)+"-"+str.substr(2,2)+"-"+str.substr(0,2);
	if (str.length>8){
		t+= this.TIME_SEP+ str.substr(8,2);
	}
	if (str.length>10){
		t+= ":"+str.substr(10,2);
	}
	if (str.length>12){
		t+= ":"+str.substr(12,2);
	}*/
	
	return t;
}

EditDate.prototype.getValue = function(){
	if (this.m_node && this.m_node.value){
		var v = ""
		if(this.m_cleave){
			v = this.m_cleave.getRawValue();
		}else{
			var c;
			for(var i=0;i<this.m_node.value.length;i++){
				c = this.m_node.value.charAt(i);
				v+= (c==" "||isNaN(c))? "":c;
			}
		}
		
		v = this.toISODate(v);
		if (v.length==0){
			v = null;
		}		
		else if (this.m_validator){
			v = this.m_validator.correctValue(v);
		}
		
		return v;
	}
}

EditDate.prototype.formatOutputValue = function(val){
	return DateHelper.format(val,this.getDateFormat());
}
/*
EditDate.prototype.reset = function(){
	//this.getNode().value = "";
	this.setValue("");
	this.focus();
	this.valueChanged();
	if(this.m_onReset)this.m_onReset();	
}
*/
/*
EditDate.prototype.setValue = function(val){
	if (this.m_validator){
		val = this.m_validator.correctValue(val);
	}
	this.getNode().value = this.formatOutputValue(val);
	console.log("Edit.prototype.setValue val="+this.getNode().value+", "+val)
	this.applyMask();
	
	if (this.m_eventFuncs && this.m_eventFuncs.change){
		this.m_eventFuncs.change();
	}
}
*/
EditDate.prototype.setInitValue = function(val){
	this.setValue(val);
	this.setAttr(this.VAL_INIT_ATTR,this.getValue());
	//console.log("EditDate.prototype.setInitValue to="+this.getValue())
	//console.log("EditDate.prototype.setValue val="+this.getNode().value+", "+val)
}

EditDate.prototype.setTimeValueStr = function(v){
	this.m_timeValueStr = v;
}

EditDate.prototype.getTimeValueStr = function(){
	return this.m_timeValueStr;
}

EditDate.prototype.setOnValueChange = function(v){
	Edit.superclass.setOnValueChange.call(this,v);
	
	var self = this;
	this.m_onInputChange = function(){
		var v = self.getValue();
		var val_valid = (v && !isNaN(v.getTime()));
		if(val_valid && !self.m_prevValid || !val_valid && self.m_prevValid)
			self.onSelectValue();
		self.m_prevValid = val_valid;
	}
	if (v){
		//add onPress event to input
		EventHelper.add(this.getNode(),"keyup",this.m_onInputChange);
	}
	else{
		//remove event if any
		EventHelper.del(this.getNode(),"keyup",this.m_onInputChange);
	}		
}

EditDate.prototype.setButtonNext = function(v){
	this.m_buttonNext = v;
	if (this.m_buttonNext && this.m_buttonNext.setEditControl){
		this.m_buttonNext.setEditControl(this);
	}		
}
EditDate.prototype.getButtonNext = function(){
	return this.m_buttonNext;
}
EditDate.prototype.setButtonPrev = function(v){
	this.m_buttonPrev = v;
	if (this.m_buttonPrev && this.m_buttonPrev.setEditControl){
		this.m_buttonPrev.setEditControl(this);
	}		
}
EditDate.prototype.getButtonPrev = function(){
	return this.m_buttonPrev;
}
/*
EditDate.prototype.applyMask = function(){
	if(window["Cleave"]){
		var f = this.getDateFormat();
		var sep,pat;
		if(f&&f.length>=3){
			sep = f[1];
			pat = f.split("/");
		}
		else{
			sep = "/";
			pat = ['d', 'm', 'Y'];
		}
		console.log("Pattern=")
		console.log(pat)
		console.log(sep)
		this.m_cleave = new Cleave(this.m_node, {
			delimiter: sep,
			date: true,
			datePattern: pat
		});
	}
	else{
		EditDate.superclass.toDOM.call(this);
	}	
}
*/
