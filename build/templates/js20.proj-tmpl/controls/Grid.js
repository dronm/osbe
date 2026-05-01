/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>,2016

 * @class
 * @classdesc grid object
  
 * @requires controls/WindowQuestion.js
 * @requires controls/GridHead.js
 * @requires controls/GridBody.js
 * @requires controls/GridFoot.js
 * @requires controls/GridPagination.js     

 * @param {string} id Object identifier
 * @param {object} options
 * @param {string} options.className - synonym of attrs.class
 * @param {string} [options.bodyTagName=DEF]
 * @param {string} options.bodyClassName
 * @param {bool} [options.cmdInsert=true]
 * @param {bool} [options.cmdEdit=true]
 * @param {bool} [options.cmdCopy=true]
 * @param {bool} [options.cmdPrint=true]
 * @param {GridCommands|GridCmdContainer} options.commands
 * @param {Model} options.model
 * @param {View} options.editViewClass
 * @param {object} options.editViewOptions
 * @param {object} options.insertViewOptions 
 * @param {WindowFormObject} options.editWinClass
 * @param {WindowFormObject} options.editWinOptions 
 * @param {int} [options.refreshInterval=0]
 * @param {bool} [options.editInline=true]
 * @param {RowCommandClass} options.rowCommandClass
 * @param {function} options.onSelect - triggers select mode, event is fired when row is selected (dblclick or enter)
 * @param {bool} [options.multySelect=false] - enables multy row selection
 * @param {bool} [options.autoRefresh=false]
 * @param {GridHead} options.head
 * @param {bool} [options.showHead=true]
 * @param {GridBody} options.body
 * @param {GridFoot} options.foot
 * @param {GridPagination} options.pagination
 * @param {bool} [options.rowSelect=true]
 * @param {bool} [options.resize=true]  - ToDo
 * @param {string} options.contClassName  - Container class name
 * @param {string} options.contTagName  - Container tag name
 * @param {PopUpMenu} options.popUpMenu
 * @param {bool} [options.navigate=true]
 * @param {bool} [options.navigateClick=true]
 * @param {bool} [options.navigateMouse=true] 
 * @param {bool} [options.fixedHeader=false] - ToDo
 * @param {int} [options.fixedOffset=0] - ToDo
 * @param {function} options.onEventSetRowClass - DEPRICATED fired when setting a row class
 * @param {function} options.onEventSetRowOptions - fired when setting new row options
 * @param {function} options.onEventSetCellOptions - fired when setting new cell options   
 * @param {function} options.onEventAddRow - fired before adding a row to table body
 * @param {function} options.onEventAddCell - fired before adding a cell to table body.row
 * @param {function} options.onEventGetData - fired on getData
 * @param {GridRow} [options.rowClass=GridRow]
 * @param {array[]} options.keyIds - conains key field identifiers
 * @param {bool} [options.lastRowFooter=false]
 * @param {function} options.onRefresh - ??? this func will be executed after gird onRefresh is done
 * @param {function} options.onSearch
 * @param {bool} [options.lastRowSelectOnInit=false] - indicates that on grid init the last row will be selected and not the first as is default
 * @param {string} [options.selectedRowClass=DEF]
 * @param {string} [options.selectedCellClass=DEF]
 * @param {Control} [options.errorControl]
 * @param {Control} [options.searchInfControl] 
 * @param {string} [options.inlineInsertPlace] first(default)|last|current     
*/
function Grid(id,options){
	options = options || {};
	options.className = (options.className!=undefined)? options.className:this.DEF_CLASS;
	
	/* if node exists it will be a container!!!*/
	var n = CommonHelper.nd(id,this.getWinObjDocument());
	if (n){
		n.id = n.id + ":cont";
	}		
	
	this.setOnSelect(options.onSelect || window.onSelect);
	//this.setMultySelect(options.multySelect || window.multySelect);
	
	this.setOnSearch(options.onSearch);
			
	this.setCmdInsert((options.cmdInsert!=undefined)? options.cmdInsert : ((options.commands&&options.commands.cmdInsert!=undefined)? options.commands.cmdInsert:true) );
	this.setCmdEdit((options.cmdEdit!=undefined)? options.cmdEdit : ((options.commands&&options.commands.cmdEdit!=undefined)? options.commands.cmdEdit:this.getCmdInsert()));
	this.setCmdCopy((options.cmdCopy!=undefined)? options.cmdCopy : ((options.commands&&options.commands.cmdCopy!=undefined)? options.commands.cmdCopy:this.getCmdInsert()) );
	this.setCmdDelete((options.cmdDelete!=undefined)? options.cmdDelete : ((options.commands&&options.commands.cmdDelete!=undefined)? options.commands.cmdDelete:this.getCmdInsert()) );
	this.setCmdPrint((options.cmdPrint!=undefined)? options.cmdPrint : ((options.commands&&options.commands.cmdPrint!=undefined)? options.commands.cmdPrint:true));
	
	Grid.superclass.constructor.call(this,id,(options.tagName || this.DEF_TAG_NAME),options);

	this.setModel(options.model);	
	
	this.setEditWinClass(options.editWinClass);
	this.setEditWinOptions(options.editWinOptions);		
	this.setEditViewClass(options.editViewClass);
	this.setEditViewOptions(options.editViewOptions);
	this.setInsertViewOptions(options.insertViewOptions||options.editViewOptions);

	this.setEditInline(options.editInline);	
	this.setRefreshInterval(options.refreshInterval || this.DEF_REFRESH_INTERVAL);
	this.setRowCommandClass(options.rowCommandClass);
		
	this.setAutoRefresh( (options.autoRefresh!=undefined)? options.autoRefresh:false );
	
	if(options.enabled!=undefined){
		if (options.head) options.head.enabled = options.enabled;
		if (options.body) options.body.enabled = options.enabled;
		if (options.foot) options.foot.enabled = options.enabled;
		if (options.commands) options.commands.enabled = options.enabled;
	}
		
	this.setHead(options.head);
	this.setShowHead((options.showHead!=undefined)? options.showHead:true);
	this.setBody(options.body || new GridBody(id+":body",{"tagName":options.bodyTagName||this.DEF_BODY_TAG_NAME,"className":options.bodyClassName}));
	this.setFoot(options.foot);
	
	this.setErrorControl((options.errorControl!==undefined)? options.errorControl: (this.m_html? null:new ErrorControl(id+":error")) );
	this.setSearchInfControl((options.searchInfControl!==undefined)? options.searchInfControl: (this.m_html? null:new GridSearchInf(id+":serchInf",{"grid":this})) );
	
	this.m_selectedRowClass = options.selectedRowClass || this.SELECTED_ROW_CLASS;
	this.m_selectedCellClass = options.selectedCellClass || this.SELECTED_CELL_CLASS;
	
	if (options.commands){
		options.commands.setGrid(this);
		this.setCommands(options.commands);
		
		this.setCmdInsert(options.commands.getCmdInsert());
		this.setCmdEdit(options.commands.getCmdEdit());
		this.setCmdCopy(options.commands.getCmdCopy());
		this.setCmdDelete(options.commands.getCmdDelete());
		this.setCmdPrint(options.commands.getCmdPrint());
	}
	
	var self = this;
	
	/*
	if (!options.pagination && options.model && ){
	}
	*/
	
	if (options.pagination){
		this.setPagination(options.pagination);
		if (options.model){
			options.pagination.setFrom(options.model.getPageFrom());
		}
		options.pagination.setGrid(this)
	}
	
	this.setPopUpMenu(options.popUpMenu);
	
	if(window.getWidthType()=="sm"){
		options.rowSelect = true; //always!
	}
	this.setRowSelect( (options.rowSelect!=undefined)?  options.rowSelect : true );
	this.setLastRowSelectOnInit((options.lastRowSelectOnInit!=undefined)? options.lastRowSelectOnInit : false);
	
	this.setContClassName(options.contClassName);
	this.setContTagName(options.contTagName || "DIV");
	
	//this.setRowClass(options.rowClass || GridRow);
	
	this.setLastRowFooter(options.lastRowFooter);
	
	//depricated
	this.m_onEventSetRowClass = options.onEventSetRowClass;
	
	this.m_onEventAddRow = options.onEventAddRow;
	this.m_onEventSetRowOptions = options.onEventSetRowOptions;
	this.m_onEventAddCell = options.onEventAddCell;
	this.m_onEventSetCellOptions = options.onEventSetCellOptions;
	this.m_onEventGetData = options.onEventGetData;
	
	this.setResize((options.resize!=undefined)? options.resize:true);
	
	var nav = (options.navigate!=undefined)? options.navigate:true;
	this.setNavigate(nav);
	this.setNavigateClick((options.navigateClick!=undefined)? options.navigate:nav);
	this.setNavigateMouse((options.navigateMouse!=undefined)? options.navigateMouse:nav);
	
	this.setInlineInsertPlace((options.inlineInsertPlace!=undefined)? options.inlineInsertPlace:"first");
	
	this.m_onRefresh = options.onRefresh;
		
	this.m_keyIds = options.keyIds || ["id"];
	
	this.m_keyDown = function(e){
		self.onKeyDown(e);
	};

	this.m_keyPress = function(e){
		self.onKeyPress(e);
	};
	
	this.m_wheelEvent = function(e){
		self.onWheel(e);
	};
	
	this.m_focusEvent = function(){
		self.setFocused(true);
	}
	this.m_blurEvent = function(){
		self.setFocused(false);		
	}
	
	this.m_clickEvent = options.clickEvent || function(ev){		
		self.onClick(ev);
		/*
		if (!self.m_tappedTwice){
			
			
			self.m_tappedTwice = true;						
			
			setTimeout( function() { self.m_tappedTwice=false; }, 300 );
			return;
		}
		ev.preventDefault();			
		//self.onDblClick(ev);
		self.m_tappedTwice = false;		
		*/
	};
	
	this.m_dblClickEvent = function(ev){
		self.onDblClick(ev);
	};	
	
	//sorting
	var head = this.getHead();
	if (head){
		var col_man,col_order,col_visib,col_filter;
		var cmd = this.getCommands() ;
		if (cmd && options.popUpMenu && cmd.setPopUpMenu){
			cmd.setPopUpMenu(options.popUpMenu);
		}
		if (cmd && cmd.getCmdColManager){
			col_man = cmd.getCmdColManager();
			if (col_man){
				col_order = col_man.getColOrder();
				col_visib = col_man.getColVisibility();
				//col_filter = col_man.getColFilter();
			}
		}
		var col_names = {};
		for (var row in head.m_elements){
			var head_row = head.m_elements[row];
			head_row.setInitColumnOrder();
			
			for (var col in head_row.m_elements){
				if (head_row.m_elements[col].getSortable()){
					var f_name = head_row.m_elements[col].getName();
					if (f_name){
						col_names[f_name] = head_row.m_elements[col];
					}
				
					head_row.m_elements[col].m_onRefresh = function(){
						self.onRefresh();
					}
					
					head_row.m_elements[col].setColManager(col_man);
					
					if (col_order && col_order.length){
						//clear all
						head_row.m_elements[col].setSortable(false);
					}					
				}
			}
			if (col_visib && col_visib.length){	
							
				head_row.setColumnOrder(col_visib);
			}
		}
		
		if (col_man){
			col_man.init();
		}
		
		
		if (col_order){
			//custom sorting
			for (var i=0;i<col_order.length;i++){
				var f_name = col_order[i].colId;
				if (col_names[f_name]){
			
					if (col_order[i].checked && col_order[i].direct!="undefined" && col_names[f_name]){
						col_names[f_name].setSortable(true);
						col_names[f_name].setSort(col_order[i].direct);
					}
				}
			}
		}
		
	}	
	//fixed header
	if (options.fixedHeader){
		this.m_fixedHeader = true;
		this.m_fixedOffset = options.fixedOffset||0;
	}
	
	this.m_editWinObjList = {};
}
extend(Grid, Control);

/* Constants */
Grid.prototype.DEF_TAG_NAME = "TABLE";
Grid.prototype.DEF_ROW_TAG_NAME = "TR";
Grid.prototype.DEF_CELL_TAG_NAME = "TD";
Grid.prototype.DEF_BODY_TAG_NAME = "TBODY";

Grid.prototype.SELECTED_ROW_CLASS = "success";
Grid.prototype.SELECTED_CELL_CLASS = "info";
Grid.prototype.FOCUSED_CLASS = "focused";
//
Grid.prototype.DEF_CLASS = "table table-bordered table-responsive table-striped smallWidthCardFormat";
Grid.prototype.DEF_TAB_INDEX = "100";
Grid.prototype.DEF_REFRESH_INTERVAL = "0";
Grid.prototype.CONSTR_FADE_CLASS = "viewFadeOnConstruct";

Grid.prototype.INCORRECT_VAL_CLASS="error";
Grid.prototype.VAL_INIT_ATTR = "initValue";

/* Private */
Grid.prototype.m_commands;
Grid.prototype.m_pagination;
Grid.prototype.m_head;
Grid.prototype.m_body;
Grid.prototype.m_foot;
Grid.prototype.m_editInline;

Grid.prototype.m_editWinClass;
Grid.prototype.m_editWinObj;
Grid.prototype.m_editWinObjList;
Grid.prototype.m_editViewClass;
Grid.prototype.m_editViewOptions;
Grid.prototype.m_insertViewOptions;
Grid.prototype.m_editViewObj;

Grid.prototype.m_rowCommandPanelClass;
Grid.prototype.m_refInterval;
Grid.prototype.m_refIntervalObj;
Grid.prototype.m_onSelect;
//Grid.prototype.m_multySelect;
Grid.prototype.m_onEventSetRowClass;
Grid.prototype.m_onEventDelete;
Grid.prototype.m_onEventInsert;
Grid.prototype.m_contClassName;
Grid.prototype.m_contTagName;
Grid.prototype.m_popUpMenu;
Grid.prototype.m_rowSelect;
Grid.prototype.m_lastRowSelectOnInit;
Grid.prototype.m_resize;
Grid.prototype.m_navigate;
Grid.prototype.m_navigateClick;
Grid.prototype.m_navigateMouse;

Grid.prototype.m_cmdInsert;
Grid.prototype.m_cmdEdit;
Grid.prototype.m_cmdCopy;
Grid.prototype.m_cmdDelete;
Grid.prototype.m_cmdPrint;

Grid.prototype.m_model;
Grid.prototype.m_selectedRowKeys;
Grid.prototype.m_selectedRowId;
Grid.prototype.m_rowClass;
Grid.prototype.m_container;
Grid.prototype.m_containerScroll;
Grid.prototype.m_lastRowFooter;

Grid.prototype.m_keyDown;
Grid.prototype.m_keyPress;
Grid.prototype.m_wheelEvent;

//temp values
Grid.prototype.m_interval;
Grid.prototype.m_oldParent;

Grid.prototype.m_showHead;

Grid.prototype.m_selectedRowClass;

Grid.prototype.m_errorControl;



Grid.prototype.getRowHeight = function(){
	var row_n = this.getSelectedRow();
	if (row_n){
		return $(row_n).height();
	}
}

//Navigation
Grid.prototype.initNavigation = function(){
	this.setFocused(true);
	EventHelper.add(this.m_node,"focus",this.m_focusEvent,false);
	EventHelper.add(this.m_node,"blur",this.m_blurEvent,false);
}

Grid.prototype.addEvents = function(){
	if (this.m_navigate){
		EventHelper.add(this.m_node,'keydown',this.m_keyDown,false);
		EventHelper.add(this.m_node,'keypress',this.m_keyPress,false);
	}
	if (this.m_navigateClick){
		EventHelper.add(this.m_node,"click",this.m_clickEvent,false);
		EventHelper.add(this.m_node,"contextmenu",this.m_clickEvent,false);
		if (this.m_navigateMouse){
			EventHelper.addWheelEvent(this.m_node,this.m_wheelEvent,false);
		}
	}
	if (this.m_cmdEdit || this.m_onSelect){
		EventHelper.add(this.m_node,"dblclick",this.m_dblClickEvent,false);
	}				
}

Grid.prototype.delEvents = function(){
	EventHelper.del(this.m_node,'keydown',this.m_keyDown,false);
	EventHelper.del(this.m_node,'keypress',this.m_keyPress,false);
	EventHelper.del(this.m_node,"click",this.m_clickEvent,false);
	EventHelper.del(this.m_node,"contextevent",this.m_clickEvent,false);
	EventHelper.delWheelEvent(this.m_node,this.m_wheelEvent,false);
	if (this.m_cmdEdit || this.m_onSelect){
		EventHelper.del(this.m_node,"dblclick",this.m_dblClickEvent,false);
	}		
}

Grid.prototype.selectFirstSelectableCell = function(row){
	var cells=row.getElementsByTagName(this.DEF_CELL_TAG_NAME);
	for (var i=0;i<cells.length;i++){
		if (this.getCellSelectable(cells[i])){
			this.selectCell(cells[i]);
			return cells[i];
		}
	}			
}
Grid.prototype.setSelection = function(){

	var selected=false;	
	if (this.m_selectedRowKeys){
		var rows = this.m_body.getNode().getElementsByTagName(this.DEF_ROW_TAG_NAME);
		for (var i=0;i<rows.length;i++){
			if (rows[i].getAttribute("keys")==this.m_selectedRowKeys){
				if (this.m_rowSelect) {
					this.selectRow(rows[i]);
					selected = true;				
				}
				else{
					if (rows[i].childNodes.length>this.m_selectedCellInd){
						this.selectCell(rows[i].childNodes[this.m_selectedCellInd]);
					}
					else{
						this.selectFirstSelectableCell(rows[i]);
					}
					selected=true;
				}				
				break;
			}			
		}
	}
	
	if (!selected){
		var rows = this.getBody().getNode().getElementsByTagName(this.DEF_ROW_TAG_NAME);
		if (rows && rows.length>0){			
			var sel_node;
			if (this.m_rowSelect){
				//var row_body_ind = this.getHead().getCount();
				if (this.m_lastRowSelectOnInit){
					//last row 
					for (var i=rows.length-1;i>0;i--){
						if (this.getRowSelectable(rows[i])){
							sel_node = rows[i];
							this.selectRow(sel_node);
							break;
						}
					}				
				}
				else{
					for (var i=0;i<rows.length;i++){
						if (this.getRowSelectable(rows[i])){
							this.selectRow(rows[i]);
							break;
						}
					}				
				}
			}
			else{
				//this.getHead().getCount()
				var sel_node = this.selectFirstSelectableCell((this.m_lastRowSelectOnInit)? rows[rows.length-1]:rows[0]);
			}
			if (this.m_lastRowSelectOnInit){
				$(sel_node).get(0).scrollIntoView();
			}
			
		}
	}
}

Grid.prototype.keyPressEvent = function(keyCode,event){	
	var res=false;

	if (keyCode == 13){
		// return
		res = this.onEditSelect(event);			
	}
	else if (keyCode == 33){
		// PageUp
		//res = this.();
		//@ToDo
	}	
	else if (keyCode == 34){
		// PageDown
		//res = this.();
		//@ToDo
	}		
	else if (keyCode == 35){
		// End
		//res = this.();
		//@ToDo
	}			
	else if (keyCode == 36){
		// Home
		//res = this.();
		//@ToDo
	}						
	else if (keyCode == 37){
		// arrow left
		res = this.onPreviousColumn();
	}	
	else if (keyCode == 38){
		// arrow up
		res = this.onPreviousRow();
	}
	else if (keyCode == 39){
		// arrow right
		res = this.onNextColumn();
	}
	else if (keyCode == 40){
		// arrow down				
		res = this.onNextRow();	
	}	
	else if (keyCode == 45){
		// insert
		res = this.onInsert();
	}	
	else if (keyCode == 46){
		// delete
		//res = this.onDelete();
		//with commands!!!
		var cmd = this.getCommands? this.getCommands():null;
		if(cmd&&cmd.getCmdDelete){
			var cmd_ctrl = cmd.getCmdDelete();
			if(cmd_ctrl){
				cmd_ctrl.onCommand();
			}
		}
	}
	else if (keyCode == 120){
		// F5
		res = this.onCopy();
	}
	else if (keyCode == 80 && event.ctrlKey){
		// ctrl+P
		res = this.onPrint();
	}
	else if (keyCode == 70 && event.ctrlKey && this.m_onSearchDialog){
		// ctrl+F
		this.m_onSearchDialog();
		res = true;
	}
	else if (keyCode == 71 && event.ctrlKey && this.m_onSearchReset){
		// ctrl+G
		this.m_onSearchReset();
		res = true;
	}
	
	return res;
}

Grid.prototype.onPreviousColumn = function(){	
	res = false;
	if (!this.m_rowSelect){
		var selected_node = this.getSelectedNode();
		if (selected_node && selected_node.previousSibling && this.getCellSelectable(selected_node.previousSibling)){
			this.selectCell(selected_node.previousSibling, selected_node);
		}
		res = true;
	}
	return res;
}

Grid.prototype.onNextColumn = function(){	
	var res = false;
	if (!this.m_rowSelect){
		var selected_node = this.getSelectedNode();
		if (selected_node && selected_node.nextSibling && this.getCellSelectable(selected_node.nextSibling)){
			this.selectCell(selected_node.nextSibling, selected_node);
		}						
		res = true;
	}				
	return res;
}

Grid.prototype.onPreviousRow = function(){	
	var res = false;
	var selected_node = this.getSelectedNode();
	var new_node;
	
	if (selected_node && this.m_rowSelect && selected_node.previousSibling
	&& (selected_node.previousSibling.nodeName == selected_node.nodeName)
	&& this.getRowSelectable(selected_node.previousSibling)
	){
		/*Row selection*/
		new_node = selected_node.previousSibling; 
		this.selectRow(new_node, selected_node);
		res = true;
	}
	
	else if (selected_node && !this.m_rowSelect
	&& selected_node.parentNode.previousSibling
	&& (selected_node.parentNode.previousSibling.nodeName == selected_node.parentNode.nodeName)
	&& this.getCellSelectable(selected_node.parentNode.previousSibling)
	){
		/*Cell selection*/
		new_node = selected_node.parentNode.previousSibling.childNodes[DOMHelper.getElementIndex(selected_node)]; 
		this.selectCell(new_node, selected_node);
		res = true;
	}
	if (res && new_node && !DOMHelper.inViewport(new_node,true)){
		$(new_node).get(0).scrollIntoView();
	}
					
	return res;
}
Grid.prototype.onNextRow = function(){	
	var res = false;
	var selected_node = this.getSelectedNode();
	var new_node;
	
	if (selected_node && this.m_rowSelect && selected_node.nextSibling
	&& (selected_node.nextSibling.nodeName==selected_node.nodeName)
	&& this.getRowSelectable(selected_node.nextSibling)
	){
		/*Row selection*/
		new_node = selected_node.nextSibling; 
		this.selectRow(new_node, selected_node);
		res = true;
	}
	else if (selected_node && !this.m_rowSelect && selected_node.parentNode.nextSibling
	&& (selected_node.parentNode.nextSibling.nodeName==selected_node.parentNode.nodeName)
	&& this.getCellSelectable(selected_node.parentNode.nextSibling)
	){
		/*Cell selection*/
		var ind = DOMHelper.getElementIndex(selected_node);
		new_node = selected_node.parentNode.nextSibling.childNodes[ind];
		this.selectCell(new_node, selected_node);
		res = true;
	}
	
	if (res && new_node && !DOMHelper.inViewport(new_node,true)){
		$(new_node).get(0).scrollIntoView();
	}
					
	return res;
}

Grid.prototype.delRow = function(rowNode){	
	this.deleteRowNode(rowNode);
}

Grid.prototype.deleteRowNode = function(rowNode){		
	if (!rowNode){
		rowNode = this.getSelectedRow();
	}
		
	if (rowNode){
		var new_node = rowNode.nextSibling;
		if (!new_node){
			new_node = rowNode.previousSibling;
		}
	
		DOMHelper.delNode(rowNode);
		
		if (new_node){
			//set position to the next row on success		
			if (this.m_rowSelect){
				this.selectRow(new_node);
			}
			else{
				var tds = new_node.getElementsByTagName(this.DEF_CELL_TAG_NAME);
				for (var i=0;i<tds.length;i++){
					if (!DOMHelper.hasClass(tds[i],this.CLASS_INVISIBLE)){
						this.selectCell(tds[i]);
						break;
					}
				}			
			}
		}		
	}	
}

Grid.prototype.onDelete = function(callBack){	
	var res = false;
	if (this.m_cmdDelete){
		var selected_node = this.getSelectedRow();
		if (selected_node){
			var self = this;
			this.setFocused(false);
			WindowQuestion.show({
				"cancel":false,
				"text":this.Q_DELETE,
				"callBack":function(r){
					if (r==WindowQuestion.RES_YES){
						self.delRow(selected_node);
					}
					else{
						self.focus();	
					}
					if(callBack){
						callBack(r);
					}
				}
			});	
			res = true;
		}
	}
	return res;
}

Grid.prototype.onSelect = function(){	
	this.m_onSelect(this.getModelRow());
}

/*Edit && Selection cases are treated here*/
Grid.prototype.onEditSelect = function(event){	
	var res = false;	
	if (this.m_cmdEdit && (!this.m_onSelect || (this.m_onSelect && event.ctrlKey)) ){
		/* Edit */
		this.edit("edit");
		res = true;
	}
	else if (this.m_onSelect && !event.ctrlKey){
		/* Selection */
		//Call onSelect function from parent form
		//Return keys or model
		//this.m_onSelect(this.getModelRow());
		this.onSelect();
		res = true;
	}
	return res;
}
Grid.prototype.onDblClick = function(ev){
	ev = EventHelper.fixMouseEvent(ev);			
	this.onEditSelect(ev);
	/*
	if (this.m_cmdEdit){
		this.edit(false);
	}
	*/
}

Grid.prototype.nodeClickable = function(node){
	return (this.getEnabled() && node.nodeName==this.DEF_CELL_TAG_NAME && DOMHelper.getParentByTagName(node,this.DEF_BODY_TAG_NAME));
}

Grid.prototype.onClick = function(ev){
	ev = EventHelper.fixMouseEvent(ev);
	/**
	 @toDo make out other ways of determineing that clicking has occured inside table body
	 */
	//if (this.getEnabled() && ev.target.nodeName==this.DEF_CELL_TAG_NAME && DOMHelper.getParentByTagName(ev.target,this.DEF_BODY_TAG_NAME)){
	if (this.nodeClickable(ev.target)){
		if (!this.getFocused()){
			this.setFocused(true);
		}
		
		if (this.m_rowSelect){
			var row = (ev.target.nodeName==this.DEF_ROW_TAG_NAME)? ev.target:DOMHelper.getParentByTagName(ev.target,this.DEF_ROW_TAG_NAME);
			if (row && this.getRowSelectable(row)){
				this.selectRow(row, this.getSelectedNode());
			}
			
		}
		else if (this.getCellSelectable(ev.target)){
			this.selectCell(ev.target, this.getSelectedNode());
		}
	}
}

Grid.prototype.onKeyDown = function(e){
	if (this.getEnabled() && this.getFocused()){
		e = EventHelper.fixKeyEvent(e);
		//var key_code = (event.charCode) ? event.charCode : event.keyCode;
		this.m_curKeyDown = e;
		if (this.keyPressEvent(e.keyCode,e)){
			if (e.preventDefault){
				e.preventDefault();
			}
			e.stopPropagation();
			return false;
		}
	}
}

Grid.prototype.onKeyPress = function(e){
	if (this.getEnabled() && this.getFocused() && !this.m_rowSelect && this.m_onSearch && !this.m_curKeyDown.ctrlKey){
		e = EventHelper.fixKeyEvent(e);
		
		if (this.m_onSearch.call(this,e)){
			if (e.preventDefault){
				e.preventDefault();
			}
			e.stopPropagation();
			return false;
		}
	}
}

Grid.prototype.onWheel = function(e){
	if (this.getEnabled() && this.getFocused()){
		e = EventHelper.fixWheelEvent(e);
		var moved;
		if (e.delta>0){
			moved = this.onNextRow();
		}
		else{
			moved = this.onPreviousRow();
		}
		//console.log("delta="+e.delta+" h="+this.getRowHeight());
		
		if (moved){
			if (e.preventDefault){
				e.preventDefault();
			}
			e.stopPropagation();
		}		
		return false;
		
	}
}

Grid.prototype.initEditWinObj = function(cmd){
	//this.setEnabled(false);
	//var key_str = "";
	var keys = {};
	if (cmd!="insert"){
		var fields = this.m_model.getFields();
		var key_fields = this.getKeyIds();
		
		if (key_fields && key_fields.length){
			for (var i=0;i<key_fields.length;i++){
				if (fields[key_fields[i]]){
					keys[key_fields[i]] = fields[key_fields[i]].getValueXHR();
				}				
			}
		}
		else{			
			for (var id in fields){
				if (fields[id].getPrimaryKey()){
					keys[id] = fields[id].getValueXHR();
				}
			}
		}
	}
	var self = this;
	
	var view_opts;
	var opts = (cmd=="edit")? this.getEditViewOptions():this.getInsertViewOptions();
	//debugger
	//can be function
	if (typeof(opts)=="function"){
		view_opts = opts.call(this);
	}
	else{
		view_opts = {};
		CommonHelper.merge(view_opts,opts);
	}
	//CommonHelper.merge(view_opts, (cmd=="edit")? this.getEditViewOptions():this.getInsertViewOptions());
	//this.m_editWinObj = new this.m_editWinClass({
	var win_id = CommonHelper.uniqid();
	var win_params = {
			"id":win_id,
			"app":window.getApp(),
			"onClose":function(res){
				//set element current if ok
				res = res || {"updated":false};
				/*if(view_opts.onClose){
					view_opts.onClose.call(this,res);
				}*/
				self.closeEditWinObj(res,this.getId());
			},
			"name":( (this.m_editWinClass.name=="editWinClass")? this.m_editWinClass.call(this,{}) : this.m_editWinClass ).toString()+CommonHelper.serialize( (cmd=="edit")? keys:win_id ),
			"keys":keys,
			"params":{
				"cmd":cmd,
				"editViewOptions":view_opts
			}
	};
	//can be a function!
	var edit_cl  = (this.m_editWinClass.name=="editWinClass")? this.m_editWinClass.call(this,win_params) : this.m_editWinClass;
	this.m_editWinObjList[win_id] = new edit_cl(win_params);	
	this.m_editWinObjList[win_id].open();
}

Grid.prototype.closeEditWinObj = function(res,winId){
	if (this.m_editWinObjList[winId]){
		this.m_editWinObjList[winId].close();
		delete this.m_editWinObjList[winId];	
	}
	this.refreshAfterEdit(res);
}

Grid.prototype.initEditView = function(parent,replacedNode,cmd,editOptions){
	//console.log("Grid.prototype.initEditView")
	this.setLocked(true);
	this.unbindPopUpMenu();
	
	var view_opts = {};
	var opts = editOptions? editOptions : ((cmd=="edit")? this.getEditViewOptions():this.getInsertViewOptions());
	//can be function
	if (typeof(opts)=="function"){
		view_opts = opts.call(this);
	}
	else{
		view_opts = {};
		CommonHelper.merge(view_opts,opts);
	}	
	view_opts.className = ( (view_opts.className!=undefined)? (view_opts.className+" "):"") + this.CONSTR_FADE_CLASS;
	view_opts.grid = this;
	var view_opts_close = view_opts.onClose;
	
	view_opts.onClose = function(res){
		if(view_opts_close){
			view_opts_close(res);
		}
		self.closeEditView(res);
	};
	if(cmd!="copy"){
		view_opts.keys = this.getSelectedNodeKeys();
	}
	view_opts.cmd = cmd;
	view_opts.winObj = (this.m_editWinClass)? this.m_editWinObj:this.getWinObj();
	view_opts.row = this.getRow();
	
	var self = this;	
	this.m_editViewObj = new this.m_editViewClass(this.getId()+":edit-view", view_opts);
}

Grid.prototype.editViewToDOM = function(parent,replacedNode,cmd){
	if(cmd=="insert" || cmd=="copy"){
		if (this.m_inlineInsertPlace=="current"){
			this.m_editViewObj.toDOMAfter(replacedNode);
			//this.m_editViewObj.toDOM(parent);
		}
		else if (this.m_inlineInsertPlace=="last"){
			this.m_editViewObj.toDOM(parent);
		}
		else{
			this.m_editViewObj.toDOM(parent);
		}
	}
	else{
		this.m_editViewObj.setReplacedNode(replacedNode);
		this.m_editViewObj.toDOM(parent);
	}
}

Grid.prototype.fillEditView = function(cmd){
	//reading data for editViewObj case
	if (cmd!="insert" && this.m_editViewObj.read){
		this.m_editViewObj.read(cmd);
	}
	else if (this.m_model){
		//ToDo default values
	}
}

Grid.prototype.closeEditView = function(res){
	//this.m_editViewObj.getDataBindings();
	if(this.m_editViewObj){
		if (this.m_editViewObj.getReplacedNode && this.m_editViewObj.getReplacedNode()){
			var nd = this.m_editViewObj.getReplacedNode();
			DOMHelper.addClass(nd,this.CONSTR_FADE_CLASS);
			this.m_editViewObj.getNode().parentNode.replaceChild(nd,this.m_editViewObj.getNode());
		}
		this.m_editViewObj.delDOM();
		delete this.m_editViewObj;	
	}
	if(this.m_editWin){
		this.m_editWin.delDOM();
		delete this.m_editWin;
	}
	if (CommonHelper.nd(this.getId()) ){
		this.bindPopUpMenu();
	}
	this.refreshAfterEdit(res);
}

Grid.prototype.refreshAfterEditCont = function(res){
	//console.log("Grid.prototype.refreshAfterEdit res.newKeys="+res.newKeys)
	if (res && res.updated){
		//ToDo set to new Id
		if (res.newKeys&&!CommonHelper.isEmpty(res.newKeys)){
			this.m_selectedRowKeys = CommonHelper.serialize(res.newKeys);	
		}
		this.onRefresh();
	}	
}

Grid.prototype.refreshAfterEdit = function(res){
	//if grid still exists
	if (CommonHelper.nd(this.getId()) ){
		if (this.m_oldParent){
			this.delDOM();
			this.toDOM(this.m_oldParent);
		}
		if (this.getLocked()){
			this.setLocked(false);
		}
		
		this.focus();
	}
	else if (this.m_oldParent){
		this.toDOM(this.m_oldParent);
		if (this.getLocked()){
			this.setLocked(false);
		}
		this.addEvents();
		this.bindPopUpMenu();
	}			
	
	this.refreshAfterEditCont(res);
}


Grid.prototype.read = function(isCopy){
	//@ToDo model => grid
}

/** 4 edit modes
 * 1) inline with editViewClass - javascript view
 * 2) same view as grid with editViewClass - javascript view
 * 3) editWinClass and editViewClass - javascript view with ext window
 * 4) editWinClass editViewClass=null - window with url
 *
 * @param {string} cmd Possible values: edit||copy||insert
 * @param {string} editOptions Structure for external call of this function. This options will be used instead of getInsertViewOptions|getEditViewOptions
 */
Grid.prototype.edit = function(cmd,editOptions){
	if (this.m_model && this.m_model.getLocked()){
		//already in edit mode
		return 0;
	}
	
	var sel_n = this.getSelectedRow();
	if(!sel_n&&cmd=="edit")return;
	
	if(cmd!="insert"){
		this.setModelToCurrentRow(sel_n);
	}
	this.m_oldParent = null;
	
	if (this.getEditInline()){
		//inline edit
		//mind if it is a detailed table!!!
		var parent = this.getBody().m_node;		
		this.initEditView(parent, sel_n, cmd, editOptions);
		this.editViewToDOM(parent,sel_n,cmd);
		this.fillEditView(cmd);
	}
	else if (this.m_editWinClass && !this.m_editViewClass){	
		//external window
		this.initEditWinObj(cmd);		
	}	
	else if (!this.m_editWinClass && this.m_editViewClass){
		//same window
		var parent = this.getNode().parentNode.parentNode;
		this.m_oldParent = this.getNode().parentNode.parentNode;
		this.initEditView(parent, null,cmd,editOptions);	
		this.delDOM();
		this.editViewToDOM(parent,null,cmd);
		this.fillEditView(cmd);
	}
	else if (this.m_editWinClass && this.m_editViewClass){
		//ext modal window with view
		this.initEditView(null, null, cmd, editOptions);	
		this.fillEditView(cmd);
		// debugger
		var ext_win_opts = this.getEditWinOptions();		
		ext_win_opts.content = this.m_editViewObj;
		this.m_editWin = new this.m_editWinClass("editExt:"+this.getId(), ext_win_opts);		
		this.m_editWin.open();
		//this.editViewToDOM(parent,replacedNode,cmd);
	}
	else{
		//throw Error("");
	}	
}

/**
 * @returns {bool} true if row can be selected, not foot or system row
 */
Grid.prototype.getRowSelectable = function(row){
	return (!DOMHelper.hasClass(row,"grid_foot")
		&&!DOMHelper.hasClass(row,"grid_details")
		&&!DOMHelper.hasClass(row,"grid_sys_row")
	);
}

/**	
 * @returns {bool} true if cell can be selected, not some system cell
 */
Grid.prototype.getCellSelectable = function(cell){
	return (!DOMHelper.hasClass(cell,"grid_sys_col")
	&&!DOMHelper.hasClass(cell.parentNode,"grid_foot")
	);
}

/**
 *	Selects newNode and unselects oldNode
 */
Grid.prototype.selectNode = function(newNode,oldNode){
	if (oldNode){		
		if (!this.m_rowSelect){
			DOMHelper.delClass(oldNode,this.m_selectedCellClass);
			DOMHelper.delClass(oldNode.parentNode,this.m_selectedRowClass);
		}
		else{
			DOMHelper.delClass(oldNode,this.m_selectedRowClass);
		}
	}
	if (newNode){
		if (!this.m_rowSelect){
			DOMHelper.addClass(newNode,this.m_selectedCellClass);
			DOMHelper.addClass(newNode.parentNode,this.m_selectedRowClass);
		}		
		else{
			DOMHelper.addClass(newNode,this.m_selectedRowClass);
		}
		//scroll grid to row
		//$(newNode).get(0).scrollIntoView();
	}
}

/**
	Makes row current
 */
Grid.prototype.selectRow = function(newRow,oldRow){
	if (newRow){
		this.m_selectedRowKeys = newRow.getAttribute("keys");
		this.m_selectedRowId = newRow.getAttribute("id");
		this.selectNode(newRow,oldRow);
	}
}
Grid.prototype.selectCell = function(newCell,oldCell){
	if (newCell){
		var tr = DOMHelper.getParentByTagName(newCell,this.DEF_ROW_TAG_NAME);
		if (tr){
			this.m_selectedRowKeys = tr.getAttribute("keys");
			this.m_selectedRowId = tr.getAttribute("id");
			this.m_selectedCellInd = DOMHelper.getElementIndex(newCell);
			this.selectNode(newCell,oldCell);		
		}
	}
}

/*
 * @returns {DOMNode} row or cell
*/
Grid.prototype.getSelectedRow = function(){
	if (!this.getRowSelect()){
		var sel = this.getSelectedCell();
		if (sel){
			return sel.parentNode;
		}
	}
	else{
		var sel = DOMHelper.getElementsByAttr(this.m_selectedRowClass,this.m_body.getNode(),"class",true,this.DEF_ROW_TAG_NAME);
		return (sel.length)? sel[0]:null;	
	}
}

Grid.prototype.getSelectedCell = function(){
	var sel = DOMHelper.getElementsByAttr(this.m_selectedCellClass,this.m_body.getNode(),"class",true,this.DEF_CELL_TAG_NAME);
	return (sel.length)? sel[0]:null;
}

Grid.prototype.getSelectedNode = function(){
	return (this.m_rowSelect)? this.getSelectedRow():this.getSelectedCell();
}

Grid.prototype.getSelectedNodeKeys = function(selectedNode){
	if(!selectedNode)
		selectedNode = this.getSelectedRow();
	if (selectedNode){
		var k_v = selectedNode.getAttribute("keys");
		return k_v? CommonHelper.unserialize(k_v):null;
	}
}
Grid.prototype.fixHeader = function(){
	/*
	if (this.m_fixedHeader){
		$(this.getNode()).stickyTableHeaders({
			"scrollableArea":$(this.m_cont.getNode())[0],
			"fixedOffset":this.m_fixedOffset
		});
	}
	*/	
}

/**
 * @desc Can be overidden to create sofisticated output
 */
Grid.prototype.createNewRow = function(rowCnt,hRowInd,modelRowCnt){
	var r_class = this.getHead().getRowClass(hRowInd);
	var row_opts;
	var opts = this.getHead().getRowOptions();	
	if (typeof(opts)=="function"){
		row_opts = opts.call(this);
	}
	else{
		row_opts = CommonHelper.clone(opts);
	}
	//
	row_opts.attrs = row_opts.attrs || {};
	
	row_opts.attrs.modelIndex = (modelRowCnt!=undefined)? modelRowCnt:rowCnt;
	
	if (this.m_onSelect){
		row_opts.className+= ( row_opts.className? " ":"") +"for_select"; 
	}
	
	if (this.m_onEventSetRowOptions){
		//model can be accessed with this.getModel()
		this.m_onEventSetRowOptions(row_opts);
	}
	
	if (this.m_onEventSetRowClass){
		//Do not use!!!
		this.m_onEventSetRowClass(this.m_model,row_opts.className);
	}

	/*
	if (this.m_onSelect){
		row_opts.events = row_opts.events || {};
		row_opts.events.click = function(){
			self.m_onSelect();
		}
	}
	*/
	var row;
	if (r_class.name=="Control" || r_class.name=="ControlContainer"){		
		//this.getId()+":"+this.getBody().getName()+":r"+row_opts.attrs.modelIndex
		row = new r_class(null,row_opts.tagName||"DIV",row_opts);
	}
	else{
		row = new r_class(null,row_opts);
	}
	return row;
}

/**
 * @desc Can be overidden to create sofisticated output
 *
 * opts.gridColumn.getId() this.getModel().getFieldValue();
 */
Grid.prototype.createNewCell = function(column,row){
	var cell_class = column.getCellClass();
	var opts = column.getCellOptions();	
	var cell_opts;
	if (typeof(opts)=="function"){
		cell_opts = opts.call(this,column,row);
		cell_opts = cell_opts || {};
	}
	else{
		cell_opts = opts? CommonHelper.clone(opts) : {};
	}
	cell_opts.modelIndex = row.getAttr("modelIndex");
	cell_opts.fields = this.m_model.getFields();
	cell_opts.row = row;
	cell_opts.gridColumn = column;
	
	var cell;
	var cell_elements = column.getCellElements();
	//struct {(struct|function)elementOptions, (string|class)elementClass}
	if (cell_elements){
		cell_opts.elements = [];
		for (var cel_el_i=0;cel_el_i<cell_elements.length;cel_el_i++){
			var cel_el_opts;
			if(typeof cell_elements[cel_el_i].elementOptions=="function"){
				cel_el_opts = cell_elements[cel_el_i].elementOptions.call(this);
			}
			else{
				cel_el_opts = CommonHelper.clone(cell_elements[cel_el_i].elementOptions);
			}			
			
			var elem_obj;
			var elem_class;
			if(typeof cell_elements[cel_el_i].elementClass=="string"){
				elem_class = eval(cell_elements[cel_el_i].elementClass);
			}
			else{
				elem_class = cell_elements[cel_el_i].elementClass;
			}
			if (elem_class.name=="Control" || elem_class.name=="ControlContainer"){
				elem_obj = new elem_class(null,cel_el_opts.tagName,cel_el_opts);
			}
			else{
				elem_obj = new elem_class(null,cel_el_opts);
			}
			elem_obj.gridColumn = column;
			cell_opts.elements.push(elem_obj);			
		}
	}				
	
	if (this.m_onEventSetCellOptions){
		this.m_onEventSetCellOptions(cell_opts);
	}
		
	if (cell_class.name=="Control" || cell_class.name=="ControlContainer"){
		cell = new cell_class(row.getId()+":"+column.getId(),cell_opts.tagName,cell_opts);				
	}
	else{
		cell = new cell_class(row.getId()+":"+column.getId(),cell_opts);				
	}
	
	column.gridCell = cell;
	column.setGridCell(cell);
	
	return cell;
}

Grid.prototype.onGetData = function(){

	if(this.m_onEventGetData)this.m_onEventGetData.call(this);
	
	if (this.m_model){
		//refresh from model
		
		var redraw = !this.m_model.getCalcHash();
		//check dataset hash
		if(!redraw){
			var new_hash = this.m_model.getHash();			
			redraw = (!this.m_dataHash||this.m_dataHash!=new_hash);
			this.m_dataHash = new_hash;
			
		}
		
		if(redraw){
			//console.log("Grid.prototype.onGetData redrawing");
			var self = this;
			var body = this.getBody();
			var foot = this.getFoot();
			body.delDOM();
			body.clear();
	
			//details
			var detail_keys = {};
			var rows = body.getNode().getElementsByTagName(this.DEF_ROW_TAG_NAME);
			for (var i = 0; i < rows.length; i++) {
				if(rows[i].getAttribute("for_keys") != null){  
					detail_keys[hex_md5(rows[i].getAttribute("for_keys"))] = {
						"for_keys":rows[i].getAttribute("for_keys"),
						"node":rows[i]
					};
				}
			}
			var details_expanded = (detail_keys&&!CommonHelper.isEmpty(detail_keys));		
			var master_cell = null;
	
			if (foot && foot.calcBegin){	
				this.m_foot.calcBegin(this.m_model);
			}
	
			if (!this.getHead())return;
		
			var columns = this.getHead().getColumns();
			//var temp_input;
		
			var row_cnt = 0, m_row_cnt=0, field_cnt;
			var row,row_keys;
			this.m_model.reset();
	
			var pag = this.getPagination();
			if (pag){
				pag.m_from = parseInt(this.m_model.getPageFrom());
				pag.setCountTotal(this.m_model.getTotCount());
			}
	
			/* temporaly always set to 0*/
			var h_row_ind = 0;
			var key_id_ar = this.getKeyIds();
		
			while(this.m_model.getNextRow()){			
			
				row = this.createNewRow(row_cnt,h_row_ind,m_row_cnt);
			
				row_keys = {};
			
				for(var k=0;k<key_id_ar.length;k++){
					row_keys[key_id_ar[k]] = this.m_model.getFieldValue(key_id_ar[k]);
				}
			
				field_cnt = 0;
				for (var col_id=0;col_id<columns.length;col_id++){
					columns[col_id].setGrid(this);

					if (columns[col_id].getField() && columns[col_id].getField().getPrimaryKey()){
						row_keys[columns[col_id].getField().getId()] = columns[col_id].getField().getValue();
					}
								
					var cell = this.createNewCell(columns[col_id],row);
				
					if(columns[col_id].getMaster()&&details_expanded){
						master_cell = cell;
					}
				
					if (this.m_onEventAddCell){
						this.m_onEventAddCell.call(this,cell);
					}
				
					row.addElement(cell);
								
					field_cnt++;				
				}
		
				row.setAttr("keys",CommonHelper.serialize(row_keys));			
			
				if (details_expanded){
					var row_key_h = hex_md5(row.getAttr("keys"));
					if(detail_keys[row_key_h]){
						detail_keys[row_key_h].masterNode = row.getNode();
						detail_keys[row_key_h].masterCell = master_cell;
					}
				}
			
				//system cell
				var row_cmd_class = this.getRowCommandClass();
				if (row_cmd_class){
					var row_class_options = {"grid":this};
					row.addElement(new row_cmd_class(this.getId()+":"+body.getName()+":"+row.getId()+":cell-sys",row_class_options));
				}
			
				if (this.m_onEventAddRow){
					this.m_onEventAddRow.call(this,row);
				}
			
				body.addElement(row);
				row_cnt++;
				m_row_cnt++;

				//foot
				if (foot && foot.calc){	
					foot.calc(this.m_model);
				}		
			}
		
			if (this.getLastRowFooter() && row){
				DOMHelper.addClass(row.m_node,"grid_foot");
			}
		
			if (foot && foot.calcEnd){	
				foot.calcEnd(this.m_model);
			}
		
			body.toDOM(this.m_node);
		
			//details
			if (details_expanded){
				for (var det_h in detail_keys){
					if(!detail_keys[det_h].masterNode){
						DOMHelper.delNode(detail_keys[det_h].node);
					}
					else{
						var p = detail_keys[det_h].masterNode.parentNode;
						var n_r = detail_keys[det_h].masterNode.nextSibling;
						var det_row;
						if(n_r){
							det_row = p.insertBefore(detail_keys[det_h].node,n_r);
						}
						else{
							det_row = p.appendChild(detail_keys[det_h].node);
						}
						if(detail_keys[det_h].masterCell){
							var tg = detail_keys[det_h].masterCell.getDetailToggle();
							if(tg){
								tg.setDetailRow(det_row);
								tg.setDetailVisible(true);							
							}
						}
					}
				}
			}
		}				
	}
	if (this.m_navigate || this.m_navigateClick){
		this.setSelection();
	}
}


/* Public */
Grid.prototype.setCommands = function(commands){
	this.m_commands = commands;
}
Grid.prototype.getCommands = function(){
	return this.m_commands;
}
Grid.prototype.setPagination = function(pagination){
	this.m_pagination = pagination;
}

Grid.prototype.getPagination = function(){
	return this.m_pagination;
}


Grid.prototype.setFoot = function(foot){
	this.m_foot = foot;
}
Grid.prototype.getFoot = function(){
	return this.m_foot;
}
Grid.prototype.setHead = function(head){	
	this.m_head = head;
}
Grid.prototype.getHead = function(){
	return this.m_head;
}
Grid.prototype.setBody = function(body){
	this.m_body = body;
}
Grid.prototype.getBody = function(){
	return this.m_body;
}
Grid.prototype.getRowCommandClass = function(){
	return this.m_rowCommandClass;
}
Grid.prototype.setRowCommandClass = function(v){
	this.m_rowCommandClass = v;
}

Grid.prototype.getEditInline = function(){
	return this.m_editInline;
}
Grid.prototype.setEditInline = function(v){
	this.m_editInline = v;
}
Grid.prototype.getEditViewObj = function(){
	return this.m_editViewObj;
}

Grid.prototype.getOnSelect = function(){
	//console.log("Grid.prototype.getOnSelect id="+this.getId()+" sel="+this.m_onSelect)
	return this.m_onSelect;
}
Grid.prototype.setOnSelect = function(v){
	//console.log("Grid.prototype.setOnSelect id="+this.getId()+" v="+v)
	this.m_onSelect = v;
}
/*
Grid.prototype.getMultySelect = function(){
	return this.m_multySelect;
}
Grid.prototype.setMultySelect = function(v){
	this.m_multySelect = v;
}
*/
Grid.prototype.setAutoRefresh = function(autoRefresh){
	this.m_autoRefresh = autoRefresh;
}
Grid.prototype.getAutoRefresh = function(){
	return this.m_autoRefresh;
}
Grid.prototype.setPopUpMenu=function(menu){
	this.m_popUpMenu = menu;
}
Grid.prototype.getPopUpMenu = function(){
	return this.m_popUpMenu;
}
Grid.prototype.setRowSelect = function(v){
	this.m_rowSelect = v;
}
Grid.prototype.getRowSelect=function(){
	return this.m_rowSelect;
}

Grid.prototype.setLastRowSelectOnInit = function(v){
	this.m_lastRowSelectOnInit = v;
}
Grid.prototype.getLastRowSelectOnInit=function(){
	return this.m_lastRowSelectOnInit;
}

Grid.prototype.setContClassName = function(v){
	this.m_contClassName = v;
}
Grid.prototype.getContClassName = function(){
	return this.m_contClassName;
}
Grid.prototype.setContTagName = function(v){
	this.m_contTagName = v;
}
Grid.prototype.getContTagName = function(){
	return this.m_contTagName;
}

Grid.prototype.setLastRowFooter = function(v){
	this.m_lastRowFooter = v;
}
Grid.prototype.getLastRowFooter = function(){
	return this.m_lastRowFooter;
}

Grid.prototype.setResize = function(v){
	this.m_resize = v;
}
Grid.prototype.getResize = function(){
	return this.m_resize;
}

Grid.prototype.setCmdInsert = function(v){
	this.m_cmdInsert = v;
}
Grid.prototype.getCmdInsert = function(){
	return this.m_cmdInsert;
}

Grid.prototype.setCmdEdit = function(v){
	this.m_cmdEdit = v;
}
Grid.prototype.getCmdEdit = function(){
	return this.m_cmdEdit;
}

Grid.prototype.setCmdCopy = function(v){
	this.m_cmdCopy = v;
}
Grid.prototype.getCmdCopy = function(){
	return this.m_cmdCopy;
}

Grid.prototype.setCmdDelete = function(v){
	this.m_cmdDelete = v;
}
Grid.prototype.getCmdDelete = function(){
	return this.m_cmdDelete;
}

Grid.prototype.setCmdPrint = function(v){
	this.m_cmdPrint = v;
}
Grid.prototype.getCmdPrint = function(){
	return this.m_cmdPrint;
}

Grid.prototype.setNavigate = function(v){
	this.m_navigate = v;
	if (this.m_navigate){
		this.setTabIndex(this.getTabIndex() || this.DEF_TAB_INDEX);
	}	
}
Grid.prototype.getNavigate = function(){
	return this.m_navigate;
}

Grid.prototype.setNavigateClick = function(v){
	this.m_navigateClick = v;
}
Grid.prototype.getNavigateClick = function(){
	return this.m_navigateClick;
}

Grid.prototype.setNavigateMouse = function(v){
	this.m_navigateMouse = v;
}
Grid.prototype.getNavigateClick = function(){
	return this.m_navigateMouse;
}

Grid.prototype.setInlineInsertPlace = function(v){
	this.m_inlineInsertPlace = v;
}
Grid.prototype.getInlineInsertPlace = function(){
	return this.m_inlineInsertPlace;
}

Grid.prototype.setRefreshInterval = function(v){
	if(this.m_refreshInterval == v){
		return;
	}

	this.m_refInterval = v;
	if (this.m_refIntervalObj!=undefined){		
		window.clearInterval(this.m_refIntervalObj);
	}
	if (v>0){
		var self = this;
		this.m_refIntervalObj = setInterval(function(){
			self.onRefresh();
		},v);
	}
}
Grid.prototype.getRefreshInterval = function(){
	return this.m_refInterval;
}

Grid.prototype.setEditViewClass = function(v){
	this.m_editViewClass = v;
}
Grid.prototype.getEditViewClass = function(){
	return this.m_editViewClass;
}

Grid.prototype.setEditViewOptions = function(v){
	this.m_editViewOptions = v;
}
Grid.prototype.getEditViewOptions = function(){
	return this.m_editViewOptions;
}
Grid.prototype.setInsertViewOptions = function(v){
	this.m_insertViewOptions = v;
}
Grid.prototype.getInsertViewOptions = function(){
	return this.m_insertViewOptions;
}

Grid.prototype.setEditWinClass = function(v){
	this.m_editWinClass = v;
}
Grid.prototype.getEditWinClass = function(){
	return this.m_editWinClass;
}
Grid.prototype.setEditWinOptions = function(v){
	this.m_editWinOptions = v;
}
Grid.prototype.getEditWinOptions = function(){
//	var ext_win_opts = CommonHelper.clone(this.m_editWinOptions);
//	if(typeof(ext_win_opts) == "function"){
//		ext_win_opts = ext_win_opts();
//	}	
	let ext_win_opts;
	if(typeof(this.m_editWinOptions) == "function"){
		ext_win_opts = this.m_editWinOptions();
	}else{
		ext_win_opts = CommonHelper.clone(this.m_editWinOptions);
	}
	ext_win_opts.cmdOk = false;
	ext_win_opts.cmdCancel = false;		
	return ext_win_opts;
}

/*
Grid.prototype.getEditWinObj = function(){
	return this.m_editWinObj;
}
*/

Grid.prototype.lockRefresh = function(v){
	if (v){		
		this.m_interval = this.getRefreshInterval();
		this.setRefreshInterval(0);
		if(this.m_model)this.m_model.setLocked(true);	
	}
	else{
		if(this.m_model)this.m_model.setLocked(false);	
		this.setRefreshInterval(this.m_interval);											
	}	
}

Grid.prototype.setEnabled = function(v){
	if (this.m_head) this.m_head.setEnabled(v);
	if (this.m_body) this.m_body.setEnabled(v);
	if (this.m_foot) this.m_foot.setEnabled(v);
	if (this.m_commands) this.m_commands.setEnabled(v);
	
	this.lockRefresh(!v);
	
	Grid.superclass.setEnabled.call(this,v);
}

Grid.prototype.setLocked = function(v){
	if (this.m_head) this.m_head.setLocked(v);
	if (this.m_body) this.m_body.setLocked(v);
	if (this.m_foot) this.m_foot.setLocked(v);
	if (this.m_commands) this.m_commands.setLocked(v);
	
	this.lockRefresh(v);
	
	Grid.superclass.setLocked.call(this,v);
}

/*
Grid.prototype.setEnabled = function(v){
	if (this.m_head) this.m_head.setEnabled(v);
	if (this.m_body) this.m_body.setEnabled(v);
	if (this.m_foot) this.m_foot.setEnabled(v);
	if (this.m_commands) this.m_commands.setEnabled(v);
	
	if (!v){		
		this.m_interval = this.getRefreshInterval();
		this.setRefreshInterval(0);
		if(this.m_model)this.m_model.setLocked(true);	
	}
	else{
		if(this.m_model)this.m_model.setLocked(false);	
		this.setRefreshInterval(this.m_interval);											
	}
	
	Grid.superclass.setEnabled.call(this,v);
}
*/

Grid.prototype.toDOM = function(parent){
	this.m_container = new ControlContainer(this.getId()+":cont",this.m_contTagName, {
		"className":this.m_contClassName,
		"visible": this.getVisible()
	});
	//debugger
	if (this.m_commands){
		//this.m_commands.setEnabled(this.getEnabled());
		this.m_container.addElement(this.m_commands);	
	}
	
	//grid	
	if (this.m_head && this.getShowHead()) this.m_head.toDOM(this.m_node);
	if (this.m_body) this.m_body.toDOM(this.m_node);	
	if (this.m_foot) this.m_foot.toDOM(this.m_node);			
	
	if (this.m_searchInfControl)this.m_container.addElement(this.m_searchInfControl);
	if (this.m_errorControl)this.m_container.addElement(this.m_errorControl);
	
	//if (this.m_pagination) this.m_container.addElement(this.m_pagination);	
	
	this.m_container.toDOM(parent);
	Grid.superclass.toDOM.call(this,this.m_container.getNode());		
	
	if (this.m_pagination){
		try{
			//causes error sometimes in IE hierarchyRequestError
			this.m_pagination.toDOM(this.m_container.getNode());
		}
		catch(e){}
	}
	
	if (this.m_autoRefresh){
		this.onRefresh();
	}
	
	if (this.m_resize){
		//ColumnResize(this.m_node);
	}
	
	if (this.m_navigate){
		this.initNavigation();
		this.setSelection();
	}
	
	this.bindPopUpMenu();
	
	this.fixHeader();
	
	this.m_rendered = true;
	
	if (!this.m_autoRefresh){
		this.onGetData();
	}
}
Grid.prototype.delDOM = function(){
//console.log("Grid.prototype.delDOM id="+this.getId())
	if (this.m_refIntervalObj!=undefined){		
		window.clearInterval(this.m_refIntervalObj);
	}
	
	this.delEvents();
	
	if (this.m_commands) this.m_commands.delDOM();
	if (this.m_errorControl) this.m_errorControl.delDOM();
	if (this.m_pagination) this.m_pagination.delDOM();
	
	//grid	
	if (this.m_head) this.m_head.delDOM();
	if (this.m_body) this.m_body.delDOM();	
	if (this.m_foot) this.m_foot.delDOM();			
	
	EventHelper.del(this.m_node,'focus',this.m_focusEvent,false);	
	EventHelper.del(this.m_node,'blur',this.m_blurEvent,false);	
	
	Grid.superclass.delDOM.call(this);
	
	//this.m_containerScroll.delDOM();
	if(this.m_container)this.m_container.delDOM();
	
	this.m_rendered = false;
}

Grid.prototype.getFocused = function(){
	return DOMHelper.hasClass(this.m_node,this.FOCUSED_CLASS);
}
Grid.prototype.setFocused = function(focused){
	if (this.m_node && focused && !this.getFocused()){
		var tables = this.getWinObjDocument().getElementsByTagName("table");
		for (var i=0;i<tables.length;i++){
			DOMHelper.delClass(tables[i],this.FOCUSED_CLASS);
		}
		DOMHelper.addClass(this.m_node,this.FOCUSED_CLASS);
		
		this.addEvents();
	}
	else if(this.m_node && !focused){
		DOMHelper.delClass(this.m_node,this.FOCUSED_CLASS);
		
		if (!CommonHelper.isIE()){
			this.delEvents();
		}
	}
}

Grid.prototype.focus = function(){
	this.setFocused(true);
	try{
		this.getNode().focus();
	}
	catch(e){}
}

Grid.prototype.getModel = function(){
	return this.m_model;
}
Grid.prototype.setModel = function(m){
	this.m_model = m;
}

/*
Grid.prototype.getRowClass = function(){
	return this.m_rowClass;
}
Grid.prototype.setRowClass = function(v){
	this.m_rowClass = v;
}
*/

Grid.prototype.onError = function(resp,erCode,erStr){		
	var e = (typeof(resp) == "string")? resp : erStr;
	var self = this;
	window.showError(e,function(){
		self.setFocused(true);
	});
}

Grid.prototype.onEdit = function(){
	if (this.m_cmdEdit){		
		this.edit("edit");
	}
}

Grid.prototype.onCopy = function(){
	if (this.m_cmdCopy){
		this.edit("copy");
	}
}

Grid.prototype.onInsert = function(){
	if (this.m_cmdInsert){
		this.edit("insert");
	}
}

Grid.prototype.onPrint = function(){
	if (this.m_cmdPrint){
		WindowPrint.show({content:this.getNode().outerHTML});
	}
}

Grid.prototype.onRefresh = function(callBack){
	this.onGetData();

	if (this.callBack){
		this.callBack.call(this);
	}
}

Grid.prototype.onRowUp = function(){
	var selected_node=this.getSelectedNode();
	if (selected_node){
		if (this.m_model){
			this.setModelToCurrentRow();
			this.m_model.recMoveUp(this.m_model.getRowIndex());
			this.onRefresh();
		}
		else if (selected_node.previousSibling){
			selected_node.parentNode.insertBefore(selected_node,selected_node.previousSibling);
		}		
	}
}
Grid.prototype.onRowDown = function(){
	var selected_node=this.getSelectedNode();
	if (selected_node){
		if (this.m_model){
			this.setModelToCurrentRow();
			this.m_model.recMoveDown(this.m_model.getRowIndex());
			this.onRefresh();
		}
		else if(selected_node.nextSibling){
			selected_node.nextSibling.parentNode.insertBefore(selected_node.nextSibling,selected_node.nextSibling.previousSibling);
		}
	}
}

Grid.prototype.setModelToCurrentRow = function(rowNode){
	/*if (!rowNode){
		rowNode = this.getSelectedRow();
	}
	this.m_model.getRow(parseInt(DOMHelper.getAttr(rowNode,"modelIndex")));
	*/	
	if(!this.m_model.getRowCount()){
		return;
	}
	var keys = this.getSelectedNodeKeys(rowNode);
	if(!keys || typeof(keys)!="object"){
		return;
	}
	
	if(CommonHelper.isEmpty(keys)){
		throw new Error(this.m_model.ER_REС_NOT_FOUND);
	}
	
	var key_fields = {};
	for(var k in keys){
		key_fields[k] = CommonHelper.clone(this.m_model.getField(k));
		key_fields[k].setValue(keys[k]);
	}	
	this.m_model.recLocate(key_fields,true);

	return keys;
}

Grid.prototype.getModelRow = function(){
	this.setModelToCurrentRow();
	return this.m_model.getFields();
}

Grid.prototype.getRow = function(){
	var row_n = this.getSelectedRow();
	if (row_n){
		return this.getBody().getElement(row_n.getAttribute("modelIndex"));
	}
}

Grid.prototype.setKeyIds = function(v){
	this.m_keyIds = v;
}

Grid.prototype.getKeyIds = function(){
	if ( (!this.m_keyIds || !this.m_keyIds.length) && (this.m_model && this.m_model.getFields())){
		this.m_keyIds = [];
		var fields = this.m_model.getFields();
		for (fid in fields){
			if (fields[fid].getPrimaryKey()){
				this.m_keyIds.push(fid);
			}		
		}
	}
	return this.m_keyIds;
}

Grid.prototype.setOnSearch = function(v){	
	this.m_onSearch = v;
}

Grid.prototype.getOnSearch = function(){
	return this.m_onSearch;
}
Grid.prototype.setOnSearchDialog = function(v){	
	this.m_onSearchDialog = v;
}

Grid.prototype.getOnSearchDialog = function(){
	return this.m_onSearchDialog;
}
Grid.prototype.setOnSearchReset = function(v){	
	this.m_onSearchReset = v;
}

Grid.prototype.getOnSearchReset = function(){
	return this.m_onSearchReset;
}

Grid.prototype.setShowHead = function(v){	
	this.m_showHead = v;
}

Grid.prototype.getShowHead = function(){
	return this.m_showHead;
}
Grid.prototype.isNull = function(){
	return (!this.m_model || this.m_model.getRowCount()==0);
}
Grid.prototype.reset = function(){
	//CommonHelper.log("Grid.prototype.reset DELETE ROWS!!!")
	if (this.m_model){
		this.m_model.clear();
		this.onRefresh();
	}
}
Grid.prototype.setValue = function(v){
	if (this.m_model){
		this.m_model.setData(v);
		this.onRefresh();
	}
}
Grid.prototype.setInitValue = function(v){
	this.setValue(v);
	this.setAttr(this.VAL_INIT_ATTR,CommonHelper.md5(this.m_model.getData().toString()));
}
Grid.prototype.getInitValue = function(){
	return this.getAttr(this.VAL_INIT_ATTR);
}

Grid.prototype.getValue = function(){
	if (this.m_model){
		return this.m_model.getData().toString();
	}
}
Grid.prototype.getModified = function(){
	//console.log("Grid.prototype.getModified id="+this.getId()+ "Modified="+(CommonHelper.md5(this.getValue()) != this.getAttr(this.VAL_INIT_ATTR)))
	//console.log("InitHASH="+this.getAttr(this.VAL_INIT_ATTR))
	//console.log("CurrentHASH="+CommonHelper.md5(this.getValue()))
	return ( CommonHelper.md5(this.getValue()) != this.getAttr(this.VAL_INIT_ATTR) );
}
Grid.prototype.getIsRef = function(){
	return false;
}
Grid.prototype.setNotValid = function(erStr){
	DOMHelper.addClass(this.m_container.getNode(),this.INCORRECT_VAL_CLASS);
	if (this.getErrorControl()){
		this.getErrorControl().setValue(erStr);
	}
	else{
		throw new Error(erStr);
	}
}
Grid.prototype.setValid = function(){
	DOMHelper.delClass(this.m_container.getNode(),this.INCORRECT_VAL_CLASS);
	if (this.getErrorControl())this.getErrorControl().clear();
}
Grid.prototype.getInputEnabled = function(){
	return this.getEnabled();
}
Grid.prototype.setInputEnabled = function(v){
	this.setEnabled(v);
}

Grid.prototype.setErrorControl = function(v){
	this.m_errorControl = v;
}
Grid.prototype.getErrorControl = function(){
	return this.m_errorControl;
}

Grid.prototype.setSearchInfControl = function(v){
	this.m_searchInfControl = v;
}
Grid.prototype.getSearchInfControl = function(){
	return this.m_searchInfControl;
}

/**
 * @param {string|array} colId
 */
Grid.prototype.setColumnVisible = function(colId,v){
	var columns = this.getHead().getColumns();
	var is_list = CommonHelper.isArray(colId);
	var col_indexes = [];
	for (var ind=0;ind<columns.length;ind++){
		if (is_list && CommonHelper.inArray(columns[ind].getId(),colId)>=0){
			columns[ind].setVisible(v);
			col_indexes.push(ind);
		}
		else if (!is_list && columns[ind].getId()==colId){
			columns[ind].setVisible(v);
			col_indexes.push(ind);
			break;
		}
	}
	var b = this.getBody().getNode();
	for (i=0;i<b.rows.length;i++){
		for (var j=0;j<col_indexes.length;j++){
			//b.rows[i].cells[col_indexes[j]].style.display = v? "":"none";
			
			//console.dir(b.rows[i].cells[col_indexes[j]])			
			if (!v){
				DOMHelper.addClass(b.rows[i].cells[col_indexes[j]],"hidden");
			}
			else{
				DOMHelper.delClass(b.rows[i].cells[col_indexes[j]],"hidden");
			}
			
		}
	}
}

Grid.prototype.setVisible = function(v){
	if(this.m_container)this.m_container.setVisible(v);
}

Grid.prototype.bindPopUpMenu = function(){
	if (this.getPopUpMenu()!=undefined){
		this.getPopUpMenu().bind(this.m_body.getNode());
	}
}
Grid.prototype.unbindPopUpMenu = function(){
	if (this.getPopUpMenu()!=undefined){
		this.getPopUpMenu().unbind();
	}
}

