/**
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016
 
 * @class
 * @classdesc button with calculator
 
 * @extends ButtonCtrl

 * @requires core/extend.js
 * @requires controls/ButtonCtrl.js     
  
 * @param {string} id - html tag id
 * @param {namespase} options
 * @param {string} [options.glyph=this.DEF_GLYPH]
 * @param {Edit} options.editControl input control
 * @param {string} [options.dateFormat=app.getDateFormat]
 * @param {string} [options.timeValueStr=00:00:00] 
 */

function ButtonCalendar(id,options){
	options = options || {};
	
	options.glyph = options.glyph || this.DEF_GLYPH;	
	
	this.setTimeValueStr(options.timeValueStr || "00:00:00");
	this.setDateFormat(options.dateFormat || window.getApp().getDateFormat());
	//this.m_onSelect = options.onSelect;
	
	var self = this;
	options.onClick = options.onClick || 		
			function(event){
				var p = $(self.getEditControl().getNode());
				p.datepicker({
					format:{
						//called after date is selected
						toDisplay: function (date, format, language) {
							//debugger
							//console.log("ButtonCalendar.toDisplay date="+date+" format="+format);
							var tm;
							//self.m_editControl instanceof EditDateTime && 
							if (!self.m_editControl.isNull()){
								var ctrl_val = self.getEditControl().getValue();
								tm = ctrl_val.getSeconds()*1000+ctrl_val.getMinutes()*60*1000+ctrl_val.getHours()*60*60*1000;
							}
							else{
								tm = self.m_time;
							}
							var d = new Date(date.getFullYear(),date.getMonth(),date.getDate(),0,0,0,tm);
							var fv = DateHelper.format(d,self.m_dateFormat);
							
							//double calling!
							/*
							if(self.m_prevDate != date)
								self.getEditControl().onSelectValue();
							self.m_prevDate = date;
							*/
							
							return fv;
						},
						//called in ctrl edit?
						toValue: function (date, format, language) {
							//console.log("ButtonCalendar.toValue date="+date+" format="+format);
							var v = DateHelper.userStrToDate(date);
							
							return v;
						}																	
					},
					language:"ru",
					daysOfWeekHighlighted:"0,6",
					autoclose:true,
					todayHighlight:true,
					orientation: "bottom right",
					//container:form,
					showOnFocus:false,
					clearBtn:true
				});
				
				p.on("hide", function(ev){
					self.getEditControl().applyMask();
				});					
				p.on("changeDate",function(ev){
					if(self.m_prevDate != ev.date)
						self.getEditControl().onSelectValue();
					self.m_prevDate = ev.date;				
				});
				p.datepicker("show");
			};
	
	ButtonCalendar.superclass.constructor.call(
		this,id,options);
}
extend(ButtonCalendar,ButtonCtrl);

ButtonCalendar.prototype.DEF_GLYPH = "glyphicon-calendar";

ButtonCalendar.prototype.m_time;
ButtonCalendar.prototype.m_dateFormat;
ButtonCalendar.prototype.m_prevDate;

ButtonCalendar.prototype.setDateFormat = function(v){
	this.m_dateFormat = v;
}
ButtonCalendar.prototype.getDateFormat = function(){
	return this.m_dateFormat;
}

ButtonCalendar.prototype.setTimeValueStr = function(v){
	this.m_time = DateHelper.timeToMS(v);
}
ButtonCalendar.prototype.getDateFormat = function(){
	return this.m_dateFormat;
}

