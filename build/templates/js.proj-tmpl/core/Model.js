/* Copyright (c) 2012 
	Andrey Mikhalevich, Katren ltd.
*/
/*	
	Description
*/
//ф
/** Requirements
 * @requires common/functions.js
 * @requires common/DOMHandler.js 
*/

/* constructor */
function Model(node){
	if (node){
		this.setNode(node);	
	}
	this.m_fields={};	
}
/* constants */
Model.prototype.ATTR_READ_ONLY = "readOnly";
Model.prototype.ATTR_LIST_COUNT = "listCount";
Model.prototype.ATTR_LIST_FROM = "listFrom";
Model.prototype.ATTR_TOT_COUNT = "totalCount";
Model.prototype.ATTR_ID = "id";
Model.prototype.ROW_TAG = "row";
Model.prototype.ER_NO_FIELD = "Field '%s' not found.";
Model.prototype.ER_IND_OUT_OF_BOUNDS = "Index out of bounds.";
Model.prototype.ER_NO_ROWS = "No rows.";
Model.prototype.ER_NO_STRUCT="Field structure not defined.";

/* private members */
Model.prototype.m_node;//root node
Model.prototype.m_rowPos;//currant row index
Model.prototype.m_row;//currant row node
Model.prototype.m_rows;
Model.prototype.m_fields;
Model.prototype.m_active=false;
Model.prototype.m_rowCount=-1;
Model.prototype.m_flagCleared=true;

/* private methods */

/* protected methods */
Model.prototype.getFieldId = function(fieldNode){
	return fieldNode.nodeName.split('.').join('_');
}

Model.prototype.fetchRow = function(){
	if (this.m_rowPos>=0){
		var fields = this.m_rows[this.m_rowPos].childNodes;
		var id;
		for (var i=0;i<fields.length;i++){
			if(fields[i].nodeType== 1){	
				id = this.getFieldId(fields[i]);
				var t_val=null;
				if (fields[i].childNodes.length){					
					for (var t_ind=0;t_ind<fields[i].childNodes.length;t_ind++){
						if(fields[i].childNodes[t_ind].nodeType== 3){	
							if (!t_val){
								t_val = "";
							}
							t_val+=fields[i].childNodes[t_ind].nodeValue;
						}
						else if(fields[i].childNodes[t_ind].nodeType== 1){
							//array
							var ar_node = fields[i].childNodes[t_ind];
							for (var j=0;j<ar_node.childNodes.length;j++){
								if(ar_node.childNodes[j].nodeType== 3){	
									if (!t_val){
										t_val = [];
									}								
									t_val.push(ar_node.childNodes[j].nodeValue);
								}							
							}
						}
					}
				}
				if(this.m_fields[id])this.m_fields[id].setValue(t_val);
			}
		}
		this.m_flagCleared = false;
	}
	else if (!this.m_flagCleared){
		//clear		
		for (var id in this.m_fields){
			this.m_fields[id].setValue(null);
		}
		this.m_flagCleared = true;
	}
}

Model.prototype.fieldExists = function(id){
	return (this.m_fields[id]!=undefined);
}
Model.prototype.createFields = function(){
	this.m_rows = this.m_node.getElementsByTagName(this.ROW_TAG);
	if (this.getRowCount()){
		var fields = this.m_rows[0].childNodes;
		var id;
		for (var i=0;i<fields.length;i++){
			if(fields[i].nodeType== 1){	
				id = this.getFieldId(fields[i]);
				this.addField(new Field(id));
			}
		}
	}
}
Model.prototype.destructFields = function(){
	for (var id in this.m_fields){
		delete this.m_fields[id];
	}
	this.m_fields={};
	this.m_flagCleared = true;
}
Model.prototype.getNewRow = function(){
	if (!this.m_fields){
		throw new Error(this.ER_NO_STRUCT);
	}
	var row = document.createElement(this.ROW_TAG);
	var field;
	for (var id in this.m_fields){
		/*
		field = document.createElement(this.FIELD_TAG);
		DOMHandler.setAttr(field,this.ATTR_ID,id);
		field.appendChild(document.createTextNode(""));
		row.appendChild(field);
		*/
	}
	return row;
}


/* public methods */
Model.prototype.checkField = function(id){
	if (!this.fieldExists(id)){		
		console.trace();
		throw new Error(format(this.ER_NO_FIELD,Array(id)));
	}
	return true;
}
Model.prototype.getFieldCount = function(){
	return this.m_fields.length;
}
Model.prototype.addField = function(field){
	var id = field.getId();
	this.m_fields[id] = field;
	this[id] = this.m_fields[id];	
}

Model.prototype.setNode = function(node){
	this.m_node = node;
}
Model.prototype.getNode = function(){
	return this.m_node;
}

Model.prototype.getActive = function(){
	return this.m_active;
}
Model.prototype.setActive = function(active){
	if (active){
		this.createFields();
		this.setRowBOF();
	}
	else{
		this.destructFields();
	}
	this.m_active = active;
}
Model.prototype.getId = function(){
	return DOMHandler.getAttr(this.m_node,this.ATTR_ID);
}

Model.prototype.getFieldById = function(id){
	this.checkField(id);
	return this.m_fields[id];
}
Model.prototype.getFieldValue = function(id){
	this.checkField(id);
	return this.m_fields[id].getValue();
}
Model.prototype.getRow = function(){
	var row = {};
	for (var id in this.m_fields){
		row[id] = this.m_fields[id].getValue();
	}
	return row;
}

Model.prototype.getFieldByIndex = function(ind){
	if (this.getFieldCount()>=ind){
		throw new Error(this.ER_IND_OUT_OF_BOUNDS);
	}
	return null;//this.m_fields[ind];
}

Model.prototype.getReadOnly = function(){
	return DOMHandler.getAttrBool(this.m_node,this.ATTR_READ_ONLY);
}
Model.prototype.getListCount = function(){
	return DOMHandler.getAttr(this.m_node,this.ATTR_LIST_COUNT);
}
Model.prototype.getListFrom = function(){
	return DOMHandler.getAttr(this.m_node,this.ATTR_LIST_FROM);
}
Model.prototype.getTotCount = function(){
	return DOMHandler.getAttr(this.m_node,this.ATTR_TOT_COUNT);
}
Model.prototype.getRowCount = function(){
	return this.m_rows.length;
}
Model.prototype.isLastRow = function(){
	return ((this.getRowPos()+1)==this.getRowCount());
}
Model.prototype.isFirstRow = function(){
	return (this.getRowPos()==0);
}
	
Model.prototype.getNextRow = function(){
	if (this.m_active&&!this.isLastRow()){
		this.setRowPos(this.getRowPos()+1);
		return true;
	}
	return false;
}
Model.prototype.getPreviousRow = function(){
	if (!this.isFirstRow()){
		this.setRowPos(this.getRowPos()-1);
		return true;
	}
	return false;
}
	
Model.prototype.getRowPos = function(){
	return this.m_rowPos;
}
	
Model.prototype.setRowPos = function(rowPos){
	if (rowPos < this.getRowCount()){
		this.m_rowPos = rowPos;		
		this.fetchRow();
	}
	else{
		throw new Error(this.ER_OUT_OF_ROW_BOUNDS);
	}
}
Model.prototype.setRowBOF = function(){
	this.setRowPos(-1);
}
Model.prototype.setLastRow = function(){
	if (this.getRowCount()==0){
		throw new Error(this.ER_NO_ROWS);
	}
	this.setRowPos(this.getRowCount()-1);
}
Model.prototype.setFirstRow = function(){
	if (this.getRowCount()==0){
		throw new Error(this.ER_NO_ROWS);
	}
	this.setRowPos(0);
}
//editting
Model.prototype.deleteRows = function(ind,count){
	var row_count = this.getRowCount();
	if (ind<0 || ind>=row_count){
		throw new Error(this.ER_IND_OUT_OF_BOUNDS);
	}
	count = count || 1;
	count = (count<=row_count)? count:row_count;
	var row;
	for (var i=0;i<count;i++){
		row = this.m_rows[i+ind];
		row.parentNode.removeChild(row);	
	}
	var last_pos = this.getRowCount()-1;
	var pos = this.getRowPos();
	pos = (pos>last_pos)? last_pos:pos;
	
	this.m_flagCleared = false;
	this.setRowPos(pos);
	return count;
}
Model.prototype.appendRow = function(){
	var row = this.getNewRow();
	this.m_node.appendChild(row);
	this.m_rowPos = this.getRowCount()-1;
}
Model.prototype.insertRow = function(ind){
	if (ind<0 || ind>=this.getRowCount()){
		throw new Error(this.ER_IND_OUT_OF_BOUNDS);
	}
	var sibl_node = this.m_rows[ind];
	var row = this.getNewRow();
	this.m_node.insertBefore(row,sibl_node);
	this.setRowPos(ind);
}
Model.prototype.post = function(){
	//fields values to DOM
	var row_node = this.m_rows[this.m_rowPos];
	var ind = 0;
	var node,val;
	for (var id in this.m_fields){
		val = this.m_fields[id].getValue();;
		node = row_node.childNodes[ind].childNodes[0];
		node.nodeValue = val;			
		ind++;
	}
}
Model.prototype.getFields = function(){
	return this.m_fields;
}
