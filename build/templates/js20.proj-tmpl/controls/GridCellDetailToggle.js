/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2019

 * @extends ControlContainer
 * @requires core/extend 
 * @requires controls/ControlContainer.js

 * @class
 * @classdesc

 * @param {string} id
 * @param {Object} options
 * @param {GridColumn} options.gridColumn
 * @param {int} options.colSpan
 * @param {string} options.value
 */
function GridCellDetailToggle(id,options){
	options = options || {};
	options.attrs = options.attrs || {};
	
	var tag_name = options.tagName || this.DEF_TAG_NAME;
	options.className = options.className || this.DEF_CLASS;
	options.attrs.title = this.TITLE;
	options.events = options.events || {};
	var self = this;
	options.events.click = function(e){
		self.onDetailToggle.call(self,e.target);
	}
	
	this.setToggleSpeed(options.toggleSpeed||this.DEF_TOGGLE_SPEED);
	
	this.m_gridCell = options.gridCell;
	this.m_detailViewClass = options.detailViewClass;
	this.m_detailViewOptions = options.detailViewOptions;
	
	GridCellDetailToggle.superclass.constructor.call(this,id,tag_name,options);
}
extend(GridCellDetailToggle,Control);

GridCellDetailToggle.prototype.m_detailVisible;

GridCellDetailToggle.prototype.m_gridCell;
GridCellDetailToggle.prototype.m_detailViewClass;
GridCellDetailToggle.prototype.m_detailViewOptions;

GridCellDetailToggle.prototype.m_toggleSpeed;
GridCellDetailToggle.prototype.m_detailRow;

GridCellDetailToggle.prototype.DEF_TOGGLE_SPEED = 300;
GridCellDetailToggle.prototype.DEF_TAG_NAME = "SPAN";
GridCellDetailToggle.prototype.DEF_CLASS = "glyphicon glyphicon-triangle-right pull-left detailToggle";

GridCellDetailToggle.prototype.onDetailToggle = function(pic){
	if(!this.m_detailVisible){
		//show details
		var detail_view_id = CommonHelper.uniqid();
		
		var tr = this.m_gridCell.getNode().parentNode;
		this.m_detailRow = document.createElement(tr.tagName);
		this.m_detailRow.className = "grid_details";
		this.m_detailRow.setAttribute("for_keys",tr.getAttribute("keys"));
		this.m_detailRow.setAttribute("detail_view_id",detail_view_id);
		
		//new 
		var v_opts = this.m_detailViewOptions || {};
		v_opts.tagName = "DIV";
		// v_opts.attrs = v_opts.attrs || {};
		// v_opts.attrs.style = "display: none;";
		// v_opts.attrs.colspan = tr.cells.length;
		// //v_opts.attrs["class"] = "grid_details_col"; display: table-cell; - does not work
		// v_opts.templateId = " ";//Never use server template!!!

		//setting keys
		var grid = this.m_gridCell.getGridColumn().getGrid();
		this.m_gridRefreshInterval = grid.getRefreshInterval();
		grid.setRefreshInterval(0);
		grid.setModelToCurrentRow(tr);
		var fields = grid.getModel().getFields();		
		for(var m_id in v_opts.detailFilters){
			for(i=0;i<v_opts.detailFilters[m_id].length;i++){
				if(fields[v_opts.detailFilters[m_id][i].masterFieldId]){
					v_opts.detailFilters[m_id][i].val = fields[v_opts.detailFilters[m_id][i].masterFieldId].getValueXHR();
				}
				
			}
		}
		var app = window.getApp();
		if(!app.m_detailViews){
			app.m_detailViews = {};
		}
		app.m_detailViews[detail_view_id] = new this.m_detailViewClass(detail_view_id, v_opts);

		//container to hols view, always td element
		let viewCont = document.createElement("TD");
		viewCont.setAttribute("style", "display: none;");
		viewCont.setAttribute("colspan", tr.cells.length);

		if(tr.nextSibling){
			tr.parentNode.insertBefore(this.m_detailRow, tr.nextSibling);	
		}else{
			tr.parentNode.appendChild(this.m_detailRow);	
		}
		// app.m_detailViews[detail_view_id].toDOM(this.m_detailRow); //old way
		app.m_detailViews[detail_view_id].toDOM(viewCont);
		this.m_detailRow.appendChild(viewCont);

		// $(app.m_detailViews[detail_view_id].getNode()).slideToggle(this.m_toggleSpeed); //old
		$(viewCont).slideToggle(300);
	}else{
		//hide details
		var tr = DOMHelper.getParentByTagName(pic,"tr");
		var detail_view_id = tr.nextSibling.getAttribute("detail_view_id");
		if(detail_view_id){
			window.getApp().m_detailViews[detail_view_id].delDOM();
		}
		var grid = this.m_gridCell.getGridColumn().getGrid();
		grid.setRefreshInterval(this.m_gridRefreshInterval);				
		if(this.m_detailViewOptions && this.m_detailViewOptions.refreshOnHide===true){
			grid.onRefresh();
		}
		DOMHelper.delNode(this.m_detailRow);			
	}
	
	this.setDetailVisible(!this.m_detailVisible);
}

GridCellDetailToggle.prototype.setToggleSpeed = function(v){
	this.m_toggleSpeed = v;	
}
GridCellDetailToggle.prototype.getToggleSpeed = function(){
	return this.m_toggleSpeed;	
}
GridCellDetailToggle.prototype.getDetailVisible = function(){
	return this.m_detailVisible;	
}
GridCellDetailToggle.prototype.setDetailVisible = function(v){
	this.m_detailVisible = v;
	$(this.m_node).toggleClass("rotate-90");	
}
GridCellDetailToggle.prototype.setDetailRow = function(v){
	this.m_detailRow = v;
}
