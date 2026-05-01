/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>,2016

 * @class
 * @classdesc

 * @extends ViewGridColParam  
 
 * @requires core/extend.js  
 * @requires controls/ViewGridColParam.js

 * @param {string} id - Object identifier
 * @param {object} options
*/
function ViewGridColOrder(id,options){
	options = options || {};	
	
	ViewGridColOrder.superclass.constructor.call(this,id,options);
}
extend(ViewGridColOrder,ViewGridColParam);

/* Constants */
ViewGridColOrder.prototype.COL_DIR_ID = "dir";

/* private members */

/* protected*/
ViewGridColOrder.prototype.addHeadCells = function(row){
	var pref = this.getId()+":grid:row1";
	row.addElement(new GridCellHead(pref+":"+this.COL_NAME_ID,{"value":this.COLUMNS_COL_CAP}));
	row.addElement(new GridCellHead(pref+":"+this.COL_CHECK_ID,{"value":this.COLUMNS_CHECK_CAP}));
	row.addElement(new GridCellHead(pref+":"+this.COL_DIR_ID,{"value":this.COLUMNS_DIR_CAP}));		
}

ViewGridColOrder.prototype.addCells = function(row,fStruc){
	var pref = this.getId()+":grid:row-"+fStruc.fieldId;
	
	row.setAttr("fields",fStruc.fields);
	
	//name
	row.addElement(new GridCell(pref+":"+this.COL_NAME_ID,
		{"value":fStruc.colRef.getValue()}
	));
	
	row.addElement(new GridCell(pref+":"+this.COL_CHECK_ID,
		{"elements":[			
			new EditCheckBox(pref+":"+this.COL_CHECK_ID+":toggle",{			
				"className":"field_toggle",
				"checked":fStruc.checked,
				"attrs":{"align":"center"}
			})
		]		
		}
	));
	
	//direction	
	var at_asc = {};
	var at_desc = {};
	if (fStruc.checked && fStruc.directs=="asc"){
		at_asc.checked="checked";
	}
	if (fStruc.checked && fStruc.directs=="desc"){
		at_desc.checked="checked";
	}
	
	row.addElement(new GridCell(pref+":"+this.COL_DIR_ID,
		{"elements":[
			new EditRadioGroup(pref+":"+this.COL_DIR_ID+":radiogroup",{
				"elements":[
					new EditRadio(pref+":"+this.COL_DIR_ID+":radiogroup:radio-asc",{
						"value":"asc",
						"labelCaption":this.ASC_CAP,
						"name":fStruc.id+"_direct",
						"editContClassName":"input-group "+window.getBsCol(1),
						"attrs":at_asc
					}),
					new EditRadio(pref+":"+this.COL_DIR_ID+":radiogroup:radio-desc",{
						"value":"desc",
						"labelCaption":this.DESC_CAP,
						"name":fStruc.id+"_direct",
						"editContClassName":"input-group "+window.getBsCol(1),
						"attrs":at_desc
					})
				]
			})		
		]}
	));
	
}

ViewGridColOrder.prototype.getRowData = function(rowElem,struc){
	var checked = rowElem.getElement(this.COL_CHECK_ID).getElement("toggle").getChecked();
	var directs = "undefined";
	if (checked){
		directs = rowElem.getElement(this.COL_DIR_ID).getElement("radiogroup").getValue();
	}	
	struc[rowElem.getNode().rowIndex-1] = {
		"colId":rowElem.getAttr("colId"),
		"fields":rowElem.getAttr("fields"),
		"directs":directs,
		"checked":checked
	};
}

/* public methods */
ViewGridColOrder.prototype.onAfterSave = function(){	
	ViewGridColVisibility.superclass.onAfterSave.call(this);
	
	var cols = {};
	for (var i=0;i<this.m_initVal.length;i++){
		cols[this.m_initVal[i].colId] = this.m_initVal[i];
	}
	
	var head = this.m_dataGrid.getHead();	
	for (var row in head.m_elements){
		var head_row = head.m_elements[row];

		var columns = head_row.m_elements;//head_row.getInitColumns();
		for (var col_id in columns){
			if (cols[col_id] && cols[col_id].checked){
				cols[col_id].colRef.setSortFieldId(cols[col_id].fields);
				cols[col_id].colRef.setSort(cols[col_id].directs);
			}
			else{
				columns[col_id].setSort("");
			}
		}
		//head_row.setColumnOrder(this.m_initVal);
	}

	this.m_dataGrid.onRefresh();	
}

