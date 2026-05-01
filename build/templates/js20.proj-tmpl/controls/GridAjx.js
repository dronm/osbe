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
 * @param {namespace} options
 * @param {PublicMethod} [options.readPublicMethod=get_list]
 * @param {PublicMethod} [options.insertPublicMethod=insert]
 * @param {PublicMethod} [options.updatePublicMethod=update]
 * @param {PublicMethod} [options.deletePublicMethod=delete]
 * @param {PublicMethod} options.exportPublicMethod
 * @param {PublicMethod} [options.editPublicMethod=get_object]
 * @param {ControllerDb} options.controller
 * @param {bool} [options.refreshAfterDelRow=false]
 * @param {bool} [options.refreshAfterUpdateRow=true]
 * @param {Array} options.filters array of Filter objects
 * @param {Array} [options.onDelOkMesTimeout=DEF_ONDELOK_MES_TIMEOUT]
 *
 * @param {bool} [options.defSrvEvents=true] add default events in toDOM method 
*/
function GridAjx(id,options){
	options = options || {};	
	
	if (options.editInline){
		//default class for editInline=true
		options.editViewClass = options.editViewClass || ViewGridEditInlineAjx;
	}
	
	this.m_filters = {};
	
	if (options.controller){
		options.readPublicMethod = options.readPublicMethod
			|| ( (options.controller.publicMethodExists(options.controller.METH_GET_LIST))?
				options.controller.getPublicMethod(options.controller.METH_GET_LIST):null );
				
		options.insertPublicMethod = options.insertPublicMethod
			|| ( (options.controller.publicMethodExists(options.controller.METH_INSERT))?
				options.controller.getPublicMethod(options.controller.METH_INSERT):null );

		options.updatePublicMethod = options.updatePublicMethod
			|| ( (options.controller.publicMethodExists(options.controller.METH_UPDATE))?
				options.controller.getPublicMethod(options.controller.METH_UPDATE):null );

		options.deletePublicMethod = options.deletePublicMethod
			|| ( (options.controller.publicMethodExists(options.controller.METH_DELETE))?
				options.controller.getPublicMethod(options.controller.METH_DELETE):null );

		options.editPublicMethod = options.editPublicMethod
			|| ( (options.controller.publicMethodExists(options.controller.METH_GET_OBJ))?
				options.controller.getPublicMethod(options.controller.METH_GET_OBJ):null );
	}
	
	//Controller list model to dataSet model
	if (options.readPublicMethod && !options.model && options.readPublicMethod.getListModelClass()){
		var m_class = options.readPublicMethod.getListModelClass();
		options.model = new m_class();
	}
	
	this.setReadPublicMethod(options.readPublicMethod);
	this.setInsertPublicMethod(options.insertPublicMethod);
	this.setUpdatePublicMethod(options.updatePublicMethod);
	this.setDeletePublicMethod(options.deletePublicMethod);
	this.setExportPublicMethod(options.exportPublicMethod);
	this.setEditPublicMethod(options.editPublicMethod);				
	
	this.setRefreshAfterDelRow(options.refreshAfterDelRow);
	this.setRefreshAfterUpdateRow((options.refreshAfterUpdateRow!=undefined)? options.refreshAfterUpdateRow:true);
		
	if (options.filters && options.filters.length){
		for (var i=0;i<options.filters.length;i++){
			this.setFilter(options.filters[i]);
		}
	}
	/*
	if (options.commands && options.controller && options.commands.getCmdPrintObj()){
		options.commands.getCmdPrintObj().setPrintObjList(options.controller.getPrintList());
	}
	*/
	
	this.setOnDelOkMesTimeout(options.onDelOkMesTimeout||this.DEF_ONDELOK_MES_TIMEOUT);
	
	/**
	 * default srv events (insert|update|delete)
	 * refresh interval should be on!
	 */	 
	if(window.getApp().getAppSrv()){
		options.srvEvents = options.srvEvents || {};	
		var srv_ev_exist = (options.srvEvents.events && options.srvEvents.events.length);
		this.m_defSrvEvents = (options.defSrvEvents!=undefined)? options.defSrvEvents : (srv_ev_exist || options.refreshInterval>0);
		this.m_httpRrefreshInterval = options.refreshInterval;
		options.refreshInterval = (this.m_defSrvEvents || srv_ev_exist)? undefined : options.refreshInterval;
		
		if(this.m_defSrvEvents || srv_ev_exist){
			var self = this;
			options.srvEvents.onEvent = options.srvEvents.onEvent || function(params){
				self.srvEventsCallBack(params);
			}
			options.srvEvents.onSubscribed = options.srvEvents.onSubscribed || function(){
				self.srvEventsOnSubscribed();
			}
			options.srvEvents.onClose = options.srvEvents.onClose || function(error){
				self.srvEventsOnClose(error);
			}
			options.srvEvents.onWakeup = options.srvEvents.onWakeup || function(error){
				self.srvEventsOnWakeup(error);
			}
			
		}
	}
		
	GridAjx.superclass.constructor.call(this,id,options);
}

extend(GridAjx,Grid);

/* Constants */
GridAjx.prototype.DEF_ONDELOK_MES_TIMEOUT = 2000;

/* private members */
GridAjx.prototype.m_readPublicMethod;
GridAjx.prototype.m_insertPublicMethod;
GridAjx.prototype.m_updatePublicMethod;
GridAjx.prototype.m_deletePublicMethod;
GridAjx.prototype.m_exportPublicMethod;
GridAjx.prototype.m_editPublicMethod;
GridAjx.prototype.m_refreshAfterDelRow;
GridAjx.prototype.m_refreshAfterUpdateRow;
GridAjx.prototype.m_filters;

/* protected*/
GridAjx.prototype.onGetData = function(resp){
	if(resp){
		this.m_model.setData(resp.getModelData(this.m_model.getId()));
	}
	
	GridAjx.superclass.onGetData.call(this);	
}

GridAjx.prototype.initEditView = function(parent,replacedNode,cmd){
	GridAjx.superclass.initEditView.call(this,parent,replacedNode,cmd);

	if(this.m_editViewObj.setWritePublicMethod){
		let pm = (cmd=="insert" || cmd=="copy")? this.getInsertPublicMethod() : this.getUpdatePublicMethod();
		this.m_editViewObj.setWritePublicMethod(pm);
	}
	if(this.m_editViewObj.setReadPublicMethod){
		//this.getEditInline() make it same as read if editInLine is true???
		this.m_editViewObj.setReadPublicMethod(this.getEditPublicMethod());
	}
}

GridAjx.prototype.fillEditView = function(cmd){
	if (cmd!="insert" && this.m_editViewObj.getReadPublicMethod){
		this.keysToPublicMethod(this.m_editViewObj.getReadPublicMethod());
	}
	
	GridAjx.superclass.fillEditView.call(this,cmd);
}

GridAjx.prototype.keysToPublicMethod = function(pm){
	var pm_fields = pm.getFields();
	var fields = this.m_model.getFields();
	for (id in pm_fields){
		if (fields[id] && fields[id].getPrimaryKey()){
			var v = fields[id].getValue();
			pm_fields[id].setValue(v);
		}
		else if (pm_fields[id].getPrimaryKey()){
			pm_fields[id].resetValue();
		}
	}
}

/*reads data to editViewObj*/
GridAjx.prototype.read = function(cmd){
	if (this.m_editViewObj){
		this.m_editViewObj.read(cmd,function(resp,erCode,erStr){
			self.onError(resp,erCode,erStr)
		});
	}
}

/*
GridAjx.prototype.edit = function(cmd){
	GridAjx.superclass.edit.call(this,cmd);

	if (this.m_editViewObj){
		var pm = this.m_editViewObj.getReadPublicMethod();
		if (!pm){
			throw Error(this.ER_NO_EDIT_PM);
		}
		
		this.keysToPublicMethod(pm);
	}
}
*/

/* Completely overridden function */
GridAjx.prototype.delRow = function(rowNode){
	var pm = this.getDeletePublicMethod();
	if (!pm){
		throw Error(this.ER_NO_DEL_PM);
	}
	
	this.setEnabled(false);
	
	this.setModelToCurrentRow();	
	this.keysToPublicMethod(pm);
	var self = this;
	pm.run({
		"async":false,
		"ok":function(resp){
			/*
			self.deleteRowNode();
			self.setEnabled(true);			
			
			window.showNote(self.NT_REC_DELETED,function(){
				self.focus();
				if (self.getRefreshAfterDelRow()){
					self.onRefresh();
				}
				
			},2000);			
			*/
			self.addLsnToReadPublicMethod(window.getApp().getLsnValueFromResponse(resp));
			self.afterServerDelRow();
		},
		"fail":function(resp,erCode,erStr){
			self.setEnabled(true);
			self.onError(resp,erCode,erStr);
		}
	});	
}

GridAjx.prototype.afterServerDelRow = function(){
	this.deleteRowNode();
	this.setEnabled(true);			
	
	window.showTempNote(this.NT_REC_DELETED,null,this.m_onDelOkMesTimeout);			
	this.focus();
	if (this.getRefreshAfterDelRow()){
		this.onRefresh();
	}		
	
}

/*
GridAjx.prototype.afterDelRow = function(newNode){
	
	//set position to the next row on success
	if (this.m_rowSelect){
		this.selectRow(newNode);
	}
	else{
		this.selectCell(newNode);
	}

	this.setEnabled(true);
	this.focus();	

	if (this.getRefreshAfterDelRow()){
		this.onRefresh();
	}

}
*/

/* public methods */

GridAjx.prototype.filtersToMethod = function(sep){		
	var pm = this.getReadPublicMethod();	
	var contr = pm.getController();
	
	sep = (sep==undefined)? contr.PARAM_FIELD_SEP_VAL:sep;
	
	var s_fields,s_signs,s_vals,s_icases;
	for (var fid in this.m_filters){
		if (this.m_filters[fid] && this.m_filters[fid].field && this.m_filters[fid].sign){
			s_fields	= ( (!s_fields)? "":s_fields+sep) + this.m_filters[fid].field;
			s_signs		= ( (!s_signs)? "":s_signs+sep ) + this.m_filters[fid].sign;
			s_vals		= ( (!s_vals)? "":s_vals+sep ) + this.m_filters[fid].val;
			s_icases	= ( (!s_icases)? "":s_icases+sep ) + (this.m_filters[fid].icase || "0");
		}
	}
	
	pm.setFieldValue(contr.PARAM_COND_FIELDS, s_fields);
	pm.setFieldValue(contr.PARAM_COND_SGNS, s_signs);
	pm.setFieldValue(contr.PARAM_COND_VALS, s_vals);
	pm.setFieldValue(contr.PARAM_COND_ICASE, s_icases);
	
	/*
	if (this.m_commands && this.m_commands.getControlFilter && this.m_commands.getControlFilter()){		
		this.m_commands.getControlFilter().getFilter().applyFilters(this.getReadPublicMethod(),false);
	}
	else if (this.m_commands && this.m_commands.getCmdFilter && this.m_commands.getCmdFilter()){
		this.m_commands.getCmdFilter().applyFilters();
	}
	else{
		//clear
		var pm = this.getReadPublicMethod();	
		var contr = pm.getController();
		pm.getField(contr.PARAM_COND_FIELDS).unsetValue();
		pm.getField(contr.PARAM_COND_SGNS).unsetValue();
		pm.getField(contr.PARAM_COND_VALS).unsetValue();
		pm.getField(contr.PARAM_COND_ICASE).unsetValue();		
	}
	*/
}


GridAjx.prototype.condFilterToMethod = function(publicMethod){
	var contr = publicMethod.getController();
	if (publicMethod.fieldExists(contr.PARAM_COND_FIELDS)){
		//filter
		this.filtersToMethod(contr.PARAM_FIELD_SEP_VAL);
		//separator	
		publicMethod.setFieldValue(contr.PARAM_FIELD_SEP, contr.PARAM_FIELD_SEP_VAL);
	}
}

/*
GridAjx.prototype.onRefresh = function(callBack){
	var self = this;
	var pm = this.getReadPublicMethod();	
	if (!pm){
		throw Error(this.ER_NO_READ_PM);
	}
	
	var contr = pm.getController();
	
	if(!this.m_sortFields){
		this.defineSortFields();
	}
	
	if(pm.fieldExists(contr.PARAM_ORD_FIELDS)){
		var last_row = this.getLastRow();
		var sort_cols,sort_dirs;
		for(var f_id in this.m_sortFields){
			sort_cols = sort_cols || "";
			sort_cols+= (sort_cols=="")? "":contr.PARAM_FIELD_SEP_VAL;
			sort_cols+= f_id;
			sort_dirs = sort_dirs || "";
			sort_dirs+=  (sort_dirs=="")? "":contr.PARAM_FIELD_SEP_VAL;
			sort_dirs+= this.m_sortFields[f_id];
			
			if(last_row && last_row[f_id]){
				//add filter
				this.m_filters
			}
		}
		pm.setFieldValue(contr.PARAM_ORD_FIELDS, sort_cols);
		pm.setFieldValue(contr.PARAM_ORD_DIRECTS, sort_dirs);				

		pm.getField(contr.PARAM_FROM).unsetValue();
		pm.setFieldValue(contr.PARAM_COUNT,this.getPagination().getCountPerPage());
		
	}
	
	this.condFilterToMethod(pm);
}
GridAjx.prototype.getLastRow = function(){
}

GridAjx.prototype.defineSortFields = function(){
	var head = this.getHead();
	if (!head)return;
	this.m_sortFields = {};
	for (var row in head.m_elements){
		var head_row = head.m_elements[row];
		for (var col in head_row.m_elements){
			if (head_row.m_elements[col].getSortable()){
				var sort_dir = head_row.m_elements[col].getSort();
				if (sort_dir == "asc" || sort_dir == "desc"){
					var sort_col = head_row.m_elements[col].getSortFieldId();
					if (!sort_col){				
						var cols = head_row.m_elements[col].getColumns();
						for(var i=0;i<cols.length;i++){
							this.m_sortFields[cols[i].getField()? cols[i].getField().getId():cols[i].getId()] = sort_dir;
						}
					}
					else{
						this.m_sortFields[sort_col] = sort_dir;
					}
				}
			}
		}		
	}
}
*/

/**
* @param {function} callBack - A callback function to be called when refreshing is done, after onGetData is called
*/
GridAjx.prototype.onRefresh = function(callBack, onError, onAll){
	if(!this.getEnabled()){
		if (callBack){
			callBack.call(this);
		}
		return;		
	}
	
	var self = this;
	var pm = this.getReadPublicMethod();	
	if (!pm){
		throw Error(this.ER_NO_READ_PM);
	}
	
	var contr = pm.getController();
	
	//pagination
	var pag = this.getPagination();
	if (pag){
		var pag_f = pag.getFrom();
		var pag_cnt = pag.getCountPerPage();
	
		if(!isNaN(pag_f)){
			pm.setFieldValue(contr.PARAM_FROM,pag_f);
		}
		else{
			pm.getField(contr.PARAM_FROM).unsetValue();
		}
		if(!isNaN(pag_cnt)){
			pm.setFieldValue(contr.PARAM_COUNT,pag_cnt);
		}
		else{
			pm.getField(contr.PARAM_COUNT).unsetValue();
		}
	}
	// debugger
	this.condFilterToMethod(pm);
			
	//ordering
	this.orderingToMethod(pm);
	/*
	var sort_cols,sort_dirs;
	var head = this.getHead();
	if (head && pm.fieldExists(contr.PARAM_ORD_FIELDS) ){
		for (var row in head.m_elements){
			var head_row = head.m_elements[row];
			for (var col in head_row.m_elements){
				if (head_row.m_elements[col].getSortable()){
					var sort_dir = head_row.m_elements[col].getSort();
					if (sort_dir == "asc" || sort_dir == "desc"){
						var sort_col = head_row.m_elements[col].getSortFieldId();
						if (!sort_col){				
							var cols = head_row.m_elements[col].getColumns();
							for(var i=0;i<cols.length;i++){
								sort_cols = (sort_cols==undefined)? "":sort_cols;
								sort_cols+= (sort_cols=="")? "":contr.PARAM_FIELD_SEP_VAL;
								//might be json field!!!
								var sort_id;
								var sort_f = cols[i].getField();
								if(sort_f){
									var sort_dt = sort_f.getDataType();
									if(sort_dt == Field.prototype.DT_JSON || sort_dt == Field.prototype.DT_JSONB){
										var sort_s_opts = cols[i].getSearchOptions();
										if(sort_s_opts && sort_s_opts.field){
											sort_id = sort_s_opts.field.getId();
										}else{
											sort_id = sort_f.getId()+"->>'descr'";	
										}
									}
								}
								sort_cols+= sort_id? sort_id : (sort_f? sort_f.getId():cols[i].getId() );
								sort_dirs = (sort_dirs==undefined)? "":sort_dirs;
								sort_dirs+=  (sort_dirs=="")? "":contr.PARAM_FIELD_SEP_VAL;
								sort_dirs+= sort_dir;
							}
						}
						else{
							sort_cols = (sort_cols==undefined)? "":sort_cols;
							sort_cols+= (sort_cols=="")? "":contr.PARAM_FIELD_SEP_VAL;
							sort_cols+= sort_col;
							sort_dirs = (sort_dirs==undefined)? "":sort_dirs;
							sort_dirs+=  (sort_dirs=="")? "":contr.PARAM_FIELD_SEP_VAL;
							sort_dirs+= sort_dir;					
						}
					}
				}
			}		
		}
		pm.setFieldValue(contr.PARAM_ORD_FIELDS, sort_cols);
		pm.setFieldValue(contr.PARAM_ORD_DIRECTS, sort_dirs);				
	}	
	*/
	//console.log("GridAjx.onRefresh before query")
	pm.run({
		"ok":function(resp){
			self.onGetData(resp);
			if (callBack){
				callBack.call(self);
			}
		},
		"fail":function(resp,erCode,erStr){
			self.onError(resp,erCode,erStr);
			if(onError){
				onError.call(self);
			}
		},
		"all": (onAll? function(){
				onAll.call(self);
			}
		:null)
	});
}

GridAjx.prototype.orderingToMethod = function(pm){
	var sort_cols, sort_dirs;
	var head = this.getHead();
	var contr = pm.getController();
	if (head && pm.fieldExists(contr.PARAM_ORD_FIELDS) ){
		for (var row in head.m_elements){
			var head_row = head.m_elements[row];
			for (var col in head_row.m_elements){
				if (head_row.m_elements[col].getSortable()){
					var sort_dir = head_row.m_elements[col].getSort();
					if (sort_dir == "asc" || sort_dir == "desc"){
						var sort_col = head_row.m_elements[col].getSortFieldId();
						if (!sort_col){				
							var cols = head_row.m_elements[col].getColumns();
							for(var i=0;i<cols.length;i++){
								sort_cols = (sort_cols==undefined)? "":sort_cols;
								sort_cols+= (sort_cols=="")? "":contr.PARAM_FIELD_SEP_VAL;
								//might be json field!!!
								var sort_id;
								var sort_f = cols[i].getField();
								if(sort_f){
									var sort_dt = sort_f.getDataType();
									if(sort_dt == Field.prototype.DT_JSON || sort_dt == Field.prototype.DT_JSONB){
										var sort_s_opts = cols[i].getSearchOptions();
										if(sort_s_opts && sort_s_opts.field){
											sort_id = sort_s_opts.field.getId();
										}else{
											sort_id = sort_f.getId()+"->>'descr'";	
										}
									}
								}
								sort_cols+= sort_id? sort_id : (sort_f? sort_f.getId():cols[i].getId() );
								sort_dirs = (sort_dirs==undefined)? "":sort_dirs;
								sort_dirs+=  (sort_dirs=="")? "":contr.PARAM_FIELD_SEP_VAL;
								sort_dirs+= sort_dir;
							}
						}
						else{
							sort_cols = (sort_cols==undefined)? "":sort_cols;
							sort_cols+= (sort_cols=="")? "":contr.PARAM_FIELD_SEP_VAL;
							sort_cols+= sort_col;
							sort_dirs = (sort_dirs==undefined)? "":sort_dirs;
							sort_dirs+=  (sort_dirs=="")? "":contr.PARAM_FIELD_SEP_VAL;
							sort_dirs+= sort_dir;					
						}
					}
				}
			}		
		}
		pm.setFieldValue(contr.PARAM_ORD_FIELDS, sort_cols);
		pm.setFieldValue(contr.PARAM_ORD_DIRECTS, sort_dirs);				
	}
}

GridAjx.prototype.onError = function(resp,erCode,erStr){
	GridAjx.superclass.onError.call(this,window.getApp().formatError(erCode,erStr));
}

GridAjx.prototype.setReadPublicMethod = function(v){
	this.m_readPublicMethod = v;
}

GridAjx.prototype.getReadPublicMethod = function(){
	return this.m_readPublicMethod;
}

GridAjx.prototype.setInsertPublicMethod = function(v){
	this.m_insertPublicMethod = v;
}

GridAjx.prototype.getInsertPublicMethod = function(){
	return this.m_insertPublicMethod;
}

GridAjx.prototype.setUpdatePublicMethod = function(v){
	this.m_updatePublicMethod = v;
}

GridAjx.prototype.getUpdatePublicMethod = function(){
	return this.m_updatePublicMethod;
}

GridAjx.prototype.setDeletePublicMethod = function(v){
	this.m_deletePublicMethod = v;
}

GridAjx.prototype.getDeletePublicMethod = function(){
	return this.m_deletePublicMethod;
}

GridAjx.prototype.setExportPublicMethod = function(v){
	this.m_exportPublicMethod = v;
}

GridAjx.prototype.getExportPublicMethod = function(){
	return this.m_exportPublicMethod;
}

GridAjx.prototype.setEditPublicMethod = function(v){
	this.m_editPublicMethod = v;
}

GridAjx.prototype.getEditPublicMethod = function(){
	return this.m_editPublicMethod;
}

GridAjx.prototype.setRefreshAfterDelRow = function(v){
	this.m_refreshAfterDelRow = v;
}

GridAjx.prototype.getRefreshAfterDelRow = function(){
	return this.m_refreshAfterDelRow;
}
GridAjx.prototype.setRefreshAfterUpdateRow = function(v){
	this.m_refreshAfterUpdateRow = v;
}

GridAjx.prototype.getRefreshAfterUpdateRow = function(){
	return this.m_refreshAfterUpdateRow;
}

GridAjx.prototype.getFilters = function(){
	return this.m_filters;
}
GridAjx.prototype.setFilters = function(filters){
	this.m_filters = filters;
}

GridAjx.prototype.getFilterKey = function(filterOrField,sign){
	var key;
	if (typeof(filterOrField)=="object"){
		key = filterOrField.field+filterOrField.sign;
	}
	else{
		key = filterOrField+(sign? sign:"");
	}
	//CommonHelper.md5(
	return key;
}

/*
filter struc{
	string field
	string sign
	string val
	int icase
	bool lwcards adds %+text
	bool rwcards adds text+%
}
*/
GridAjx.prototype.setFilter = function(filter){
	var pm_ins = this.getInsertPublicMethod();
	if (pm_ins&&pm_ins.fieldExists(filter.field)){
		if(filter.val === undefined || filter.val === null){
			pm_ins.unsetFieldValue(filter.field);
		}else{
			pm_ins.setFieldValue(filter.field, filter.val);
		}
	}
	var pm_upd = this.getUpdatePublicMethod();
	if (pm_upd&&pm_upd.fieldExists(filter.field)){
		if(filter.val === undefined || filter.val === null){
			pm_upd.unsetFieldValue(filter.field);
		}else{
			pm_upd.setFieldValue(filter.field, filter.val);
		}
	}

	this.m_filters[this.getFilterKey(filter)] = filter;
}
GridAjx.prototype.getFilter = function(filterOrField,sign){
	return this.m_filters[this.getFilterKey(filterOrField,sign)];
}

GridAjx.prototype.unsetFilter = function(filterOrField,sign){
	this.m_filters[this.getFilterKey(filterOrField,sign)] = undefined;
}

GridAjx.prototype.setOnDelOkMesTimeout = function(v){
	this.m_onDelOkMesTimeout = v;
}
GridAjx.prototype.getOnDelOkMesTimeout = function(){
	return this.m_onDelOkMesTimeout;
}

GridAjx.prototype.refreshAfterEditCont = function(res){

	if (this.getRefreshAfterUpdateRow() && res && res.updated){
		//ToDo set to new Id
		if (res.newKeys&&!CommonHelper.isEmpty(res.newKeys)){
			this.m_selectedRowKeys = CommonHelper.serialize(res.newKeys);	
		}
		this.addLsnToReadPublicMethod(res.lsn);
		this.onRefresh();
	}	
}


GridAjx.prototype.srvEventsOnWakeup = function(json){
	console.log("Calling refresh after wakeup")
	this.onRefresh();
}

GridAjx.prototype.addLsnToReadPublicMethod = function(lsn){
	var pm = this.getReadPublicMethod();	
	if(pm && pm.fieldExists("lsn")){
		if(lsn){				
			pm.setFieldValue("lsn", lsn);
		}else{
			pm.unsetFieldValue("lsn");
		}
	}
}

GridAjx.prototype.srvEventsCallBack = function(json){
	//add sofisticated mechanism
//	console.log("GridAjx.prototype.srvEventsCallBack ")
//	console.log(json)
	
	var do_refresh = true;
	if(json.eventId && json.params
	&& (
		( this.getUpdatePublicMethod() && json.eventId==this.getEventIdOnPublicMethod(this.getUpdatePublicMethod()) )
		||( this.getDeletePublicMethod() && json.eventId==this.getEventIdOnPublicMethod(this.getDeletePublicMethod()) )
	)
	){
		//if update/delete - check if id is in the grid
		// console.log("Update/delete method, checking keys")
		var keys = this.getKeyIds();
		var key_fields = {};
		for(var i=0;i<keys.length;i++){
			if(json.params[keys[i]]){
				key_fields[keys[i]] = json.params[keys[i]];
			}
		}
		try{
			this.m_model.recLocate(key_fields,true);
		}
		catch(e){
			do_refresh = false;
		}
	}
	if(do_refresh){		
		
		//set lsn value
		if(json.params && json.params.lsn){
			this.addLsnToReadPublicMethod(json.params.lsn);
		}
		
		console.log("Calling refresh")
		this.onRefresh();
	}
}

GridAjx.prototype.getEventIdOnPublicMethod = function(pm){
	if(!pm){
		return null;
	}
	var contr = pm.getController();
	return contr? window.getApp().getEventIdOnController(contr,pm.getId()) : null;
}

GridAjx.prototype.getDefSrvEvents = function(){
	var events = [];
	var ev_id = this.getEventIdOnPublicMethod(this.getInsertPublicMethod());
	if(ev_id){
		events.push({"id": ev_id});
	}
	
	var ev_id = this.getEventIdOnPublicMethod(this.getUpdatePublicMethod());
	if(ev_id){
		events.push({"id": ev_id});
	}
	
	var ev_id = this.getEventIdOnPublicMethod(this.getDeletePublicMethod());
	if(ev_id){
		events.push({"id": ev_id});
	}
	
	return events;
}

GridAjx.prototype.srvEventsOnSubscribed = function(){
	this.setRefreshInterval(0);
}

GridAjx.prototype.srvEventsOnClose = function(message){
//console.log("GridAjx.prototype.srvEventsOnClose message=")
//console.log(message)
	if(message && message.code>1000){
		//back to http time event
		//console.log("GridAjx.prototype.srvEventsOnClose setRefreshInterval="+this.m_httpRrefreshInterval)
		this.setRefreshInterval(this.m_httpRrefreshInterval);
	}
}

GridAjx.prototype.toDOM = function(p){
	if(this.m_defSrvEvents && !this.m_srvEvents.events){
		this.m_srvEvents.events = this.getDefSrvEvents();
	}
	GridAjx.superclass.toDOM.call(this,p);		
}


