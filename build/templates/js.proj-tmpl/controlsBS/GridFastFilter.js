/* Copyright (c) 2016 
	Andrey Mikhalevich, Katren ltd.
*/
/*	
	Description
*/
/** Requirements
 * @requires 
 * @requires core/extend.js  
*/

/* constructor
@param string id
@param object options{

}
*/
function GridFastFilter(id,options){
	options = options || {};	
	
	options.tagName = "div";
	options.noSetControl = true;
	options.noUnsetControl = true;
	options.noToggleControl = true;
	options.className = "row fast-filter";
	
	GridFastFilter.superclass.constructor.call(this,id,options);
	
	var self = this;
	this.m_btnClearFilter = new ButtonCtrl(null,
		{"glyph":"glyphicon-remove",
		"attrs":{"title":"сбросить фильтр"},
		"onClick":function(){
			self.resetValues();
		}
		}
	);	
	
}
extend(GridFastFilter,GridFilter);

/* Constants */


/* private members */

/* protected*/


/* public methods */
GridFastFilter.prototype.toDOM = function(parent){
	if (this.getCount()>1)this.m_btnClearFilter.toDOM(this.m_node);
	
	GridFastFilter.superclass.toDOM.call(this,parent);		

}

GridFastFilter.prototype.addFilterControl = function(control,filter){		
//console.log("GridFastFilter.prototype.addFilterControl");
	var self = this;
	
	if (control.resetValue){
		control.m_origResetValue = control.resetValue;		
		control.resetValue = function(noRefresh){
			control.m_origResetValue.call(control);
			if (noRefresh==undefined){
				self.refresh();
			}
		}				
	}
	//control.getEditMask && !control.getEditMask() && 	
	if (control.getNode().nodeName.toLowerCase()=="input"){
		var attr = control.getAttr("type");
		if (attr=="text"){
			control.m_events = {
				"keyup":function(){
					self.refresh();
				}
			};
		}
	}
	/*
	else if (control.getEditMask && control.getEditMask() && control.getNode().nodeName.toLowerCase()=="input"){
		var attr = control.getAttr("type");
		if (attr=="text"){
			control.m_events = {
				"input":function(){
				console.log("control val="+control.getValue())
					//self.refresh();
				}
			};
		}	
	}
	*/
	GridFastFilter.superclass.addFilterControl.call(this,control,filter);
}

GridFastFilter.prototype.resetValues = function(){
	var params = this.m_filter.m_params;
	for (var ctrl_id in params){
		this.m_elements[ctrl_id].resetValue(true);
	}
	this.refresh();
}
