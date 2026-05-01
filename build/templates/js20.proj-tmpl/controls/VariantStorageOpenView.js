/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2017
 
 * @class
 * @classdesc Open variant select view
 
 * @extends ControlContainer
 
 * @requires core/extend.js
 * @requires controls/ControlContainer.js
 
 * @param string id 
 * @param {object} options
 * @param {string} options.variantStorageName
 */
function VariantStorageOpenView(id,options){
	options = options || {};	
	
	var self = this;
		
	this.m_onClose = options.onClose;

	var model = new VariantStorageList_Model();
	var contr = new VariantStorage_Controller();
	var pm = contr.getPublicMethod("get_list");
	pm.setFieldValue("storage_name",options.variantStorageName);
	
	VariantStorageOpenView.superclass.constructor.call(this,id,"TEMPLATE",options);

	this.addElement(new GridAjx(id+":variants",{
		"model":model,
		//"keyIds":["id"],//storage_name
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
						new GridCellHead(id+":variants:head:row0:variant_name",{
							"columns":[
								new GridColumn({"field":model.getField("variant_name")})
							],
							"sortable":true
						})
						,new GridCellHead(id+":variants:head:row0:default_variant",{
							"columns":[
								new GridColumnBool({
									"field":model.getField("default_variant")
									,"showFalse":false
								})
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
		"focus":true,
		"onSelect":options.onSelect
	}));	
			
}
extend(VariantStorageOpenView,ControlContainer);

/* Constants */


/* private members */

/* protected*/


/* public methods */

