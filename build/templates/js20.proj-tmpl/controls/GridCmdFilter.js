/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016
 
 * @class
 * @classdesc object dialog view
 
 * @extends GridCmd
 
 * @requires core/extend.js
 * @requires controls/GridCmd.js       
 
 * @param string id 
 * @param {object} options
 * @param {object} options.filters
 * @param {GridCmd} options.controlSave
 * @param {GridCmd} options.controlOpen
 * @param {object} options.variantStorage name,model
 */
function GridCmdFilter(id,options){
	options = options || {};	
	
	options.glyph = "glyphicon-filter";
	
	GridCmdFilter.superclass.constructor.call(this,id,options);

	this.m_filter = new ModelFilter({"filters":options.filters});	
	
	this.setControlSave(options.controlSave);
	this.setControlOpen(options.controlOpen);
		
	this.m_controls[0].setVisible(true);
	
	this.m_variantStorage = options.variantStorage;
}
extend(GridCmdFilter,GridCmd);

/* Constants */
GridCmdFilter.prototype.BTN_CLASS_SET = "btn-danger";
GridCmdFilter.prototype.BTN_CLASS_UNSET = "btn-primary";

/* private members */
GridCmdFilter.prototype.m_filter;
GridCmdFilter.prototype.m_controlSave;
GridCmdFilter.prototype.m_controlOpen;
GridCmdFilter.prototype.m_gridRefresh;
GridCmdFilter.prototype.m_pop;
GridCmdFilter.prototype.m_variantStorage;
/* protected*/


/* public methods */

GridCmdFilter.prototype.setFilterVisibile = function(v){
	if (this.m_grid)this.m_grid.setRefreshInterval((v)? 0:this.m_gridRefresh);
	
	if (this.m_pop)this.m_pop.setVisible(v);
	
	if (!v && this.m_grid){
		//delete this.m_pop;
		//this.m_pop = null;
		this.m_grid.focus();
	}
}

GridCmdFilter.prototype.afterFilterSet = function(setCnt){
	var btn = this.getControl();
	var cl_old,cl_new;
	if (setCnt){
		cl_new = this.BTN_CLASS_SET;
		cl_old = btn.getColorClass();
	}
	else{
		cl_new = btn.getColorClass();
		cl_old = this.BTN_CLASS_SET;		
	}
	DOMHelper.swapClasses(btn.getNode(),cl_new,cl_old);
	
}

GridCmdFilter.prototype.refreshGrid = function(){
	var pag = this.m_grid.getPagination();
	if (pag){
		pag.reset();
	}						
	var self = this;
	window.setGlobalWait(true);
	this.m_grid.onRefresh(
		function(){
			self.setFilterVisibile(false);
		},null,
		function(){
			window.setGlobalWait(false);
		}
	);
}

GridCmdFilter.prototype.onCommand = function(e){
	/*
	if (this.m_pop){
		delete this.m_pop;
		this.m_pop = null;	
	}
	*/
	if (!this.m_pop){
		var self = this;
		this.m_pop = new PopOver(this.m_id+":popover",{
			"caption":this.TITLE,
			"zIndex":"2000",
			"className":window.getBsCol(8),
			"contentElements":[
				new GridCmdFilterView(this.m_id+":popover:cont",{
					"filter":this.m_filter,
					"cmdSet":(this.m_grid!=undefined),
					"cmdUnset":(this.m_grid!=undefined),
					"onApplyFilters":(this.m_grid==undefined)? null:function(){
						var cnt = self.m_filter.applyFilters(self.m_grid);
						self.afterFilterSet(cnt);
						self.refreshGrid();
						/*
						if (cnt){
							self.m_variantStorage.model.setFieldValue("filter_data",
								self.m_filter.getValue()
							);
						}
						*/
					},
					"onResetFilters":(this.m_grid==undefined)? null:function(){						
						self.m_filter.resetFilters(self.m_grid);
						self.afterFilterSet(0);
						self.refreshGrid();
						
						//self.m_grid.onRefresh(true);
						//self.m_pop.setVisible(false);
					},
					"controlSave":this.getControlSave(),
					"controlOpen":this.getControlOpen()
				})
			]
		});
	
		if (this.m_grid){
			this.m_gridRefresh = this.m_grid.getRefreshInterval();
			this.m_grid.setRefreshInterval(0);
		}
		this.m_pop.toDOM(e,this.getControl().getNode());
	}
	else{
		this.setFilterVisibile(!this.m_pop.getVisible());		
	}
}

GridCmdFilter.prototype.getFilter = function(){
	return this.m_filter;
}

GridCmdFilter.prototype.setFilter = function(v){
	this.m_filter = v;	
}

/**
 * returns {ModelFilter}
 */ 
/*
GridCmdFilter.prototype.getFilters = function(){
	return this.m_filter;
}

GridCmdFilter.prototype.setFilters = function(v){
	this.m_filter = new ModelFilter({"filters":v});	
}
*/
GridCmdFilter.prototype.applyFilters = function(){
	if (this.m_pop){
		this.m_filter.applyFilters(this.m_grid);
		//.getReadPublicMethod(),false
	}
}

GridCmdFilter.prototype.getControlSave = function(v){
	return this.m_controlSave;
}

GridCmdFilter.prototype.setControlSave = function(v){
	this.m_controlSave = v;
	if (v)this.m_controlSave.setCmdFilter(this);
}

GridCmdFilter.prototype.getControlOpen = function(v){
	return this.m_controlOpen;
}

GridCmdFilter.prototype.setControlOpen = function(v){
	this.m_controlOpen = v;
	if(v)this.m_controlOpen.setCmdFilter(this);
}

GridCmdFilter.prototype.unserializeFilters = function(){
	if (this.m_variantStorage && this.m_variantStorage.model){
	//console.log("GridCmdFilter.prototype.unserializeFilters setting filter value")
	//console.dir(this.m_variantStorage.model.getFieldValue("filter_data"))
		var cnt = this.m_filter.setValue(this.m_variantStorage.model.getFieldValue("filter_data"));
		this.afterFilterSet(cnt);
	
		if (cnt && this.m_grid){
			this.m_filter.applyFilters(this.m_grid);
		}
	}
}

GridCmdFilter.prototype.setGrid = function(v){
	GridCmdFilter.superclass.setGrid.call(this,v);

	this.unserializeFilters();
}

GridCmdFilter.prototype.onDelDOM = function(){
	if (this.m_pop){
		this.m_pop.delDOM();
		delete this.m_pop;
	}
}
GridCmdFilter.prototype.setFilterInfo = function(v){
	this.m_filterInfo = v;
}
