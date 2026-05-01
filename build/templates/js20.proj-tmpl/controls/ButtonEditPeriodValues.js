/**
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2022
 
 * @class
 * @classdesc Edit control clear value button

 * @extends ButtonCtrl 

 * @requires core/extend.js
 * @requires controls/ButtonCtrl.js     
  
 * @param {string} id - html tag id
 * @param {namespase} options
 * @param {Control} options.editControl
 
 * @param {string} options.formCaption
 * @param {object} options.viewClass
 * @param {int} options.key
 */
function ButtonEditPeriodValues(id,options){
	options = options || {};
	options.glyph = "glyphicon-pencil";
	options.title = this.TITLE;
	//options.enabled = true
	
	var self = this;
	this.m_onEditPeriodValues = options.onEditPeriodValues || function(){
		self.onEditPeriodValues();
	};
	
	options.onClick = options.onClick || 
		function(event){
			if(self.onEditPeriodValues)self.onEditPeriodValues();
		};
	
	if(!options.periodOptions){
		throw new Error("options.periodOptions not defined");
	}
	this.m_periodOptions = options.periodOptions;
	
	ButtonEditPeriodValues.superclass.constructor.call(this,id,options);
}
extend(ButtonEditPeriodValues,ButtonCtrl);

ButtonEditPeriodValues.prototype.onEditPeriodValues = function() {
	//Открыть форму
	self = this;
	var id = this.getId();
	if(this.m_periodOptions)
	this.m_view = new PeriodValueList_View(id+":f:v",{
		"periodOptions":this.m_periodOptions
	});
	this.m_form = new WindowFormModalBS(id+":f",{
		"dialogWidth":"80%",
		"content":this.m_view,
		"cmdCancel":false,
		"cmdOk":true,
		"contentHead":this.m_periodOptions.formCaption,
		"onClickOk":function(){
			self.setLastVal(function(){
				self.closeForm();
			});
		}
	});
	
	this.m_form.open();
	
}

ButtonEditPeriodValues.prototype.closeForm = function(){
	this.m_view.delDOM()
	this.m_form.delDOM();
	delete this.m_view;
	delete this.m_form;			
}

ButtonEditPeriodValues.prototype.setLastVal = function(callBack){	
	var key = (typeof(this.m_periodOptions.key)=="function")? this.m_periodOptions.key() : this.m_periodOptions.key;
	if(!this.m_editControl || !key){
		self.m_editControl.setValue(0);
		callBack();
	}else{
		var pm = (new PeriodValue_Controller()).getPublicMethod("get_last_val");
		pm.setFieldValue("period_value_type", this.m_periodOptions.valueType);
		pm.setFieldValue("key", key);
		var self = this;
		pm.run({
			"ok":function(resp){
				var m = resp.getModel("PeriodValue_Model");
				var v = 0;
				if(m.getNextRow()){		
					v = m.getFieldValue("val");	
				}
				self.m_editControl.setValue(v);
				callBack();
				
			}
		});
	}
}
