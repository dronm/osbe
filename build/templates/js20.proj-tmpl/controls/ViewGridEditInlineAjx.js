/**
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016
 
 * @class
 * @classdesc
	
 * @param {string} id view identifier
 * @param {namespace} options
 * @param {namespace} [options.tagName=this.DEF_TAG_NAME]
 * @param {namespace} [options.columnTagName=this.DEF_COL_TAG_NAME] 
 * @param {string} [cmdContClassName=DEF_CMD_CLASS]
 * @param {string} containerClass 
 */	

function ViewGridEditInlineAjx(id,options){
	options = options || {};	
	
	options.tagName = options.tagName || this.DEF_TAG_NAME;
	options.cmdSave = false;
	
	this.m_columnTagName = 	options.columnTagName || this.DEF_COL_TAG_NAME;
	this.m_containerClass = options.containerClass;
	options.commandContainer = new ControlContainer(id+":cmd-cont",this.m_columnTagName,{"className":options.cmdContClassName||this.DEF_CMD_CLASS});
	
	this.setGrid(options.grid);
	let gridModelId = options.grid.getModel().getId();
	options.model = (options.models && options.models[gridModelId])? options.models[gridModelId] : null; //new window[gridModelId]();
	//if there is a model in options - use it, otherwise public method get_object model.
	
	this.m_row = options.row;
	
	ViewGridEditInlineAjx.superclass.constructor.call(this,id,options);
}
extend(ViewGridEditInlineAjx,ViewObjectAjx);

/* Constants */
ViewGridEditInlineAjx.prototype.DEF_TAG_NAME = "TR";
ViewGridEditInlineAjx.prototype.DEF_COL_TAG_NAME = "TD";
ViewGridEditInlineAjx.prototype.DEF_CMD_CLASS = "cmdButtons";

/* private members */
ViewGridEditInlineAjx.prototype.m_grid;
ViewGridEditInlineAjx.prototype.m_row;
ViewGridEditInlineAjx.prototype.m_columnTagName;

/* protected*/

/* Default controls */
ViewGridEditInlineAjx.prototype.addEditControls = function(){	
	var view_id = this.getId();	
	var columns = this.getGrid().getHead().getColumns();

	var focus_set_elem;
	var autofocused = false;
	var ctrl_cont_class = this.m_containerClass;
	for (var col_id=0; col_id<columns.length; col_id++){
	
		var column = undefined;
		
		if (this.m_row){
			cell_obj = this.m_row.getElement(columns[col_id].getId());			
			if (cell_obj){			
				column = cell_obj.getGridColumn();
			}
		}
		
		if (!column){
			column = columns[col_id]; 
		}
		
		var ctrl;//edit control	
		var f = column.getField();
		if (!f){
			//no field binding - empty stub			
			ctrl = new Control(view_id+":"+column.getId(), this.m_columnTagName, {"className": ctrl_cont_class});
			
		}else if (column.getCtrlEdit()){
			var ctrl_opts = {};
			var o = column.getCtrlOptions();
			if (o){
				//console.log(typeof(o))
				if(typeof(o) == "function"){
					ctrl_opts = o.call(this);
				}else{
					ctrl_opts = CommonHelper.clone(o);
				}
			}
			ctrl_opts.visible = columns[col_id].getHeadCell().getVisible();
			if(ctrl_cont_class){
				ctrl_opts.contClassName = ctrl_cont_class;
			}
		
			var ctrl_class = column.getCtrlClass();		
			if (!ctrl_class){
				//Default control classes based on data types		
				var tp = f.getDataType();
				if (tp==f.DT_BOOL){
					ctrl_class = EditCheckBox;
				}
				else if (tp==f.DT_DATE){
					ctrl_class = EditDate;
				}
				else if (tp==f.DT_DATETIME){
					ctrl_class = EditDateTime;
				}
				else if (tp==f.DT_ENUM){
					ctrl_class = EditSelect;
				}
				else if (tp==f.DT_FLOAT){
					ctrl_class = EditFloat;
				}
				else if (tp==f.DT_INT){
					ctrl_class = EditInt;
				}
				else if (tp==f.DT_STRING){
					ctrl_class = EditString;
				}
				else if (tp==f.DT_PWD){
					ctrl_class = EditPassword;
				}
				else if (tp==f.DT_TEXT){
					ctrl_class = EditText;
				}
				else{
					ctrl_class = EditString;
				}			
			}				
			if (f.getValidator().getMaxLength()){
				ctrl_opts.maxLength = f.getValidator().getMaxLength();
			}
			if (f.getValidator().getRequired()){
				ctrl_opts.required = true;
			}
					
			var focus_skeep = false;
			if (f.getPrimaryKey()){
				ctrl_opts.noSelect = true;
				ctrl_opts.noClear = true;
				focus_skeep = f.getAutoInc();
			}
			ctrl_opts["name"] = column.getId();
			ctrl = new ctrl_class(view_id+":"+column.getId(), ctrl_opts);
			if (ctrl_opts.focus||ctrl_opts.focussed||ctrl_opts.focused||ctrl_opts.autofocus){
				autofocused = true;
			}
			else if (!autofocused && !focus_skeep && !focus_set_elem && (ctrl_opts.enabled==undefined||ctrl_opts.enabled)){
				focus_set_elem = ctrl;
			}
		}
		else{
			//can not be editted
			ctrl = new Control(view_id+":"+column.getId(), this.m_columnTagName, {"value": f.getValue(), "className": ctrl_cont_class});
		}
		this.addElement(ctrl);		
	}
	if (!autofocused && focus_set_elem){
		//focus to first editable element
		focus_set_elem.setAttr("autofocus","autofocus");
	}
}

ViewGridEditInlineAjx.prototype.addControls = function(){
	
	this.addEditControls();
	
	ViewGridEditInlineAjx.superclass.addControls.call(this);
}

ViewGridEditInlineAjx.prototype.setWritePublicMethod = function(pm){	
	ViewGridEditInlineAjx.superclass.setWritePublicMethod.call(this,pm);
	
	if (!pm){
		return;
	}

	let columns = this.getGrid().getHead().getColumns();
	let comBind = this.getCommands()[this.CMD_OK].getBindings();		
	for (let colId=0; colId<columns.length; colId++){
		//write
		//var f_id = (columns[colId].getWFieldId())? columns[colId].getWFieldId():columns[colId].getField().getId();
		
		var column = undefined;
		if (this.m_row){
			cell_obj = this.m_row.getElement(columns[colId].getId());
			if (cell_obj){
				column = cell_obj.getGridColumn();
			}
		}
		if (!column){
			column = columns[colId]; 
		}
		
		if (column.getField()){
			let fId = (column.getCtrlBindField())?
				column.getCtrlBindField().getId() : 
					(
						(column.getCtrlBindFieldId())?
							column.getCtrlBindFieldId() : column.getField().getId()
					);
			//console.log("ViewGridEditInlineAjx.prototype.setWritePublicMethod FId="+fId+" BindFieldId="+column.getCtrlBindFieldId());
			if (pm.fieldExists(fId)){
				comBind.push(new CommandBinding({
					"field":pm.getField(fId),
					"control":this.getElement(column.getId())
				}));
				//console.log("ViewGridEditInlineAjx.prototype.setWritePublicMethod Added FId="+fId);
			}else{
				console.log("ViewGridEditInlineAjx.prototype.setWritePublicMethod: fieldID: "+fId+", no PublicMethod field")
			}
		}
	}
	this.setKeysPublicMethod(pm);
}

/* public methods */
ViewGridEditInlineAjx.prototype.setReadBinds = function(pm){
	if (!pm){
		return;
	}
	//if model is defined in options.models parameter then use it instead of a new instance.
	// let objModel = pm.getController().getObjModelClass();
	// let model = new objModel();
	let model = this.m_model; //this does not work!
	if(!model){// no option model - use object model
		let objModel = pm.getController().getObjModelClass();
		model = new objModel();
	}
	
	let columns = this.getGrid().getHead().getColumns();
	let bindings = [];

	for (let colId=0; colId<columns.length; colId++){
		let column = undefined;
		if (this.m_row){
			let cellObj = this.m_row.getElement(columns[colId].getId());
			if (cellObj){
				column = cellObj.getGridColumn();
			}
		}
		if (!column){
			column = columns[colId]; 
		}
	
		if (column.getField() && column.getCtrlEdit()){
			let colFieldId = column.getField().getId();
			bindings.push(new DataBinding({
				"field":model.getField(colFieldId),
				"model":model,
				"control":this.getElement(column.getId())
			}));

			//used this code, but it does unnecessary coping
			//better to use this.m_model property
			/*
			let newField = CommonHelper.clone(column.getField());
			if (column.getCtrlBindField()){
				//id field
				model.addField(CommonHelper.clone(column.getCtrlBindField()));
			}
			
			bindings.push(new DataBinding({
				"field":newField,
				"model":model,
				"control":this.getElement(column.getId())
			}));
			*/
		}
	}
	this.setDataBindings(bindings);	
	this.onGetData(null, this.getCmd()); //for filling values passed from insert/view options.
}

ViewGridEditInlineAjx.prototype.setReadPublicMethod = function(pm){
	ViewGridEditInlineAjx.superclass.setReadPublicMethod.call(this,pm);
	this.setReadBinds(pm);
}

//,replacedNode
ViewGridEditInlineAjx.prototype.viewToDOM = function(parent,prevNode){
	var elem;
	for (var elem_id in this.m_elements){
		elem = this.m_elements[elem_id];
		elem.toDOM(this.m_node);
	}
	
	//sys column
	this.m_commandContainer.toDOM(this.m_node);
	
	if (this.m_replacedNode){
		this.m_replacedNode.parentNode.replaceChild(this.m_node,this.m_replacedNode);
	}
	else{
		if(prevNode){
			parent.insertBefore(this.m_node,prevNode.nextSibling);
		}
		else{
			var rows = parent.getElementsByTagName(this.m_node.nodeName);
			if (rows.length==0){
				parent.appendChild(this.m_node);
			}
			else{			
				parent.insertBefore(this.m_node,rows[0]);
			}
		}
	}
	this.scrollToNode();
	this.setFocus();
	this.addKeyEvents();
}

ViewGridEditInlineAjx.prototype.toDOMAfter = function(prevNode){
	this.viewToDOM(prevNode.parentNode,prevNode);
}

ViewGridEditInlineAjx.prototype.toDOM = function(parent){
	this.viewToDOM(parent);
}

ViewGridEditInlineAjx.prototype.scrollToNode = function(){
	var scroll_to_node = (this.getCmd()=="insert" && this.m_grid.getInlineInsertPlace()=="first")? this.m_grid.m_container.getNode():this.m_node;
	if (!DOMHelper.inViewport(scroll_to_node,true)){
		$(scroll_to_node).get(0).scrollIntoView({"behavior":"smooth","block":"start"});
	}
}

ViewGridEditInlineAjx.prototype.setGrid = function(v){
	this.m_grid = v;
}
ViewGridEditInlineAjx.prototype.getGrid = function(){
	return this.m_grid;
}

ViewGridEditInlineAjx.prototype.getReplacedNode = function(){
	return this.m_replacedNode;
}

ViewGridEditInlineAjx.prototype.addElement = function(ctrl,defOptions){
	if ((!defOptions || !defOptions.contTagName) && ctrl.setContTagName){
		ctrl.setContTagName(this.m_columnTagName);
	}
	if ((!defOptions || !defOptions.editContClassName) && ctrl.setEditContClassName){
		ctrl.setEditContClassName(ctrl.DEF_EDIT_CONT_CLASS+" "+window.getBsCol(12));
	}
//console.log("CtrlId="+ctrl.getId()+" ContTagName="+ctrl.getContTagName())
	ViewGridEditInlineAjx.superclass.addElement.call(this,ctrl);
}

ViewGridEditInlineAjx.prototype.setKeysPublicMethod = function(pm){	
	for (var k in this.m_keys){
		var fid = "old_"+k;
		if (pm.fieldExists(fid)){
			pm.setFieldValue(fid,this.m_keys[k]);
		}
	}		
}


