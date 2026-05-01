/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>,2016

 * @class
 * @classdesc ajax based grid commands

 * @requires core/extend.js  
 * @requires controls/GridCmdContainer.js

 * @param {string} id Object identifier
 * @param {object} options
 * @param {bool|GridCmd} [options.cmdInsert=true]
 * @param {bool|GridCmd} [options.cmdEdit=true]
 * @param {bool|GridCmd} [options.cmdCopy=false]
 * @param {bool|GridCmd} [options.cmdDelete=true]
 * @param {bool|GridCmd} [options.cmdRefresh=true] 
 * @param {bool|GridCmd} [options.cmdPrint=true]
 * @param {bool|GridCmd} [options.cmdPrintObj=false]

 * @param {namespace} options.printObjList
 * @param {bool|GridCmd} [options.cmdAllCommands=true]
 * @param {bool|GridCmd} [options.cmdSearch=true]
 * @param {bool|GridCmd} [options.cmdColManager=true]
 * @param {bool|GridCmd} options.cmdFilter
 * @param {bool|GridCmd} options.cmdFilterSave
 * @param {bool|GridCmd} options.cmdFilterOpen  
 * @param {object} options.filters
 * @param {object} options.variantStorage
 * @param {PopUpMenu} options.popUpMenu     
*/

function GridCmdContainer(id,options){
	options = options || {};
	
	options.attrs = options.attrs || {};
	options.className = options.className || options.attrs["class"] || this.DEF_CLASS_NAME;
	
	options.cmdInsert = (options.cmdInsert!=undefined)? options.cmdInsert : true;//(window.onSelect? false:true);
	options.cmdEdit = (options.cmdEdit!=undefined)? options.cmdEdit:options.cmdInsert;
	options.cmdCopy = (options.cmdCopy!=undefined)? options.cmdCopy:options.cmdInsert;
	options.cmdDelete = (options.cmdDelete!=undefined)? options.cmdDelete:options.cmdInsert;
	options.cmdRefresh = (options.cmdRefresh!=undefined)? options.cmdRefresh:true;
	options.cmdPrint = (options.cmdPrint!=undefined)? options.cmdPrint:true;
	options.cmdPrintObj = (options.printObjList!=undefined)? true:((options.cmdPrintObj!=undefined)? options.cmdPrintObj:false);
	options.cmdSearch = (options.cmdSearch!=undefined)? options.cmdSearch:true;
	options.cmdColManager = (options.cmdColManager!=undefined)? options.cmdColManager:false;
	options.cmdFilter = (options.cmdFilter!=undefined)? options.cmdFilter:(options.filters!=undefined);
	options.cmdFilterSave = (options.cmdFilterSave!=undefined)? options.cmdFilterSave:(options.variantStorage!=undefined);
	options.cmdFilterOpen = (options.cmdFilterOpen!=undefined)? options.cmdFilterOpen:(options.variantStorage!=undefined);
	options.cmdAllCommands = (options.cmdAllCommands!=undefined)? options.cmdAllCommands:true;
	
	options.templateOptions = options.templateOptions || {};
	options.templateOptions.cmdInsert=options.cmdInsert,
	options.templateOptions.cmdEdit=options.cmdEdit,
	options.templateOptions.cmdCopy=options.cmdCopy,
	options.templateOptions.cmdDelete=options.cmdDelete,
	options.templateOptions.cmdRefresh=options.cmdRefresh,
	options.templateOptions.cmdPrint=options.cmdPrint,
	options.templateOptions.cmdPrintObj=options.cmdPrintObj,
	options.templateOptions.cmdSearch=options.cmdSearch,
	options.templateOptions.cmdColManager=options.cmdColManager,
	options.templateOptions.cmdFilter=options.cmdFilter,
	options.templateOptions.cmdFilterSave=options.cmdFilterSave,
	options.templateOptions.cmdFilterOpen=options.cmdFilterOpen,
	options.templateOptions.cmdAllCommands=options.cmdAllCommands

	GridCmdContainer.superclass.constructor.call(this, id, (options.tagName || this.DEF_TAG_NAME), options);
	
	options.variantStorage = options.variantStorage || {};

	/* insert */
	if (options.cmdInsert){
		this.setCmdInsert( (typeof(options.cmdInsert)=="object")?
			options.cmdInsert : new GridCmdInsert(id+":insert")
		);	
	}
	
	if (options.cmdEdit){
		this.setCmdEdit( (typeof(options.cmdEdit)=="object")?
			options.cmdEdit : new GridCmdEdit(id+":edit")
		);
	}

	
	//copy	
	if(options.cmdCopy){
		this.setCmdCopy( (typeof(options.cmdCopy)=="object")?
			options.cmdCopy : new GridCmdCopy(id+":copy")
		);	
	}	

	//delete
	if(options.cmdDelete){
		this.setCmdDelete( (typeof(options.cmdDelete)=="object")?
			options.cmdDelete : new GridCmdDelete(id+":delete")
		);	
	}	
	
	//column manager
	if (options.cmdColManager){
		var filters_copy = CommonHelper.clone(options.filters);
		this.setCmdColManager( (typeof(options.cmdColManager)=="object")?		
			options.cmdColManager : new GridCmdColManager(id+":colManager",{
				"filters":options.filters,
				"variantStorageName":options.variantStorage["name"],
				"variantStorageModel":options.variantStorage.model
			})
		);		
	}
		
	//print	
	if (options.cmdPrint){
		this.setCmdPrint( (typeof(options.cmdPrint)=="object")?
			options.cmdPrint : new GridCmdPrint(id+":print")
		);		
	}
	
	//refresh
	if (options.cmdRefresh){
		this.setCmdRefresh( (typeof(options.cmdRefresh)=="object")?
			options.cmdRefresh : new GridCmdRefresh(id+":print")
		);		
	}

	//print obj	
	if (options.cmdPrintObj){
		this.setCmdPrintObj( (typeof(options.cmdPrintObj)=="object")?
			options.printObj : new GridCmdPrintObj(id+":printObj",{
						"printList":options.printObjList,
						"keyIds":options.printObjListKeyIds
					})
		);			
	}
	
	//search
	if (options.cmdSearch){		
		this.setCmdSearch( (typeof(options.cmdSearch)=="object")?
			options.cmdSearch : new GridCmdSearch(id+":search")
		);
		//this.getCmdSearch().setFilterInfo(this.m_filterInfo);
	}

	//filter
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
				"variantStorage":options.variantStorage
			})
		);
		//this.getCmdFilter().setFilterInfo(this.m_filterInfo);				
	}

	//all commands
	if (options.cmdAllCommands){
		this.setCmdAllCommands( (typeof(options.cmdAllCommands)=="object")?
			options.cmdAllCommands : new GridCmdAllCommands(id+":allCommands")
		);		
	}
	
	this.m_popUpMenu = options.popUpMenu;
	
	this.m_commands = [];
	if (options.addCustomCommands){
		options.addCustomCommands.call(this,this.m_commands);
	}
	else if (options.addCustomCommandsBefore){
		options.addCustomCommandsBefore.call(this,this.m_commands);
	}
	
	this.addControls();

	if (options.addCustomCommandsAfter){
		var l = this.m_commands.length;
		options.addCustomCommandsAfter.call(this,this.m_commands);
		for(var i=l;i<this.m_commands.length;i++){			
			if (this.m_commands[i].getShowCmdControl()){
				this.m_commands[i].controlsToContainer(this);
			}		
		}
	}
	
	//always last
	if (this.m_cmdAllCommands){
		this.m_commands.push(this.m_cmdAllCommands);
		if (this.m_cmdAllCommands.getShowCmdControl()){
			this.m_cmdAllCommands.controlsToContainer(this);
		}
		
	}
	
}
extend(GridCmdContainer,ControlContainer);

/* Constants */
GridCmdContainer.prototype.DEF_TAG_NAME = "DIV";
GridCmdContainer.prototype.DEF_CLASS_NAME = "cmdButtons";//btn-group

/* Private */
GridCmdContainer.prototype.m_grid;
GridCmdContainer.prototype.m_cmdInsert;
GridCmdContainer.prototype.m_cmdEdit;
GridCmdContainer.prototype.m_cmdCopy;
GridCmdContainer.prototype.m_cmdDelete;
GridCmdContainer.prototype.m_cmdPrint;
GridCmdContainer.prototype.m_cmdRefresh;
GridCmdContainer.prototype.m_cmdColManager;

GridCmdContainer.prototype.m_cmdPrintObj;
GridCmdContainer.prototype.m_cmdSearch;
GridCmdContainer.prototype.m_cmdFilter;
GridCmdContainer.prototype.m_cmdFilterSave;
GridCmdContainer.prototype.m_cmdFilterOpen;
GridCmdContainer.prototype.m_cmdAllCommands;
GridCmdContainer.prototype.m_popUpMenu;

/* override in extendet classes*/
GridCmdContainer.prototype.addCommands = function(){
	if (this.m_cmdInsert){
		this.m_commands.push(this.m_cmdInsert);
	}
	if (this.m_cmdEdit){
		this.m_commands.push(this.m_cmdEdit);
	}
	if (this.m_cmdCopy){
		this.m_commands.push(this.m_cmdCopy);
	}
	if (this.m_cmdDelete){
		this.m_commands.push(this.m_cmdDelete);
	}
	if (this.m_cmdPrint){
		this.m_commands.push(this.m_cmdPrint);
	}
	if (this.m_cmdColManager){
		this.m_commands.push(this.m_cmdColManager);
	}
	if (this.m_cmdRefresh){
		this.m_commands.push(this.m_cmdRefresh);
	}
	if (this.m_cmdPrintObj){
		this.m_commands.push(this.m_cmdPrintObj);
	}
	if (this.m_cmdSearch){
		this.m_commands.push(this.m_cmdSearch);
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

GridCmdContainer.prototype.addControls = function(){
	
	this.addCommands();
	
	for (var i=0;i<this.m_commands.length;i++){
		if (this.m_commands[i].getShowCmdControl()){
			this.m_commands[i].controlsToContainer(this);
		}
	}
	/*
	if (this.m_popUpMenu){
		this.toPopUp(this.m_popUpMenu);
	}
	*/
}


/* Public */
GridCmdContainer.prototype.setGrid = function(v){
	this.m_grid = v;
	
	for (var i=0;i<this.m_commands.length;i++){
		this.m_commands[i].setGrid(v);
	}
	
	if (this.m_popUpMenu){
		this.selectToPopUp();
	}
}
GridCmdContainer.prototype.getGrid = function(){
	return this.m_grid;
}

GridCmdContainer.prototype.selectToPopUp = function(){
	if (this.m_grid && this.m_grid.getOnSelect()){
		if (this.m_cmdInsert
		||this.m_cmdEdit
		||this.m_cmdCopy
		||this.m_cmdDelete
		||this.m_cmdPrint
		||this.m_cmdColManager
		||this.m_cmdRefresh
		||this.m_cmdSearch
		){
			this.m_popUpMenu.addSeparator();
		}
	
		var self = this;
		this.m_popUpMenu.addButton(new ButtonCtrl(null,{
			"caption":this.GRID_SELECT_POPUP_CAPTION,
			"onClick":function(){
				self.m_grid.onSelect();
			}
		}));		
	}
}

GridCmdContainer.prototype.toPopUp = function(){
	for (var i=0;i<this.m_commands.length;i++){
		if (this.m_commands[i].getShowCmdControlInPopup()){
			this.m_commands[i].controlsToPopUp(this.m_popUpMenu);
		}
	}
	
}

GridCmdContainer.prototype.getCmdInsert = function(){
	return this.m_cmdInsert;
}
GridCmdContainer.prototype.setCmdInsert = function(v){
	this.m_cmdInsert = v;
}

GridCmdContainer.prototype.getCmdEdit = function(){
	return this.m_cmdEdit;
}
GridCmdContainer.prototype.setCmdEdit = function(v){
	this.m_cmdEdit = v;
}

GridCmdContainer.prototype.getCmdCopy = function(){
	return this.m_cmdCopy;
}
GridCmdContainer.prototype.setCmdCopy = function(v){
	this.m_cmdCopy = v;
}

GridCmdContainer.prototype.getCmdDelete = function(){
	return this.m_cmdDelete;
}
GridCmdContainer.prototype.setCmdDelete = function(v){
	this.m_cmdDelete = v;
}

GridCmdContainer.prototype.getCmdPrint = function(){
	return this.m_cmdPrint;
}
GridCmdContainer.prototype.setCmdPrint = function(v){
	this.m_cmdPrint = v;
}

GridCmdContainer.prototype.getCmdRefresh = function(){
	return this.m_cmdRefresh;
}
GridCmdContainer.prototype.setCmdRefresh = function(v){
	this.m_cmdRefresh = v;
}

GridCmdContainer.prototype.getCmdColManager = function(){
	return this.m_cmdColManager;
}
GridCmdContainer.prototype.setCmdColManager = function(v){
	this.m_cmdColManager = v;
}

GridCmdContainer.prototype.getCmdPrintObj = function(){
	return this.m_cmdPrintObj;
}
GridCmdContainer.prototype.setCmdPrintObj = function(v){
	this.m_cmdPrintObj = v;
}

GridCmdContainer.prototype.getCmdSearch = function(){
	return this.m_cmdSearch;
}
GridCmdContainer.prototype.setCmdSearch = function(v){
	this.m_cmdSearch = v;
}
GridCmdContainer.prototype.getCmdFilter = function(){
	return this.m_cmdFilter;
}
GridCmdContainer.prototype.setCmdFilter = function(v){
	this.m_cmdFilter = v;
}

GridCmdContainer.prototype.getCmdFilterSave = function(){
	return this.m_cmdFilterSave;
}
GridCmdContainer.prototype.setCmdFilterSave = function(v){
	this.m_cmdFilterSave = v;
}

GridCmdContainer.prototype.getCmdFilterOpen = function(){
	return this.m_cmdFilterOpen;
}
GridCmdContainer.prototype.setCmdFilterOpen = function(v){
	this.m_cmdFilterOpen = v;
}

GridCmdContainer.prototype.getCmdAllCommands = function(){
	return this.m_cmdAllCommands;
}
GridCmdContainer.prototype.setCmdAllCommands = function(v){
	this.m_cmdAllCommands = v;
}

GridCmdContainer.prototype.getPopUpMenu = function(){
	return this.m_popUpMenu;
}
GridCmdContainer.prototype.setPopUpMenu = function(v){
	this.m_popUpMenu = v;
	if (this.m_popUpMenu){
		this.toPopUp(this.m_popUpMenu);
	}	
}

GridCmdContainer.prototype.delDOM = function(){
	//console.log("GridCmdContainer.prototype.delDOM")
	for (var i=0;i<this.m_commands.length;i++){
		this.m_commands[i].onDelDOM();
	}

	GridCmdContainer.superclass.delDOM.call(this);
}
