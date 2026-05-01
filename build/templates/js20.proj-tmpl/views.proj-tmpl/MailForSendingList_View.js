/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2017

 * @extends ViewAjx
 * @requires js20/core/extend.js
 * @requires js20/controls/ViewAjx.js     

 * @class
 * @classdesc
 
 * @param {string} id - Object identifier
 * @param {namespace} options
 * @param {string} options.className
 */
function MailForSendingList_View(id,options){
	options = options || {};	
	
	MailForSendingList_View.superclass.constructor.call(this,id,options);
	
	MailForSendingList_View.superclass.constructor.call(this,id,options);
	
	var model = options.models.MailForSendingList_Model;
	var contr = new MailForSending_Controller();
	
	var constants = {"doc_per_page_count":null,"grid_refresh_interval":null};
	window.getApp().getConstantManager().get(constants);
	
	var pagClass = window.getApp().getPaginationClass();
	
	var popup_menu = new PopUpMenu();
	
	var period_ctrl = new EditPeriodDate(id+":filter-ctrl-period",{
		"field":new FieldDateTime("date_time")
	});
	
	var filters = {
		"period":{
			"binding":new CommandBinding({
				"control":period_ctrl,
				"field":period_ctrl.getField()
			}),
			"bindings":[
				{"binding":new CommandBinding({
					"control":period_ctrl.getControlFrom(),
					"field":period_ctrl.getField()
					}),
				"sign":"ge"
				},
				{"binding":new CommandBinding({
					"control":period_ctrl.getControlTo(),
					"field":period_ctrl.getField()
					}),
				"sign":"le"
				}
			]
		},
		"email_type":{
			"binding":new CommandBinding({
				"control":new Enum_email_types(id+":filter-ctrl-email_type",{
					"contClassName":"form-group-filter",
					"labelCaption":"Статус"
				}),
				"field":new FieldString("email_type")}),
			"sign":"e"		
		}
	};
	
	
	this.addElement(new GridAjx(id+":grid",{
		"model":model,
		"keyIds":["id"],
		"controller":contr,
		"editInline":false,
		"editWinClass":MailForSending_Form,
		"popUpMenu":popup_menu,
		"commands":new GridCmdContainerAjx(id+":grid:cmd",{
			"cmdInsert":false,
			"cmdCopy":false,
			"cmdDelete":false,
			"cmdEdit":true,
			"cmdFilter":true,
			"filters":filters,
			"variantStorage":options.variantStorage			
		}),
		"head":new GridHead(id+"-grid:head",{
			"elements":[
				new GridRow(id+":grid:head:row0",{
					"elements":[
						new GridCellHead(id+":grid:head:date_time",{
							"columns":[
								new GridColumnDate({
									"dateFormat":"d/m/Y H:i",
									"field":model.getField("date_time"),
									"ctrlClass":EditDate,
									"searchOptions":{
										"field":new FieldDate("date_time"),
										"searchType":"on_beg"
									}
								})
							],
							"sortable":true,
							"sort":"desc"
						}),
						new GridCellHead(id+":grid:head:subject",{
							"columns":[
								new GridColumn({"field":model.getField("subject")})
							],
							"sortable":true
						}),						
						new GridCellHead(id+":grid:head:from_addr",{
							"columns":[
								new GridColumn({"field":model.getField("from_addr")})
							],
							"sortable":true
						}),
						new GridCellHead(id+":grid:head:from_name",{
							"columns":[
								new GridColumn({"field":model.getField("from_name")})
							],
							"sortable":true
						}),
						new GridCellHead(id+":grid:head:to_addr",{
							"columns":[
								new GridColumn({"field":model.getField("to_addr")})
							],
							"sortable":true
						}),
						new GridCellHead(id+":grid:head:to_name",{
							"columns":[
								new GridColumn({"field":model.getField("to_name")})
							],
							"sortable":true
						}),
						new GridCellHead(id+":grid:head:sent_date_time",{
							"columns":[
								new GridColumnDate({
									"dateFormat":"d/m/Y H:i",
									"field":model.getField("sent_date_time"),
									"ctrlClass":EditDate,
									"searchOptions":{
										"field":new FieldDate("sent_date_time"),
										"searchType":"on_beg"
									}
								})
							],
							"sortable":true
						}),
						new GridCellHead(id+":grid:head:email_type",{
							"columns":[
								new EnumGridColumn_email_types({"field":model.getField("email_type")})
							],
							"sortable":true
						})			
						,new GridCellHead(id+":grid:head:error_str",{
							"columns":[
								new GridColumn({"field":model.getField("error_str")})
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
		"refreshInterval":constants.grid_refresh_interval.getValue()*1000,
		"rowSelect":false,
		"focus":true
	}));		
}
extend(MailForSendingList_View,ViewAjx);

/* Constants */


/* private members */

/* protected*/


/* public methods */

