/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2017
 
 * @class
 * @classdesc object dialog view
 
 * @extends ControlContainer
 
 * @requires core/extend.js
 * @requires controls/ControlContainer.js
 * @requires controls/ButtonCmd.js
 
 * @param string id 
 * @param {namespace} options
 * @param {bool} [options.cmdSet=true]
 * @param {Control} [options.controlSet=ButtonCmd] 
 * @param {bool} [options.cmdUnset=true]
 * @param {Control} [options.controlUnset=ButtonCmd]   
 * @param {GridCmd} options.controlSave
 * @param {GridCmd} options.controlOpen
 * @param {ModelFilter} options.filter
 * @param {function} options.onApplyFilters
 * @param {function} options.onResetFilters     
 */
function GridCmdFilterView(id,options){
	options = options || {};	
	
	options.templateOptions = {"bsCol":window.getBsCol()};
	options.template = window.getApp().getTemplate("GridCmdFilterView");
	
	GridCmdFilterView.superclass.constructor.call(this,id,"TEMPLATE",options);
	
	options.cmdSet = (options.cmdSet!=undefined)? options.cmdSet:true;
	options.cmdUnset = (options.cmdUnset!=undefined)? options.cmdUnset:options.cmdSet;
	
	var self = this;
	
	if (options.cmdSet || options.controlSet){
		this.setControlSet(
			options.controlSet ||
			new ButtonCmd(id+":set",
				{"caption":this.SET_CAP,
				"onClick":function(){
					self.applyFilters();				
				},
				"attrs":{"title":this.SET_TITLE}
				})
		);	
	}
	
	if (options.cmdUnset || options.controlUnset){
		this.setControlUnset(
			options.controlUnset ||
			new ButtonCmd(id+":unset",
				{"caption":this.UNSET_CAP,
				"onClick":function(){
					self.resetFilters();				
				},
				"attrs":{"title":this.UNSET_TITLE}
				})
		);	
	}
	
	if (options.controlSave){
		this.m_origSave = options.controlSave.getControl(0);
		this.setControlSave(new ButtonCmd(id+":save",
				{"glyph":this.m_origSave.getGlyph(),
				"onClick":function(){
					options.controlSave.onCommand();				
				},
				"attrs":{"title":this.m_origSave.getAttr("title")}
		}));	
	}
	if (options.controlOpen){
		this.m_origOpen = options.controlOpen.getControl(0);
		this.setControlSave(new ButtonCmd(id+":open",
				{"glyph":this.m_origOpen.getGlyph(),
				"onClick":function(){
					options.controlOpen.onCommand();				
				},
				"attrs":{"title":this.m_origOpen.getAttr("title")}
		}));	
	}
	
	/* filter */
	this.setFilter(options.filter);
	
	this.setOnApplyFilters(options.onApplyFilters);
	this.setOnResetFilters(options.onResetFilters);
	
}
extend(GridCmdFilterView,ControlContainer);

/* Constants */


/* private members */
GridCmdFilterView.prototype.m_controlSet;
GridCmdFilterView.prototype.m_controlUnset;
GridCmdFilterView.prototype.m_controlSave;
GridCmdFilterView.prototype.m_controlOpen;
/* protected*/


/* public methods */
GridCmdFilterView.prototype.addControls = function(v){
	this.clear();
	if (this.m_filter){
		var filters = this.m_filter.getFilters();	
		for (var id in filters){
			if(!filters[id]||!filters[id].binding)continue;
			var ctrl = filters[id].binding.getControl();
			ctrl.setVisible(true);
			this.addElement(ctrl);
		}
	}	
	if(this.m_controlSet) this.addElement(this.m_controlSet);
	if(this.m_controlUnset) this.addElement(this.m_controlUnset);
	
	if(this.m_controlSave) this.addElement(this.m_controlSave);
	if(this.m_controlOpen) this.addElement(this.m_controlOpen);
}

GridCmdFilterView.prototype.setControlSet = function(v){
	this.m_controlSet = v;	
}

GridCmdFilterView.prototype.getControlSet = function(){
	return this.m_controlSet;	
}

GridCmdFilterView.prototype.setControlUnset = function(v){
	this.m_controlUnset = v;	
}

GridCmdFilterView.prototype.getControlUnset = function(){
	return this.m_controlUnset;	
}
	
GridCmdFilterView.prototype.setFilter = function(v){
	this.m_filter = v;	
	this.addControls();
}

GridCmdFilterView.prototype.getFilter = function(){
	return this.m_filter;	
}

GridCmdFilterView.prototype.setOnApplyFilters = function(v){
	this.m_onApplyFilters = v;	
}

GridCmdFilterView.prototype.getOnApplyFilters = function(){
	return this.m_onApplyFilters;	
}

GridCmdFilterView.prototype.setOnResetFilters = function(v){
	this.m_onResetFilters = v;	
}

GridCmdFilterView.prototype.getOnResetFilters = function(){
	return this.m_onResetFilters;	
}

GridCmdFilterView.prototype.applyFilters = function(){
	if (this.m_filter){
		if (this.m_onApplyFilters){
			this.m_onApplyFilters();
		}
	}
}
	
GridCmdFilterView.prototype.resetFilters = function(){
	if (this.m_filter){
		if (this.m_onResetFilters){
			this.m_onResetFilters();
		}
	}

}	

GridCmdFilterView.prototype.setControlSave = function(v){
	this.m_controlSave = v;	
}
GridCmdFilterView.prototype.getControlSave = function(v){
	return this.m_controlSave;	
}

GridCmdFilterView.prototype.setControlOpen = function(v){
	this.m_controlOpen = v;	
}
GridCmdFilterView.prototype.getControlOpen = function(v){
	return this.m_controlOpen;	
}

