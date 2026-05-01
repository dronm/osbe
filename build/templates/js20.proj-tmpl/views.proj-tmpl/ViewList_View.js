/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2017

 * @extends ViewAjx
 * @requires core/extend.js  

 * @class
 * @classdesc
 
 * @param {string} id - Object identifier
 * @param {namespace} options
 * @param {string} options.className
 */
function ViewList_View(id,options){
	options = options || {};	
	
	ViewList_View.superclass.constructor.call(this,id,options);
	
	var model = options.models.ViewList_Model;
	var contr = new View_Controller();
	
	var constants = {"doc_per_page_count":null};
	window.getApp().getConstantManager().get(constants);
	
	var filters = {
		"section":{
			"binding":new CommandBinding({
				"control":new ViewSectionSelect(id+":filter-section",{
					"labelCaption":undefined,
					"contClassName":"form-group "+window.getBsCol(12)
					}),
				"field":new FieldString("section")}),
			"sign":"e"
		}
	};
	
	var popup_menu = new PopUpMenu();
	var self = this;
	
	var grid = new GridAjx(id+":grid",{
		"model":model,
		"keyIds":["id"],
		"controller":contr,
		"editInline":null,
		"editWinClass":null,
		"popUpMenu":popup_menu,
		"commands":new GridCmdContainerAjx(id+":grid:cmd",{
			"filters":filters,
			"cmdInsert":false,
			"cmdCopy":new GridCmd(id+":grid:cmd:openNewWin",{
				"glyph":"glyphicon glyphicon-duplicate",
				"title":this.OPEN_WIN_TITLE,
				"showCmdControl":false,
				"onCommand":function(){
					var fields = this.m_grid.getModelRow();
					if (fields){
						var href = self.getObjectHref(fields);
						var win = window.open(href, "_blank");
						win.focus();						
						/*
						(new WindowFormObject({
							"formName":self.getId(),// "_blank",
							"template":fields.t.getValue(),
							"controller":fields.c.getValue(),
							"method":fields.f.getValue()
						})).open();
						*/
					}
				}
			}),
			"cmdDelete":false,
			"cmdEdit":new GridCmd(id+":grid:cmd:open",{
				"glyph":"glyphicon-eye-open",
				"title":this.OPEN_TITLE,
				"showCmdControl":false,
				"onCommand":function(){
					this.m_grid.onEdit();
				}
			})
		}),
		"head":new GridHead(id+"-grid:head",{
			"elements":[
				new GridRow(id+":grid:head:row0",{					
					"elements":[
						new GridCellHead(id+":grid:head:user_descr",{
							"value":this.GRID_COL_CAP,
							"columns":[
								new GridColumn({
									"field":model.getField("user_descr")
									,"formatFunction":function(fields,cell){
										var href = self.getObjectHref(fields);
										var cell_n = cell.getNode();
										var t_tag = document.createElement("A");
										t_tag.setAttribute("href",href);
										t_tag.setAttribute("target","_blank");
										t_tag.setAttribute("title",self.OPEN_WIN_TITLE);
										t_tag.textContent = fields.user_descr.getValue();
										cell_n.appendChild(t_tag);										
									}
								})
							]
						})
					]
				})
			]
		}),
		"pagination":new GridPagination(id+"_page",
			{"countPerPage":constants.doc_per_page_count.getValue()}),		
		
		"autoRefresh":false,
		"refreshInterval":0,
		"rowSelect":false,
		"focus":true
	});		
	
	grid.edit = function(){
		var row = this.getModelRow();					
		window.getApp().showMenuItem(null,row.c.getValue(),row.f.getValue(),row.t.getValue());
	}
	
	this.addElement(grid);
}
extend(ViewList_View,ViewAjxList);

/* Constants */


/* private members */

/* protected*/
ViewList_View.prototype.getObjectHref = function(fields){
	var href = "";
	var c = fields.c.getValue();
	var f = fields.f.getValue();
	var t = fields.t.getValue();
	if(c&&c.length)href+= (href==""? "":"&")+"c="+c;
	if(f&&f.length)href+= (href==""? "":"&")+"f="+f;
	if(t&&t.length)href+= (href==""? "":"&")+"t="+t;
	href+= (href==""? "":"&")+"v=Child";
	
	window.getChildParam = function(){	
	}
	
	return "?"+href;
}

/* public methods */

