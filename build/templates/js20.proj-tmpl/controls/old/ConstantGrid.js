/**
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016
 
 * @class
 * @classdesc
	
 * @param {string} id view identifier
 * @param {Object} options
 */	
function ConstantGrid(id,options){
	options = options || {};	
	
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
								})
							]
						})						
					]
				})
			]
		}),
		"rowSelect":false,
		"autoRefresh":false,
		"focus":true
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
		"Interval":{
			"columnClass":GridColumn,
			"ctrlClass":EditString
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
ConstantGrid.prototype.m_defClasses;

/* protected*/


/* public methods */
ConstantGrid.prototype.onGetData = function(resp){
	if(resp){
		this.m_model.setData(resp.getModelData(this.m_model.getId()));
	}
	
	if (this.m_model){
		//refresh from model
		var self = this;
		var body = this.getBody();
		var foot = this.getFoot();
		body.delDOM();
		body.clear();
	
		if (foot && foot.calcBegin){	
			this.m_foot.calcBegin(this.m_model);
		}
	
		if (!this.getHead())return;
		
		var columns = this.getHead().getColumns();
		//var temp_input;
		
		var row_cnt = 0, field_cnt;
		var row,row_keys;
		this.m_model.reset();
	
		var pag = this.getPagination();
		if (pag){
			pag.m_from = parseInt(this.m_model.getPageFrom());
			pag.setCountTotal(this.m_model.getTotCount());
		}
	
		/* temporaly always set to 0*/
		var h_row_ind = 0;
		var key_id_ar = this.getKeyIds();
	
		while(this.m_model.getNextRow()){
			row = this.createNewRow(row_cnt,h_row_ind);
			
			row_keys = {};
			
			for(var k=0;k<key_id_ar.length;k++){
				row_keys[key_id_ar[k]] = this.m_model.getFieldValue(key_id_ar[k]);
			}

			//ADDED
			var ctrlOptions = this.m_model.getFieldValue("ctrl_options");

			var val_type = this.m_model.getFieldValue("val_type");
			var const_id = this.m_model.getFieldValue("id");
			
			var column_class_f = this.m_model.getField("view_class");
			var column_class;
			if (!column_class_f.isSet()){
				column_class = (this.m_defClasses[val_type])? this.m_defClasses[val_type].columnClass:this.m_defClasses.DEF.columnClass;
			}
			else{
				column_class = eval(column_class_f.getValue());
			}
			var view_options = this.m_model.getFieldValue("view_options");

			var ctrl_class_f = this.m_model.getField("ctrl_class");
			var ctrl_class;
			if (!ctrl_class_f.isSet()){
				//ctrl class is not defined, find on data type
				ctrl_class = (this.m_defClasses[val_type])? this.m_defClasses[val_type].ctrlClass:this.m_defClasses.DEF.ctrlClass;
			}
			else{
				ctrl_class = eval(ctrl_class_f.getValue());
			}
			if (val_type=="Ref"){
				ctrlOptions = ctrlOptions || {};
				ctrlOptions.labelCaption = "";
				ctrlOptions.keyIds = ["val"];
			}
			
			field_cnt = 0;
			for (var col_id=0;col_id<columns.length;col_id++){
				columns[col_id].setGrid(this);

				if (columns[col_id].getField() && columns[col_id].getField().getPrimaryKey()){
					row_keys[columns[col_id].getField().getId()] = columns[col_id].getField().getValue();
				}
				
				//Added
				if (columns[col_id].getField()&&columns[col_id].getField().getId()=="val"){
					//console.log("Setting ctrl_class="+ctrl_class+" for "+columns[col_id].getField().getValue())
					columns[col_id].ctrlClass = ctrl_class;
					columns[col_id].ctrlOptions = ctrlOptions;
					columns[col_id].ctrlBindFieldId = "val";
				}
				//Added
				
				var cell = this.createNewCell(columns[col_id],row);
			
				if(columns[col_id].getMaster()&&details_expanded){
					master_cell = cell;
				}
			
				if (this.m_onEventAddCell){
					this.m_onEventAddCell.call(this,cell);
				}
			
				row.addElement(cell);
							
				field_cnt++;				
			}
			
			row.setAttr("keys",CommonHelper.array2json(row_keys));
		
			//system cell
			var row_cmd_class = this.getRowCommandClass();
			if (row_cmd_class){
				var row_class_options = {"grid":this};
				row.addElement(new row_cmd_class(row.getId()+":cell-sys",row_class_options));
			}
			body.addElement(row);
			row_cnt++;
	
			/*
			if (this.m_onSelect){
				this.m_selects[row_id] = function(){
					EventHandler.add(row.m_node,"click",function(){
						self.m_onSelect();
					},true);
				};
			}
			*/
			//foot
			if (foot && foot.calc){	
				foot.calc(this.m_model);
			}		
		}
		
		if (this.getLastRowFooter() && row){
			DOMHelper.addClass(row.m_node,"grid_foot");
		}
	
		if (foot && foot.calcEnd){	
			foot.calcEnd();
		}
		
		body.toDOM(this.m_node);
		
	}
	if (this.m_navigate){
		this.setSelection();
	}
	
	if (this.m_onRefresh){
		this.m_onRefresh.call(this);
	}
}

ConstantGrid.prototype.initEditView = function(parent,replacedNode,cmd){

	ConstantGrid.superclass.initEditView.call(this,parent,replacedNode,cmd);

	var pm = this.getUpdatePublicMethod();
	pm.setFieldValue("id",this.m_model.getFieldValue("id"));
}
