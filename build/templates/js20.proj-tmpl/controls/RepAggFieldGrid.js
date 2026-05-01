/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2019

 * @extends RepFieldGrid
 * @requires core/extend.js
 * @requires controls/RepFieldGrid.js     

 * @class
 * @classdesc
 
 * @param {string} id - Object identifier
 * @param {object} options
 */
function RepAggFieldGrid(id,options){
	options = options || {};	
	
	var model = new RepAggField_Model({
		"sequences":{"id":0}
	});

	var cells = [
		new GridCellHead(id+":head:agg_fields",{
			"value":"Наименование",
			"columns":[
				new GridColumn({"field":model.getField("agg_fields")})
			],
			"sortable":true,
			"sort":"asc"
		}),					
		new GridCellHead(id+":head:agg_fn",{
			"value":"Функция",
			"columns":[
				new GridColumn({
					"field":model.getField("agg_fn")
				})
			]
		}),
	];

	var self = this;
	options = {
		"model":model,
		"keyIds":["id"],
		"controller":new RepAggField_Controller({"clientModel":model}),
		"editInline":true,
		"editWinClass":null,
		"popUpMenu":new PopUpMenu(),
		"commands":new RepFieldGridCommands(id+":cmd"),
		"head":new GridHead(id+":head",{
			"elements":[
				new GridRow(id+":head:row0",{
					"elements":cells
				})
			]
		}),
		"pagination":null,				
		"autoRefresh":false,
		"refreshInterval":0,
		"rowSelect":true
	};
	
	RepAggFieldGrid.superclass.constructor.call(this,id,options);
}
//ViewObjectAjx,ViewAjxList
extend(RepAggFieldGrid,GridAjx);

/* Constants */


/* private members */

/* protected*/


/* public methods */

