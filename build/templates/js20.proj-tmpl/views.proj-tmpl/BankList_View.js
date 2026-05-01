/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2017

 * @extends
 * @requires core/extend.js  

 * @class
 * @classdesc
 
 * @param {string} id - Object identifier
 * @param {namespace} options
 * @param {string} options.className
 */
function BankList_View(id,options){
	options = options || {};	
	
	BankList_View.superclass.constructor.call(this,id,options);
	
	var model = options.models.BankList_Model;
	var contr = new Bank_Controller();
	
	var constants = {"doc_per_page_count":null};
	window.getApp().getConstantManager().get(constants);
	
	var pagClass = window.getApp().getPaginationClass();
	
	var popup_menu = new PopUpMenu();
	
	this.addElement(new GridAjx(id+":grid",{
		"model":model,
		"keyIds":["bik"],
		"controller":contr,
		"editInline":false,
		"editWinClass":Bank_Form,
		"popUpMenu":popup_menu,
		"commands":new GridCmdContainerAjx(id+":grid:cmd",{
			"cmdInsert":false,
			"cmdCopy":false,
			"cmdDelete":false
		}),
		"head":new GridHead(id+"-grid:head",{
			"elements":[
				new GridRow(id+":grid:head:row0",{
					"elements":[
						new GridCellHead(id+":grid:head:bik",{
							"columns":[
								new GridColumn({"field":model.getField("bik")})
							],
							"sortable":true,
							"sort":"asc"
						}),					
						new GridCellHead(id+":grid:head:gr_descr",{
							"columns":[
								new GridColumn({"field":model.getField("gr_descr")})
							],
							"sortable":true
						}),											
						new GridCellHead(id+":grid:head:name",{
							"columns":[
								new GridColumn({"field":model.getField("name")})
							],
							"sortable":true
						}),
						new GridCellHead(id+":grid:head:korshet",{
							"columns":[
								new GridColumn({"field":model.getField("korshet")})
							],
							"sortable":true
						}),
						new GridCellHead(id+":grid:head:gor",{
							"columns":[
								new GridColumn({"field":model.getField("gor")})
							],
							"sortable":true
						})
						
					]
				})
			]
		}),
		"pagination":new pagClass(id+"_page",
			{"countPerPage":constants.doc_per_page_count.getValue()}),		
		
		"autoRefresh":false,
		"refreshInterval":0,
		"rowSelect":false,
		"focus":true
	}));		
}
extend(BankList_View,ViewAjx);

/* Constants */


/* private members */

/* protected*/


/* public methods */

