/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016

 * @extends ControlContainer
 * @requires core/extend 
 * @requires controls/ControlContainer.js

 * @class
 * @classdesc

 * @param {string} id
 * @param {Object} options
 * @param {GridColumn} options.gridColumn
 * @param {int} options.colSpan
 * @param {string} options.value
 */
function GridCell(id,options){
	options = options || {};
	
	if (options.gridColumn){
		options.attrs = options.attrs || {};
		if (options.gridColumn.getHeadCell()){
			var col_attrs = options.gridColumn.getHeadCell().getColAttrs() || {};
			for (col_attr_id in col_attrs){
				if (typeof col_attrs[col_attr_id]=="function"){
					options.attrs[col_attr_id] = col_attrs[col_attr_id].call(this,options.fields);
				
				}
				else{
					options.attrs[col_attr_id] = col_attrs[col_attr_id];
				}
			}
			//CommonHelper.merge(options.attrs,);
		}
		
		if (options.gridColumn.getField()){
			options.attrs.fieldId = options.gridColumn.getField().getId();
			var f_alias = options.gridColumn.getFieldAlias();
			if(f_alias){
				options.attrs["data-label"] = f_alias;
			}
			/*if(options.value!=undefined){
				console.log("CellId="+id+" val="+options.value)
				console.log(options.value)
			}*/
			options.value = (options.value!=undefined)? options.value : options.gridColumn.getField().getValue();
		}
	}

	this.setGridColumn(options.gridColumn);
	
	var val = options.value;
	options.value = undefined;
	
	GridCell.superclass.constructor.call(this, id, (options.tagName || this.DEF_TAG_NAME) ,options);
	
	this.setColSpan(options.colSpan);
	this.setRowSpan(options.rowSpan);		

	this.m_modelIndex = options.modelIndex;
	this.m_row = options.row;

	if (val!=undefined || (this.m_gridColumn && this.m_gridColumn.getFormatFunction()) ){
		this.setValue(val);
	}
	
}
extend(GridCell,ControlContainer);

/* constants */
GridCell.prototype.DEF_TAG_NAME = "TD";

/* Private */
GridCell.prototype.m_gridColumn;
GridCell.prototype.m_value;

GridCell.prototype.detailToggles;//m_gridColumn.getMaster()!

/* Public */
GridCell.prototype.setColSpan = function(v){
	if (v) this.setAttr("colspan",v);
}
GridCell.prototype.getColSpan = function(){
	return this.getAttr("colspan");
}

GridCell.prototype.setRowSpan = function(v){
	if (v) this.setAttr("rowspan",v);
}
GridCell.prototype.getRowSpan = function(){
	return this.getAttr("rowspan");
}

GridCell.prototype.setGridColumn = function(v){
	this.m_gridColumn = v;

}

GridCell.prototype.getGridColumn = function(){
	return this.m_gridColumn;
}


GridCell.prototype.formatValue = function(val){
	if (this.m_gridColumn){		

		/* value definition priority:

			- format function
			- if there is one control inside, value is set to this control
			- if there are several controls inside, value is NOT set
			

			Cell Value resolving
				column.formatVal() is called first on any value
				column.getFormat() - if given CommonHelper.format is applied
				column.getMask() - if given masked input is used
				getAssocClassList - if value matches some hash in the list (AssocClassList),

							the list value associated with the hash is converted to a class
				getAssocImageList - if value matches some hash in the list (AssocImageList),
							the list value is treated as image source
				getAssocValueList- if value matches some hash in the list (AssocValueList),
							the list value is put to cell

			
		*/
		
		var elem_cnt = 0;
		if (this.m_elements){
			elem_cnt = this.getCount();
		}
		
		var f_func = this.m_gridColumn.getFormatFunction();
		if (f_func){			
			val = f_func.call(this.m_gridColumn,this.m_gridColumn.getGrid().getModel().getFields(),this);
		}
		if (elem_cnt==1){			
			//value to the first control
			for (var k in this.m_elements){
				this.m_elements[k].setValue(val);
				val = "";
				break;
			}
		}
		else if (elem_cnt){
			//No value is set
		}		
		else if (!f_func){
			val = this.m_gridColumn.formatVal(val);
			if (this.m_gridColumn.getFormat()){
				//formatting
				val = CommonHelper.format(this.m_gridColumn.getFormat(),val);
			}
			else if (this.m_gridColumn.getMask()){
				//mask
				var input = new Control(this.getId()+":mask","input",{"attrs":{"value":val},"visible":false});
				$(input.getNode()).mask(this.m_gridColumn.getMask());
				val = input.m_node.value;
			}
			else if (this.m_gridColumn.getAssocClassList()){
				var assoc_class = this.m_gridColumn.getAssocClassList()[val.toString()];
				if (assoc_class){
					this.addElement(new Control(this.getId()+":assoc-img","i",{
						"className":assoc_class
					}));
				}
				val = "";
			}
		
			else if (this.m_gridColumn.getAssocImageList()){

				var img = this.m_gridColumn.getAssocImageList()[val];
				if (img){
					this.addElement(new Control(this.getId()+":assoc-img","img",{
						"attrs":{"src":img}
					}));
				}
				val = "";
			}
			else if (this.m_gridColumn.getAssocValueList()){
				val = (val===null || val=="")? "null":val;
				//console.log("val="+val)
				val = this.m_gridColumn.getAssocValueList()[val];
			}
			else if (val && this.m_gridColumn.getAssocIndex()){
				var v = this.m_gridColumn.getAssocIndex();
				//console.log("v="+v+" val="+val[v])
				val = val[v];
			}
		}
	}
	return val;
}

GridCell.prototype.setValue = function(val){
	this.m_value = val;
	
	val = this.formatValue(val);
	
	GridCell.superclass.setValue.call(this,val);	
}

GridCell.prototype.getValue = function(){
	return this.m_value;
}

GridCell.prototype.getFormattedValue = function(){
	return this.formatValue(this.m_value);
}

GridCell.prototype.toDOM = function(parent){
	GridCell.superclass.toDOM.call(this,parent);
	
	//master-detail
	if(this.m_gridColumn&&this.m_gridColumn.getMaster()){
		this.m_detailToggle = new GridCellDetailToggle(this.getId()+":det_toggle",{
			"gridCell":this,
			"detailViewClass":this.m_gridColumn.getDetailViewClass(),
			"detailViewOptions":this.m_gridColumn.getDetailViewOptions()
		});
		if(this.getNode()&&this.getNode().firstChild)
			this.m_detailToggle.toDOMBefore(this.getNode().firstChild);
	}
}

GridCell.prototype.delDOM = function(){
	//master-detail
	if(this.m_detailToggl){		
		this.m_detailToggle.delDOM();
		delete this.m_detailToggle;	
	}

	GridCell.superclass.delDOM.call(this);
}

GridCell.prototype.getDetailToggle = function(){
	return this.m_detailToggle;
}
