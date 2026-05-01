/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016
 
 * @class
 * @classdesc Model based on XML data. Field id(string) is obligatory
 
 * @requires core/extend.js
 * @requires core/Model.js 
 * @requires core/CommonHelper.js
 
 * @param {string} id - Model identifier
 * @param {Object} options
 * @param {namespace} options.fields
 * @param {string|XMLNode} options.data - Can either be a string or a XML node
 */
function ModelXMLTree(id,options){	
	
	ModelXMLTree.superclass.constructor.call(this,id,options);
}
extend(ModelXMLTree,ModelXML);

/* CONSTANTS */
ModelXMLTree.prototype.DEF_TAG_MODEL = "root";
ModelXMLTree.prototype.DEF_TAG_ROW = "item";

/* private members */
ModelXMLTree.prototype.m_parentNode;
ModelXMLTree.prototype.m_keyField;


/**
 * @private 
 * @returns {Field}
 */
ModelXMLTree.prototype.getKeyField = function(){
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

ModelXMLTree.prototype.getRow = function(ind){
	ModelXMLTree.superclass.getRow.call(this,ind);
	//grid.edit(insert) sets model to current row
	this.m_parentNode = (this.m_currentRow)? this.m_currentRow:this.m_node;
}

ModelXMLTree.prototype.addRow = function(row){	
	if(!this.m_parentNode) this.m_parentNode = this.m_node;
	this.m_parentNode.appendChild(row);
}

ModelXMLTree.prototype.getParentId = function(){	
	var par_id;
	if (this.m_currentRow && this.m_currentRow.parentNode && this.m_currentRow.parentNode!=this.m_node){
		var key_id = this.getKeyField().getId();
		var na = this.m_currentRow.parentNode.getElementsByTagName(key_id);
		if (na && na.length){
			var tn = DOMHelper.firstChildElement(na[0],3);
			if (tn)par_id = tn.nodeValue;
		}
	}
	return par_id;
}


ModelXMLTree.prototype.getRows = function(includeDeleted){
	return this.m_node.getElementsByTagName(this.getTagRow());
}

ModelXMLTree.prototype.makeRow = function(){
	var row = document.createElement(this.getTagRow());
	var key_field = this.getKeyField();
	var key_id = key_field.getId();
	for (var fid in this.m_fields){	
		var cell = document.createElement(fid);
		var v = "";
		var f_set = this.m_fields[fid].isSet();
		
		if (!f_set && fid==key_id && !this.m_sequences[fid]){
			v = CommonHelper.uniqid();
		}		
		else if (f_set){
			v = this.m_fields[fid].getValue();
		}
		cell.appendChild(document.createTextNode(v));
		row.appendChild(cell);
		
	}
	return row;
}


/**
 * @public
 * @returns {int}
 */
ModelXMLTree.prototype.getRowCount = function(includeDeleted){
	includeDeleted = (includeDeleted!=undefined)? includeDeleted:true;
	var rows = this.getRows(includeDeleted);
	return rows? rows.length:0;
}

