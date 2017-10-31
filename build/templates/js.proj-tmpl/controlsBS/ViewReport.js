/* Copyright (c) 2015 	Andrey Mikhalevich, Katren ltd.*//*		Description*///ф/** Requirements * @requires controls/ControlContainer.js*//* constructor */function ViewReport(id,options){	options = options || {};	options.className = options.className||"panel panel-primary";	ViewReport.superclass.constructor.call(this,		id,"div",options);			if (options.title){		this.m_title = new Control(id+"_title","div",{			"value":options.title,			"className":"panel-heading"			});	}		this.m_tuneContainer= new ControlContainer(id+"_tune","div",{"className":"panel-group collapse in"});	this.setWaitControl(options.waitControl||new WaitControl(id+"_wait"));	this.setErrorControl(options.errorControl||new ErrorControl(id+"_error"));			this.m_methodId = options.methodId;	this.m_viewId = options.viewId;	this.m_controller = options.controller;	this.m_reportControl = options.reportControl||new Control(id+"_report","div");	this.m_commandPanel = options.commandPanel||new ControlContainer(id+"_cmd","div",					{"repView":this,"className":"grid_commands"});						this.m_winObj = options.winObj;		var self = this;		this.setOnClose(options.onClose);		/*		these controls can be stored in database	*/	if (options.reportType){		this.m_variant = new EditReportVariant(id+"_variant",{		"report_type":options.reportType,		"onStoreVariant":function(id){			self.storeControls(id);		},		"onRestoreVariant":function(keys,descr){			self.restoreControls(keys,descr);		}		});	}	this.m_storingControl = {};}extend(ViewReport,ControlContainer);ViewReport.prototype.EXCEL_VIEW = "ViewExcel";ViewReport.prototype.PDF_VIEW = "ViewPDF";ViewReport.prototype.m_controller;ViewReport.prototype.m_methodId;ViewReport.prototype.m_viewId;ViewReport.prototype.m_title;ViewReport.prototype.m_waitControl;ViewReport.prototype.m_filterContainer;ViewReport.prototype.m_condFieldContainer;ViewReport.prototype.m_aggFieldContainer;ViewReport.prototype.m_groupFieldContainer;ViewReport.prototype.m_reportControl;ViewReport.prototype.m_errorControl;ViewReport.prototype.m_commandPanel;ViewReport.prototype.m_tuneContainer;ViewReport.prototype.getFilterContainer = function(){	return this.m_filterContainer;}ViewReport.prototype.setFilterContainer = function(ctrl){	this.m_filterContainer = ctrl;}ViewReport.prototype.setGroupContainer = function(ctrl){	return this.m_groupFieldContainer = ctrl;}ViewReport.prototype.getWaitControl = function(){	return this.m_waitControl;}ViewReport.prototype.toDOM = function(parent){	ViewReport.superclass.toDOM.call(this,parent);	if (this.m_title){		this.m_title.toDOM(this.m_node);	}	if (this.m_variant){		this.m_variant.toDOM(this.m_node);	}		if (this.m_waitControl){		this.m_waitControl.toDOM(this.m_node);	}	if (this.m_errorControl){		this.m_errorControl.toDOM(this.m_node);	}		if (this.m_filterContainer){		this.m_filterContainer.toDOM(this.m_node);	}			if (this.m_commandPanel){		this.m_commandPanel.toDOM(this.m_node);	}					if (this.m_groupFieldContainer){		this.m_groupFieldContainerCont = new ControlContainer(uuid(),"div",{"className":"panel panel-default "+get_bs_col()+"3"});				this.m_groupFieldContainerCont.addElement(new Control(uuid(),"div",{"className":"panel-heading","value":"Группировки и поля"}));		this.m_groupFieldContainerCont.addElement(this.m_groupFieldContainer);		this.m_groupFieldContainerCont.toDOM(this.m_tuneContainer.m_node);	}			if (this.m_condFieldContainer){		this.m_condFieldContainerCont = new ControlContainer(uuid(),"div",{"className":"panel panel-default "+get_bs_col()+"6"});				this.m_condFieldContainerCont.addElement(new Control(uuid(),"div",{"className":"panel-heading","value":"Условия отбора"}));		this.m_condFieldContainerCont.addElement(this.m_condFieldContainer);		this.m_condFieldContainerCont.toDOM(this.m_tuneContainer.m_node);	}		if (this.m_aggFieldContainer){		this.m_aggFieldContainerCont = new ControlContainer(uuid(),"div",{"className":"panel panel-default "+get_bs_col()+"3"});				this.m_aggFieldContainerCont.addElement(new Control(uuid(),"div",{"className":"panel-heading","value":"Показатели"}));		this.m_aggFieldContainerCont.addElement(this.m_aggFieldContainer);		this.m_aggFieldContainerCont.toDOM(this.m_tuneContainer.m_node);	}			this.m_tuneContainer.toDOM(this.m_node);			if (this.m_reportControl){		this.m_reportControl.toDOM(this.m_node);	}}ViewReport.prototype.removeDOM = function(){	if (this.m_title){		this.m_title.removeDOM();	}	if (this.m_variant){		this.m_variant.removeDOM();	}		if (this.m_waitControl){		this.m_waitControl.removeDOM();	}		if (this.m_errorControl){		this.m_errorControl.removeDOM();	}				if (this.m_filterContainer){		this.m_filterContainer.removeDOM();	}		if (this.m_condFieldContainer){		this.m_condFieldContainer.removeDOM();		this.m_condFieldContainerCont.removeDOM();	}		if (this.m_groupFieldContainer){		this.m_groupFieldContainer.removeDOM();		this.m_groupFieldContainerCont.removeDOM();	}			if (this.m_aggFieldContainer){		this.m_aggFieldContainer.removeDOM();		this.m_aggFieldContainerCont.removeDOM();	}				this.m_tuneContainer.removeDOM();		if (this.m_reportControl){		this.m_reportControl.removeDOM();	}		ViewReport.superclass.removeDOM.call(this);}ViewReport.prototype.setReportControl = function(reportControl){	this.m_reportControl = reportControl;}ViewReport.prototype.getReportControl = function(){	return this.m_reportControl;}ViewReport.prototype.setErrorControl = function(ctrl){	this.m_errorControl = ctrl;}ViewReport.prototype.getErrorControl = function(){	return this.m_errorControl;}ViewReport.prototype.setWaitControl = function(ctrl){	this.m_waitControl = ctrl;}ViewReport.prototype.getWaitControl = function(){	return this.m_waitControl;}ViewReport.prototype.fillParams = function(contr){		var pm = contr.getPublicMethodById(this.m_methodId);	pm.setParamValue("v",this.m_viewId);	var params_struc = {		"fields":null,		"signs":null,		"vals":null,		"icase":null,		"groups":null,		"agg_fields":null,		"agg_types":null	};		//заполним фильры	this.getFilterParams(params_struc);	if (params_struc.fields){		pm.setParamValue(contr.PARAM_COND_FIELDS,params_struc.fields);		pm.setParamValue(contr.PARAM_COND_SGNS,params_struc.signs);		pm.setParamValue(contr.PARAM_COND_VALS,params_struc.vals);		pm.setParamValue(contr.PARAM_COND_ICASE,params_struc.icase);	}		//заполним показатели	if (this.m_aggFieldContainer){		this.m_aggFieldContainer.getParams(params_struc);		if (params_struc.agg_fields){			pm.setParamValue(contr.PARAM_AGG_FIELDS,params_struc.agg_fields);			pm.setParamValue(contr.PARAM_AGG_TYPES,params_struc.agg_types);		}			}	//заполним группировки	if (this.m_groupFieldContainer){		this.m_groupFieldContainer.getParams(params_struc);		if (params_struc.groups){			pm.setParamValue(contr.PARAM_GROUPS,params_struc.groups);		}			}		//разделитель!!!	pm.setParamValue("field_sep","@");		return true;}ViewReport.prototype.downloadReport = function(view){		var contr = new this.m_controller(new ServConnector(HOST_NAME));	if (!this.fillParams(contr)){		return;	}	var meth = contr.getPublicMethodById(this.m_methodId);	meth.setParamValue(contr.PARAM_VIEW,view);	var params = {};	this.addExtraParamsForDownload(params);			var form = $('<form></form>').attr('action', "index.php").attr('method', 'post');	for (var id in meth.m_params){		form.append($("<input></input>").attr('type', 'hidden').attr('name', id).attr('value', meth.m_params[id].getValue()));	}	for (var id in params){		form.append($("<input></input>").attr('type', 'hidden').attr('name', id).attr('value', params[id].getValue()));	}	    			form.appendTo('body').submit().remove();		/*	var q_params = contr.getQueryString(meth);	for (id in params){		q_params+="&"+id+"="+params[id];	}	top.location.href = HOST_NAME+"index.php?"+q_params;	*/	}ViewReport.prototype.makeReport = function(async){		this.m_repResultOk = false;		this.m_errorControl.m_node.innerHTML = "";		if (this.m_reportControl==undefined){		return;	}		if (this.m_aggFieldContainer&&!this.m_aggFieldContainer.getSelectedCount()){		//если есть показатели, должен быть установлен минимум один, иначе - ошибка		this.m_errorControl.setValue("Не выбран ни один показательт!");		return;	}		if (this.m_groupFieldContainer&&!this.m_groupFieldContainer.getSelectedCount()){		//если есть группировки, должна быть установлена минимум одна, иначе - ошибка		this.m_errorControl.setValue("Не задана ни одна группировка!");		return;	}				var qm_async = (async==undefined)? false:async;		var self = this;	var contr = new this.m_controller(new ServConnector(HOST_NAME));	if (!this.fillParams(contr)){		return;	}		this.m_reportControl.m_node.innerHTML = "";			if (this.m_commandPanel){		this.m_commandPanel.setEnabled(false); 	}					if (this.m_waitControl){		this.m_waitControl.setVisible(true); 	}		var params = {};	this.addExtraParams(params);		contr.runPublicMethod(this.m_methodId,params,qm_async,		function(respText){			self.m_reportControl.m_node.innerHTML = 				respText;			if (self.m_waitControl){				self.m_waitControl.setVisible(false); 			}			if (self.m_commandPanel){				self.m_commandPanel.setEnabled(true); 			}			this.m_repResultOk = true;		},	this,this.onError,false,false);//false - post}ViewReport.prototype.onError = function(resp,erCode,erStr){			if (this.m_errorControl){		this.m_errorControl.setValue(erCode+" "+erStr);	}	if (this.m_waitControl){		this.m_waitControl.setVisible(false); 	}	this.m_commandPanel.setEnabled(true); 	this.m_repResultOk = false;}ViewReport.prototype.addExtraParams = function(struc){	}ViewReport.prototype.addExtraParamsForDownload = function(struc){}ViewReport.prototype.addStoringControl = function(control){	this.m_storingControl[control.getId()]=control;}ViewReport.prototype.storeControls = function(variantId){	var data={};	var cnt = 0;	for (var id in this.m_storingControl){		data[id]=this.m_storingControl[id].getValueAsObj();		cnt++;	}	if (cnt){		var contr = new ReportVariant_Controller(new ServConnector(HOST_NAME));		contr.run("update",			{"params":{"old_id":variantId,					"data":array2json(data)					},			"get":false,			"func":function(){				WindowMessage.show({					"text":"Сохранение настроек выполнено.",					"type":WindowMessage.TP_NOTE}				);				}					}		);	}}ViewReport.prototype.restoreControls = function(keys,descrs){	var self = this;	var contr = new ReportVariant_Controller(new ServConnector(HOST_NAME));	contr.run("get_object",		{"params":{"id":keys.id},		"func":function(resp){				var m = resp.getModelById("ReportVariant_Model",true);				if (m.getNextRow()){					var data = json2obj(m.getFieldValue("data"));					for (var id in data){						if (self.m_storingControl[id]){							self.m_storingControl[id].setValueFromObj(data[id]);													}					}				}			}				}	);}ViewReport.prototype.addCmdMakeReport = function(opts){	opts = opts||{};	var self = this;	this.m_commandPanel.addElement(new ButtonCmd(this.getId()+"_btn_make",				{"caption":opts.caption||"Сформировать",				"onClick":function(){							self.makeReport(true);				}				})	);	}ViewReport.prototype.addCmdPrint = function(){	var self = this;	this.m_commandPanel.addElement(new ButtonCmd(this.getId()+"_btn_print",		{"glyph":"glyphicon-print",		"onClick":function(e){		if (self.getEnabled()){			var ctrl = self.getReportControl();			if (ctrl&&ctrl.m_node){				WindowPrint.show({"content":ctrl.m_node.outerHTML});			}		}},	"attrs":{"title":"печать"}	})	);	}ViewReport.prototype.addCmdFilter = function(opts){	opts = opts||{};	this.m_commandPanel.addElement(new ButtonCmd(this.getId()+"_btn_filter",{		"attrs":{			"data-toggle":"collapse",			"data-target":("#"+this.m_tuneContainer.getId()),			"aria-expanded":"true"			},		"caption":opts.caption||"Настройка",		"glyph":"glyphicon-triangle-bottom"		})	);	}ViewReport.prototype.addCmdExcel = function(){	var self = this;	this.m_commandPanel.addElement(new ButtonExpToExcel(this.getId()+"_btn_exp_to_excel",			{"onClick":function(){						self.downloadReport(self.EXCEL_VIEW);			}			})			);	}ViewReport.prototype.addCmdPDF = function(){	var self = this;	this.m_commandPanel.addElement(new ButtonExpToPDF(this.getId()+"_btn_exp_to_pdf",			{"onClick":function(){				self.downloadReport(self.PDF_VIEW);			}			})			);	}ViewReport.prototype.addFilterContainer = function(filters){	filters = filters||[];	this.m_filter = new ListFilter();	this.m_filterContainer = new ControlContainer(this.getId()+"_filter","div",{		"className":"form-horizontal"}	);	for (var i=0;i<filters.length;i++){		this.m_filter.addFilter(filters[i].control.getId(),filters[i].filter);		this.m_filterContainer.addElement(filters[i].control);	}}ViewReport.prototype.getOnClose = function(){	return this.m_onClose;}ViewReport.prototype.setOnClose = function(onClose){	this.m_onClose = onClose;}ViewReport.prototype.getFilterParams = function(struc){			if (this.m_filter){		for (var ctrl_id in this.m_filterContainer.m_elements){			var ctrl = this.m_filterContainer.m_elements[ctrl_id];			if (this.m_filter.m_params[ctrl_id]){				var keys = this.m_filter.m_params[ctrl_id].keyFieldIds;				if (keys){					for (var i=0;i<keys.length;i++){						var key;						if (ctrl.getFieldValue){							key = ctrl.getFieldValue(keys[i]);						}						else{							key = ctrl.getAttr("fkey_"+keys[i]);						}									this.m_filter.m_params[ctrl_id].key = key;					}				}				this.m_filter.m_params[ctrl_id].descr = ctrl.getValue();			}		}		this.m_filter.getParams(struc);	}	if (this.m_condFieldContainer){		this.m_condFieldContainer.getParams(struc);	}}