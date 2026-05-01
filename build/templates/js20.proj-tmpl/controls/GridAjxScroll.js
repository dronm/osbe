/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>,2020

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
 * @param {bool} [options.refreshAfterUpdateRow=true] with Event serverset to false! 
 * @param {Array} options.filters array of Filter objects
 * @param {Array} [options.onDelOkMesTimeout=DEF_ONDELOK_MES_TIMEOUT]
 *
 * @param {bool} [options.defSrvEvents=true] add default events in toDOM method
*/
function GridAjxScroll(id,options){
	options = options || {};	
	
	options.pagination = undefined;//unset!!!
	
	if (options.editInline){
		//default vlass for editInline=true
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
	
	//defaults
	options.srvEvents = options.srvEvents || [];	
	var self = this;
	options.srvEventsCallBack = options.srvEventsCallBack || function(params){
		self.srvEventsCallBack(params);
	}
	this.m_defSrvEvents = (options.defSrvEvents!=undefined)? options.defSrvEvents:true;
	
	this.setOnDelOkMesTimeout(options.onDelOkMesTimeout||this.DEF_ONDELOK_MES_TIMEOUT);
	
	GridAjxScroll.superclass.constructor.call(this,id,options);
	
	
}
extend(GridAjxScroll,Grid);

/* Constants */
GridAjxScroll.prototype.DEF_ONDELOK_MES_TIMEOUT = 2000;

/* private members */
GridAjxScroll.prototype.m_readPublicMethod;
GridAjxScroll.prototype.m_insertPublicMethod;
GridAjxScroll.prototype.m_updatePublicMethod;
GridAjxScroll.prototype.m_deletePublicMethod;
GridAjxScroll.prototype.m_exportPublicMethod;
GridAjxScroll.prototype.m_editPublicMethod;
GridAjxScroll.prototype.m_refreshAfterDelRow;
GridAjxScroll.prototype.m_refreshAfterUpdateRow;
GridAjxScroll.prototype.m_filters;

/* protected*/

GridAjxScroll.prototype.initEditView = function(parent,replacedNode,cmd){

	GridAjxScroll.superclass.initEditView.call(this,parent,replacedNode,cmd);
	var pm;
	if (cmd=="insert"){
		pm = this.getInsertPublicMethod();
		/*
		var contr = pm.getController();
		if (pm.fieldExists(contr.PARAM_RET_ID)){
			pm.setFieldValue(contr.PARAM_RET_ID,1);
		}
		*/
	}
	else{
		pm = this.getUpdatePublicMethod();
	}
	this.m_editViewObj.setWritePublicMethod(pm);
	this.m_editViewObj.setReadPublicMethod(this.getEditPublicMethod());
}

GridAjxScroll.prototype.fillEditView = function(cmd){
	if (cmd!="insert"){
		this.keysToPublicMethod(this.m_editViewObj.getReadPublicMethod());
	}
	
	GridAjxScroll.superclass.fillEditView.call(this,cmd);
}

GridAjxScroll.prototype.keysToPublicMethod = function(pm){
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
GridAjxScroll.prototype.read = function(cmd){
	if (this.m_editViewObj){
		this.m_editViewObj.read(cmd,function(resp,erCode,erStr){
			self.onError(resp,erCode,erStr)
		});
	}
}

/*
GridAjxScroll.prototype.edit = function(cmd){
	GridAjxScroll.superclass.edit.call(this,cmd);

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
GridAjxScroll.prototype.delRow = function(rowNode){
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
		"ok":function(){
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
			self.afterServerDelRow();
		},
		"fail":function(resp,erCode,erStr){
			self.setEnabled(true);
			self.onError(resp,erCode,erStr);
		}
	});	
}

GridAjxScroll.prototype.afterServerDelRow = function(){
	this.deleteRowNode();
	this.setEnabled(true);			
	
	window.showTempNote(this.NT_REC_DELETED,null,this.m_onDelOkMesTimeout);			
	this.focus();
	if (this.getRefreshAfterDelRow()){
		this.onRefresh();
	}		
	
}

/*
GridAjxScroll.prototype.afterDelRow = function(newNode){
	
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

GridAjxScroll.prototype.filtersToMethod = function(sep){		
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


GridAjxScroll.prototype.condFilterToMethod = function(publicMethod){
	var contr = publicMethod.getController();
	if (publicMethod.fieldExists(contr.PARAM_COND_FIELDS)){
		//filter
		this.filtersToMethod(contr.PARAM_FIELD_SEP_VAL);
		//separator	
		publicMethod.setFieldValue(contr.PARAM_FIELD_SEP, contr.PARAM_FIELD_SEP_VAL);
	}
}

/*
GridAjxScroll.prototype.onRefresh = function(callBack){
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
GridAjxScroll.prototype.getLastRow = function(){
}

GridAjxScroll.prototype.defineSortFields = function(){
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
GridAjxScroll.prototype.onRefresh = function(callBack){
	/*if(this.m_model.getLocked()){
		if (callBack){
			callBack.call(this);
		}
		return;		
	}*/
	
	var self = this;
	var pm = this.getReadPublicMethod();	
	if (!pm){
		throw Error(this.ER_NO_READ_PM);
	}
	
	var contr = pm.getController();
	
	//pagination
	var pag = this.getPagination();
	if (pag && !isNaN(pag.getFrom())){
		pm.setFieldValue(contr.PARAM_FROM,pag.getFrom());
		pm.setFieldValue(contr.PARAM_COUNT,pag.getCountPerPage());
	}
	else if (pag){
		pm.getField(contr.PARAM_FROM).unsetValue();
		pm.getField(contr.PARAM_COUNT).unsetValue();	
	}
	
	this.condFilterToMethod(pm);
			
	//ordering
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
								sort_cols+= (cols[i].getField()? cols[i].getField().getId():cols[i].getId() );
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
	/*
	for (var col in this.m_sortCols){
		var sort_directs = this.m_sortCols[col].getSort();
		if (sort_directs == "asc" || sort_directs == "desc"){			
			var sort_cols = this.m_sortCols[col].getSortFieldId();
			if (!sort_cols){				
				var init_sort_direct = sort_directs;
				sort_directs = "";
				sort_cols = "";
				var cols = this.m_sortCols[col].getColumns();
				for(var i=0;i<cols.length;i++){
					sort_cols+= (sort_cols=="")? "":",";//ToDo SEPARATOR!!!
					sort_cols+= cols[i].getField().getId();
					sort_directs+=  (sort_directs=="")? "":",";
					sort_directs+= init_sort_direct;
				}
			}
			pm.setFieldValue(contr.PARAM_ORD_FIELDS, sort_cols);
			pm.setFieldValue(contr.PARAM_ORD_DIRECTS, sort_directs);
		}
	}
	*/
	//console.log("GridAjxScroll.onRefresh before query")
	pm.run({
		"ok":function(resp){
			self.onGetData(resp);
			if (callBack){
				callBack.call(self);
			}
		},
		"fail":function(resp,erCode,erStr){
			self.onError(resp,erCode,erStr);
		}
	});
}

GridAjxScroll.prototype.onError = function(resp,erCode,erStr){
	GridAjxScroll.superclass.onError.call(this,window.getApp().formatError(erCode,erStr));
}

GridAjxScroll.prototype.setReadPublicMethod = function(v){
	this.m_readPublicMethod = v;
}

GridAjxScroll.prototype.getReadPublicMethod = function(){
	return this.m_readPublicMethod;
}

GridAjxScroll.prototype.setInsertPublicMethod = function(v){
	this.m_insertPublicMethod = v;
}

GridAjxScroll.prototype.getInsertPublicMethod = function(){
	return this.m_insertPublicMethod;
}

GridAjxScroll.prototype.setUpdatePublicMethod = function(v){
	this.m_updatePublicMethod = v;
}

GridAjxScroll.prototype.getUpdatePublicMethod = function(){
	return this.m_updatePublicMethod;
}

GridAjxScroll.prototype.setDeletePublicMethod = function(v){
	this.m_deletePublicMethod = v;
}

GridAjxScroll.prototype.getDeletePublicMethod = function(){
	return this.m_deletePublicMethod;
}

GridAjxScroll.prototype.setExportPublicMethod = function(v){
	this.m_exportPublicMethod = v;
}

GridAjxScroll.prototype.getExportPublicMethod = function(){
	return this.m_exportPublicMethod;
}

GridAjxScroll.prototype.setEditPublicMethod = function(v){
	this.m_editPublicMethod = v;
}

GridAjxScroll.prototype.getEditPublicMethod = function(){
	return this.m_editPublicMethod;
}

GridAjxScroll.prototype.setRefreshAfterDelRow = function(v){
	this.m_refreshAfterDelRow = v;
}

GridAjxScroll.prototype.getRefreshAfterDelRow = function(){
	return this.m_refreshAfterDelRow;
}
GridAjxScroll.prototype.getFilters = function(){
	return this.m_filters;
}

GridAjxScroll.prototype.setRefreshAfterUpdateRow = function(v){
	this.m_refreshAfterUpdateRow = v;
}

GridAjxScroll.prototype.getRefreshAfterUpdateRow = function(){
	return this.m_refreshAfterUpdateRow;
}

GridAjxScroll.prototype.getFilterKey = function(filterOrField,sign){
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
}
*/
GridAjxScroll.prototype.setFilter = function(filter){
	var pm_ins = this.getInsertPublicMethod();
	if (pm_ins&&pm_ins.fieldExists(filter.field)) pm_ins.setFieldValue(filter.field,filter.val);
	var pm_upd = this.getUpdatePublicMethod();
	if (pm_upd&&pm_upd.fieldExists(filter.field)) pm_upd.setFieldValue(filter.field,filter.val);

	this.m_filters[this.getFilterKey(filter)] = filter;
}
GridAjxScroll.prototype.getFilter = function(filterOrField,sign){
	return this.m_filters[this.getFilterKey(filterOrField,sign)];
}

GridAjxScroll.prototype.unsetFilter = function(filterOrField,sign){
	this.m_filters[this.getFilterKey(filterOrField,sign)] = undefined;
}

GridAjxScroll.prototype.setOnDelOkMesTimeout = function(v){
	this.m_onDelOkMesTimeout = v;
}
GridAjxScroll.prototype.getOnDelOkMesTimeout = function(){
	return this.m_onDelOkMesTimeout;
}

//**********************************************
GridAjxScroll.prototype.onPreviousRow = function(){
	var res = GridAjxScroll.superclass.onPreviousRow.call(this);	
	if(!res){
		if(this.m_visibleRowIndex>0){
			//from cache
			
			var body = this.getBody();
			var body_n = body? body.getNode():null;			
			if(body_n && body_n.lastChild){
				
				this.m_visibleRowIndex--;
				var m_row_cnt = this.m_visibleRowIndex;
				this.m_model.setRowIndex(m_row_cnt);
				console.log("Model set to index "+m_row_cnt)
				var h_row_ind = 0;
				var row_cnt = m_row_cnt;
				
				var columns,keyIdAr,masterCell;
				var row = this.appendRow(body,row_cnt,h_row_ind,m_row_cnt,keyIdAr,columns,masterCell);
				var row_n = row.getNode();
				
				var selected_node = this.getSelectedNode();
				//to prevent blicking
				//DOMHelper.hide(selected_node);
				if (!this.m_rowSelect){
					DOMHelper.delClass(selected_node,this.m_selectedCellClass);
					DOMHelper.delClass(selected_node.parentNode,this.m_selectedRowClass);
				}
				else{
					DOMHelper.delClass(selected_node,this.m_selectedRowClass);
				}
				//DOMHelper.show(selected_node);
				body_n.removeChild(body_n.lastChild);
				
				row.toDOMBefore(body_n.firstChild);
				if(!this.m_rowSelect){	
					var ind = DOMHelper.getElementIndex(selected_node);
					this.selectCell(row_n.childNodes[ind], selected_node);				
				}
				else{
					this.selectRow(row_n, selected_node);
				}
				
				//need fetch more rows?
				if(this.m_visibleRowIndex < 10){
				
					var ct = (DateHelper.time()).getTime();
					if(
					//no active query or expired and last same query not empty or time elapsed
					(	!this.m_fetchQueryId ||
						(this.m_fetchQueryTime && (ct-this.m_fetchQueryTime)>5000)
					)
					&&
					(!this.m_lastInsertDataToCacheEmpty || (ct-this.m_lastInsertDataToCacheEmptyTime)>15000)
					){
						//last cache row ordering field values
						var self = this;
						this.m_model.setRowIndex(0);
						this.fetchData("desc",function(model){
							self.insertDataToCache(model);
						});
					}
				}
				
			}
		}
	}
}

GridAjxScroll.prototype.defineSortFields = function(){
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

/*
 * model with fetched data
 */
GridAjxScroll.prototype.appendDataToCache = function(model){
	console.log("Got new data appendDataToCache")
	
	this.m_lastAppendDataToCacheEmpty = !(model.getRowCount()>0);
	if(this.m_lastAppendDataToCacheEmpty){
		console.log("Got empty set...")
		this.m_lastAppendDataToCacheEmptyTime = (DateHelper.time()).getTime();
	}
	else{
		
		var to_del_cnt = (this.m_model.getRowCount()+model.getRowCount()) - 90;
		console.log("New row count will be ="+(this.m_model.getRowCount()+model.getRowCount()))
		if(to_del_cnt>0){
			console.log("deleting count="+to_del_cnt)
			for(var i=0;i<to_del_cnt;i++){
				this.m_model.deleteRowByIndex(0,false);
			}
			this.m_visibleRowIndex = this.m_visibleRowIndex - to_del_cnt;
			console.log("Model shrink to "+this.m_model.getRowCount())			
		}
		this.m_model.appendModelData(model);
		console.log("Model count after fetch "+this.m_model.getRowCount())			
	}	
	this.m_fetchQueryTime = undefined;
	this.m_fetchQueryId = undefined;	
	this.clearFetchFilters();
	delete model;
}

GridAjxScroll.prototype.insertDataToCache = function(model){
	console.log("Got new data insertDataToCache")
	
	this.m_lastInsertDataToCacheEmpty = !(model.getRowCount()>0);
	if(this.m_lastInsertDataToCacheEmpty){
		this.m_lastInsertDataToCacheEmptyTime = (DateHelper.time()).getTime();
		console.log("Got empty set...")
	}
	else{
		var to_del_cnt = (this.m_model.getRowCount()+model.getRowCount()) - 90;
		console.log("New row count will be ="+(this.m_model.getRowCount()+model.getRowCount()))
		if(to_del_cnt>0){
			console.log("deleting count="+to_del_cnt)
			for(var i=0;i<to_del_cnt;i++){
				this.m_model.deleteRowByIndex(this.m_model.getRowCount()-1,false);
			}
			console.log("Model shrink to "+this.m_model.getRowCount())			
		}
		this.m_visibleRowIndex = this.m_visibleRowIndex + model.getRowCount();
		this.m_model.insertModelData(model);		
		console.log("Model count after fetch "+this.m_model.getRowCount())			
	}	
	this.m_fetchQueryTime = undefined;
	this.m_fetchQueryId = undefined;
	this.clearFetchFilters();
	delete model;
}

GridAjxScroll.prototype.clearFetchFilters = function(){
	var fl_key;
	for(var f_id in this.m_sortFields){
		fl_key = this.getFilterKey(f_id,"g");
		if(this.m_filters[fl_key])this.m_filters[fl_key] = undefined;
		
		fl_key = this.getFilterKey(f_id,"l");
		if(this.m_filters[fl_key])this.m_filters[fl_key] = undefined;
		
	}
}

GridAjxScroll.prototype.fetchData = function(direct,onGetDataForCache){
	var self = this;
	var pm = this.getReadPublicMethod();	
	if (!pm){
		throw Error(this.ER_NO_READ_PM);
	}
	
	var contr = pm.getController();

	//record count
	pm.getField(contr.PARAM_FROM).unsetValue();
	pm.setFieldValue(contr.PARAM_COUNT,30);
	
	//ordering && ordering conditions
	if(!this.m_sortFields){
		this.defineSortFields();
	}	
	var sort_cols,sort_dirs;
	for(var f_id in this.m_sortFields){
		sort_cols = sort_cols || "";
		sort_cols+= (sort_cols=="")? "":contr.PARAM_FIELD_SEP_VAL;
		sort_cols+= f_id;
		sort_dirs = sort_dirs || "";
		sort_dirs+=  (sort_dirs=="")? "":contr.PARAM_FIELD_SEP_VAL;
		sort_dirs+= this.m_sortFields[f_id];		
		
		var sgn = (this.m_sortFields[f_id]==direct)? contr.PARAM_SGN_GREATER:contr.PARAM_SGN_LESS;
		this.m_filters[this.getFilterKey(f_id,sgn)] = {
			"field":f_id,
			"sign":sgn,
			"val":this.m_model.getFieldValue(f_id)
		};
		//clear reverse
		this.m_filters[this.getFilterKey(f_id,(this.m_sortFields[f_id]!=direct)? contr.PARAM_SGN_GREATER:contr.PARAM_SGN_LESS)] = undefined;
	}
	pm.setFieldValue(contr.PARAM_ORD_FIELDS, sort_cols);
	pm.setFieldValue(contr.PARAM_ORD_DIRECTS, sort_dirs);				
	
	//conditions
	this.condFilterToMethod(pm);
	
	console.log("Fetching data...")
	
	var self = this;
	this.m_fetchQueryTime = (DateHelper.time()).getTime();
	this.m_fetchQueryId = pm.run({
		"ok":function(resp){
			onGetDataForCache(resp.getModel(self.m_model.getId()));
		},
		"fail":function(resp,erCode,erStr){
			self.onError(resp,erCode,erStr);
		}
	});
}


GridAjxScroll.prototype.onNextRow = function(){
	var res = GridAjxScroll.superclass.onNextRow.call(this);	
	if(!res){
		var m_count = this.m_model.getRowCount();
		if(this.m_visibleRowIndex+this.m_visibleRowCount<m_count){
			//from cache
			
			var body = this.getBody();
			var body_n = body? body.getNode():null;			
			if(body_n && body_n.firstChild){
				
				this.m_visibleRowIndex++;
				var m_row_cnt = this.m_visibleRowIndex + this.m_visibleRowCount - 1;
				this.m_model.setRowIndex(m_row_cnt);
				console.log("Model set to index "+m_row_cnt)
				var h_row_ind = 0;
				var row_cnt = m_row_cnt;
				
				var columns,keyIdAr,masterCell;
				var row = this.appendRow(body,row_cnt,h_row_ind,m_row_cnt,keyIdAr,columns,masterCell);
				var row_n = row.getNode();
				
				var selected_node = this.getSelectedNode();
				//to prevent blicking
				//DOMHelper.hide(selected_node);
				if (!this.m_rowSelect){
					DOMHelper.delClass(selected_node,this.m_selectedCellClass);
					DOMHelper.delClass(selected_node.parentNode,this.m_selectedRowClass);
				}
				else{
					DOMHelper.delClass(selected_node,this.m_selectedRowClass);
				}
				//DOMHelper.show(selected_node);
				body_n.removeChild(body_n.firstChild);
				
				row.toDOM(body_n);
				if(!this.m_rowSelect){	
					var ind = DOMHelper.getElementIndex(selected_node);
					this.selectCell(row_n.childNodes[ind], selected_node);				
				}
				else{
					this.selectRow(row_n, selected_node);
				}
				
				//need fetch more rows?
				if((m_count - (this.m_visibleRowIndex+this.m_visibleRowCount)) < 10){
					var ct = (DateHelper.time()).getTime();
					if(
					//no active query or expired and last same query not empty or time elapsed
					(	!this.m_fetchQueryId ||
						(this.m_fetchQueryTime && (ct-this.m_fetchQueryTime)>5000)
					)
					&&
					(!this.m_lastAppendDataToCacheEmpty || (ct-this.m_lastAppendDataToCacheEmptyTime)>15000)
					){
						//last cache row ordering field values
						var self = this;
						this.m_model.setRowIndex(m_count-1);
						this.fetchData("asc",function(model){
							self.appendDataToCache(model);
						});
					}
				}
			}
		}
	}
}

GridAjxScroll.prototype.appendRow = function(body,rowCnt,hRowInd,mRowCnt,keyIdAr,columns,detailKeys){

	var details_expanded = (detailKeys&&!CommonHelper.isEmpty(detailKeys));		

	var master_cell = null;
	var row = this.createNewRow(rowCnt,hRowInd,mRowCnt);

	var row_keys = {};

	if(!keyIdAr)keyIdAr = this.getKeyIds();
	
	for(var k=0;k<keyIdAr.length;k++){
		row_keys[keyIdAr[k]] = this.m_model.getFieldValue(keyIdAr[k]);
	}

	if(!columns)columns = this.getHead().getColumns();

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
		if(detailKeys[row_key_h]){
			detailKeys[row_key_h].masterNode = row.getNode();
			detailKeys[row_key_h].masterCell = master_cell;
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

	return row;
}


GridAjxScroll.prototype.onGetData = function(resp){

	if(resp){
		this.m_model.setData(resp.getModelData(this.m_model.getId()));
	}
	
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
			var master_cell;
	
			if (foot && foot.calcBegin){	
				this.m_foot.calcBegin(this.m_model);
			}
	
			if (!this.getHead())return;
		
			var columns;
			// = this.getHead().getColumns();
		
			var row_cnt = 0, m_row_cnt=0, field_cnt;
			var row,row_keys;
			this.m_model.reset();
	
			var pag = this.getPagination();
			if (pag){
				pag.m_from = parseInt(this.m_model.getPageFrom());
				pag.setCountTotal(this.m_model.getTotCount());
			}
	
			/* temporary always set to 0*/
			var h_row_ind = 0;
			var key_id_ar;
			// = this.getKeyIds();
		
			//Scroll from particular index
			if(isNaN(this.m_visibleRowIndex))this.m_visibleRowIndex=0;
			this.m_model.setRowIndex(this.m_visibleRowIndex-1);
			this.m_visibleRowCount = 30;			
		
			while(this.m_model.getNextRow()){			
			
				var row = this.appendRow(body,row_cnt,h_row_ind,m_row_cnt,key_id_ar,columns,detail_keys);
				/*
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
				*/
				
			
				row_cnt++;
				m_row_cnt++;

				//foot
				if (foot && foot.calc){	
					foot.calc(this.m_model);
				}
				
				//scroll
				if(row_cnt>this.m_visibleRowCount-1){
					break;
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

GridAjxScroll.prototype.toDOM = function(parent){
	if(this.m_defSrvEvents){
		this.setDefSrvEvents();
	}

	GridAjxScroll.superclass.toDOM.call(this,parent);	
}

GridAjxScroll.prototype.srvEventsCallBack = function(params){
	//add sofisticated mechanism
	this.onRefresh(function(){
		window.showTempNote("Grid data refreshed",null,5000);
	});
}

GridAjxScroll.prototype.getEventIdOnPublicMethod = function(pm){
	var contr = pm.getController();
	var contr_name = contr? contr.constructor.name||CommonHelper.functionName(contr.constructor) : null;		
	contr_name = contr_name? contr_name.substr(0,contr_name.indexOf("_")) : null;
	return (contr_name? contr_name+"."+pm.getId() : null);
}

GridAjxScroll.prototype.setDefSrvEvents = function(){
	var events = [];
	if(this.getInsertPublicMethod()){
		events.push({"id": this.getEventIdOnPublicMethod(this.getInsertPublicMethod())});
	}
	if(this.getUpdatePublicMethod()){
		events.push({"id": this.getEventIdOnPublicMethod(this.getUpdatePublicMethod())});
	}
	this.setSrvEvents(events);
}

