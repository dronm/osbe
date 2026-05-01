/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2012
 
 * @class
 * @classdesc
 
 * @requires core/extend.js
 * @requires ControlContainer.js 

 * @extends ControlContainer
  
 * @param {string} id Object identifier
 * @param {namespace} options
 * @param {bool} [cmdSet=true]
 * @param {bool} [cmdUnset=true]
 * @param {Control} [controlSet=ButtonCmd]
 * @param {Control} [controlUnset=ButtonCmd]   
 */
function GridFilter(id,options){
	options = options || {};
	
	options.className = options.className || this.DEF_CLASS_NAME;
	
	GridFilter.superclass.constructor.call(this, id, options.tagName || this.DEF_TAG_NAME, options);

	options.cmdSet = (options.cmdSet!=undefined)? options.cmdSet:true;
	options.cmdUnset = (options.cmdUnset!=undefined)? options.cmdUnset:options.cmdSet;
	
	var self = this;
	
	/* set */
	if (options.cmdSet){
		this.setControlSet(options.controlSet || new ButtonCmd(id+":cmdSet",
			{"caption":this.DEF_SET_CTRL_CAP,
			"onClick":function(){
				self.setFilter();				
			},
			"attrs":{"title":this.DEF_SET_CTRL_TITLE}
			})
		);	
	}

	/* unset */
	if (options.cmdUnset){
		this.setControlUnset(options.controlUnset || new ButtonCmd(id+":cmdUnset",
			{"caption":this.DEF_UNSET_CTRL_CAP,
			"onClick":function(){
				self.unsetFilter();
			},
			"attrs":{"title":this.DEF_UNSET_CTRL_TITLE}
			})
		);	
	}

	/* filter */
	this.m_filter = new ModelFilter({
		"filters":options.filters
	});
				
	this.addControls();	
}
extend(GridFilter,ControlContainer);

GridFilter.prototype.DEF_TAG_NAME = "form";
GridFilter.prototype.DEF_CLASS_NAME = "form-horizontal collapse";

GridFilter.prototype.m_controlSet;
GridFilter.prototype.m_controlUnset;
GridFilter.prototype.m_filter;
GridFilter.prototype.m_onRefresh;

/**/
GridFilter.prototype.addControls = function(){
	var filters = this.m_filter.getFilters();	
	for (var id in filters){
		this.addElement(filters[id].binding.getControl());
	}
	
	this.m_contCommands = new ControlContainer(this.getId()+":cont-cmd","DIV",{"className":window.getBsCol()+"12"});
	
	if (this.m_controlSet) this.m_contCommands.addElement(this.m_controlSet);
	if (this.m_controlUnset) this.m_contCommands.addElement(this.m_controlUnset);
	
	this.addElement(this.m_contCommands);
}


GridFilter.prototype.setControlSet = function(v){
	this.m_controlSet = v;	
}

GridFilter.prototype.getControlSet = function(){
	return this.m_controlSet;	
}

GridFilter.prototype.setControlUnset = function(v){
	this.m_controlUnset = v;	
}

GridFilter.prototype.getControlUnset = function(){
	return this.m_controlUnset;	
}

GridFilter.prototype.setFilter = function(v){
	this.m_filter = v;	
}

GridFilter.prototype.getFilter = function(){
	return this.m_filter;	
}

GridFilter.prototype.setOnRefresh = function(v){
	this.m_onRefresh = v;	
}

GridFilter.prototype.getOnRefresh = function(){
	return this.m_onRefresh;	
}

GridFilter.prototype.setFilter = function(){
	if (this.m_onRefresh){		
		this.m_onRefresh();
	}
}
	
GridFilter.prototype.unsetFilter = function(){
	this.m_filter.resetFilters();
	if (this.m_onRefresh){
		this.m_onRefresh();
	}
}
