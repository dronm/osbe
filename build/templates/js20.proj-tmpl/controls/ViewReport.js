/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>,2012

 * @class
 * @classdesc
  
 * @requires controls/ControlContainer.js     

 * @param {string} id Object identifier
 * @param {namespace} options
 * @param {string} options.reportViewId
 * @param {string} [options.excelViewId=DEF_EXCEL_VIEW]
 * @param {string} [options.pdfViewId=DEF_PDF_VIEW] 
 * @param {string} options.templateId
 * @param {bool} [options.cmdMake=true]
 * @param {bool} [options.cmdPrint=true]
 * @param {bool} [options.cmdFilter=true]
 * @param {bool} [options.cmdExcel=true]
 * @param {bool} [options.cmdPdf=true]
 * @param {RepCommands} [options.commands=RepCommands]
 * @param {bool} [options.openFilterOnInit=true] 
*/
function ViewReport(id,options){
	options = options || {};
	
	options.templateOptions = options.templateOptions || {};
	options.templateOptions.HEAD_TITLE = this.HEAD_TITLE;
	
	ViewReport.superclass.constructor.call(this,id,"DIV",options);
	
	this.setPublicMethod(options.publicMethod);
	
	this.setReportViewId(options.reportViewId);
	this.setExcelViewId(options.excelViewId || this.DEF_EXCEL_VIEW);
	this.setPdfViewId(options.pdfViewId || this.DEF_PDF_VIEW);
		
	this.setTemplateId(options.templateId);
		
	this.setReportControl(options.reportControl || new Control(id+":report","DIV",{}));
	
	this.m_retContentType = options.retContentType || "text";
	
	var self = this;
	
	var def_cmd_opts = {
		"cmdMake":options.cmdMake,
		"cmdPrint":options.cmdPrint,
		"cmdFilter":options.cmdFilter,
		"cmdExcel":options.cmdExcel,
		"cmdPdf":options.cmdPdf,
		"filters":options.filters
	};

	if (def_cmd_opts.cmdMake)def_cmd_opts.onReport = function(){self.onReport();};
	if (def_cmd_opts.cmdPrint)def_cmd_opts.onPrint = function(){self.onPrint();};
	if (def_cmd_opts.cmdExcel)def_cmd_opts.onExcel = function(){self.onExcel();};
	if (def_cmd_opts.cmdPdf)def_cmd_opts.onPdf = function(){self.onPdf();};
	
	def_cmd_opts.variantStorage = options.variantStorage;
	
	this.m_commands = options.commands || new RepCommands(id+":repCommands",def_cmd_opts);
	
	this.m_openFilterOnInit = (options.openFilterOnInit!=undefined)? options.openFilterOnInit:true;
	
}
extend(ViewReport,ControlContainer);

ViewReport.prototype.DEF_EXCEL_VIEW = "ViewExcel";
ViewReport.prototype.DEF_PDF_VIEW = "ViewPDF";

ViewReport.prototype.m_publicMethod;
ViewReport.prototype.m_templateId;
ViewReport.prototype.m_reportViewId;
ViewReport.prototype.m_excelViewId;
ViewReport.prototype.m_pdfViewId;
ViewReport.prototype.m_commands;
ViewReport.prototype.m_groupper;
ViewReport.prototype.m_reportControl;

ViewReport.prototype.getFilter = function(){
	return this.m_filter;
}
ViewReport.prototype.setFilter = function(filter){
	this.m_filter = filter;
}

ViewReport.prototype.setGroupper = function(v){
	this.m_groupper = v;
}

ViewReport.prototype.getGroupper = function(v){
	return this.m_groupper;
}

ViewReport.prototype.setPublicMethod = function(v){
	this.m_publicMethod = v;
}
ViewReport.prototype.getPublicMethod = function(){
	return this.m_publicMethod;
}

ViewReport.prototype.setReportViewId = function(v){
	this.m_reportViewId = v;
}
ViewReport.prototype.getReportViewId = function(){
	return this.m_reportViewId;
}

ViewReport.prototype.setExcelViewId = function(v){
	this.m_excelViewId = v;
}
ViewReport.prototype.getExcelViewId = function(){
	return this.m_excelViewId;
}

ViewReport.prototype.setPdfViewId = function(v){
	this.m_pdfViewId = v;
}
ViewReport.prototype.getPdfViewId = function(){
	return this.m_pdfViewId;
}

ViewReport.prototype.setReportControl = function(reportControl){
	this.m_reportControl = reportControl;
}
ViewReport.prototype.getReportControl = function(){
	return this.m_reportControl;
}

ViewReport.prototype.setCommands = function(v){
	this.m_commands = v;
}
ViewReport.prototype.getCommands = function(){
	return this.m_commands;
}

ViewReport.prototype.setTemplateId = function(v){
	this.m_templateId = v;
}
ViewReport.prototype.getTemplateId = function(){
	return this.m_templateId;
}

ViewReport.prototype.toDOM = function(parent){

	ViewReport.superclass.toDOM.call(this,parent);
	
	this.m_commands.toDOM(this.m_node);
	if (this.m_openFilterOnInit){
		var f = this.m_commands.getCmdFilter();
		if (f)f.onCommand();
	}	
	this.m_reportControl.toDOM(this.m_node);
}

ViewReport.prototype.delDOM = function(){

	this.m_commands.delDOM();
	this.m_reportControl.delDOM();
	
	ViewReport.superclass.delDOM.call(this);
}

ViewReport.prototype.fillParams = function(){	
	if (this.m_commands.getCmdFilter()){		
		let pm = this.getPublicMethod();
		try{
			this.m_commands.getCmdFilter().getFilter().applyFiltersToPublicMethod(pm);
		}
		catch(e){
			this.m_commands.getCmdFilter().onCommand(null);
			throw Error(e.message);
		}
	}
	
	if (this.m_groupper){
		this.m_groupper.getParams(filter_struc);
		if (!filter_struc.grp_fields){
			throw Error(this.NO_GRP_SELECTED);
		}
		let contr = pm.getController();
		pm.setFieldValue(contr.PARAM_GRP_FIELDS,filter_struc.grp_fields);		
	}	
}

ViewReport.prototype.downloadReport = function(view){	
	this.getPublicMethod().download(view);
}

ViewReport.prototype.setControlsEnabled = function(en){
	this.m_commands.getCmdMake().getControl().setEnabled(en);
	if(this.m_commands.getCmdExcel())this.m_commands.getCmdExcel().getControl().setEnabled(en);
	if(this.m_commands.getCmdPdf())this.m_commands.getCmdPdf().getControl().setEnabled(en);
	if(this.m_commands.getCmdPrint())this.m_commands.getCmdPrint().getControl().setEnabled(en);
}

ViewReport.prototype.onGetReportData = function(respText){
	this.m_reportControl.m_node.innerHTML = respText;	
}

ViewReport.prototype.onReport = function(){	

	this.fillParams();
		
	var self = this;
	
	this.setControlsEnabled(false);
	window.setGlobalWait(true);
	
	var pm = this.getPublicMethod();
	if(pm.fieldExists("templ") && this.getTemplateId()){
		pm.setFieldValue("templ", this.getTemplateId());
	}
	pm.run({
		"viewId":this.getReportViewId(),
		"get":true,
		"retContentType":this.m_retContentType,
		"ok":function(resp){
			self.onGetReportData(resp);
		},
		"all":function(){
			window.setGlobalWait(false);
			self.setControlsEnabled(true);
			//self.m_commands.getCmdMake().getControl().setEnabled(true);
		}
	});
}

ViewReport.prototype.onPrint = function(){	
	var ctrl = this.getReportControl();
	if (ctrl){
		WindowPrint.show({"content":ctrl.getNode().outerHTML});
	}
}

ViewReport.prototype.onExcel = function(){	
	//this.downloadReport(this.getExcelViewId());
	var ctrl_n = this.getReportControl().getNode();
	var tb = ctrl_n.getElementsByTagName("TABLE");
	if(tb&&tb.length){
		var title_l = DOMHelper.getElementsByAttr("reportTitle", ctrl_n, "class", true);
		var sheet_t;
		if(title_l&&title_l.length){
			sheet_t = DOMHelper.getText(title_l[0]);
		}
		else{
			sheet_t = this.getName();			
		}
		DOMHelper.tableToExcel(tb[0],sheet_t, sheet_t+".xls");
	}
}

ViewReport.prototype.onPdf = function(){	
	this.downloadReport(this.getPdfViewId());
}


