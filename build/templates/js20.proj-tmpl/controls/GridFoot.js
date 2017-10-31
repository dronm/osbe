/* Copyright (c) 2016	Andrey Mikhalevich, Katren ltd.*//*		Description*//** Requirements * @requires common/functions.js*//* constructor */function GridFoot(id,options){	options = options || {};		this.setAutoCalc(options.autoCalc);		GridFoot.superclass.constructor.call(this, id, (options.tagName || this.DEF_TAG_NAME),options);}extend(GridFoot,ControlContainer);GridFoot.prototype.DEF_TAG_NAME = "tfoot";GridFoot.prototype.m_autoCalc;GridFoot.prototype.calc = function(model){	if (this.getAutoCalc()){		for (var r in this.m_elements){			for (var c in this.m_elements[r].m_elements){				var cell = this.m_elements[r].m_elements[c];				var f = (cell.getCalc)? cell.getCalc():null;				if (f){					f.call(cell,model);				}			}		}	}}GridFoot.prototype.calcBegin = function(model){	if (this.getAutoCalc()){		for (var r in this.m_elements){			for (var c in this.m_elements[r].m_elements){				var cell = this.m_elements[r].m_elements[c];				var f = (cell.getCalcBegin)? cell.getCalcBegin():null;				if (f){					f.call(cell,model);				}			}		}	}}GridFoot.prototype.calcEnd = function(model){	if (this.getAutoCalc()){		for (var r in this.m_elements){			for (var c in this.m_elements[r].m_elements){				var cell = this.m_elements[r].m_elements[c];				var f = (cell.getCalcEnd)? cell.getCalcEnd():null;				if (f){					f.call(cell,model);				}			}		}	}}GridFoot.prototype.getAutoCalc = function(){	return this.m_autoCalc;}GridFoot.prototype.setAutoCalc = function(v){	this.m_autoCalc = v;}