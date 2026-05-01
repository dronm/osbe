/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016
 
 * @class
 * @classdesc Model based on XML data
 
 * @requires core/extend.js
 * @requires core/Model.js 
 * @requires core/CommonHelper.js
 
 * @param {string} id - Model identifier
 * @param {Object} options
 * @param {namespace} options.fields
 * @param {string|XMLNode} options.data - Can either be a string or a XML node
 * @param {string} [options.tagModel=this.DEF_TAG_MODEL]
 * @param {string} [options.tagRow=this.DEF_TAG_ROW]
 * @param {string} [options.namespace=this.DEF_NAMESPACE]   
 */
function ModelXML(id,options){	
	options = options || {};
	this.setTagModel(options.tagModel || this.DEF_TAG_MODEL);
	this.setTagRow(options.tagRow || this.DEF_TAG_ROW);
	
	this.m_namespace = options.namespace || this.DEF_NAMESPACE;
	
	ModelXML.superclass.constructor.call(this,id,options);
}
extend(ModelXML,Model);

/* CONSTANTS */
ModelXML.prototype.ATTR_TOT_COUNT = "totalCount";
ModelXML.prototype.ATTR_PG_COUNT = "rowsPerPage";
ModelXML.prototype.ATTR_PG_FROM = "listFrom";
ModelXML.prototype.ATTR_DELETED = "deleted";
ModelXML.prototype.ATTR_INSERTED = "inserted";
ModelXML.prototype.ATTR_UPDATED = "updated";
ModelXML.prototype.ATTR_HASH = "hash";

ModelXML.prototype.DEF_TAG_MODEL = "model";
ModelXML.prototype.DEF_TAG_ROW = "row";
ModelXML.prototype.TAG_AT_ID = "id";

ModelXML.prototype.DEF_NAMESPACE = "http://www.w3.org/1999/xhtml";

/* private members */
ModelXML.prototype.m_node;

ModelXML.prototype.m_tagModel;
ModelXML.prototype.m_tagRow;
ModelXML.prototype.m_namespace;
/*
ModelXML.prototype.initFieldsOnData = function(){
	var rows = this.m_node.getElementsByTagName(this.getTagRow());
	if (!rows) {
		return;
	}
	for (var f in rows[0].childNodes){
		var n = rows[0].childNodes[f].nodeName;
		this.m_fields[n] = new FieldString(n);
	}
}
*/

/**
 * Retrieves specific row
 * @protected 
 * @returns {boolean}
 * @param {Node} row 
 */
ModelXML.prototype.fetchRow = function(row){
	this.resetFields();	
	var f = row.childNodes;
	for (var i=0;i<f.length;i++){
		if (f[i].nodeType==1){
			var fid = f[i].nodeName;
			if (!this.m_fields[fid]){
				continue;
			}
			//field exists in MD
			var t_val = null;
			if (this.m_fields[fid].getDataType()==this.m_fields[fid].DT_ARRAY){
				if (f[i].childNodes.length){					
					for (var t_ind=0;t_ind<f[i].childNodes.length;t_ind++){
						if(f[i].childNodes[t_ind].nodeType== 3){	
							if (!t_val){
								t_val = "";
							}
							t_val+=f[i].childNodes[t_ind].nodeValue;
						}
						else if(f[i].childNodes[t_ind].nodeType== 1){
							//array
							var ar_node = f[i].childNodes[t_ind];
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
			}else if (f[i].nodeType==1 && f[i].childNodes.length){
				if (f[i].childNodes[0].nodeType==3){
					t_val = f[i].childNodes[0].nodeValue;
				}
				else{
					t_val = f[i].innerHTML;//??? IE
				}
			}
			
			if (t_val==undefined && this.m_fields[fid].getValidator() && this.m_fields[fid].getValidator().getRequired()){
			}else if (t_val!==null){
				//escaping matches ViewHTMLXSLT.php escaping
				//t_val = t_val.replace(/esc\*esc\//g, "*/");
				//console.log("Setting id="+fid+" t_val="+t_val)
				this.m_fields[fid].setValue(t_val);
			}								
		}
	}

	return true;
}

/**
 * @protected
 * @param {bool} includeDeleted
 */
ModelXML.prototype.getRows = function(includeDeleted){
	includeDeleted = (includeDeleted!=undefined)? includeDeleted:true;
	var rows = [];
	for (var i=0;i<this.m_node.childNodes.length;i++){
		if (this.m_node.childNodes[i].nodeType==1){//Node.ELEMENT_NODE
			if (!includeDeleted && this.m_node.childNodes[i].getAttribute(this.ATTR_DELETED)=="1"){
				continue;
			}
			rows.push(this.m_node.childNodes[i]);
		}
	}
	//many model issue
	//var rows = this.m_node.getElementsByTagName(this.getTagRow());
	return rows;
}

/**
 * @protected
 * @param {bool} includeDeleted
 */
ModelXML.prototype.getRowsJSON = function(includeDeleted){
	includeDeleted = (includeDeleted!=undefined)? includeDeleted:false;
	var rows = [];
	for (var i=0;i<this.m_node.childNodes.length;i++){
		
		if (this.m_node.childNodes[i].nodeType==1){//Node.ELEMENT_NODE
			if (!includeDeleted && this.m_node.childNodes[i].getAttribute(this.ATTR_DELETED)=="1"){
				continue;
			}
			var fields = {};
			for (var j=0;j<this.m_node.childNodes[i].childNodes.length;j++){
				fields[this.m_node.childNodes[i].childNodes[j].nodeName] = this.m_node.childNodes[i].childNodes[j].nodeValue;
			}			
			rows.push(fields);
		}
	}
	//many model issue
	//var rows = this.m_node.getElementsByTagName(this.getTagRow());
	return rows;
}

/**
 * @protected
 * @param {Node} row
 * @param {bool} mark Only mark row as deleted
 */
ModelXML.prototype.deleteRow = function(row,mark){
	ModelXML.superclass.deleteRow.call(this,row,mark);
	if (mark){
		row.setAttribute(this.ATTR_DELETED,"1");
	}
	else if (row.parentNode){
		row.parentNode.removeChild(row);
	}	
}

/**
 * @protected
 * @param {Node} row
 */
ModelXML.prototype.undeleteRow = function(row){
	row.removeAttribute(this.ATTR_DELETED);
}

/*
 * @protected
 * @param {Node} row 
 */
ModelXML.prototype.addRow = function(row){	
	row.setAttribute(this.ATTR_INSERTED,"1");
	this.m_node.appendChild(row);
}

/*
 * @protected
 * @param {Node} row 
 */
ModelXML.prototype.copyRow = function(row){	
	this.addRow(row.cloneNode(true));
}

/*
 * @protected
 * @param {Node} row 
 */
ModelXML.prototype.updateRow = function(row){	
	ModelXML.superclass.updateRow.call(this,row);
	
	row.setAttribute(this.ATTR_UPDATED,"1");
}


ModelXML.prototype.appendFieldToRow = function(field,row){
	var cell = document.createElement(field.getId());
	var v = "";
	if (field.isSet()){
		v = field.getValueXHR();
	}
	//console.log("Adding "+v+" to "+field.getId())	
	var cell_t = document.createTextNode(v);
	cell.appendChild(cell_t);
	row.appendChild(cell);
}

/*
 * @protected
 * @returns {Node}
 */
ModelXML.prototype.makeRow = function(){
	var row = document.createElement(this.getTagRow());
	for (var fid in this.m_fields){
		this.appendFieldToRow(this.m_fields[fid],row);
		/*
		var cell = document.createElement(fid);
		var v = "";
		if (this.m_fields[fid].isSet()){
			v = this.m_fields[fid].getValueXHR();
		}
		var cell_t = document.createTextNode(v);
		cell.appendChild(cell_t);
		row.appendChild(cell);
		*/
	}
	return row;
}

/*
 * @protected
 * @returns {Node}
 */
ModelXML.prototype.setRowValues = function(row){
	for (var id in this.m_fields){
		var found = false;	
		for (var rcells=0;rcells<row.childNodes.length;rcells++){
			if (row.childNodes[rcells].nodeName==id && row.childNodes[rcells].nodeType==1){
				if(this.m_fields[id].isSet()){
					if (row.childNodes[rcells].firstChild){
						row.childNodes[rcells].firstChild.nodeValue = this.m_fields[id].getValueXHR();
					}
					else{
						//Corrected 21/01/20 no child text node !!!
						row.childNodes[rcells].appendChild(document.createTextNode(this.m_fields[id].getValueXHR()));
					}
				}
				found = true;	
				break;
			}
		}
		if(!found){
			//new field?
			//console.log("Adding field "+id)
			this.appendFieldToRow(this.m_fields[id],row);
		}
	}	
}

ModelXML.prototype.initSequences = function(){
	for (sid in this.m_sequences){
		this.m_sequences[sid] = (this.m_sequences[sid]==undefined)? 0:this.m_sequences[sid];
		var fields = this.m_node.getElementsByTagName(sid);
		for (var f=0;f<fields.length;f++){
			if (fields[f].firstChild){
				var dv = parseInt(fields[f].firstChild.nodeValue,10);
				if (this.m_sequences[sid]<dv){
					this.m_sequences[sid] = dv;
				}
			}
		}
		//console.log("Sequence "+sid+"=")
		//console.dir(this.m_sequences[sid])
	}
}
//****************************************************************************************

/**
 * @public
 * @param {Node|string} data
 */
ModelXML.prototype.setData = function(data){
	/*if (this.getLocked()){
		throw Error(this.ER_LOCKED);
	}*/
	
	var no_data = false;
	
	if (!data){
		data = '<'+this.getTagModel()+' '+this.TAG_AT_ID+'="'+this.getId()+'" xmlns="'+this.m_namespace+'"/>';
		no_data = true;
	}

	
	if (typeof(data) == "string"){
		var xml = DOMHelper.xmlDocFromString(data);
		if (xml && xml.getElementById){
			this.m_node = xml.getElementById(this.getId());	
		}
		
		//IE 10=null??
		if (xml && !this.m_node){
			var models = xml.getElementsByTagName(this.getTagModel());	
			var id = this.getId();
			for (var i =0;i<models.length;i++){
				if (models[i].getAttribute(this.TAG_AT_ID)==id){
					this.m_node = models[i];	
					break;
				}
			}
		}
	}
	else{
		this.m_node = data;	
	}
	
	if (!this.m_node){
		throw new Error(CommonHelper.format(this.ER_NO_MODEL,[this.getId()]));
	}
	
	//lazy field definition based on data
	if (!this.m_fields
	&& this.m_node.childNodes && this.m_node.childNodes.length && this.m_node.childNodes[0].nodeName==this.getTagRow()
	&& this.m_node.childNodes[0].childNodes){
		this.m_fields = {};
		for (var i=0;i<this.m_node.childNodes[0].childNodes.length;i++){
			var fid = this.m_node.childNodes[0].childNodes[i].nodeName;
			this.m_fields[fid] = new FieldString(fid);
		}
	}
	
	if (this.m_node["toString"]){
		this.m_node["toString"] = function(){
			return this.outerHTML;
		}
	}
	
	if (!no_data){
		this.initSequences();
	}		
	ModelXML.superclass.setData.call(this,data);
}

/**
 * @public
 * @returns {Node}
 */
ModelXML.prototype.getData = function(){
	return this.m_node;
}

/**
 * @public
 * @returns {int}
 */
ModelXML.prototype.getRowCount = function(includeDeleted){
	includeDeleted = (includeDeleted!=undefined)? includeDeleted:true;
	
	if(includeDeleted){
		return (this.m_node&&this.m_node.children)? this.m_node.children.length:0;
		//return (this.m_node&&this.m_node.childNodes)? this.m_node.childNodes.length:0;		
		//Does not wotk overridden in ModelXMLTree!!! 
	}
	else{
		//ToDo xPath not(@deleted='1')
		var rows = this.getRows(includeDeleted);
		return rows? rows.length:0;
	}
}

/**
 * @public
 * @returns {int}
 */
ModelXML.prototype.getTotCount = function(){	
	return this.getAttr(this.ATTR_TOT_COUNT);
}

/**
 * @public
 * @returns {int}
 */
ModelXML.prototype.getPageCount = function(){	
	return this.getAttr(this.ATTR_PG_COUNT);
}

/**
 * @public
 * @returns {int}
 */
ModelXML.prototype.getPageFrom = function(){	
	return this.getAttr(this.ATTR_PG_FROM);
}

/**
 * @public
 * @returns {string}
 */
ModelXML.prototype.getAttr = function(attr){
	if (this.m_node){
		return this.m_node.getAttribute(attr);
	}

}

/**
 * @public
 */
ModelXML.prototype.clear = function(){
	while(this.m_node.children.length){
		this.m_node.removeChild(this.m_node.children[0]);
	}
}

/**
 * @public
 * @returns {string}
 */
ModelXML.prototype.getTagModel = function(){
	return this.m_tagModel;
}
/**
 * @public
 * @param {string} v 
 */
ModelXML.prototype.setTagModel = function(v){
	this.m_tagModel = v;
}

/**
 * @public
 * @returns {string}
 */
ModelXML.prototype.getTagRow = function(){
	return this.m_tagRow;
}
/**
 * @public
 * @param {string} v 
 */
ModelXML.prototype.setTagRow = function(v){
	this.m_tagRow = v;
}

/**
 * @public
 * @returns {int}
 */
ModelXML.prototype.getHash = function(){	
	return this.getAttr(this.ATTR_HASH);
}

/**
 * appends new rows to current model from targetModel
 * models must be of the same structure!
 */
ModelXML.prototype.appendModelData = function(targetModel){
	for (var i=0;i<targetModel.m_node.children.length;i++){
		this.m_node.appendChild(targetModel.m_node.children[i].cloneNode(true));
	}
}

/**
 * inserts new rows to current model from targetModel
 * models must be of the same structure! 
 */
ModelXML.prototype.insertModelData = function(targetModel){
	var before_n = this.m_node.children[0];
	for (var i=0;i<targetModel.m_node.children.length;i++){
		this.m_node.insertBefore(targetModel.m_node.children[i].cloneNode(true),before_n);
	}
	
}

ModelXML.prototype.deleteRowByIndex = function(ind,mark){
	if(this.m_node.children&&this.m_node.children[ind]){
		this.deleteRow(this.m_node.children[ind],mark);
	}
}


