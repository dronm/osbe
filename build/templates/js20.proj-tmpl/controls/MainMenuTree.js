/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2017

 * @extends TreeAjx
 * @requires core/extend.js
 * @requires TreeAjx.js     

 * @class
 * @classdesc Main menu tree class, Relies on a specific MainMenuContent_Model
 
 * @param {string} id - Object identifier
 * @param {namespace} options
 * @param {string} options.className
 */
function MainMenuTree(id,options){
	options = options || {};	
	
	var self = this;
	
	options.editViewOptions = {
		"tagName":"LI",
		"columnTagName":"DIV",
		"onBeforeExecCommand":function(cmd,pm){
			pm.setFieldValue("viewdescr",self.m_editViewDescr);
		}
	};
	options.rootCaption = this.ROOT_CAP;
	options.model = new MainMenuContent_Model();
	options.className = "menuConstructor";
	options.controller = new MainMenuContent_Controller({"clientModel":options.model});
	
	options.popUpMenu = (options.popUpMenu!=undefined)? options.popUpMenu:new PopUpMenu();
	options.navigateMouse = false;	
	
	options.commands = new GridCmdContainerAjx(id+":cmd",{
		"cmdColManager":false,
		"cmdExport":false,
		"cmdSearch":false,
		"cmdCopy":false,
		"cmdRefresh":false
	});
	
	options.head = new GridHead(id+":head",{
		"rowOptions":[{"tagName":"li"}],
		"elements":[
			new GridRow(id+":content-tree:head:row0",{
				"elements":[
					new GridCellHead(id+":content-tree:head",{
						"className":window.getBsCol(6),
						"columns":[
							new GridColumn({
								"model":options.model,
								"field":options.model.getField("descr"),
								"cellOptions":{
									"tagName":"SPAN"									
								},
								"ctrlOptions":{									
									"labelCaption":this.LB_CAP_DESCR,
									"contTagName":"DIV",
									"labelClassName":"control-label "+window.getBsCol(2),
									"editContClassName":"input-group "+window.getBsCol(10)
								}
							}),
							new GridColumn({
								"field":options.model.getField("viewdescr"),
								"model":options.model,
								"cellOptions":{"tagName":"SPAN"},
								"ctrlClass":ViewEditRef,
								//"ctrlBindField":options.model.getField("viewid"),
								"ctrlBindFieldId": "viewid",
								"ctrlOptions":{
									"labelCaption":this.LB_CAP_VIEW,
									"contTagName":"DIV",
									"labelClassName":"control-label "+window.getBsCol(2),
									"editContClassName":"input-group "+window.getBsCol(10),
									"keyIds":["viewid"],
									"menuTree":this,
									"onSelect":function(fields){
										self.onViewSelected(fields);
									}
								}								
							}),
							new GridColumn({
								"field":options.model.getField("glyphclass"),
								"model":options.model,
								"cellOptions":{
									"tagName":"SPAN"									
								},
								"ctrlOptions":{									
									"labelCaption":this.LB_CAP_GLYPHCLASS,
									"contTagName":"DIV",
									"labelClassName":"control-label "+window.getBsCol(2),
									"editContClassName":"input-group "+window.getBsCol(10),
									"buttonSelect":new ButtonCtrl(id+":content-tree:head:glyphclass-sel",{
										"glyph":"glyphicon-menu-hamburger",
										"onClick":function(e){
											self.selectPict(this.getEditControl());
										}
									})
								}
							}),
							
							new GridColumn({
								"field":options.model.getField("default"),
								"assocClassList":{"true":"glyphicon glyphicon-ok"},
								"model":options.model,
								"cellOptions":{"tagName":"SPAN"},
								"ctrlOptions":{
									"labelCaption":this.LB_CAP_DEFAULT,
									"contTagName":"DIV",
									"labelClassName":"control-label "+window.getBsCol(2),
									"editContClassName":"input-group "+window.getBsCol(1)									
								}								
							})
						]
					})
				]
			})
		]
	});
	
	MainMenuTree.superclass.constructor.call(this,id,options);
}
extend(MainMenuTree,TreeAjx);

/* Constants */


/* private members */

/* protected*/


/* public methods */
/*
row.m_drop.accept = function(dragObject) {
	var drop_id = CommonHelper.unserialize(this.element.getAttribute("keys")).id;
	var drag_id = CommonHelper.unserialize(dragObject.element.getAttribute("keys")).id;					
	console.log("FromId="+drag_id+" to Id="+drop_id)
	
	self.m_model.resetFields();
	self.m_model.m_fields.id.setValue(drag_id)
	var drag_row = self.m_model.recLocate(self.m_model.m_fields)[0];

	self.m_model.resetFields();
	self.m_model.m_fields.id.setValue(drop_id)					
	var drop_row = self.m_model.recLocate(self.m_model.m_fields)[0];
	
	drop_row.parentNode.insertBefore(drag_row,drop_row);
	if (self.m_model.getFieldValue("viewDescr")){
		//elem
		drop_row.parentNode.insertBefore(drag_row,drop_row);
	}
	else{
		//group
		DOMHelper.setParent(drag_row,drop_row);
	}
	self.onRefresh();
	
}			
*/

MainMenuTree.prototype.selectPict = function(editCtrl){
	var self = this;
	this.m_view = new View(this.getId()+":view:body:view",{
		"template":window.getApp().getTemplate("IcomoonList"),
		"events":{
			"click":function(e){
				if (e.target.tagName.toUpperCase()=="DIV"){
					editCtrl.setValue(e.target.firstChild.className);
					self.closeSelect();
				}
			}
		}
	});	
	this.m_form = new WindowFormModalBS(this.getId()+":form",{
		"cmdCancel":true,
		"controlCancelCaption":this.BTN_CANCEL_CAP,
		"controlCancelTitle":this.BTN_CANCEL_TITLE,
		"cmdOk":false,
		"controlOkCaption":null,
		"controlOkTitle":null,
		"onClickCancel":function(){
			self.closeSelect();
		},		
		"onClickOk":function(){
			//self.setValue(self.m_view.getValue());
			self.closeSelect();
		},				
		"content":this.m_view,
		"contentHead":this.SEL_PIC_HEAD
	});

	this.m_form.open();	
}
MainMenuTree.prototype.closeSelect = function(){
	if (this.m_view){
		this.m_view.delDOM();
		delete this.m_view;
	}
	if (this.m_form){
		this.m_form.close();
		delete this.m_form;
	}		
}

MainMenuTree.prototype.onViewSelected = function(fields){
//console.log("MainMenuTree.prototype.onViewSelected")
//console.dir(fields)
	var descr = fields.user_descr.getValue();
	var sec = fields.section.getValue();
	if(descr.substring(0,sec.length)==sec){
		descr = descr.substring(sec.length);
	}
	this.getEditViewObj().getElement("descr").setValue(descr);
}
