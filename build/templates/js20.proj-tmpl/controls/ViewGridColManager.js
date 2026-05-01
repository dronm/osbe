/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>,2016

 * @class
 * @classdesc Grid column manager view

 * @extends ControlContainer.js  
 
 * @requires core/extend.js  
 * @requires controls/ControlContainer.js

 * @param {string} id - Object identifier
 * @param {object} options
 * @param {string} options.variantStorageName
 * @param {Grid} options.grid
 * @param {ModelFilter} options.filter 
*/
function ViewGridColManager(id,options){

	options = options || {};	
	
	var self = this;
	
	this.m_onClose = options.onClose;
	this.m_filter = options.filter;
	this.m_onApplyFilters = options.onApplyFilters;
	this.m_onResetFilters = options.onResetFilters;
	this.m_onVariantSave = options.onVariantSave;
	this.m_onVariantOpen = options.onVariantOpen;
	
	options.templateOptions = {
		"colorClass":window.getApp().getColorClass(),
		"bsCol":window.getBsCol(),
		"TAB_COLUMNS":this.TAB_COLUMNS,
		"TAB_SORT":this.TAB_SORT
	};	
	
	options.addElement = function(){
		this.addElement(
			new ViewGridColVisibility(id+":view-visibility",{
				"colStruc":options.colVisibility,
				"variantStorageName":options.variantStorageName,
				"grid":options.grid
			})
		);
		
		this.addElement(
			new ViewGridColOrder(id+":view-order",{
				"colStruc":options.colOrder,
				"variantStorageName":options.variantStorageName,
				"grid":options.grid
			})
		);
	
		this.addElement(new ButtonCmd(id+":save",
				{"glyph":"glyphicon-save",
				"onClick":function(){
					self.m_onVariantSave.call(this);
				},
				"attrs":{"title":this.TITLE_SAVE}
		}));
	
		this.addElement(new ButtonCmd(id+":open",
				{"glyph":"glyphicon-open",
				"onClick":function(){
					self.m_onVariantOpen.call(this);
				},
				"attrs":{"title":this.TITLE_OPEN}
		}));		
	}
		
	ViewGridColManager.superclass.constructor.call(this,id,"TEMPLATE",options);
		
	/*
	this.addElement(
		new GridCmdFilterView(id+":view-filter",{
			"filter":this.m_filter,
			"onApplyFilters":function(){
				self.m_onResetFilters();
			},
			"onResetFilters":function(){	
				self.m_onResetFilters();					
			},
		
			"grid":options.grid
		})
	);
	*/
}
extend(ViewGridColManager,ControlContainer);//

/* Constants */

/* private members */

/* protected*/


/* public methods */

ViewGridColManager.refresh = function(){
	this.getElement("view-visibility").refresh();
	this.getElement("view-order").refresh();
}
