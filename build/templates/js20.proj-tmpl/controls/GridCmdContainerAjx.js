/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>,2016

 * @class
 * @classdesc ajax based grid commands

 * @requires core/extend.js  
 * @requires controls/GridCmdContainer.js

 * @param {string} id Object identifier
 * @param {namespace} options
 * @param {string} [options.template=GridCmdContainerAjx]
 * @param {bool|GridCmd} [options.cmdExport=true] Export to Excel
 * @param {string} options.exportFileName Export to Excel file name without extension
  * @param {string} options.exportTempl Export to Excel transformation template XXX.xls.xsl
 * @param {string} options.exportPublicMethod
*/
function GridCmdContainerAjx(id,options){
	options = options || {};
	
	//options.template = options.template || window.getApp().getTemplate("GridCmdContainerAjx");
	
	options.cmdExport = (options.cmdExport!=undefined)? options.cmdExport:true;

	//Export
	if (options.cmdExport){
		this.setCmdExport( (typeof(options.cmdExport)=="object")?
			options.cmdExport : new GridCmdExport(id+":export", {
				"fileName": options.exportFileName,
				"templ": options.exportTempl,
				"publicMethod": options.exportPublicMethod
			})
		);	
	}
	
	options.templateOptions = options.templateOptions || {};
	options.templateOptions.cmdExport = options.cmdExport,
	
	GridCmdContainerAjx.superclass.constructor.call(this,id,options);
}
extend(GridCmdContainerAjx,GridCmdContainer);

/* private */
GridCmdContainerAjx.prototype.m_cmdExport;

GridCmdContainerAjx.prototype.addCommands = function(){
	
	GridCmdContainerAjx.superclass.addCommands.call(this);

	if (this.m_cmdExport){
		this.m_commands.push(this.m_cmdExport);
	}
}

/* public */
GridCmdContainerAjx.prototype.getCmdExport = function(){
	return this.m_cmdExport;
}
GridCmdContainerAjx.prototype.setCmdExport = function(v){
	this.m_cmdExport = v;
}

/*
GridCmdContainerAjx.prototype.setGrid = function(v){
	GridCmdContainerAjx.superclass.setGrid.call(this,v);
	
	if (this.m_cmdExport){
		this.m_cmdExport.setGrid(v);
	}	
}
*/
