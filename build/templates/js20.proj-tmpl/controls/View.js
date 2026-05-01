/**
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2014
 
 * @class
 * @classdesc Basic visual view
 
 * @requires core/extend.js
 * @requires core/ControlContainer.js     
  
 * @param {string} id - html tag id
 * @param {object} options
 */
function View(id,options){
	options = options || {};	
	
	var title = this.HEAD_TITLE || options.HEAD_TITLE;
	if (title){
		options.templateOptions = options.templateOptions || {};
		options.templateOptions.HEAD_TITLE = title;
	}
	
	
	this.setDataBindings(options.dataBindings || []);
	
	this.m_editResult = {
		"newKeys":null,
		"updated":false
	};
	
	View.superclass.constructor.call(this, id, (options.tagName || this.DEF_TAG_NAME), options);
}
extend(View,ControlContainer);

/* Constants */
View.prototype.DEF_TAG_NAME = "DIV";

/* private members */

View.prototype.m_controlStates;

View.prototype.m_dataBindings;

/* newly inserted keys will be returned to grid*/
View.prototype.m_editResult;

/* protected*/
View.prototype.onGetData = function(resp){
}

View.prototype.setFocus = function(){
	//set focus to first element, if nothing autofocused
	var set = false, cnt = 0;
	for(var id in this.m_elements){
		cnt++;
		if (this.m_elements[id].getAttr("autofocus")){
			this.m_elements[id].focus();
			set = true;
			break;
		}
	}
	if (!set && cnt){
		this.getElementByIndex(0).focus();
	}
}

View.prototype.setReadTempDisabled = function(){
	this.m_controlStates = [];
	if (this.m_dataBindings){
		for (var i=0;i<this.m_dataBindings.length;i++){
			var ctrl = this.m_dataBindings[i].getControl();
			if (ctrl){
				this.m_controlStates.push({
					"ctrl":ctrl,
					"enabled":ctrl.getEnabled(),
					"inputEnabled":ctrl.getInputEnabled? ctrl.getInputEnabled():true
				});
				ctrl.setEnabled(false);
			}
		}	
	}	
}

View.prototype.setReadTempEnabled = function(){
	if (this.m_controlStates){
		for (var i=0;i<this.m_controlStates.length;i++){
			if (this.m_controlStates[i].enabled){
				this.m_controlStates[i].ctrl.setEnabled(true);
			}
			if(this.m_controlStates[i].ctrl.setInputEnabled)this.m_controlStates[i].ctrl.setInputEnabled(this.m_controlStates[i].inputEnabled);
		}
	}
}



/* public methods */
View.prototype.setError = function(s,delay){
	window.showError(s,null,delay);
}

View.prototype.resetError = function(){
	window.resetError();
}

View.prototype.toDOM = function(parent){
	View.superclass.toDOM.call(this,parent);
	
	this.setFocus();
}

/**
 * @public
 * @returns {array} - array of DataBinding
 */
View.prototype.getDataBindings = function(){
	return this.m_dataBindings; 
}

/**
 * @public
 * @param {array} v - array of DataBinding
 */
View.prototype.setDataBindings = function(v){
	this.m_dataBindings = v; 
}


/**
 * @public
 * @param {DataBinding} binding
 */
View.prototype.addDataBinding = function(binding){
	this.m_dataBindings.push(binding); 
}

/**
 * @public
 */
View.prototype.clearDataBinding = function(){
	this.setDataBindings([]); 
}

/**
 * @public
 * validate/checkes all required fields
 */
View.prototype.validate = function(){
	var res = true;
	var el_list = this.getElements();
	for(var id in el_list){
		if(!el_list[id].getValue){
			continue;
		}
		if (el_list[id].setValid){
			el_list[id].setValid();
		}
		if(el_list[id].validate && !el_list[id].validate()){
			res = false;
			continue;
		}
		var v = el_list[id].getValue()
		if (
			(el_list[id].getIsRef && el_list[id].getIsRef() && !v || v.isNull())
			||( (!el_list[id].getIsRef || !el_list[id].getIsRef()) && v===null)
		){
			el_list[id].setNotValid(Validator? Validator.prototype.ER_EMPTY : "emty value");
			res = false;
		}
		
	}
	return res;
}


