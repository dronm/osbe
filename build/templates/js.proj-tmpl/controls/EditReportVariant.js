/* Copyright (c) 2014 	Andrey Mikhalevich, Katren ltd.*//*		Description*///ф/** Requirements  * @requires controls/Edit.js*//* constructor */function EditReportVariant(id,options){	options = options || {};		options.enabled = false;	options.labelCaption = "Вариант отчета:";	options.noOpen = true;	options.noClear = true;	var contr = new ReportVariant_Controller(new ServConnector(HOST_NAME));	var pm = contr.getPublicMethodById("get_list");	pm.setParamValue("report_type",options.report_type);		options.buttonSelect=		new ButtonSelectObject(id+'_btn_select',		{"title":"выбрать настройку отчета",		"controller":contr,		"methParams":{"insert":{"report_type":options.report_type}},		"modelId":"ReportVariantList_Model",		"listView":ReportVariantList_View,		"keyFieldIds":["variant_id"],		"lookupKeyFieldIds":["id"],		"onSelected":function(keys,descr){				options.onRestoreVariant(keys,descr);			}		});		options.keyFieldIds=["variant_id"];	EditReportVariant.superclass.constructor.call(		this,id,options);		var self = this;	this.getButtons().addElement(new Button(id+'_btn_store',		{"image":{"src":this.IMG,"alt":""},		"title":"сохранить настройку отчета",		"onClick":function(){			var id = self.getFieldValue();			if (id){				options.onStoreVariant(id);			}		}		})	);}extend(EditReportVariant,EditObject);EditReportVariant.prototype.IMG = "img/polimerplast/save.jpg"