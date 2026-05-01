/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016
 
 * @class
 * @classdesc Model based on XML data. Field id(string) is obligatory
 
 * @requires core/extend.js
 * @requires core/Model.js 
 * @requires core/CommonHelper.js
 
 * @param {string} id - Model identifier
 * @param {object} options
 * @param {object} options.fields
 * @param {string|object} options.data - Can either be a string or a JSON
 
 * @param {string} [options.tagParent=this.DEF_TAG_PARENT]   
 
 */
function ModelJSONTree(id,options){	
	
	this.setTagParent(options.tagParent || this.DEF_TAG_PARENT);
	
	ModelJSONTree.superclass.constructor.call(this,id,options);
}
extend(ModelJSONTree,ModelJSON);

/* CONSTANTS */
ModelJSONTree.prototype.DEF_TAG_MODEL = "root";
ModelJSONTree.prototype.DEF_TAG_ROW = "item";
ModelJSONTree.prototype.DEF_TAG_ROWS = "items";
ModelJSONTree.prototype.DEF_TAG_PARENT = "parent_id";

/* private members */
ModelJSONTree.prototype.m_parentNode;
ModelJSONTree.prototype.m_keyField;
ModelJSONTree.prototype.m_tagParent;

/**
 * @private 
 * @returns {Field}
 */
ModelJSONTree.prototype.getKeyField = function(){
	if (!this.m_keyField){
		for (var fid in this.m_fields){
			if (this.m_fields[fid].getPrimaryKey()){
				this.m_keyField = this.m_fields[fid];
				break;
			}
		}
	}
	return this.m_keyField;
}

ModelJSONTree.prototype.getRow = function(ind){
	ModelJSONTree.superclass.getRow.call(this,ind);
	this.m_parentNode = (this.m_currentRow)? this.m_currentRow:this.m_model;
}

ModelJSONTree.prototype.addRow = function(row){	
	var tags = this.getTagRows();
	if(!this.m_parentNode){//added 05/10/20
		this.m_parentNode = this.m_model;
	}
	this.m_parentNode[tags] = this.m_parentNode[tags] || [];
	this.m_parentNode[tags].push(row);
}

ModelJSONTree.prototype.getParentId = function(){	
	var par_id;
	if (this.m_currentRow && this.m_currentRow[this.getTagParent()]){		
		par_id = this.m_currentRow[this.getTagParent()];
	}
	return par_id;
}

ModelJSONTree.prototype.fillRows = function(arToFill,row){
	var t = this.getTagRows();
	for (row_id in row[t]){
		arToFill.push(row[t][row_id]);
		if (row[t][row_id][t]){
			this.fillRows(arToFill,row[t][row_id]);
		}
	}
}


ModelJSONTree.prototype.getRows = function(includeDeleted){
	var rows = [];
	this.fillRows(rows,this.m_model);
	return rows;
}


ModelJSONTree.prototype.makeRow = function(){
	var key_field = this.getKeyField();
	var key_id = key_field.getId();
	var row = {"fields":{}};//"fields":{} corrected	
	for (var fid in this.m_fields){
		var v = "";
		var f_set = this.m_fields[fid].isSet();
		
		if (!f_set && fid==key_id && !this.m_sequences[fid]){
			v = CommonHelper.uniqid();
		}		
		else if (f_set){
			v = this.m_fields[fid].getValue();
		}
		
		//corrected 20/03/21
		if(row.fields){
			row.fields[fid] = v;	
		}else{
			row[fid] = v;
		}
	}
	// && this.m_parentNode.fields
	row[this.getTagParent()] = (this.m_parentNode)? this.m_parentNode[this.getKeyField().getId()]:null;
	return row;
}


ModelJSONTree.prototype.getTagParent = function(){
	return this.m_tagParent;
}
ModelJSONTree.prototype.setTagParent = function(v){
	this.m_tagParent = v;
}

