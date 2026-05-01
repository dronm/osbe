/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016
 
 * @class
 * @classdesc Period Edit cotrol
 
 * @extends ControlContainer
 
 * @requires core/extend.js
 * @requires controls/ControlContainer.js
 * @requires controls/ButtonCmd.js               
 
 * @param string id 
 * @param {namespace} options
 * @param {Control} [options.editClass=EditDate]  
 * @param {bool} [options.cmdDownFast=true]
 * @param {bool} [options.cmdDown=true]
 * @param {bool} [options.cmdUpFast=true]
 * @param {bool} [options.cmdUp=true]
 * @param {bool} [options.cmdPeriodSelect=true]       
 * @param {Control} options.controlDownFast
 * @param {Control} options.controlDown 
 * @param {Control} options.controlUpFast 
 * @param {Control} options.controlUp
 * @param {Control} options.controlPeriodSelect
 * @param {PeriodSelect} options.periodSelectClass
 * @param {object} options.periodSelectOptions
 * @param {string} options.valueFrom
 * @param {string} options.valueTo 
 
 * @param {string} options.downFastTitle
 * @param {string} options.downTitle 
 * @param {string} options.upFastTitle
 * @param {string} options.upTitle
 * @param {bool} options.controlCmdClear
 
 */
function EditPeriodDate(id,options){
	options = options || {};	

	options.cmdDownFast = (options.cmdDownFast!==undefined)? options.cmdDownFast:true;
	options.cmdDown = (options.cmdDown!==undefined)? options.cmdDown:true;
	options.cmdUpFast = (options.cmdUpFast!==undefined)? options.cmdUpFast:true;
	options.cmdUp = (options.cmdUp!==undefined)? options.cmdUp:true;
	options.cmdPeriodSelect = (options.cmdPeriodSelect!==undefined)? options.cmdPeriodSelect:true;

	options.template = options.template || window.getApp().getTemplate("EditPeriodDate");
	options.templateOptions = options.templateOptions || {
		"CONTR_DOWN_FAST_TITLE": options.downFastTitle||this.CONTR_DOWN_FAST_TITLE,
		"CONTR_DOWN_TITLE": options.downTitle||this.CONTR_DOWN_TITLE,
		"CONTR_UP_FAST_TITLE": options.upFastTitle||this.CONTR_UP_FAST_TITLE,
		"CONTR_UP_TITLE": options.upTitle||this.CONTR_UP_TITLE,
		"PERIOD_SELECT": options.cmdPeriodSelect,
		"DOWN": options.cmdDown,
		"DOWN_FAST": options.cmdDownFast,
		"UP": options.cmdUp,
		"UP_FAST": options.cmdUpFast,
		"LABEL": (options.labelCaption!=undefined&&typeof(options.labelCaption)=="string"&&options.labelCaption.length)? options.labelCaption: false
	};
	
	EditPeriodDate.superclass.constructor.call(this,id,"template",options);
	
	var edit_class = options.editClass || EditDate;
	
	var self = this;
	if (options.cmdDownFast){
		this.setControlDownFast(options.controlDownFast || new Button(id+":downFast",{
			"glyph":"glyphicon-triangle-left",
			"onClick":function(){
				self.goFast(-1);
			}
		}));
	}
	
	if (options.cmdDown){
		this.setControlDown(options.controlDown || new Button(id+":down",{
			"glyph":"glyphicon-menu-left",
			"onClick":function(){
				self.go(-1);
			}
		}));
	}
	
	
	if (options.cmdUp){
		this.setControlUp(options.controlUp || new Button(id+":up",{
			"glyph":"glyphicon-menu-right",
			"onClick":function(){
				self.go(1);
			}
		}));
	}
	if (options.cmdUpFast){
		this.setControlUpFast(options.controlUpFast || new Button(id+":upFast",{
			"glyph":"glyphicon-triangle-right",
			"onClick":function(){
				self.goFast(1);
			}
		}));
	}
	
	if(options.controlFrom||options.cmdControlFrom==undefined||options.cmdControlFrom===true){
		this.setControlFrom(options.controlFrom ||
			new edit_class(id+":from",{			
				"value":options.valueFrom,
				"timeValueStr":(options.valueFrom)? DateHelper.format(options.valueFrom,"H:i:s"):this.DEF_FROM_TIME,
				"contClassName":window.getBsCol(6),
				"editContClassName":"input-group "+window.getBsCol(12),
				"cmdClear": options.controlCmdClear
				/*,"onValueChange":function(){
					console.log("controlFrom value change")
				}*/
			})
		);
	}
	
	if(options.controlTo||options.cmdControlTo==undefined||options.cmdControlTo===true){	
		this.setControlTo(options.controlTo ||
			new edit_class(id+":to",{
				"value":options.valueTo,
				"timeValueStr":(options.valueTo)? DateHelper.format(options.valueTo,"H:i:s"):this.DEF_TO_TIME,
				"contClassName":window.getBsCol(6),
				"editContClassName":"input-group "+window.getBsCol(12),
				"cmdClear": options.controlCmdClear
				/*,"onValueChange":function(){
					console.log("controlTo value change")
				}*/
			})
		);
	}
		
	this.setField(options.field);
	
	if (options.cmdPeriodSelect){
		var sel_ctrl;
		if(options.controlPeriodSelect){
			//custom control
			sel_ctrl = options.controlPeriodSelect;
		}
		else{
			var sel_class = options.periodSelectClass || PeriodSelect;
			var sel_opts = options.periodSelectOptions || {};
			sel_opts.onValueChange = sel_opts.onValueChange || function(){
				self.setPredefinedPeriod(this.getValue());
			};
			sel_ctrl = new sel_class(this.getId()+":periodSelect",sel_opts);
		}
		//How to disable date controls (from && to) if period is predefined?
		let selected_per = sel_ctrl.getValue();
		if(selected_per && selected_per != "all"){
			//disable date controls
			this.getControlFrom().setEnabled(false);
			this.getControlTo().setEnabled(false);
		}
		this.setControlPeriodSelect(sel_ctrl);
	}
	
	//this.m_cont = new ControlContainer(id+":d-cont","div");
	
	this.addControls();
}
extend(EditPeriodDate,ControlContainer);

/* Constants */
EditPeriodDate.prototype.DEF_FROM_TIME = "00:00:00";
EditPeriodDate.prototype.DEF_TO_TIME = "23:59:59";

/* private members */
EditPeriodDate.prototype.m_controlFrom;
EditPeriodDate.prototype.m_controlTo;
EditPeriodDate.prototype.m_controlUp;
EditPeriodDate.prototype.m_controlUpFast;
EditPeriodDate.prototype.m_controlDown;
EditPeriodDate.prototype.m_controlDownFast;
EditPeriodDate.prototype.m_controlPeriodSelect;
EditPeriodDate.prototype.m_field;

/* protected*/
EditPeriodDate.prototype.addControls = function(){

	if (this.m_controlDownFast)this.addElement(this.m_controlDownFast);
	if (this.m_controlDown)this.addElement(this.m_controlDown);
	
	
	if(this.m_controlPeriodSelect)this.addElement(this.m_controlPeriodSelect);
	
	this.addElement(this.m_controlFrom);
	this.addElement(this.m_controlTo);

	if (this.m_controlUp)this.addElement(this.m_controlUp);
	if (this.m_controlUpFast)this.addElement(this.m_controlUpFast);	
}


/* public methods */
EditPeriodDate.prototype.getControlFrom = function(){
	return this.m_controlFrom;
}

EditPeriodDate.prototype.setControlFrom = function(v){
	this.m_controlFrom = v;
}

EditPeriodDate.prototype.getControlTo = function(){
	return this.m_controlTo;
}

EditPeriodDate.prototype.setControlTo = function(v){
	this.m_controlTo = v;
}

EditPeriodDate.prototype.getControlUp = function(){
	return this.m_controlUp;
}

EditPeriodDate.prototype.setControlUp = function(v){
	this.m_controlUp = v;
}

EditPeriodDate.prototype.getControlUpFast = function(){
	return this.m_controlUpFast;
}

EditPeriodDate.prototype.setControlUpFast = function(v){
	this.m_controlUpFast = v;
}

EditPeriodDate.prototype.getControlDownFast = function(){
	return this.m_controlDownFast;
}

EditPeriodDate.prototype.setControlDownFast = function(v){
	this.m_controlDownFast = v;
}

EditPeriodDate.prototype.getControlDown = function(){
	return this.m_controlDown;
}

EditPeriodDate.prototype.setControlDown = function(v){
	this.m_controlDown = v;
}

EditPeriodDate.prototype.getControlPeriodSelect = function(){
	return this.m_controlPeriodSelect;
}

EditPeriodDate.prototype.setControlPeriodSelect = function(v){
	this.m_controlPeriodSelect = v;
}

EditPeriodDate.prototype.getField = function(){
	return this.m_field;
}

EditPeriodDate.prototype.setField = function(v){
	this.m_field = v;
}

EditPeriodDate.prototype.reset = function(){
	this.m_controlFrom.reset();
	this.m_controlTo.reset();
}

EditPeriodDate.prototype.focus = function(){
	if(this.m_controlFrom)this.m_controlFrom.focus();
}

/**
 * @returns [object]
 */
EditPeriodDate.prototype.getValue = function(){
	return {"period":this.getControlPeriodSelect().getValue()};
}

EditPeriodDate.prototype.isNull = function(){
	return (this.m_controlFrom && this.m_controlTo.isNull());
}
/**
 * @param [object] v
 */
EditPeriodDate.prototype.setValue = function(v){
	if (v){
		this.getControlPeriodSelect().setValue(v);
		this.setControlsEnabled(v);
	}
}

EditPeriodDate.prototype.setInitValue = function(v){
	this.setValue(v);
}

EditPeriodDate.prototype.reset = function(){
	//this.getControlFrom().reset();
	//this.getControlTo().reset();
	if(this.getControlPeriodSelect())this.getControlPeriodSelect().setValue("all");
}

EditPeriodDate.prototype.setCtrlDateTime = function(ctrl,dt){
	dt.setHours(0);
	dt.setMinutes(0);
	dt.setSeconds(0);
	dt.setTime(dt.getTime() + DateHelper.timeToMS(ctrl.getTimeValueStr()));
	ctrl.setValue(dt);
}

EditPeriodDate.prototype.setControlsEnabled = function(per){
	var ctrl_en = (per=="all");
	this.getControlFrom().setEnabled(ctrl_en);
	this.getControlTo().setEnabled(ctrl_en);

}

EditPeriodDate.prototype.setPredefinedPeriod = function(per){
	this.setControlsEnabled(per);
	if (per=="all"){
		this.getControlFrom().reset();
		this.getControlTo().reset();
		this.getControlFrom().focus();
	}
	else if (per=="day"){
		this.setCtrlDateTime(this.getControlFrom(),DateHelper.time());
		this.setCtrlDateTime(this.getControlTo(),DateHelper.time());
	}			
	else if (per=="week"){
		this.setCtrlDateTime(this.getControlFrom(),DateHelper.weekStart());
		this.setCtrlDateTime(this.getControlTo(),DateHelper.weekEnd());
	}
	else if (per=="month"){
		this.setCtrlDateTime(this.getControlFrom(),DateHelper.monthStart());
		this.setCtrlDateTime(this.getControlTo(),DateHelper.monthEnd());	
	}
	else if (per=="quarter"){
		this.setCtrlDateTime(this.getControlFrom(),DateHelper.quarterStart());
		this.setCtrlDateTime(this.getControlTo(),DateHelper.quarterEnd());	
	}
	else if (per=="year"){
		this.setCtrlDateTime(this.getControlFrom(),DateHelper.yearStart());
		this.setCtrlDateTime(this.getControlTo(),DateHelper.yearEnd());		
	}	
}

EditPeriodDate.prototype.addYearsToControl = function(control,years){
	var v = control.getValue();
	if (v){
		v.setFullYear(v.getFullYear() + years);
		control.setValue(v);
	}
}
EditPeriodDate.prototype.addMonthsToControl = function(control,months){
	var v = control.getValue();
	if (v){
		v.setMonth(v.getMonth() + months);
		control.setValue(v);
	}
}
EditPeriodDate.prototype.addDaysToControl = function(control,days){
	var v = control.getValue();
	if (v){
		v.setDate(v.getDate() + days);
		control.setValue(v);
	}
}
EditPeriodDate.prototype.goFast = function(sign){
	var per = this.getControlPeriodSelect().getValue();
	if (per=="all"){
		this.addMonthsToControl(this.getControlFrom(),1*sign);
	}
	else if (per=="year"){
		this.addYearsToControl(this.getControlFrom(),2*sign);
		this.addYearsToControl(this.getControlTo(),2*sign);
	}
	else if (per=="quarter"){
		this.addYearsToControl(this.getControlFrom(),1*sign);
		this.addYearsToControl(this.getControlTo(),1*sign);
	}
	else if (per=="month"){
		this.addYearsToControl(this.getControlFrom(),1*sign);
		this.getControlTo().setValue(DateHelper.monthEnd(this.getControlFrom().getValue()));
	}
	else if (per=="week"){
		this.addMonthsToControl(this.getControlFrom(),1*sign);
		this.getControlFrom().setValue(DateHelper.weekStart(this.getControlFrom().getValue()));
		this.getControlTo().setValue(DateHelper.weekEnd(this.getControlFrom().getValue()));
	}	
	else if (per=="day"){
		this.addMonthsToControl(this.getControlFrom(),1*sign);
		this.addMonthsToControl(this.getControlTo(),1*sign);
	}	
}

EditPeriodDate.prototype.go = function(sign){
	var per = this.getControlPeriodSelect().getValue();
	if (per=="all"){
		this.addDaysToControl(this.getControlFrom(),1*sign);
	}
	else if (per=="year"){
		this.addYearsToControl(this.getControlFrom(),1*sign);
		this.addYearsToControl(this.getControlTo(),1*sign);
	}
	else if (per=="quarter"){
		this.addMonthsToControl(this.getControlFrom(),3*sign);
		this.addMonthsToControl(this.getControlTo(),3*sign);
	}
	else if (per=="month"){
		this.addMonthsToControl(this.getControlFrom(),1*sign);
		this.setCtrlDateTime(this.getControlTo(),DateHelper.monthEnd(this.getControlFrom().getValue()));
	}
	else if (per=="week"){
		this.addDaysToControl(this.getControlFrom(),7*sign);
		this.setCtrlDateTime(this.getControlTo(),DateHelper.weekEnd(this.getControlFrom().getValue()));
	}	
	else if (per=="day"){
		this.addDaysToControl(this.getControlFrom(),1*sign);
		this.addDaysToControl(this.getControlTo(),1*sign);
	}	
}
