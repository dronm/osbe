/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016
 
 * @class
 * @classdesc Basic Model, has abstract functions that are to be overridden in extended classes
 
 * @param {string} id - Model identifier
 * @param {object} options
 * @param {object} options.fields
 * @param {string|object} options.data
 */
function Model(id,options){
	options = options || {};
	
	this.setId(id);
	
	this.setFields(options.fields);
	
	this.m_sequences = options.sequences || {};
	
	this.setMarkOnDelete((options.markOnDelete!=undefined)? options.markOnDelete:false);
	
	this.setData(options.data);
	this.setCalcHash(options.calcHash);
}

/* private members */
Model.prototype.m_fields;
Model.prototype.m_id;
Model.prototype.m_locked;
Model.prototype.m_sequences;
Model.prototype.m_currentRow;
Model.prototype.m_rowIndex;
Model.prototype.m_markOnDelete;

/**
 * @abstract
 * @protected
 * @param {any} row
 * @param {bool} mark Only mark row as deleted
 */
Model.prototype.deleteRow = function(row,mark){
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
			if(this.m_fields[id].unsetValue){
				this.m_fields[id].unsetValue();
			/*}else{
				console.log(this.m_id)
				console.log(id)
				console.log(this.m_fields[id])
			*/	
			}			
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
 * Retrieves current row with index = this.m_rowIndex 
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
			}else{
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
	var row = this.recLocate(keyFields,true);
	this.deleteRow(this.m_currentRow,mark);
}

/**
 * @public
 * @param {Object} keyFields
 */
Model.prototype.recUndelete = function(keyFields){
	var row = this.recLocate(keyFields,true);
	this.undeleteRow(this.m_currentRow);
	//Make Current
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
}

/**
 * @public
 * updates current row
 */
Model.prototype.recUpdate = function(){	
	this.updateRow(this.m_currentRow);			
}

/**
 * @public
 * @param {Object} keyFields id=value of Field
 * @param {bool} unique
 * @returns {Array} array of row indexes
 */
Model.prototype.locate = function(keyFields,unique){
	var res;
	/*if(this.getLocked()){
		throw new Error(this.ER_LOCKED);
	}*/
	this.setLocked(true);
	var cur_ind = this.getRowIndex();
	try{
		this.reset();
		var row_i = 0;
		while(this.getNextRow()){			
			var key_found = true;
			for(var fid in keyFields){
				if(this.fieldExists(fid)){
					var dt = keyFields[fid].getDataType? keyFields[fid].getDataType() : Field.prototype.DT_STRING;
					var is_date = (dt==keyFields[fid].DT_DATETIME||dt==keyFields[fid].DT_DATE||dt==keyFields[fid].DT_DATETIMETZ);
					
					var m_v = this.getFieldValue(fid);
					var k_v = keyFields[fid].getValue? keyFields[fid].getValue() : keyFields[fid];
					if(
					(!is_date&&m_v!=k_v)
					||(is_date&&m_v.getTime()!=k_v.getTime())
					){
						key_found = false;
						break;
					}
				}
			}
			if(key_found){
				if(!res){
					res = [];
				}
				res.push(row_i);
				if(unique){
					break;
				}
			}
			row_i++;			
		}
	}
	finally{
		this.setLocked(false);
	}
	this.setRowIndex(cur_ind);
	return res;
}

/**
 * @public
 * Moves record set to first found row
 * @param {Object} keyFields id=value of Field
 * @param {bool} unique
 * @returns {Array}
 */
Model.prototype.recLocate = function(keyFields,unique){
	var res = this.locate(keyFields,unique);
	if (!res && unique){
		throw Error(this.ER_REС_NOT_FOUND);
	}	
	else if(res){
		this.getRow(res[0]);
	}
	return res;
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
	this.reset();
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

/**
 * @public
 * @returns {bool}  
 */
Model.prototype.getCalcHash = function(){
	return this.m_calcHash;
}

/**
 * @public
 * @param {bool} v
 */
Model.prototype.setCalcHash = function(v){
	this.m_calcHash = v;
}

/**
 * Stub
 * @public 
 */
Model.prototype.appendModelData = function(targetModel){
}

/**
 * Stub
 * @public 
 */
Model.prototype.insertModelData = function(targetModel){
}
/*
needs formatting, should be in GUI (grid)
Model.prototype.getFormattedValue = function(){
	var ind = this.getRowIndex();
	try{
		var descr = "", f_descr,fields;
		this.reset();
		while(this.getNextRow()){		
			f_descr = "";
			fields = this.getFields();
			for(var id in fields){
				f_descr += ((f_descr=="")? "" : ", "+fields[id].getValue());
			}
			descr += ((descr=="")? "" : String.fromCharCode(10));
			descr += f_descr;
		}
		
	}finally{
		this.setRowIndex(ind);
	}
	return descr;
}
*/
