/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>,2016

 * @class
 * @classdesc
 
 * @requires core/extend.js  
 * @requires controls/GridCmd.js

 * @param {string} id Object identifier
 * @param {object} options
 * @param {string} options.fileName
 * @param {string} options.templ 
 * @param {object} options.publicMethod   
*/
function GridCmdExport(id,options){
	options = options || {};	

	options.showCmdControl = (options.showCmdControl!=undefined)? options.showCmdControl:false;
	options.glyph = "glyphicon-save-file";
	
	this.m_fileName = options.fileName;
	this.m_templ = options.templ;
	
	this.m_publicMethod = options.publicMethod;

	GridCmdExport.superclass.constructor.call(this,id,options);
		
}
extend(GridCmdExport,GridCmd);

/* Constants */


/* private members */
GridCmdExport.prototype.m_fileName;
GridCmdExport.prototype.m_templ;
/* protected*/


/* public methods */
GridCmdExport.prototype.onCommand = function(){
	//export all list with filter!!!
	var flt = this.m_grid.getCommands().getCmdFilter();
	if(flt){
		flt.getFilter().applyFilters(this.m_grid);
	}
	var pm;
	if(this.m_publicMethod){
		pm = this.m_publicMethod;
	}else{
		pm = this.m_grid.getReadPublicMethod();
	}
	
	if(this.m_grid.condFilterToMethod){
		this.m_grid.condFilterToMethod(pm);
	}
	if(pm.fieldExists("fname")){		
		pm.setFieldValue("fname", this.m_fileName || this.DEF_FILE_NAME);
	}
	if(this.m_templ && pm.fieldExists("fname")){		
		pm.setFieldValue("templ", this.m_templ);
	}
	
	pm.setFieldValue("from", 0);
	//pm.unsetFieldValue("count");
	pm.setFieldValue("count", 5000);//global sql_limit
	pm.download("ViewExcel");
	
}

