/* Copyright (c) 2012 	Andrey Mikhalevich, Katren ltd.*//*		Description*///ф/** Requirements * @requires controls/ControlContainer.js*//* constructor */function ViewReport(id,options){	options = options || {};	ViewReport.superclass.constructor.call(this,		id,"div",options);	if (options.title){		this.m_title = new Control(id+"_title","h1",{"value":options.title});	}			if (options.noWaitControl==undefined || options.waitControl==false){		this.m_waitControl = new WaitControl(id);		this.addElement(this.m_waitControl);	}			if (options.methodId){		this.m_methodId = options.methodId;	}	if (options.viewId){		this.m_viewId = options.viewId;	}			if (options.controller){		this.m_controller = options.controller;	}		if (options.connect){		this.m_connect = options.connect;	}	if (options.reportControl){		this.m_reportControl = options.reportControl;	}		this.m_filter = new GridFilter(id+"_filter",{		"onRefresh":this.makeReport,		"clickContext":this,		"setControlCaption":options.makeReportCaption || this.DEF_MAKE_REP_BTN_CAP,		"NoUnsetControl":true		});	if (options.commandPanel){		this.m_commandPanel = options.commandPanel;	}	this.m_winObj = options.winObj;		var self = this;		if (options.noExportToExcel==undefined||options.noExportToExcel==false){		this.m_filter.addCommandControl(new ButtonExpToExcel(id+"_btn_exp_to_excel",				{"onClick":function(){							self.downloadReport(self.EXCEL_VIEW);				}				})				);	}/*		if (options.noExportToPDF==undefined||options.noExportToPDF==false){		this.m_filter.addCommandControl(new ButtonExpToPDF(id+"_btn_exp_to_pdf",				{"onClick":function(){					self.downloadReport(self.PDF_VIEW);				}				})				);	}*/	/*		these controls can be stored in database	*/	if (options.reportType){		this.m_variant = new EditReportVariant(id+"_variant",{		"report_type":options.reportType,		"onStoreVariant":function(id){			self.storeControls(id);		},		"onRestoreVariant":function(keys,descr){			self.restoreControls(keys,descr);		}		});	}	this.m_storingControl = {};}extend(ViewReport,ControlContainer);ViewReport.prototype.DEF_MAKE_REP_BTN_CAP = 'Сформировать';ViewReport.prototype.EXCEL_VIEW = "ViewExcel";ViewReport.prototype.PDF_VIEW = "ViewPDF";ViewReport.prototype.m_connect;ViewReport.prototype.m_controller;ViewReport.prototype.m_methodId;ViewReport.prototype.m_viewId;ViewReport.prototype.m_title;ViewReport.prototype.m_waitControl;ViewReport.prototype.m_filter;ViewReport.prototype.m_groupper;ViewReport.prototype.m_aggregates;ViewReport.prototype.m_reportControl;ViewReport.prototype.m_commandPanel;ViewReport.prototype.getFilter = function(){	return this.m_filter;}ViewReport.prototype.setFilter = function(filter){	this.m_filter = filter;}ViewReport.prototype.setGroupper = function(groupper){	return this.m_groupper = groupper;}ViewReport.prototype.setAggregates = function(aggregates){	return this.m_aggregates = aggregates;}ViewReport.prototype.getWaitControl = function(){	return this.m_waitControl;}ViewReport.prototype.getConnect = function(){	return this.m_connect;}ViewReport.prototype.toDOM = function(parent){	if (this.m_title){		this.m_title.toDOM(parent);	}	if (this.m_variant){		this.m_variant.toDOM(parent);	}		if (this.m_filter){		this.m_filter.toDOM(parent);	}		if (this.m_groupper){		this.m_groupper.toDOM(parent);	}			if (this.m_aggregates){		this.m_aggregates.toDOM(parent);	}				if (this.m_waitControl){		this.m_waitControl.toDOM(parent);	}	if (this.m_commandPanel){		this.m_commandPanel.toDOM(parent);	}				if (this.m_reportControl){		this.m_reportControl.toDOM(parent);	}		ViewReport.superclass.toDOM.call(this,parent);}ViewReport.prototype.removeDOM = function(){	if (this.m_title){		this.m_title.removeDOM();	}	if (this.m_variant){		this.m_variant.removeDOM();	}		if (this.m_filter){		this.m_filter.removeDOM();	}		if (this.m_groupper){		this.m_groupper.removeDOM();	}				if (this.m_aggregates){		this.m_aggregates.removeDOM();	}					if (this.m_waitControl){		this.m_waitControl.removeDOM();	}		if (this.m_commandPanel){		this.m_commandPanel.removeDOM();	}			if (this.m_reportControl){		this.m_reportControl.removeDOM();	}		ViewReport.superclass.removeDOM.call(this);}ViewReport.prototype.setReportControl = function(reportControl){	this.m_reportControl = reportControl;}ViewReport.prototype.getReportControl = function(){	return this.m_reportControl;}ViewReport.prototype.fillParams = function(contr){		var pm = contr.getPublicMethodById(this.m_methodId);	pm.setParamValue("v",this.m_viewId);	var filter_struc = {		"fields":null,		"signs":null,		"vals":null,		"icase":null,		"grp_fields":null,		"agg_fields":null,		"agg_types":null	};	if (this.m_filter){				this.m_filter.getParams(filter_struc);	}	if (this.m_groupper){		this.m_groupper.getParams(filter_struc);		if (!filter_struc.grp_fields){			this.m_reportControl.setValue('Не выбрано ни одной группировки!');			return false;		}		pm.setParamValue(contr.PARAM_GRP_FIELDS,filter_struc.grp_fields);			}		if (this.m_aggregates){		this.m_aggregates.getParams(filter_struc);		if (!filter_struc.agg_fields){			this.m_reportControl.setValue('Не выбрано ни одного показателя!');			return false;		}		pm.setParamValue(contr.PARAM_AGG_FIELDS,filter_struc.agg_fields);		pm.setParamValue(contr.PARAM_AGG_TYPES,filter_struc.agg_types);	}	//Фильтры	if (filter_struc.fields){		pm.setParamValue(contr.PARAM_COND_FIELDS,filter_struc.fields);		pm.setParamValue(contr.PARAM_COND_SGNS,filter_struc.signs);		pm.setParamValue(contr.PARAM_COND_VALS,filter_struc.vals);		pm.setParamValue(contr.PARAM_COND_ICASE,filter_struc.icase);	}	return true;}ViewReport.prototype.downloadReport = function(view){		var contr = new this.m_controller(new ServConnector(HOST_NAME));	if (!this.fillParams(contr)){		return;	}	var meth = contr.getPublicMethodById(this.m_methodId);	meth.setParamValue(contr.PARAM_VIEW,view);	var params = {};	this.addExtraParamsForDownload(params);			var q_params = contr.getQueryString(meth);	for (id in params){		q_params+="&"+id+"="+params[id];	}	top.location.href = HOST_NAME+"index.php?"+q_params;	//alert(HOST_NAME+"index.php?"+q_params);}ViewReport.prototype.makeReport = function(async){		if (this.m_reportControl==undefined){		return;	}			var qm_async = (async==undefined)? false:async;		var self = this;	var contr = new this.m_controller(new ServConnector(HOST_NAME));	if (!this.fillParams(contr)){		return;	}		this.m_reportControl.m_node.innerHTML = "";	if (this.m_commandPanel){		this.m_commandPanel.setVisible(false); 	}					if (this.m_waitControl){		this.m_waitControl.setVisible(true); 	}		var params = {};	this.addExtraParams(params);		contr.runPublicMethod(this.m_methodId,params,qm_async,		function(respText){			self.m_reportControl.m_node.innerHTML = 				respText;			if (self.m_waitControl){				self.m_waitControl.setVisible(false); 			}			if (self.m_commandPanel){				self.m_commandPanel.setVisible(true); 			}			},	this,this.onError,false);		}ViewReport.prototype.onError = function(resp,erCode,erStr){			if (this.m_reportControl){		this.m_reportControl.setValue(erStr);	}}ViewReport.prototype.addExtraParams = function(struc){}ViewReport.prototype.addExtraParamsForDownload = function(struc){}ViewReport.prototype.addStoringControl = function(control){	this.m_storingControl[control.getId()]=control;}ViewReport.prototype.storeControls = function(variantId){	var data={};	var cnt = 0;	for (var id in this.m_storingControl){		data[id]=this.m_storingControl[id].getValueAsObj();		cnt++;	}	if (cnt){		var contr = new ReportVariant_Controller(new ServConnector(HOST_NAME));		contr.run("update",			{"params":{"old_id":variantId,					"data":array2json(data)					},			"func":function(){				WindowMessage.show({					"text":"Сохранение настроек выполнено.",					"type":WindowMessage.TP_NOTE}				);				}					}		);	}}ViewReport.prototype.restoreControls = function(keys,descrs){	var self = this;	var contr = new ReportVariant_Controller(new ServConnector(HOST_NAME));	contr.run("get_object",		{"params":{"id":keys.id},		"func":function(resp){				var m = resp.getModelById("ReportVariant_Model");				m.setActive(true);				if (m.getNextRow()){					var data = json2obj(m.getFieldValue("data"));					for (var id in data){						if (self.m_storingControl[id]){							self.m_storingControl[id].setValueFromObj(data[id]);													}					}				}			}				}	);}