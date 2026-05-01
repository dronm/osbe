/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016
 
 * @class
 * @classdesc Basic Model, has abstract functions that are to be overridden in extended classes
 
 * @param {string} id - Model identifier
 * @param {object} options
 * @param {object} options.fields
 * @param {string|object} options.data
 * @param {bool} [options.primaryKeyIndex=false]
 */
function Model(id,options){
	options = options || {};
	
	this.setId(id);
	
	this.setFields(options.fields);
	
	this.m_indexes = {};
	this.m_sequences = options.sequences || {};
	
	if (options.primaryKeyIndex){
		this.addPrimaryKeyIndex();
	}
	
	this.setMarkOnDelete((options.markOnDelete!=undefined)? options.markOnDelete:false);
	
	this.setData(options.data);
}

/* private members */
Model.prototype.m_rowIndex;
Model.prototype.m_fields;
Model.prototype.m_id;
Model.prototype.m_locked;
Model.prototype.m_indexes;
Model.prototype.m_sequences;
Model.prototype.m_currentRow;

Model.prototype.m_markOnDelete;

/**
 * @abstract
 * @protected
 * @param {any} row
 * @param {bool} mark Only mark row as deleted
 */
Model.prototype.deleteRow = function(row,mark){
	//Delete from Index?
	/*if(!mark){
		//this.reindex();
		for (var idx in this.m_indexes){
			var val = "";
			for (var idx_f_i=0;idx_f_i<this.m_indexes[idx].fields.length;idx_f_i++){				
				val+= this.m_fields[this.m_indexes[idx].fields[idx_f_i]].getValue();
			}
			var h = CommonHelper.md5(val);
			if (!this.m_indexes[idx].hashes[h]){
				this.m_indexes[idx].hashes[h] = [];
			}
			this.m_indexes[idx].hashes[h].push(this.m_currentRow);// this.getRows(true)[this.m_rowIndex]
		}
	}
	*/
}

/**
 * @abstract
 * @protected
 * @param {any} row
 */
Model.prototype.addRow = function(row){
}

/**
 * @abstract
 * @protected
 * @param {any} row
 */
Model.prototype.setRowValues = function(row){
}

/**
 * @protected
 * @param {any} row
 */
Model.prototype.updateRow = function(row){
	this.setRowValues(row);
}

/**
 * @protected
 */
Model.prototype.resetFields = function(){
	if (this.m_fields){
		//throw new Error(CommonHelper.format(this.ER_NO_FIELDS,[this.getId()]));
		for (var id in this.m_fields){
			this.m_fields[id].unsetValue();
		}
	}
}

/**
 * @abstract
 * @public
 * @param {any} row
 */
Model.prototype.copyRow = function(row){
}


/**
 * @public
 * @param {any} data
 */
Model.prototype.setData = function(data){
	this.reset();
	
	//this.reindex();
}


/**
 * @abstract
 * @public
 * @returns {any}
 */
Model.prototype.getData = function(){
}

/**
 * @public
 * @returns {bool}
 */
Model.prototype.getNextRow = function(){
	if (this.m_rowIndex+1==this.getRowCount()){
		return null;
	}
	this.m_rowIndex++;
	return this.recFetch();
}

/**
 * @public
 * @returns {bool}
 */
Model.prototype.getPreviousRow = function(){
	if (this.m_rowIndex==0){
		return null;
	}
	this.m_rowIndex--;
	return this.recFetch();
}

/**
 * @abstract
 * @public
 * @returns {Array}
 * @param {bool} [includeDeleted=false]
 */
Model.prototype.getRows = function(includeDeleted){	
}

/**
 * @public
 * @param {int} ind
 * @returns {bool}
 */
Model.prototype.getRow = function(ind){
	if (isNaN(ind) || ind<0 || ind>=this.getRowCount()){
		this.reset();
		return null;
	}
	this.m_rowIndex = ind;
	return this.recFetch();
}

/**
 * Retrieves current row, with index = this.m_rowIndex 
 * @public
 * @returns {bool}  
 */
Model.prototype.recFetch = function(){
	var rows = this.getRows();
	if (!rows || !rows.length) {
		return;
	}
	this.m_currentRow = rows[this.m_rowIndex];
	return this.fetchRow(this.m_currentRow);
}

/**
 * @abstract
 * @public 
 * @returns {int}
 * @param {bool} [includeDeleted=false]
 */
Model.prototype.getRowCount = function(includeDeleted){
}

/**
 * @abstract
 * @public 
 * @returns {int} 
 */
Model.prototype.getTotCount = function(){
}

/**
 * @abstract
 * @public 
 * @returns {int} 
 */
Model.prototype.getPageFrom = function(){
}

/**
 * @abstract
 * @public 
 * @returns {int} 
 */
Model.prototype.getPageCount = function(){
}

/**
 * @public
 * @returns {Object}
 */
Model.prototype.getFields = function(){
	return this.m_fields;
}

/**
 * @public
 * @returns {int}
 */
Model.prototype.getRowIndex = function(){

	return this.m_rowIndex;
}

/**
 * synonym of getRow
 * @public
 * @param {int} ind
 * @returns {bool}
 */
Model.prototype.setRowIndex = function(ind){
	return this.getRow(ind);
}

/**
 * @public
 * @returns {bool}
 * @param {string} id Field id
 */
Model.prototype.fieldExists = function(id){
	return (this.m_fields && this.m_fields[id]!=undefined);
}

/**
 * @param {string} keyIdsHash search field identifiers hash
 * @param {string} valHash search string hash
 * @raturns {Array}
 */
Model.prototype.locate = function(keyIdsHash,valHash){
	var res;
	for (var idx in this.m_indexes){
		if (this.m_indexes[idx].fieldHash==keyIdsHash){
			//get index
			res = this.m_indexes[idx].hashes[valHash];
			
			break;
		}
		
	}	
		
	return res;
}

/**
 * @public
 * @returns {Field}
 * @param {string} id Field id
 */
Model.prototype.getField = function(id){
	if (!this.m_fields){
		throw new Error(CommonHelper.format(this.ER_NO_FIELDS,[this.getId()]));
	}

	if (!this.m_fields[id]){
		throw new Error(CommonHelper.format(this.ER_NO_FIELD,[id,this.getId()]));
	}
	return this.m_fields[id];
}

/**
 * @public
 * @param {Object} v
 */
Model.prototype.setFields = function(v){
	if (CommonHelper.isArray(v)){
		this.m_fields = {};
		for (var i=0;i<v.length;i++){
			if (typeof(v[i])=="object"){
				this.addField(v[i]);
			}
			else{
				var f = new FieldString(v[i]);
				this.addField(f);
			}
		}
	}
	else if (typeof(v)=="object"){
		this.m_fields = v;
	}
}


/**
 * @public
 * @param {Field} f
 */
Model.prototype.addField = function(f){
	if (!this.m_fields){
		throw new Error(CommonHelper.format(this.ER_NO_FIELDS,[this.getId()]));
	}

	this.m_fields[f.getId()] = f;
}

/**
 * @public
 * @returns {any} value of Filed type
 * @param {string} id Field id
 */
Model.prototype.getFieldValue = function(id){
	return this.getField(id).getValue();
}

/**
 * @public
 * @param {string} id Field id
 * @param {any} v Field value 
 */
Model.prototype.setFieldValue = function(id,v){
	this.getField(id).setValue(v);
}

/**
 * Resets data set. Row index is set to 0, field values are nulled
 * @public
 */
Model.prototype.reset = function(){
	this.resetFields();
	this.m_rowIndex = -1;
	this.m_currentRow = undefined;
}

/**
 * @public
 * @param {Object} keyFields
 * @param {bool} [mark=this.getMarkOnDelete()]
 */
Model.prototype.recDelete = function(keyFields,mark){
	mark = (mark!=undefined)? mark:this.getMarkOnDelete();
	var row = this.recLocate(keyFields);
	if (!row || !row.length){
		throw Error(this.ER_REС_NOT_FOUND);
	}	
	this.deleteRow(row[0],mark);
}

/**
 * @public
 * @param {Object} keyFields
 */
Model.prototype.recUndelete = function(keyFields){
	var row = this.recLocate(keyFields);
	if (!row || !row.length){
		throw Error(this.ER_REС_NOT_FOUND);
	}	
	this.undeleteRow(row[0]);
	//Make Current And Reindex
}

/**
 * @public
 */
Model.prototype.recInsert = function(){
	//auto inc keys
	for (var sid in this.m_sequences){
		if (this.m_fields[sid] && !this.m_fields[sid].isSet()){
			this.m_sequences[sid]++;
			this.m_fields[sid].setValue(this.m_sequences[sid]);			
		}
	}
	this.m_currentRow = this.makeRow();
	this.addRow(this.m_currentRow);
	this.m_rowIndex = this.getRowCount()-1;
	this.reindexAllCurrentRow();		
}

/**
 * @public
 * @param {Object} keyFields
 */
Model.prototype.recUpdate = function(keyFields){
	var row = this.recLocate(keyFields);
	if (!row || !row.length){
		throw Error(this.ER_REС_NOT_FOUND);
	}
	this.updateRow(row[0]);			
}

/**
 * @public
 * @param {Object} keyFields id=value of Field
 * @returns {Array}
 */
Model.prototype.recLocate = function(keyFields){
	var val = "";
	var ids_hash = "";
	for (var fi in keyFields){
		if (keyFields[fi].isSet() && this.m_fields[fi]){
			val+= keyFields[fi].getValue();
			ids_hash+= fi;
		}
	}
	return this.locate(CommonHelper.md5(ids_hash),CommonHelper.md5(val));
}


/**
 * @public
 * @param {bool} v
 */
Model.prototype.setLocked = function(v){
	this.m_locked = v;
}

/**
 * @public
 * @returns {bool}  
 */
Model.prototype.getLocked = function(){
	return this.m_locked;
}

/**
 * @public
 * @param {string} id  
 */
Model.prototype.setId = function(id){
	this.m_id = id;
}

/**
 * @public
 * @returns {bool}  
 */
Model.prototype.getMarkOnDelete = function(){
	return this.m_markOnDelete;
}

/**
 * @public
 * @param {bool} v
 */
Model.prototype.setMarkOnDelete = function(v){
	this.m_markOnDelete = v;
}

/**
 * @public
 * @returns {string}  
 */
Model.prototype.getId = function(){
	return this.m_id;
}


/**
 * Stub
 * @public 
 */
Model.prototype.clear = function(){
}

/**
 * @public
 * @param {int} ind row index to move
 * @param {int} cnt count, can be negative
 */
Model.prototype.recMove = function(ind,cnt){
}

/**
 * @public
 * @param {int} ind row index to move 
 */
Model.prototype.recMoveUp = function(ind){
	this.recMove(ind,-1);
}
/**
 * @public
 * @param {int} ind row index to move 
 */
Model.prototype.recMoveDown = function(ind){
	this.recMove(ind,1);
}

//******** INDEX ***********************

/**
 * @protected
 * @param {string} idx Index id
 */
Model.prototype.reindexCurrentRow = function(idx){
	var val = "";
	for (var idx_f_i=0;idx_f_i<this.m_indexes[idx].fields.length;idx_f_i++){				
		val+= this.m_fields[this.m_indexes[idx].fields[idx_f_i]].getValue();
	}
	var h = CommonHelper.md5(val);
	if (!this.m_indexes[idx].hashes[h]){
		this.m_indexes[idx].hashes[h] = [];
	}
	this.m_indexes[idx].hashes[h].push(this.m_currentRow);// this.getRows(true)[this.m_rowIndex]
}
/**
 * @protected
 */
Model.prototype.reindexAllCurrentRow = function(){
	for (var i in this.m_indexes){
		this.reindexCurrentRow(i);
	}		
}
/**
 * @public
 * @param {string} specIdx Index id or null
 */
Model.prototype.reindex = function(specIdx){
	if (CommonHelper.isEmpty(this.m_indexes)) return;
	//console.log("Model.prototype.reindex")
	this.m_rowIndex = -1;
	while (this.getNextRow()){
		if (specIdx){
			this.reindexCurrentRow(specIdx);
		}
		else{
			this.reindexAllCurrentRow();
		}
	}
	this.m_rowIndex = -1;
}

/**
 * @public
 * @param {string} id Index identifier
 * @param {Array} fields Field identifiers
 */
Model.prototype.addIndex = function(id,fields){
	if (this.m_fields){
		this.m_indexes[id] = {};
		this.m_indexes[id].fields = fields;
		this.m_indexes[id].fieldHash = "";
		this.m_indexes[id].hashes = {};

		var f_ids = "";
		for (var fi in this.m_fields){
			if (fields.indexOf(fi)>=0){
				f_ids+= fi;
			}
		}
		this.m_indexes[id].fieldHash = CommonHelper.md5(f_ids);
	}	
}

/**
 * @public
 */
Model.prototype.addPrimaryKeyIndex = function(){
	if (this.m_fields){
		var fields = [];
		for (var id in this.m_fields){
			if (this.m_fields[id].getPrimaryKey()){
				fields.push(id);
			}
		}
		this.addIndex("primaryKey",fields);
	}
}

