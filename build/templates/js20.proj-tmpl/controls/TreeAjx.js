/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2017

 * @extends GridAjx
 * @requires core/extend.js
 * @requires GridAjx.js     

 * @class
 * @classdesc
 
 * @param {string} id - Object identifier
 * @param {object} options
 */
function TreeAjx(id,options){
	options = options || {};	
		
	options.rowSelect = true;
	options.resize = false;
	options.showHead = false;
	
	options.autoRefresh = false;
	options.editInline = (options.editInline!=undefined)? options.editInline:true;
	options.inlineInsertPlace = (options.inlineInsertPlace!=undefined)? options.inlineInsertPlace:"current";
	options.editViewOptions = options.editViewOptions || {
		"tagName":"LI",
		"columnTagName":"DIV"
	};
	
	options.selectedRowClass = "active";
	
	//options.popUpMenu = (options.popUpMenu!=undefined)? options.popUpMenu:new PopUpMenu();
	
	options.commands = options.commands || new GridCmdContainerAjx(id+":cmd",{
		"cmdColManager":false,
		"cmdExport":false,
		"cmdSearch":false,
		"cmdRefresh":false
	});
	
	this.setRootCaption(options.rootCaption || this.DEF_ROOT_CAPTION);
	
	TreeAjx.superclass.constructor.call(this,id,options);
}
extend(TreeAjx,GridAjx);

/* Constants */
TreeAjx.prototype.DEF_TAG_NAME = "DIV";
TreeAjx.prototype.DEF_ROW_TAG_NAME = "LI";
TreeAjx.prototype.DEF_CELL_TAG_NAME = "DIV";
TreeAjx.prototype.DEF_BODY_TAG_NAME = "UL";


/* private members */
TreeAjx.prototype.m_rootCaption;


/* protected*/
TreeAjx.prototype.nodeClickable = function(node){
	return (this.getEnabled());
}

TreeAjx.prototype.onNextRow = function(){	
	var res = false;
	var selected_node = this.getSelectedNode();
	var new_node;
	
	var new_node;
	if (selected_node){		
		//find child node with same nodeName
		var chld_same_tag = selected_node.getElementsByTagName(selected_node.nodeName);
		if (chld_same_tag && chld_same_tag.length){
			new_node = chld_same_tag[0];
		}
		else if (selected_node.nextSibling && selected_node.nextSibling.nodeName==selected_node.nodeName){
			new_node = selected_node.nextSibling;
		}
		else{
			new_node = DOMHelper.getParentByTagName(selected_node,selected_node.nodeName);
			if (new_node){
				new_node = new_node.nextSibling;
			}
		}
	
		if (new_node
		&& this.getRowSelectable(new_node)
		){
			/*Row selection*/
			this.selectRow(new_node, selected_node);
			
			$(new_node).get(0).scrollIntoView();
			res = true;
		}
	}
					
	return res;
}

TreeAjx.prototype.onPreviousRow = function(){	
	var res = false;
	var selected_node = this.getSelectedNode();
	var new_node;
	
	if (selected_node){
		if (selected_node.previousSibling && selected_node.previousSibling.nodeName==selected_node.nodeName){
			new_node = selected_node.previousSibling;
		}
		else{
			new_node = DOMHelper.getParentByTagName(selected_node,selected_node.nodeName);
		}
	
		if (new_node
		&& this.getRowSelectable(new_node)
		){
			/*Row selection*/
			this.selectRow(new_node, selected_node);
			
			$(new_node).get(0).scrollIntoView();
			res = true;
		}
	}
						
	return res;
}


/* public methods */
TreeAjx.prototype.setRootCaption = function(v){
	this.m_rootCaption = v;
}

TreeAjx.prototype.getRootCaption = function(){
	return this.m_rootCaption;
}

TreeAjx.prototype.edit = function(cmd){
	if (cmd=="edit" && DOMHelper.getAttr(this.getSelectedRow(),"modelIndex")==-1){
		//root
		return 0;
	}
	if(cmd=="insert"){
		this.setModelToCurrentRow();
	}
	TreeAjx.superclass.edit.call(this,cmd);
}

TreeAjx.prototype.onGetData = function(){
	if (this.m_model){

		//refresh from model
		var self = this;
		var body = this.getBody();
		var foot = this.getFoot();
		body.delDOM();
		body.clear();
	
		if (foot && foot.calcBegin){	
			this.m_foot.calcBegin(this.m_model);
		}
	
		if (!this.getHead())return;
		
		var columns = this.getHead().getColumns();
		//var temp_input;
		
		var row_cnt, field_cnt;
		var row,row_keys;
		this.m_model.reset();
	
		var pag = this.getPagination();
		if (pag){
			pag.m_from = parseInt(this.m_model.getPageFrom());
			pag.setCountTotal(this.m_model.getTotCount());
		}
	
		/* temporaly always set to 0*/
		var h_row_ind = 0;
	
		this.m_itemIds = {};
	
		/**
			ADDED CODE
		 */
		
		var key_field_id = this.m_model.getKeyField().getId();
		row_cnt = -1;//FIRST ROW IS DUMB
		var r_class = this.getHead().getRowClass(h_row_ind);
		//row = new r_class(this.getId()+":"+this.getBody().getName()+":"+row_cnt,{});
		row = this.createNewRow(row_cnt,h_row_ind,row_cnt+1);
		var root_node = new ControlContainer(null,"UL");
		row.addElement(new GridCell(row.getId()+":descr",{"value":this.getRootCaption(),"tagName":"SPAN"}));
		row.addElement(root_node);		
		body.addElement(row);
		row_cnt++;
		//**************************************************
		this.m_model.reset();
		while(this.m_model.getNextRow()){		
			row = this.createNewRow(row_cnt,h_row_ind,row_cnt+1);

			row_keys = {};
			for(var k=0;k<this.m_keyIds.length;k++){
				if (this.m_model.fieldExists(this.m_keyIds[k])){
					row_keys[this.m_keyIds[k]] = this.m_model.getFieldValue(this.m_keyIds[k]);
				}
			}
			
			field_cnt = 0;
			for (var col_id=0;col_id<columns.length;col_id++){
			
				columns[col_id].setGrid(this);

				if (columns[col_id].getField() && columns[col_id].getField().getPrimaryKey()){
					row_keys[columns[col_id].getField().getId()] = columns[col_id].getField().getValue();
				}
								
				var cell = this.createNewCell(columns[col_id],row);
				
				if (this.m_onEventAddCell){
					this.m_onEventAddCell.call(this,cell);
				}
				
				row.addElement(cell);
								
				field_cnt++;				
			}
		
			row.setAttr("keys",CommonHelper.serialize(row_keys));			
		
			//system cell
			var row_cmd_class = this.getRowCommandClass();
			if (row_cmd_class){
				var row_class_options = {"grid":this};
				row.addElement(new row_cmd_class(this.getId()+":"+body.getName()+":"+row.getId()+":cell-sys",row_class_options));
			}
			
			if (this.m_onEventAddRow){
				this.m_onEventAddRow.call(this,row);
			}
			
			/**
				ADDED CODE
			 */			
			var item_id = this.m_model.getFieldValue(key_field_id);			
			
			var parent_item_id = this.m_model.getParentId();
			this.m_itemIds[item_id] = new ControlContainer(row.getId()+":gr","UL",{});
			row.addElement(this.m_itemIds[item_id]);
//console.log("parent_item_id="+parent_item_id)
			if (parent_item_id){
				this.m_itemIds[parent_item_id].addElement(row);
			}
			else{
				root_node.addElement(row);
			}
			
			row.m_drag = new DragObject(row.getNode(),{"offsetY":60,"offsetX":-100});			
			row.m_drop = new DropTarget(row.getNode());
			row.m_drop.accept = function(dragObject) {
				var drop_id = CommonHelper.unserialize(this.element.getAttribute("keys")).id;
				var drag_id = CommonHelper.unserialize(dragObject.element.getAttribute("keys")).id;					
				//console.log("FromId="+drag_id+" to Id="+drop_id)
				
				var key_fields = {
					"id":new FieldInt("id")
				}
				
				key_fields.id.setValue(drag_id);
				var drag_row;
				var drag_row_a = self.m_model.recLocate(key_fields,true);
				if(drag_row_a&&drag_row_a.length){					
					drag_row = self.m_model.m_currentRow;
				}

				key_fields.id.setValue(drop_id);
				var drop_row;
				var drop_row_a = self.m_model.recLocate(key_fields,true);
				if(drop_row_a&&drop_row_a.length){					
					drop_row = self.m_model.m_currentRow;
				}
				if(drag_row&&drop_row){
					drop_row.parentNode.insertBefore(drag_row,drop_row);
					/*
					if (self.m_model.getFieldValue("viewDescr")){
						//elem
						drop_row.parentNode.insertBefore(drag_row,drop_row);
					}
					else{
						//group
						DOMHelper.setParent(drag_row,drop_row);
					}
					*/
					self.onRefresh();
				}
			}			
			//**************************************************
						
			row_cnt++;
	
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
		
	}
	if (this.m_navigate || this.m_navigateClick){
		this.setSelection();
	}
}

TreeAjx.prototype.onDelete = function(callBack){	
	var res = false;
	if (this.m_cmdDelete){
		//prevent Root node deletion
		var selected_node = this.getSelectedRow();
		if(selected_node.parentNode==this.getBody().getNode()){
			return;	
		}
		
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

