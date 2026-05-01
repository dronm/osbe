/* Copyright (c) 2012 
	Andrey Mikhalevich, Katren ltd.
*/
/*	
	Description
*/
//ф
/** Requirements
 * @requires common/functions.js
*/

/* constructor */
function Grid(id,options){
	options = options || {};
	options.className = options.className||"";
	if (options.className){
		options.className+=" ";
	}
	options.className+="table table-bordered table-responsive table-striped";
	options.tagName = options.tagName || this.DEF_TAG_NAME;
	
	if (options.commandPanel){
		options.commandPanel.setClickContext(this);
		options.commandPanel.setOnClickInsert(this.onInsert);
		options.commandPanel.setOnClickEdit(this.onEdit);
		options.commandPanel.setOnClickCopy(this.onCopy);
		options.commandPanel.setOnClickDelete(this.onDelete);
		options.commandPanel.setOnClickRefresh(this.onRefresh);
		this.setCommandPanel(options.commandPanel);
	}
	
	Grid.superclass.constructor.call(this,
		id,options.tagName,options);

	if (options.editViewClass){
		this.m_editViewClass = options.editViewClass;
	}
	if (options.editInline){
		this.m_editInline = options.editInline;
	}
	if (options.editWinClass){
		this.m_editWinClass = options.editWinClass;
	}	
	if (options.refreshInterval){
		this.setRefreshInterval(options.refreshInterval);
	}
	
	if (options.rowCommandPanelClass){
		this.m_rowCommandPanelClass = options.rowCommandPanelClass;
	}
	this.m_rowCommandPanelClassParams = options.rowCommandPanelClassParams;
	if (options.onSelect){
		this.m_onSelect = options.onSelect;
	}
	this.m_multySelect = options.multySelect;
	
	this.m_autoRefresh = (options.noAutoRefresh==undefined || (options.noAutoRefresh!=undefined&&options.noAutoRefresh==false));
	
	this.m_editViewParams = options.editViewParams||{};
	
	if (options.filter){
		this.setFilter(options.filter);
		options.filter.setClickContext(this);
		options.filter.setOnRefresh(this.onRefresh);
	}
	
	if (options.head){
		this.setHead(options.head);
	}
	if (options.body){
		this.setBody(options.body);
	}
	if (options.foot){
		this.setFoot(options.foot);
	}
	
	this.m_extraFields = options.extraFields;
	
	options.errorControl = options.errorControl || new ErrorControl(id);
	if (options.errorControl){
		this.setErrorControl(options.errorControl);
	}
	
	if (options.pagination){
		this.setPagination(options.pagination);
		options.pagination.setOnGridRefresh(this.onRefresh);
		options.pagination.setClickContext(this);
	}
	
	if (options.popUpMenu){
		this.setPopUpMenu(options.popUpMenu);
	}
	
	//event context
	if (options.eventContext){
		this.m_eventContext = options.eventContext;
	}
	if (options.onEventRefresh){
		this.m_onEventRefresh = options.onEventRefresh;
	}
	this.m_resize = false;//(options.noResize==undefined || (options.noResize!=undefined && options.noResize==false));
	this.m_navigate = (options.noNavigation==undefined || (options.noNavigation!=undefined && options.noNavigation==false));
	if (this.m_navigate){
		options.attrs=options.attrs||{};
		this.setAttr("tabindex",options.attrs.tabindex||"100");
		this.m_rowSelect =
		(options.rowSelect==undefined
		||(options.rowSelect!=undefined&&options.rowSelect==true)
		);
	}
	var self = this;
	this.m_keyEvent=function(event){
		if (self.getEnabled()){
			event = EventHandler.fixMouseEvent(event);
			var key_code = (event.charCode) ? event.charCode : event.keyCode;
			if (self.keyPressEvent(key_code,event)){
				event.preventDefault();
				return false;
			}
		}
	};
	this.m_focusEvent = function(){
		self.setFocused(true);
	}
	this.m_blurEvent = function(){
		self.setFocused(false);		
	}
	
	this.m_clickEvent = function(event){
		event = EventHandler.fixMouseEvent(event);
		if (self.getEnabled()&&event.target.nodeName.toLowerCase()=="td"){
			if (!self.getFocused()){
				self.setFocused(true);
			}
			if (self.m_rowSelect&&self.getRowSelectable(event.target.parentNode)){
				self.selectRow(event.target.parentNode,
				self.getSelectedNode());
			}
			else if (!self.m_rowSelect&&self.getCellSelectable(event.target)){
				self.selectCell(event.target,
				self.getSelectedNode());			
			}
		}
	};
	this.m_dblClickEvent = function(event){
			self.onDblClick(event);
	};
	this.m_lastRowFooter = options.lastRowFooter;
	
	//*********************** custom colum order&&visibility *****************************
	var head=this.getHead();
	if (head){	
		var name = this.getName();
				
		var custom_sort = (name && TEMPLATE_PARAMS[name] && TEMPLATE_PARAMS[name].order && is_array(TEMPLATE_PARAMS[name].order) && TEMPLATE_PARAMS[name].order.length);
		var custom_order = (name && TEMPLATE_PARAMS[name] && TEMPLATE_PARAMS[name].visibility && is_array(TEMPLATE_PARAMS[name].visibility) && TEMPLATE_PARAMS[name].visibility.length);
	
		this.m_sortCols = {};		
		var col_names = {};
		
		for (var row in head.m_elements){
			var head_row=head.m_elements[row];
						
			for (var col in head_row.m_elements){			
				if (head_row.m_elements[col].getSortable()){
					var f_name = head_row.m_elements[col].getName();
					if (f_name){
						col_names[f_name] = head_row.m_elements[col];
					}
					
					this.m_sortCols[col]=head_row.m_elements[col];
					head_row.m_elements[col].m_onRefresh=function(){
						self.onRefresh();
					}
					head_row.m_elements[col].m_grid = this;
					if (custom_sort){
						//очистим все
						head_row.m_elements[col].unsetSort();
					}
				}
			}
			if (custom_order){
				head_row.setInitColumnOrder();
				head_row.setColumnOrder(TEMPLATE_PARAMS[name].visibility);
			}
			
		}
	
		if (custom_sort){
			//custom sorting
			this.m_sortCols = {};
			for (var id in TEMPLATE_PARAMS[name].order){
				var f_name = TEMPLATE_PARAMS[name].order[id].id;
				if (col_names[f_name]){
					this.m_sortCols[col_names[f_name].getId()] = col_names[f_name];
			
					if (TEMPLATE_PARAMS[name].order[id].checked && TEMPLATE_PARAMS[name].order[id].direct!="undefined" && col_names[f_name]){
						col_names[f_name].setSort(TEMPLATE_PARAMS[name].order[id].direct);
					}
				}
			}
		}
	}
	//**********************************************************
				
	//fixed header
	if (options.fixedHeader){
		this.m_fixedHeader = true;
		this.m_fixedOffset = options.fixedOffset||0;
	}
	
}
extend(Grid,Control);

Grid.prototype.DEF_TAG_NAME = "table";
Grid.prototype.SELECTED_CLASS="success";
Grid.prototype.FOCUSED_CLASS="focused";

Grid.prototype.m_commandPanel;
Grid.prototype.m_pagination;
Grid.prototype.m_head;
Grid.prototype.m_body;
Grid.prototype.m_foot;
Grid.prototype.m_filter;
View.prototype.m_errorControl;
Grid.prototype.m_editInline;
Grid.prototype.m_editWinClass;
Grid.prototype.m_editViewClass;
Grid.prototype.m_editViewObj;
Grid.prototype.m_rowCommandPanelClass;
Grid.prototype.m_parent;
Grid.prototype.m_interval;
Grid.prototype.m_intervalObj;
Grid.prototype.m_onSelect;
Grid.prototype.m_multySelect;
Grid.prototype.m_eventContext;
Grid.prototype.m_onEventRefresh;
Grid.prototype.m_onEventDelete;
Grid.prototype.m_onEventInsert;

Grid.prototype.setCommandPanel = function(commandPanel){
	this.m_commandPanel = commandPanel;
}
Grid.prototype.getCommandPanel = function(){
	return this.m_commandPanel;
}
Grid.prototype.setPagination = function(pagination){
	this.m_pagination = pagination;
}
Grid.prototype.getPagination = function(){
	return this.m_pagination;
}
Grid.prototype.setFilter = function(filter){
	this.m_filter = filter;
}
Grid.prototype.getFilter = function(){
	return this.m_filter;
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
Grid.prototype.getEditViewClass = function(){
	return this.m_editViewClass;
}
Grid.prototype.getRowCommandPanelClass = function(){
	return this.m_rowCommandPanelClass;
}
Grid.prototype.filterToDOM = function(parent){
	//filter
	if (this.getFilter()){
		this.getFilter().toDOM(parent);
	}
}
Grid.prototype.toDOM = function(parent){
	this.m_cont = new Control(uuid(),"div",{className:"scrollable-area "+this.getId()});	
	
	
	//errors
	if (this.getErrorControl()){
		this.getErrorControl().toDOM(parent);
	}	
	
	var flt_parent;
	//command panel
	if (this.getCommandPanel()){
		this.getCommandPanel().toDOM(parent);
		flt_parent = this.getCommandPanel().getNode();
	}
	else{
		flt_parent = this.m_node;
	}
	//filter
	this.filterToDOM(flt_parent);
	
	Grid.superclass.toDOM.call(this,this.m_cont.getNode());	
	
	//grid	
	var head = this.getHead();
	if (head){	
		head.toDOM(this.m_node);
	}
	var body = this.getBody();
	if (body)
		body.toDOM(this.m_node);
	var foot = this.getFoot();
	if (foot)
		foot.toDOM(this.m_node);		
	
	
	this.m_cont.toDOM(parent);

	//pagination
	var pagin = this.getPagination()
	if (pagin){
		pagin.toDOM(parent);
	}
	
	this.m_parent = parent;
	if (this.m_autoRefresh){
		this.onRefresh();
	}
	
	if (this.m_resize){
		ColumnResize(this.m_node);
	}
	if (this.m_navigate){
		this.initNavigation();
		this.setSelection();
	}
	
	if (this.getPopUpMenu()!=undefined){
		this.getPopUpMenu().bind(body.getNode());
	}
	
	this.fixHeader();
	
	this.m_rendered = true;
}
Grid.prototype.removeDOM = function(){
	this.setRefreshInterval(0);
	if (this.m_filter){
		this.m_filter.removeDOM();
	}
	if (this.m_errorControl){
		this.m_errorControl.removeDOM();
	}
	if (this.m_commandPanel){
		this.m_commandPanel.removeDOM();
	}	
	var head = this.getHead();
	if (head){	
		head.removeDOM();
	}
	var body = this.getBody();
	if (body){
		body.removeDOM();
	}
	var foot = this.getFoot();
	if (foot){
		foot.removeDOM();		
	}
	
	EventHandler.removeEvent(this.m_node,'focus',this.m_focusEvent,false);	
	EventHandler.removeEvent(this.m_node,'blur',this.m_blurEvent,false);	
	
	Grid.superclass.removeDOM.call(this);
	
	this.m_cont.removeDOM();
	
	if (this.m_pagination){
		this.m_pagination.removeDOM();
	
	}		
	
	this.m_rendered = false;
}

Grid.prototype.onError = function(erStr){		
	if (this.m_errorControl){
		this.m_errorControl.setValue(erStr);
	} else{
		// window.showTempError(erStr, null, 5000);
		throw new Error(erStr);
	}
}
Grid.prototype.getErrorControl = function(){
	return this.m_errorControl;
}
Grid.prototype.setErrorControl = function(errorControl){
	this.m_errorControl = errorControl;
}
Grid.prototype.getEditInline = function(){
	return this.m_editInline;
}

Grid.prototype.onEdit = function(rowId,keys){
	if (this.m_onEventEdit){
		//this.m_onEventEdit
	}
}
Grid.prototype.onCopy = function(rowId,keys){
}
Grid.prototype.onDelete = function(rowId,keys){
	var self = this;
	WindowQuestion.show({
		"cancel":false,
		"text":"Удалить запись?",
		"callBack":function(r){
			if (r==WindowQuestion.RES_YES){
				var n = nd(rowId);
				if (n){
					self.getBody().getNode().removeChild(n);
				}
			}
		}
	});
}
Grid.prototype.onInsert = function(){
}
Grid.prototype.onRefresh = function(){
	if (this.m_onEventRefresh){
		this.m_onEventRefresh.call(this.m_eventContext);
	}
	if (this.m_navigate){
		this.setSelection();
	}
}

Grid.prototype.onUp = function(){
	var selected_node=this.getSelectedNode();
	if (selected_node&&selected_node.previousSibling){
		selected_node.parentNode.insertBefore(selected_node,selected_node.previousSibling);
	}
}
Grid.prototype.onDown = function(){
	var selected_node=this.getSelectedNode();
	if (selected_node){
		var n_up = selected_node.nextSibling;
		if (n_up){
			n_up.parentNode.insertBefore(n_up,n_up.previousSibling);
		}
	}
}

Grid.prototype.setRefreshInterval = function(refreshInterval){
	this.m_interval = refreshInterval;
	if (refreshInterval==0 && this.m_intervalObj!=undefined){		
		window.clearInterval(this.m_intervalObj);
	}
	else if (refreshInterval>0){
		var self = this;
		this.m_intervalObj = setInterval(function(){
			self.onRefresh();
		},refreshInterval);
	}
}
Grid.prototype.getRefreshInterval = function(){
	return this.m_interval;
}
Grid.prototype.setAutoRefresh = function(autoRefresh){
	this.m_autoRefresh = autoRefresh;
}
Grid.prototype.getAutoRefresh = function(){
	return this.m_autoRefresh;
}
//Navigation
Grid.prototype.initNavigation = function(){
	this.setFocused(true);
	EventHandler.addEvent(this.m_node,'focus',this.m_focusEvent,false);
	EventHandler.addEvent(this.m_node,'blur',this.m_blurEvent,false);
}
Grid.prototype.selectFirstSelectableCell = function(row){
	var cells=row.getElementsByTagName("td");
	for (var i=0;i<cells.length;i++){
		if (this.getCellSelectable(cells[i])){
			this.selectCell(cells[i]);
			break;
		}
	}			
}
Grid.prototype.setSelection = function(){
	var selected=false;
	if (this.m_selectedRowKeys){
		var rows = this.m_node.getElementsByTagName("tr");
		for (var i=0;i<rows.length;i++){
			if (rows[i].getAttribute("key_values")==this.m_selectedRowKeys){
				if (this.m_rowSelect) {
					this.selectRow(rows[i]);
					selected=true;				
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
	if (!selected && this.getHead()){
		var rows=this.m_node.getElementsByTagName("tr");
		if (rows && rows.length>1){
			if (this.m_rowSelect){
				var row_body_ind = this.getHead().getCount();
				for (var i=row_body_ind;i<rows.length;i++){
					if (this.getRowSelectable(rows[i])){
						this.selectRow(rows[i]);
						break;
					}
				}
			}
			else{
				this.selectFirstSelectableCell(rows[this.getHead().getCount()]);
			}
		}
	}
}
Grid.prototype.keyPressEvent = function(keyCode,event){	
	var res=false;
	if (this.getFocused()){
		switch (keyCode){
			case 40: // arrow down				
				res = this.onKeyDown();
				break;
			case 38: // arrow up
				res = this.onKeyUp();
				break;
			case 39: // arrow right
				this.onKeyRight();
				break;
			case 37: // arrow left
				res = this.onKeyLeft();
				break;
			case 13: // return
				res = this.onKeyEnter(event);
				break;
			case 46: // delete
				res = this.onKeyDelete();
				break;
			case 45: // insert
				res = this.onKeyInsert();
				break;				
		}		
	}
	return res;
}
Grid.prototype.onKeyLeft = function(){	
	res = false;
	if (!this.m_rowSelect){
		var selected_node = this.getSelectedNode();
		if (selected_node && selected_node.previousSibling
		&&this.getCellSelectable(selected_node.previousSibling)){
			this.selectCell(selected_node.previousSibling,
				selected_node);
		}
		res = true;
	}
	return res;
}
Grid.prototype.onKeyRight = function(){	
	var res = false;
	if (!this.m_rowSelect){
		var selected_node = this.getSelectedNode();
		if (selected_node && selected_node.nextSibling
		&&this.getCellSelectable(selected_node.nextSibling)){
			this.selectCell(selected_node.nextSibling,
				selected_node);
		}						
		res = true;
	}				
	return res;
}
Grid.prototype.onKeyUp = function(){	
	var res = false;
	var selected_node = this.getSelectedNode();
	if (selected_node				
	&&this.m_rowSelect
	&&selected_node.previousSibling
	&&(selected_node.previousSibling.nodeName==selected_node.nodeName)
	&&this.getRowSelectable(selected_node.previousSibling)
	){
		this.selectRow(selected_node.previousSibling,selected_node);
		res = true;
	}
	else if (selected_node
	&&!this.m_rowSelect
	&&selected_node.parentNode.previousSibling
	&&(selected_node.parentNode.previousSibling.nodeName==selected_node.parentNode.nodeName)
	&&this.getCellSelectable(selected_node.parentNode.previousSibling)
	){
		var ind = DOMHandler.getElementIndex(selected_node);
		this.selectCell(selected_node.parentNode.previousSibling.childNodes[ind],
			selected_node);
		res = true;
	}				
	return res;
}
Grid.prototype.onKeyDown = function(){	
	var res = false;
	var selected_node = this.getSelectedNode();
	if (selected_node				
	&&this.m_rowSelect
	&&selected_node.nextSibling
	&&(selected_node.nextSibling.nodeName==selected_node.nodeName)
	&&this.getRowSelectable(selected_node.nextSibling)
	){
		this.selectRow(selected_node.nextSibling,selected_node);
		res = true;
	}
	else if (selected_node
	&&!this.m_rowSelect
	&&selected_node.parentNode.nextSibling
	&&(selected_node.parentNode.nextSibling.nodeName==selected_node.parentNode.nodeName)
	&&this.getCellSelectable(selected_node.parentNode.nextSibling)
	){
		var ind = DOMHandler.getElementIndex(selected_node);
		this.selectCell(selected_node.parentNode.nextSibling.childNodes[ind],
			selected_node);
		res = true;
	}				
	return res;
}
Grid.prototype.onKeyInsert = function(){	
	var res = false;
	if (this.m_commandPanel&&this.m_commandPanel.m_cmdInsert){		
		this.onInsert();
		res = true;
	}
	return res;
}
Grid.prototype.onKeyDelete = function(){	
	var res = false;
	if (this.m_commandPanel&&this.m_commandPanel.m_cmdDelete){
		var selected_node=this.getSelectedNode();
		if (selected_node){
			this.onDelete(selected_node.getAttribute("id"),
			json2obj(selected_node.getAttribute("key_values"))
			);
			res = true;
		}
	}
	return res;
}
Grid.prototype.onKeyEnter = function(event){	
	var res = false;
	if (
		(!this.m_onSelect||(this.m_onSelect&&event.ctrlKey))
		&&
		(this.m_commandPanel&&this.m_commandPanel.m_cmdEdit)
		)
	{
		this.onEdit(this.m_selectedRowId,json2obj(this.m_selectedRowKeys));
		res = true;
	}
	else if (this.m_onSelect&&!event.ctrlKey){
		var extraValues={};
		var descrValues={};
		var head_cells={};
		var ind=0;
		var row_n = nd(this.m_selectedRowId,this.getWinObjDocum());
		if (row_n){
			this.getHead().getFields(head_cells);
			for (var head_id in head_cells){
				ind+=1;
				field_val = "";
				bind = head_cells[head_id].getReadBind();
				if (!bind)continue;
				if (head_cells[head_id].getDescrCol()){
					descrValues[bind.valueFieldId] = 
						row_n.cells[ind-1].innerHTML;
				}
				/*
				if (this.m_extraFields&&this.m_extraFields[head_id]){
					extraValues[head_id] = row_n.cells[ind-1].innerHTML;
				}
				*/
			}	
		};
		this.m_onSelect(
			json2obj(this.m_selectedRowKeys),
			descrValues,
			extraValues,
			this.m_multySelect);
		res = true;
	}
	return res;
}
Grid.prototype.onDblClick = function(event){
	event = EventHandler.fixMouseEvent(event);			
	if (this.getEnabled()&&event.target.nodeName.toLowerCase()=="td"){
		var selected_node=this.getSelectedNode();
		if (selected_node&&this.m_rowSelect){
			this.onEdit(selected_node.getAttribute("id"),
			json2obj(selected_node.getAttribute("key_values"))
			);
		}
	}
}
Grid.prototype.getRowSelectable = function(row){
	return (!DOMHandler.hasClass(row,"grid_foot")
		&&!DOMHandler.hasClass(row,"grid_details")
	);
}
Grid.prototype.getCellSelectable = function(cell){
	return (!DOMHandler.hasClass(cell,"grid_sys_col")
	&&!DOMHandler.hasClass(cell.parentNode,"grid_foot")
	);
}
Grid.prototype.selectNode = function(newNode,oldNode){
	if (oldNode){
		DOMHandler.removeClass(oldNode,this.SELECTED_CLASS);
	}
	if (newNode){
		DOMHandler.addClass(newNode,this.SELECTED_CLASS);
	}
}
Grid.prototype.selectRow = function(newRow,oldRow){
	if (newRow){
		this.m_selectedRowKeys=newRow.getAttribute("key_values");
		this.m_selectedRowId=newRow.getAttribute("id");
		this.selectNode(newRow,oldRow);
	}
}
Grid.prototype.selectCell = function(newCell,oldCell){
	if (newCell){
		this.m_selectedRowKeys=newCell.parentNode.getAttribute("key_values");
		this.m_selectedRowId=newCell.parentNode.getAttribute("id");
		this.m_selectedCellInd = DOMHandler.getElementIndex(newCell);
		this.selectNode(newCell,oldCell);
	}
}

/*
	returns node row/cell
*/
Grid.prototype.getSelectedNode = function(){
	var sel = DOMHandler.getElementsByAttr(this.SELECTED_CLASS,this.m_body.m_node,"class",true,
		(this.m_rowSelect)? "tr":"td");
	return (sel.length)? sel[0]:null;
	/*
	var n = nd(this.m_selectedRowId,this.getWinObjDocum());
	if (this.m_rowSelect){
		return n;
	}
	*/
}
Grid.prototype.getFocused = function(){
	return DOMHandler.hasClass(this.m_node,this.FOCUSED_CLASS);
}
Grid.prototype.setFocused = function(focused){
	if (focused){
		var tables=this.getWinObjDocum().getElementsByTagName('table');
		for (var i=0;i<tables.length;i++){
			DOMHandler.removeClass(tables[i],this.FOCUSED_CLASS);
		}
		DOMHandler.addClass(this.m_node,this.FOCUSED_CLASS);
		EventHandler.addEvent(this.m_node,'keydown',this.m_keyEvent,false);
		EventHandler.addEvent(this.m_node,"click",this.m_clickEvent,false);
		EventHandler.addEvent(this.m_node,"contextmenu",this.m_clickEvent,false);
		if (this.m_commandPanel&&this.m_commandPanel.m_cmdEdit){
			EventHandler.addEvent(this.m_node,'dblclick',this.m_dblClickEvent,false);
		}				
	}
	else{
		DOMHandler.removeClass(this.m_node,this.FOCUSED_CLASS);
		//this.getWinObjDocum()		
		EventHandler.removeEvent(this.m_node,'keydown',this.m_keyEvent,false);
		EventHandler.removeEvent(this.m_node,"click",this.m_clickEvent,false);
		EventHandler.removeEvent(this.m_node,"contextevent",this.m_clickEvent,false);
		if (this.m_commandPanel&&this.m_commandPanel.m_cmdEdit){
			EventHandler.removeEvent(this.m_node,'dblclick',this.m_dblClickEvent,false);
		}		
	}
}
Grid.prototype.setEnabled = function(enabled){
	if (this.m_commandPanel){
		this.m_commandPanel.setEnabled(enabled);
	}
	Grid.superclass.setEnabled.call(this,enabled);
}
Grid.prototype.getSelectedNodeKeys = function(){
	var selected_node=this.getSelectedNode();
	if (selected_node){
		return json2obj(selected_node.getAttribute("key_values"));
	}
}
Grid.prototype.setEditViewParam=function(par,val){
	this.m_editViewParams[par] = val;
}
Grid.prototype.setPopUpMenu=function(menu){
	this.m_popUpMenu = menu;
}
Grid.prototype.getPopUpMenu=function(){
	return this.m_popUpMenu;
}
Grid.prototype.fixHeader=function(){
	/*
	if (this.m_fixedHeader){
		$(this.getNode()).stickyTableHeaders({
			"scrollableArea":$(this.m_cont.getNode())[0],
			"fixedOffset":this.m_fixedOffset
		});
	}
	*/	
}

Grid.prototype.serialize= function(o){
	var o = o||{};

	if (this.m_head){
		o.head = this.m_head.serialize();
	}
	if (this.m_body){
		o.body = this.m_body.m_node.innerHTML;
	}
	if (this.m_foot){
		o.foot = this.m_foot.serialize();
	}
	
	
	for (var a in this.m_node.attributes){
		if (typeof this.m_node.attributes[a]!="object"
		&& typeof this.m_node.attributes[a]!="function"
		&& a!="value"){
			o[a] = this.m_node.attributes[a];
		}
	}
	
	return array2json(o);
}

Grid.prototype.unserialize = function(str){
	var o = json2obj(str);
	
	
	for (var a in o){
		if (a=="head"){
			this.m_head = o.head;
		}
		else if (a=="body"){
			this.m_body.m_node.innerHTML = o.body;		
		}
		else if (a=="foot"){
			this.m_foot = o.foot;
		}
		else{		
			this.m_node.attributes[a] = o[a];
		}
	}	
	
}
Grid.prototype.getValueAsObj = function(){
	return {
		"head":this.m_head,
		"body":this.m_body.m_node.innerHTML,
		"foot":this.m_foot
	};
}

Grid.prototype.setValueFromObj= function(obj){

	if (obj.head){
		this.m_head = obj.head;
	}

	if (obj.body){
		this.m_body.m_node.innerHTML = obj.body;
	}
	
	if (obj.foot){
		this.m_ащще = obj.foot;
	}
	
}


