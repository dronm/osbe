/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2017
 
 * @class
 * @classdesc object dialog view
 
 * @extends ControlContainer
 
 * @requires core/extend.js
 * @requires controls/ControlContainer.js
 
 * @param string id 
 * @param {object} options
 * @param {string} options.variantStorageName
 */
function VariantStorageSaveView(id,options){
	options = options || {};	
	
	var self = this;
		
	this.m_onClose = options.onClose;

	var model = new VariantStorageList_Model();
	var contr = new VariantStorage_Controller();
	var pm = contr.getPublicMethod("get_list");
	pm.setFieldValue("storage_name",options.variantStorageName);
	
	options.addElement = function(){
		this.addElement(new GridAjx(id+":variants",{
			"model":model,
			//"keyIds":["storage_name"],
			"controller":contr,
			"editInline":null,
			"editWinClass":null,
			"popUpMenu":null,
			"showHead":false,
			"commands":new GridCommandsAjx(id+":variants:cmd",{
				"cmdInsert":false,
				"cmdEdit":false,
				"cmdDelete":true,
				"cmdCopy":false,
				"cmdPrint":false,
				"cmdRefresh":false,
				"cmdExport":false
			}),		
			"head":new GridHead(id+":variants:head",{
				"elements":[
					new GridRow(id+":variants:head:row0",{
						"elements":[
							new GridCellHead(id+":variants:head:row0:default_variant",{
								"colAttrs":{"colspan":2},
								"columns":[
									new GridColumn({
										"field":model.getField("default_variant"),
										"assocClassList":{
											"true":"glyphicon glyphicon-ok"
										}
									})
								]
							}),					
							new GridCellHead(id+":variants:head:row0:variant_name",{
								"columns":[
									new GridColumn({"field":model.getField("variant_name")})
								]
							})
						]
					})
				]
			}),
			"pagination":null,				
			"autoRefresh":true,
			"refreshInterval":0,
			"rowSelect":true,
			"focus":true
		}));	
	
		//name
		this.addElement(	
			new EditString(id+":name",{
				"focus":true,
				"labelCaption":this.VARIANT_NAME_CAP,
				"className":window.getApp().getBsCol(12)
			})
		);

		//default_variant
		this.addElement(	
			new EditCheckBox(id+":default_variant",{
				"labelCaption":this.DEF_VARIANT_CAP,
				"className":window.getApp().getBsCol(12)
			})
		);
	}
	VariantStorageSaveView.superclass.constructor.call(this,id,"TEMPLATE",options);

	var grid = this.getElement("variants");
	this.m_gridOnClick = grid.onClick;
	var self = this;
	grid.onClick = function(ev){
		var grid = self.getElement("variants");
		self.m_gridOnClick.call(grid,ev);
		
		var row = grid.getModelRow();
		self.getElement("default_variant").setValue(row.default_variant.getValue());
		var ctrl = self.getElement("name");
		ctrl.setValue(row.variant_name.getValue());
		ctrl.focus();
	}
}
extend(VariantStorageSaveView,ControlContainer);

/* Constants */

/* private members */

/* protected*/


/* public methods */
