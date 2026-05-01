/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2017

 * @extends GridColumn
 * @requires core/extend.js
 * @requires controls/GridColumn.js     

 * @class
 * @classdesc
 
 * @param {object} options
 * @param {object} options.cellElements
 * @param {WindowObjectForm} options.form
 * @param {function} options.onClickRef 
 */
function GridColumnRef(options){
	options = options || {};	
	
	var self = this;
	this.m_origFormatFunction = options.formatFunction;
	options.formatFunction = function(fields,gridCell){
		var res;		
		if (self.m_origFormatFunction){
			res = self.m_origFormatFunction(fields,gridCell);
		}
		else{
			res = self.getCellValue(fields,gridCell);
		}
		return res;
	}

	options.searchOptions = options.searchOptions || {"searchType":"on_match", "typeChange":"false"};
	

	this.m_onClickRef = options.onClickRef;

	this.setForm(options.form);
	this.setViewOptions(options.viewOptions);

	options.cellElements = options.cellElements || 	(
	(options.form||this.m_onClickRef)?
	[
		{"elementClass":Control,
		"elementOptions":{
			"tagName":"A",
			"href":"#",
			"events":{
				"click":function(e){
					self.onClickRef(e);
				}
			}
			}
		}
	]
	: null
	);

	GridColumnRef.superclass.constructor.call(this,options);
}
extend(GridColumnRef,GridColumn);

/* Constants */


/* private members */
GridColumnRef.prototype.m_keys;
GridColumnRef.prototype.m_form;


GridColumnRef.prototype.onClickRef = function(e){
	e = EventHelper.fixKeyEvent(e);
	if (e.preventDefault){
		e.preventDefault();
	}
	e.stopPropagation();
	
	var keys = this.getKeysFromClickEvent(e);

	if(this.m_onClickRef){
		this.m_onClickRef(keys,e);
	}
	else{
		this.openRef(keys);
	}
}

GridColumnRef.prototype.openRef = function(keys){
	
	if (keys && this.m_form){
		var view_opts = {};
		CommonHelper.merge(view_opts,this.getViewOptions());
		(new this.m_form({
			"name":this.m_form.toString()+CommonHelper.serialize(keys),
			"keys":keys,
			"params":{
				"cmd":"edit",
				"editViewOptions":view_opts
			}
		})).open();
	}

}

GridColumnRef.prototype.getKeysFromClickEvent = function(e){
	var keys,f_id;
	var td = DOMHelper.getParentByTagName(e.target,"TD");
	if (td){
		f_id = td.getAttribute("fieldid");
		var tr = DOMHelper.getParentByTagName(td,"TR");
		if (tr && f_id){
			this.getGrid().setModelToCurrentRow(tr);
			v = this.getGrid().getModel().getFieldValue(f_id);
			if(CommonHelper.isArray(v) && v.length){
				//array of objects
				keys = this.getObjectKeys(v[0]);
			}
			else{
				keys = this.getObjectKeys(v);
			}
		}
	}
	return keys;
}

GridColumnRef.prototype.getObjectKeys = function(v){
	return ( (!v || typeof v!="object")? null :( (v.getKeys)? v.getKeys() : (v.keys? v.keys : (v.m_keys? v.m_keys:null)) ) );
}

GridColumnRef.prototype.getObjectDescr = function(v,fields){
	var keys = this.getObjectKeys(v);
	//console.dir(keys)
	var no_keys = false;
	for (key in keys){
		if (keys[key]==null){
			no_keys = true;
			break;
		}
	}
	return !no_keys? (v.getDescr? v.getDescr(): (v.descr? v.descr : (v.m_descr? v.m_descr:keys) ) ) : "";
}

GridColumnRef.prototype.getCellValue = function(fields){
	var f = fields[this.getField().getId()];
	var res = "";
	
	if (!f.isNull()){
		var v = f.getValue();
		
		if (typeof v =="string"){
			//field of type string linked to Ref column
			v = CommonHelper.unserialize(v);
		}	
		if(CommonHelper.isArray(v)){
			//array of objects
			for(var i=0;i<v.length;i++){
				if(v[i]){
					res+= (res=="")? "":", ";
					res+= this.getObjectDescr(v[i],fields);
				}
			}
		}
		else if(v){
			res = this.getObjectDescr(v,fields);
		}
	}
	return res;
}

/* protected*/


/* public methods */
GridColumn.prototype.getForm = function(){
	return this.m_form;
}
GridColumn.prototype.setForm = function(v){
	this.m_form = v;
}
GridColumn.prototype.getViewOptions = function(){
	return this.m_viewOptions;
}
GridColumn.prototype.setViewOptions = function(v){
	this.m_viewOptions = v;
}
