/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>,2012,2017

 * @class
 * @classdesc
  
 * @requires controls/ControlContainer.js
 * @requires controls/ButtonCmd.js 

 * @param {string} id Object identifier
 * @param {namespace} options
 
 * @param {Control} [options.controlMake=ButtonCmd]
 * @param {Control} [options.controlPrint=ButtonCmd]
 * @param {Control} [options.controlFilter=ButtonCmd]
 * @param {Control} [options.controlExcel=ButtonCmd]
 * @param {Control} [options.controlPdf=ButtonCmd]
 
 * @param {bool} [options.cmdMake=true]
 * @param {bool} [options.cmdPrint=true]
 * @param {bool} [options.cmdFilter=true]
 * @param {bool} [options.cmdExcel=true]
 * @param {bool} [options.cmdPdf=true]
 
 * @param {function} options.onReport
 * @param {function} options.onExcel
 * @param {function} options.onPrint
 * @param {function} options.onPdf

 * @param {namespace} filters 
*/

function RepCommands(id,options){
	options = options || {};
		
	options.attrs = options.attrs || {};
	options.className = options.className || options.attrs["class"] || this.DEF_CLASS_NAME;
		
	RepCommands.superclass.constructor.call(this, id, (options.tagName || this.DEF_TAG_NAME), options);

	options.cmdMake = (options.cmdMake!=undefined)? options.cmdMake:true;
	options.cmdPrint = (options.cmdPrint!=undefined)? options.cmdPrint:true;
	options.cmdFilter = (options.cmdFilter!=undefined)? options.cmdFilter:true;
	options.cmdFilterSave = (options.cmdFilterSave!=undefined)? options.cmdFilterSave:(options.variantStorage!=undefined);
	options.cmdFilterOpen = (options.cmdFilterOpen!=undefined)? options.cmdFilterOpen:(options.variantStorage!=undefined);	
	options.cmdExcel = (options.cmdExcel!=undefined)? options.cmdExcel:false;
	options.cmdPdf = (options.cmdPdf!=undefined)? options.cmdPdf:false;
	
	options.variantStorage = options.variantStorage || {};
	
	var self = this;
	
	/* make */
	if (options.cmdMake){
		this.setCmdMake( (typeof(options.cmdMake)=="object")?
			options.cmdMake : new GridCmd(id+":make",{
				"onCommand":options.onReport,
				"caption":this.BTN_MAKE_CAP,
				"title":this.BTN_MAKE_TITLE
			})
		);	
	
	}

	if (options.cmdFilter){
		if (options.cmdFilterSave){		
			this.setCmdFilterSave( (typeof(options.cmdFilterSave)=="object")?
				options.cmdFilterSave : new GridCmdFilterSave(id+":filterSave",{
					"variantStorageName":options.variantStorage.name,
					"dataCol":"filter_data"
				})
			);
		}		
		
		if (options.cmdFilterOpen){		
			this.setCmdFilterOpen( (typeof(options.cmdFilterOpen)=="object")?
				options.cmdFilterOpen : new GridCmdFilterOpen(id+":filterOpen",{
					"variantStorageName":options.variantStorage.name,
					"dataCol":"filter_data"
				})
			);
		}
				
		this.setCmdFilter( (typeof(options.cmdFilter)=="object")?
			options.cmdFilter : new GridCmdFilter(id+":filter",{
				"filters":options.filters,
				"controlSave":this.getCmdFilterSave(),
				"controlOpen":this.getCmdFilterOpen(),
				"variantStorageModel":options.variantStorage.model
			})
		);
		/**
		 * there will be no grid
		 */
		this.getCmdFilter().unserializeFilters();
	}

	/* print */
	if (options.cmdPrint){
		this.setCmdPrint( (typeof(options.cmdPrint)=="object")?
			options.cmdPrint : new GridCmd(id+":print",{
				"glyph":"glyphicon-print",
				"onCommand":options.onPrint,
				//"caption":this.BTN_PRINT_CAP,
				"title":this.BTN_PRINT_TITLE
			})
		);	
		this.getCmdPrint().getControl().setEnabled(false);
	}

	/* Excel */
	if (options.cmdExcel){
		this.setCmdExcel( (typeof(options.cmdExcel)=="object")?
			options.cmdExcel : new GridCmd(id+":excel",{
				"glyph":"glyphicon-save-file",
				"onCommand":options.onExcel,
				//"caption":this.BTN_PRINT_CAP,
				"title":this.BTN_EXCEL_TITLE
			})
		);	
		this.getCmdExcel().getControl().setEnabled(false);
	}

	/* Pdf */
	if (options.cmdPdf){
		this.setCmdPdf( (typeof(options.cmdPdf)=="object")?
			options.cmdPdf : new GridCmd(id+":pdf",{
				"glyph":"glyphicon-save-file",
				"onCommand":options.onPdf,
				//"caption":this.BTN_PRINT_CAP,
				"title":this.BTN_PDF_TITLE
			})
		);	
		this.getCmdPdf().getControl().setEnabled(false);
	}
		
	this.m_commands = options.commands || [];
	this.addControls();
	
}
extend(RepCommands,ControlContainer);

/* Constants */
RepCommands.prototype.DEF_TAG_NAME = "div";
RepCommands.prototype.DEF_CLASS_NAME = "cmdButtons";//btn-group


/* Private */
RepCommands.prototype.m_cmdMake;
RepCommands.prototype.m_cmdPrint;
RepCommands.prototype.m_cmdExcel;
RepCommands.prototype.m_cmdPdf;
RepCommands.prototype.m_cmdFilter;
RepCommands.prototype.m_cmdFilterOpen;
RepCommands.prototype.m_cmdFilterSave;
RepCommands.prototype.m_commands;


/* override in extendet classes*/
RepCommands.prototype.addCommands = function(){
	if (this.m_cmdMake){
		this.m_commands.push(this.m_cmdMake);
	}
	if (this.m_cmdPrint){
		this.m_commands.push(this.m_cmdPrint);
	}
	if (this.m_cmdExcel){
		this.m_commands.push(this.m_cmdExcel);
	}
	if (this.m_cmdPdf){
		this.m_commands.push(this.m_cmdPdf);
	}
	if (this.m_cmdFilter){
		this.m_commands.push(this.m_cmdFilter);
	}
	if (this.m_cmdFilterSave){
		this.m_commands.push(this.m_cmdFilterSave);
	}
	if (this.m_cmdFilterOpen){
		this.m_commands.push(this.m_cmdFilterOpen);
	}	
}

RepCommands.prototype.addControls = function(){
	
	this.addCommands();
	
	for (var i=0;i<this.m_commands.length;i++){
		if (this.m_commands[i].getShowCmdControl()){
			this.m_commands[i].controlsToContainer(this);
		}
	}
}

/* Public */

RepCommands.prototype.getCmdMake = function(){
	return this.m_cmdMake;
}
RepCommands.prototype.setCmdMake = function(v){
	this.m_cmdMake = v;
}

RepCommands.prototype.getCmdExcel = function(){
	return this.m_cmdExcel;
}
RepCommands.prototype.setCmdExcel = function(v){
	this.m_cmdExcel = v;
}

RepCommands.prototype.getCmdPdf = function(){
	return this.m_cmdPdf;
}
RepCommands.prototype.setCmdPdf = function(v){
	this.m_cmdPdf = v;
}

RepCommands.prototype.getCmdPrint = function(){
	return this.m_cmdPrint;
}
RepCommands.prototype.setCmdPrint = function(v){
	this.m_cmdPrint = v;
}

RepCommands.prototype.getCmdFilter = function(){
	return this.m_cmdFilter;
}
RepCommands.prototype.setCmdFilter = function(v){
	this.m_cmdFilter = v;
}

RepCommands.prototype.getCmdFilterSave = function(){
	return this.m_cmdFilterSave;
}
RepCommands.prototype.setCmdFilterSave = function(v){
	this.m_cmdFilterSave = v;
}

RepCommands.prototype.getCmdFilterOpen = function(){
	return this.m_cmdFilterOpen;
}
RepCommands.prototype.setCmdFilterOpen = function(v){
	this.m_cmdFilterOpen = v;
}

RepCommands.prototype.delDOM = function(){
	for (var i=0;i<this.m_commands.length;i++){
		this.m_commands[i].onDelDOM();
	}

	RepCommands.superclass.delDOM.call(this);
}

/*
RepCommands.prototype.setVisible = function(v){
	RepCommands.superclass.setVisible.call(this,v);
	
	if (this.m_commands){
		for (var i=0;i<this.m_commands.length;i++){
			for (var k=0;i<this.m_commandss[i].m_controls.length;k++){
				if (this.m_commands[i].m_controls[k]){
					this.m_commands[i].m_controls[k].setVisible(v);
				}
			}
		}
	}
}

RepCommands.prototype.setEnabled = function(v){
	RepCommands.superclass.setEnabled.call(this,v);
	
	if (this.m_commands){
		for (var i=0;i<this.m_commands.length;i++){
			for (var k=0;i<this.m_commands[i].m_controls.length;k++){
				if (this.m_commands[i].m_controls[k]){
					this.m_commands[i].m_controls[k].setEnabled(v);
				}
			}
		}
	}
}
*/
