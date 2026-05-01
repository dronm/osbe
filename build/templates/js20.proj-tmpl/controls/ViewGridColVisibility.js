/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016

 * @extends ViewGridColParam
 * @requires core/extend.js
 * @requires ViewGridColParam.js     

 * @class
 * @classdesc
 
 * @param {string} id - Object identifier
 * @param {object} options
 */
function ViewGridColVisibility(id,options){
	options = options || {};	

	ViewGridColVisibility.superclass.constructor.call(this,id,options);
}
extend(ViewGridColVisibility,ViewGridColParam);

/* Constants */

/* private members */

/* protected*/
ViewGridColVisibility.prototype.addHeadCells = function(row){
	var pref = this.getId()+":grid:row1";
	row.addElement(new GridCellHead(pref+":"+this.COL_NAME_ID,{"value":this.COLUMNS_COL_CAP}));
	row.addElement(new GridCellHead(pref+":"+this.COL_CHECK_ID,{"value":this.COLUMNS_CHECK_CAP}));	
}

ViewGridColVisibility.prototype.addCells = function(row,fStruc){
	var pref = this.getId()+":grid:row-"+fStruc.fieldId;
	
	//name
	row.addElement(new GridCell(pref+":"+this.COL_NAME_ID,
		{"value":fStruc.colRef.getValue()}
	));
	
	//checked
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
	
}

ViewGridColVisibility.prototype.getRowData = function(rowElem,struc){
	struc[rowElem.getNode().rowIndex-1] = {
		"colId":rowElem.getAttr("colId"),
		"checked":rowElem.getElement(this.COL_CHECK_ID).getElement("toggle").getChecked()
	};
}

/* public methods */
ViewGridColVisibility.prototype.onAfterSave = function(){	
	ViewGridColVisibility.superclass.onAfterSave.call(this);
	
	var head = this.m_dataGrid.getHead();
	for (var row in head.m_elements){
		var head_row=head.m_elements[row];

		head_row.delDOM();		
		head_row.setColumnOrder(this.m_initVal);
	}

	head.toDOM(this.m_dataGrid.m_node);
	this.m_dataGrid.onRefresh();
	
}

