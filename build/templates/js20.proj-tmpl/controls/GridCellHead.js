/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016

 * @class
 * @classdesc

 * @param {object} options
 * @param {object} options.colAttrs Column attributes
 * @param {bool} options.sortable
 * @param {string} options.sort asc|desc 
 * @param {string} options.sortFieldId
 * @param {string} options.align
 * @param {string} options.colAlign
 * @param {array} options.columns of {field,format}
 * @param {array} options.format
 */
function GridCellHead(id,options){
	options = options || {};
	options.attrs = options.attrs || {};

	//at least one with same name as cell
	/*if (!options.columns){
		var ns = id+":";
		var fid = id.substring(ns.length);
		options.columns = [new GridColumn({"fieldId":fid})];
	}
	*/	
	options.value = options.value || options.labelCaption || options.alias;
	if (options.value==undefined&&options.columns&&options.columns.length){
		//setting fields aliases
		options.value = "";
		for(var i=0;i<options.columns.length;i++){
			if (options.columns[i].getField()){
				options.value+= ((options.value=="")? "":" ") + options.columns[i].getField().getAlias();
			}
		}
	}
	
	//setting attributes befor constructor call
	if (options.visible!=undefined && !options.visible){
		options.colAttrs = options.colAttrs || {};
		options.attrs["class"] = this.CLASS_INVISIBLE;
		options.colAttrs["class"] = this.CLASS_INVISIBLE;
	}	
	
	//class members	
	if (options.colAlign){
		options.colAttrs = options.colAttrs || {};
		options.colAttrs.align = options.colAlign;
	}

	//align based on type
	if((!options.colAttrs||!options.colAttrs.align)&&options.columns&&options.columns.length){
		options.colAttrs = options.colAttrs || {};
		if(
			(window.GridColumnDate && options.columns[0] instanceof GridColumnDate)
			|| (window.GridColumnPhone && options.columns[0] instanceof GridColumnPhone)
			|| (window.GridColumnEmail && options.columns[0] instanceof GridColumnEmail)
		){
			options.colAttrs.align = "center";
		}
		else if( options.columns[0] instanceof GridColumnFloat){
			options.colAttrs.align = "right";
		}		
		
		//var col_constr = options.columns[0].constructor.name||CommonHelper.functionName(options.columns[0].constructor)
	}
	
	
	//header
	options.attrs.align = options.attrs.align || this.DEF_ALIGN;
	
	this.m_sortable = options.sortable;
	if (options.sortable){
		options.attrs.title = options.attrs.title || this.TITLE;		
	}
	
	//constructor
	GridCellHead.superclass.constructor.call(this,id,options);
		
	if (options.sortable){
		if (options.sort){
			this.setSort(options.sort);
		}
		if (options.sortFieldId){
			this.setSortFieldId(options.sortFieldId);
		}		
	
		this.setSortable(true);
		
		options.attrs.title = options.attrs.title || this.TITLE;		
	}
	
	this.setColumns(options.columns);	
	this.setColAttrs(options.colAttrs);
	
	//?????
	if (options.colControlContainer){
		//use GridColumn.cellElements.cellClass&&cellOptions
		this.m_colControlContainer = options.colControlContainer;
	}
	
	var self = this;
	this.m_sorting = function(event){		
		self.sorting(event);
	}	
}
extend(GridCellHead,GridCell);

/* constants */
GridCellHead.prototype.SORT_UP_CLASS = "grid-sort glyphicon glyphicon-sort-by-attributes";
GridCellHead.prototype.SORT_DOWN_CLASS = "grid-sort glyphicon glyphicon-sort-by-attributes-alt";

GridCellHead.prototype.SORT_UP = "asc";
GridCellHead.prototype.SORT_DOWN = "desc";
GridCellHead.prototype.SORT_CLASS = "sortable";
GridCellHead.prototype.DEF_ALIGN = "center";
GridCellHead.prototype.DEF_TAG_NAME = "TH";
GridCellHead.prototype.GLYPH_TAG = "SPAN";

/* private */
GridCellHead.prototype.m_colAttrs;
GridCellHead.prototype.m_columns;
GridCellHead.prototype.m_onRefresh;

GridCellHead.prototype.initSort = function(sort){
	var el = document.createElement(this.GLYPH_TAG);
	el.className = (sort==this.SORT_UP)? this.SORT_UP_CLASS:this.SORT_DOWN_CLASS;
	el.name = "sorter";

	var divs = this.m_node.getElementsByTagName("div");		
	var parent = this.m_node;
	if (divs && divs.length){
		parent=divs[0];
	}
	//var els = parent.getElementsByTagName(this.GLYPH_TAG);	
	var els = DOMHelper.getElementsByAttr(el.name, parent, "name", true,this.GLYPH_TAG)
	if (els && els.length){
		DOMHelper.delNode(els[0]);
	}
	parent.appendChild(el);
}

GridCellHead.prototype.updateColManager = function(){
	if (this.m_colManager && this.m_colManager.getColOrder()){
		var col_order = this.m_colManager.getColOrder();
		var name = this.getName();
		for (var i=0;i<col_order.length;i++){
			var this_col = (col_order.colId = name);
			if (this_col){
				col_order.directs = this.getAttr("sort");
			}
			col_order.checked = this_col;
		}
		
	}
}

GridCellHead.prototype.sorting = function(event){
	event= EventHelper.fixMouseEvent(event);		
	var th;
	if (event.target.nodeName.toLowerCase()=="th"){
		th = event.target;
	}
	else{
		th = DOMHelper.getParentByTagName(event.target,"th");
	}
	if (th){
		var sort = th.getAttribute("sort");
		if (sort==this.SORT_UP){
			/*
			th.setAttribute("sort",this.SORT_DOWN);
			
			var imgs = th.getElementsByTagName(this.GLYPH_TAG);
			if (imgs && imgs.length){
				imgs[0].className = this.SORT_DOWN_CLASS;
			}
			*/
			this.setSort(this.SORT_DOWN);
			this.updateColManager();
			if (this.m_onRefresh){
				this.m_onRefresh();
			}
		}
		else if (sort==this.SORT_DOWN){
			/*
			th.setAttribute("sort",this.SORT_UP)
			var imgs = th.getElementsByTagName(this.GLYPH_TAG);
			if (imgs && imgs.length){
				imgs[0].className = this.SORT_UP_CLASS;
			}
			*/
			this.setSort(this.SORT_UP);
			this.updateColManager();
			if (this.m_onRefresh){
				this.m_onRefresh();
			}				
		}
		else{
			var trs = th.parentNode.childNodes;
			for (var i=0;i<trs.length;i++){
				if (trs[i].getAttribute("sort")){
					DOMHelper.delAttr(trs[i],"sort");
					var imgs = trs[i].getElementsByTagName(this.GLYPH_TAG);
					if (imgs && imgs.length){
						DOMHelper.delNode(imgs[0]);							
					}
					break;
				}
			}
			this.makeSortable();
			this.setAttr("sort", this.SORT_UP);			
			this.initSort();
			
			this.updateColManager();			
			if (this.m_onRefresh){
				this.m_onRefresh();
			}				
		}			
	}

}

GridCellHead.prototype.makeSortable = function(){	
	if(this.m_sortable){
		EventHelper.add(this.m_node,"click",this.m_sorting,true);
	}
}

GridCellHead.prototype.makeUnSortable = function(){	
	if(this.m_sortable){
		EventHelper.del(this.m_node,"click",this.m_sorting,true);
	}
}

/* public */
GridCellHead.prototype.getColAttrs = function(){
	return this.m_colAttrs;
}
GridCellHead.prototype.setColAttrs = function(v){
	this.m_colAttrs = v;
}

GridCellHead.prototype.getColControlContainer = function(){
	return this.m_colControlContainer;
}

GridCellHead.prototype.getAlign = function(){
	return this.m_node.align;
}
GridCellHead.prototype.setAlign = function(v){
	this.m_node.align = v;
}

GridCellHead.prototype.getSortable = function(){
	return (DOMHelper.hasClass(this.m_node,this.SORT_CLASS));
}

GridCellHead.prototype.setSortable = function(v){
	if (v){
		DOMHelper.addClass(this.m_node,this.SORT_CLASS);
	}
	else{
		DOMHelper.delClass(this.m_node,this.SORT_CLASS);
	}	
}

GridCellHead.prototype.setColumns = function(v){	
	this.m_columns = v;
	if(this.m_columns){
		var alias = this.getText();
		for(var i=0;i<this.m_columns.length;i++){
			if (this.m_columns[i].getField()){
				this.m_columns[i].setFieldAlias(alias);
			}
		}
	}	
}
GridCellHead.prototype.getColumns = function(){
	return this.m_columns;
}

GridCellHead.prototype.setSortFieldId = function(v){	
	this.setAttr("sortFieldId",v);
}
GridCellHead.prototype.getSortFieldId = function(){
	return this.getAttr("sortFieldId");
}

GridCellHead.prototype.getSort = function(){
	return this.getAttr("sort");
}

GridCellHead.prototype.setSort = function(v){
	this.setAttr("sort",v);
	
	var imgs = this.m_node.getElementsByTagName(this.GLYPH_TAG);
	if (imgs && imgs.length){
		imgs[0].className = (v==this.SORT_DOWN)? this.SORT_DOWN_CLASS:this.SORT_UP_CLASS;
	}
	
}


GridCellHead.prototype.toDOM = function(parent){	
	GridCellHead.superclass.toDOM.call(this,parent);
	
	if (this.getSortable()){
		var sort = this.getSort();
		if (sort){
			this.initSort(sort);
		}	
		this.makeSortable();
	}
}
GridCellHead.prototype.delDOM = function(){			
	if (this.getSortable()){
		this.makeUnSortable();
	}
	GridCellHead.superclass.delDOM.call(this);
}

GridCellHead.prototype.setEnabled = function(v){
	if (v){
		this.makeSortable();
		var els = this.m_node.getElementsByTagName(this.GLYPH_TAG);	
		if (els && els.length){
			DOMHelper.delClass(els[0],this.ATTR_DISABLED);
		}		
	}
	else{
		this.makeUnSortable();
		var els = this.m_node.getElementsByTagName(this.GLYPH_TAG);	
		if (els && els.length){
			DOMHelper.addClass(els[0],this.ATTR_DISABLED);
		}		
	}
	GridCellHead.superclass.setEnabled.call(this,v);
}

GridCellHead.prototype.setColManager = function(v){
	this.m_colManager = v;
}

