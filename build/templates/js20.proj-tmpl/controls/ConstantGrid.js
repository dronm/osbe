/**
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016
 
 * @class
 * @classdesc
	
 * @param {string} id view identifier
 * @param {Object} options
 */	
function ConstantGrid(id,options){
	options = options || {};	
	
	var self = this;
	var contr = new Constant_Controller();
	var opts = {
		"model":options.model,
		"controller":contr,
		"editInline":true,
		"editWinClass":null,
		"popUpMenu":new PopUpMenu(),
		"commands":new GridCmdContainerAjx(id+":cmd",{
			"cmdInsert":false,
			"cmdCopy":false,
			"cmdDelete":false,
			"cmdEdit":true
		}),		
		"updatePublicMethod":contr.getPublicMethod("set_value"),			
		"head":new GridHead(id+":head",{
			"elements":[
				new GridRow(id+":head:0",{
					"elements":[
						new GridCellHead(id+":head:0:name",{
							"value":this.LIST_COL_NAME,
							"columns":[
								new GridColumn({
									"field":options.model.getField("name"),
									"ctrlEdit":false,
									"ctrlOptions":{
										"enabled":false,
										"cmdClear":false
									}
								})
							],
							"sortable":true,
							"sort":"asc"							
						}),
						new GridCellHead(id+":head:0:descr",{
							"value":this.LIST_COL_DESCR,
							"columns":[
								new GridColumn({
									"field":options.model.getField("descr"),
									"ctrlEdit":false,
									"ctrlOptions":{
										"enabled":false,
										"cmdClear":false
									}
								})
							]
						}),
						new GridCellHead(id+":head:0:val",{
							"value":this.LIST_COL_VAL,
							"columns":[
								new GridColumn({
									"field":options.model.getField("val")
									,"ctrlClassResolve":function(){
										return self.getConstantClass();
									}
									,"ctrlOptions":function(){
										return self.getConstantClassOptions();
									}
									,"cellOptions":function(column,row){
										return this.getCellOptions(column,row);
									}
								})
							]
						})						
					]
				})
			]
		}),
		"rowSelect":false,
		"autoRefresh":false,
		"focus":true,
		"defSrvEvents":false //no need to subscribe to set_value event
	};
	ConstantGrid.superclass.constructor.call(this,id,opts);
	
	this.m_defClasses = {
		"Bool":{
			"columnClass":GridColumnBool,
			"ctrlClass":EditCheckBox
		},
		"Date":{
			"columnClass":GridColumnDate,
			"ctrlClass":EditDate
		},
		"DateTime":{
			"columnClass":GridColumnDateTime,
			"ctrlClass":EditDateTime
		},
		"Time":{
			"columnClass":window["GridColumnTime"]? window["GridColumnTime"]:GridColumn,
			"ctrlClass": window["EditTime"]? window["EditTime"]:EditString
		},
		"Interval":{
			"columnClass":window["GridColumnInterval"]? window["GridColumnInterval"]:GridColumn,
			"ctrlClass": window["EditInterval"]? window["EditInterval"]:EditString
		},
		"Float":{
			"columnClass":GridColumnFloat,
			"ctrlClass":EditFloat
		},
		"Int":{
			"columnClass":GridColumn,
			"ctrlClass":EditInt
		},
		"Ref":{
			"columnClass":GridColumnRef,
			"ctrlClass":EditString
		},		
		"DEF":{
			"columnClass":GridColumn,
			"ctrlClass":EditString
		
		}
	};							
	
}
extend(ConstantGrid,GridAjx);

/* Constants */


/* private members */

/* protected*/

ConstantGrid.prototype.getConstantClassOptions = function(){
	return {
		"labelCaption":""
		,"autoRefresh":false
	};
}

ConstantGrid.prototype.getConstantClass = function(column,row){
	var val = this.m_model.getFieldValue("val");
	var val_type = this.m_model.getFieldValue("val_type");
	
	var ctrl_class_f = this.m_model.getField("ctrl_class");
	var ctrl_class;
	if (!ctrl_class_f.isSet()){
		//ctrl class is not defined, find on data type
		ctrl_class = (this.m_defClasses[val_type])? this.m_defClasses[val_type].ctrlClass:this.m_defClasses.DEF.ctrlClass;
	}
	else{
		ctrl_class = eval(ctrl_class_f.getValue());		
	}
	
	return ctrl_class;
}

ConstantGrid.prototype.getCellOptions = function(column,row){
	var opts = {
		"value":this.m_model.getFieldValue("val")
	};
	var val_type = this.m_model.getFieldValue("val_type");
	
	if(val_type && val_type.toUpperCase && (val_type.toUpperCase()=="JSON" || val_type.toUpperCase()=="JSONB")){
		var val_o = CommonHelper.unserialize(opts.value);
		
		if (val_o && val_o.m_descr){
			opts.value = val_o.m_descr;
			
		}else if (val_o && val_o.descr){
			opts.value = val_o.descr;
			
		}else if (val_o && val_o.getDescr){
			opts.value = val_o.getDescr();
			
		}else if (val_o){
			var ctrl_class = eval(this.m_model.getFieldValue("ctrl_class"));
			if(ctrl_class){
				var self = this;
				var ed_o = new ctrl_class(null,{
					"labelCaption":""
					,"events":{
						"click":function(e){
							self.onClick(e);
						}
					}
				});
				ed_o.setValue(val_o);
				opts.elements = [ed_o];
			}
		}
	}
		
	return opts;
}

ConstantGrid.prototype.initEditView = function(parent,replacedNode,cmd){

	ConstantGrid.superclass.initEditView.call(this,parent,replacedNode,cmd);

	var pm = this.getUpdatePublicMethod();
	pm.setFieldValue("id",this.m_model.getFieldValue("id"));
}
