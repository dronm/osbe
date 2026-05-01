/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2017

 * @extends ControlContainer
 * @requires core/extend.js
 * @requires ControlContainer.js     

 * @class
 * @classdesc
 
 * @param {string} id - Object identifier
 * @param {object} options
 * @param {object} options.valueJSON
 */
function EditJSON(id,options){
	options = options || {};	
	
	EditJSON.superclass.constructor.call(this,id,options.tagName,options);
	
	if (options.valueJSON){
		this.setValue(options.valueJSON);
	}
}
extend(EditJSON,ControlContainer);

/* Constants */


/* private members */

/* protected*/


/* public methods */
EditJSON.prototype.getValueJSON = function(){	
	var o = {};
	for (var elem_id in this.m_elements){
		//input elements
		if (this.m_elements[elem_id] && !this.m_elements[elem_id].getAttr("notForValue") && this.m_elements[elem_id].getModified){
			if (this.m_elements[elem_id] instanceof EditJSON){
				o[elem_id] = this.m_elements[elem_id].getValueJSON();
				
			}else if (this.m_elements[elem_id] instanceof EditDate){
				//otherwise it will be turned to datetime!
				o[elem_id] = DateHelper.format(this.m_elements[elem_id].getValue(), "Y-m-d");
				
			}else{								
				o[elem_id] = this.m_elements[elem_id].getValue();
			}
		}
	}
	return o;
}

EditJSON.prototype.getValue = function(){	
	return CommonHelper.serialize(this.getValueJSON());
}

EditJSON.prototype.setValueOrInit = function(v,isInit){
	var o;
	if (typeof(v)=="string"){
		o = CommonHelper.unserialize(v);
	}
	else{
		o = v;
	}
	for (var id in o){
		if (this.m_elements[id] && (!this.m_elements[id].getAttr||!this.m_elements[id].getAttr("notForValue")) ){
			if (isInit && this.m_elements[id].setInitValue){
				this.m_elements[id].setInitValue(o[id]);
			}
			else{
				this.m_elements[id].setValue(o[id]);
			}
		}
	}	
}

EditJSON.prototype.setValue = function(v){
	this.setValueOrInit(v,false);
}

EditJSON.prototype.setInitValue = function(v){
	this.setValueOrInit(v,true);
}

EditJSON.prototype.setValid = function(){
	var list = this.getElements();
	for(var id in list){
		if (list[id] && list[id].setValid){
			list[id].setValid();
		}
	}	
}

EditJSON.prototype.setNotValid = function(str){
	//var list = this.getElements();
	//console.log("Error:"+str)
}

EditJSON.prototype.getModified = function(){
	var res = false;
	var list = this.getElements();
	for(var id in list){
		if (list[id] && list[id].getModified && list[id].getModified()){
			res = true;
			break;
		}
	}
	return res;
}

EditJSON.prototype.isNull = function(){
	var res = true;
	var list = this.getElements();
	for(var id in list){
		if (list[id] && list[id].isNull && !list[id].isNull()){
			res = false;
			break;
		}
	}
	return res;
}

EditJSON.prototype.reset = function(){	
	for (var elem_id in this.m_elements){
		//input elements		
		if (this.m_elements[elem_id] && !this.m_elements[elem_id].getAttr("notForValue") && this.m_elements[elem_id].reset){
			this.m_elements[elem_id].reset();
			/*this.m_elements[elem_id].delDOM();
			delete this.m_elements[elem_id];
			this.m_elements[elem_id] = undefined;
			*/
		}
	}
}

EditJSON.prototype.validate = function(){
	var res = true;
	for (var elem_id in this.m_elements){
		//input elements		
		if (this.m_elements[elem_id] && !this.m_elements[elem_id].getAttr("notForValue") && this.m_elements[elem_id].reset){
			res = ( (!this.m_elements[elem_id].validate || this.m_elements[elem_id].validate()) && res);
		}
	}
	return res;
}
