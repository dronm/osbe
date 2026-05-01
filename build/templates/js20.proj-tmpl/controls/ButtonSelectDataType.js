/**
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2012
 
 * @class
 * @classdesc Edit control clear value button

 * @extends ButtonCtrl 

 * @requires core/extend.js
 * @requires controls/ButtonCtrl.js     
  
 * @param {string} id - html tag id
 * @param {object} options
 * @param {Control} options.editControl
 */
function ButtonSelectDataType(id,options){
	options = options || {};
	
	this.m_compoundControl = options.compoundControl;
	
	options.glyph = options.glyph || "glyphicon-random";
	
	var self = this;
	options.onClick = options.onClick ||	
		function(event){
			self.doSelect(EventHelper.fixMouseEvent(event));
		}	
	
	ButtonSelectDataType.superclass.constructor.call(this,id,options);
}
extend(ButtonSelectDataType,ButtonCtrl);

ButtonSelectDataType.prototype.m_form;
ButtonSelectDataType.prototype.m_compoundControl;

ButtonSelectDataType.prototype.doSelect = function(e){	
	var data_types = this.m_compoundControl.getPossibleDataTypes();
	var rows = [];
	for (var t in data_types){
		rows.push({"fields":{
			"dataTypeDescrLoc":data_types[t].dataTypeDescrLoc,
			"dataType":t
		}});
	}
	var model = new ModelJSON("dataTypeList",{"fields":["dataType","dataTypeDescrLoc"],"data":{"rows":rows}});
	var self = this;
	var ctrl_id = this.getId()+":selectDataType:form:body:view:grid";
	this.m_view = new View(this.getId()+":selectDataType:form:body:view",{
		"elements":[
			new Grid(ctrl_id,{
				"keyIds":["dataType"],
				"showHead":false,
				"model":model,
				"head":new GridHead(ctrl_id+":head",{
					"elements":[
						new GridRow(ctrl_id+":head:row0",{					
							"elements":[
								new GridCellHead(ctrl_id+":head:dataTypeDescrLoc",{
									"columns":[
										new GridColumn({"field":model.getField("dataTypeDescrLoc")})
									]
								})
							]
						})
					]
				}),
				"onSelect":function(fields){
					self.onSelect(fields);
				}
			})
		]
	});
	
	this.m_form = new WindowFormModalBS(this.getId()+":selectDataType:form",{
		"cmdCancel":true,
		"cmdOk":true,
		"onClickCancel":function(){
			self.m_form.close();
		},		
		"onClickOk":function(){	
			self.onSelect(self.m_view.getElement("grid").getModelRow());
		},				
		"content":this.m_view,
		"contentHead":this.HEAD_TITLE
	});

	this.m_form.open();
	
}

ButtonSelectDataType.prototype.onSelect = function(fields){		
	this.m_compoundControl.setDataType(fields.dataType.getValue());
	this.m_form.close();
}
