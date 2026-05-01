/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>,2020

 * @class
 * @classdesc export local dataset to to Excel
 
 * @requires core/extend.js  
 * @requires controls/GridCmd.js

 * @param {string} id Object identifier
 * @param {object} options
 * @param {string} options.fileName
 * @param {string} options.sheetName 
*/
function GridCmdExportExcelLocal(id,options){
	options = options || {};	

	options.showCmdControl = (options.showCmdControl!=undefined)? options.showCmdControl:false;
	options.glyph = "glyphicon-save-file";

	this.m_sheetName = options.sheetName;
	this.m_fileName = options.fileName;

	GridCmdExportExcelLocal.superclass.constructor.call(this,id,options);
		
}
extend(GridCmdExportExcelLocal,GridCmd);

/* Constants */

/* private members */

/* protected*/


/* public methods */
GridCmdExportExcelLocal.prototype.onCommand = function(){
	var flt = this.m_grid.getCommands().getCmdFilter();
	DOMHelper.tableToExcel(this.m_grid.getNode(), this.m_sheetName||this.DEF_FILE_NAME, this.m_fileName||this.DEF_FILE_NAME);
}

