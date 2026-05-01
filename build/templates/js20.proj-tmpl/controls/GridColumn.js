/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016

 * @class
 * @classdesc

 * @param {object} options
 * @param {Field} options.field
 * @param {GridHeadCell} options.headCell
 * @param {Model} options.model
 * @param {string} options.fieldId
 
 * For format resolutions see GridCell->setValue(value)
 * @param {string} options.format
 * @param {object} options.formatFunction 
 * @param {string} options.mask
 * @param {object} options.assocImageList
 * @param {object} options.assocValueList
 * @param {object} options.assocClassList
 * @param {string} options.assocIndex
 
 * @param {GridCell} options.cellClass
 * @param {object} options.cellOptions
 * @param {object} options.cellElements
 
 * Parameters for editting
 * @param {boolean} options.ctrlEdit[true] if control can be editted
 * @param {string} options.ctrlId
 * @param {object} options.ctrlClass class function
 * @param {function} options.ctrlClassResolve dynamically resolves class, function that returns class function
 * @param {string} options.ctrlBindFieldId
 * @param {Field} options.ctrlBindField
 * @param {Field} options.ctrlOptions
 
 * @param {object} options.searchOptions Search && Order options!
 			field Field
 			searchType [on_beg,on_match,on_part]
 			typeChange bool
			condSgn string
			ctrlClass
 *
 * @param {bool} [options.searchable=true]
 
 * @param {bool} [options.master=true]
 * @param {object} options.detailViewClass
 * @param {object} options.detailViewOptions
 * @param {string} options.fieldAlias 
 */
 
function GridColumn(options){

	options = options || {};
	
	if (typeof(options)!="object"){
		throw new Error("Constructor type not supported (id,option)");
	}		
	
	var id;
	if (options.id){
		id = options.id;
	}
	else if (options.field){
		id = options.field.getId();
	}
	else{
		id = CommonHelper.uniqid();
	}
	
	this.m_id = id;
	options.ctrlId = id;
	
	this.m_headCell = options.headCell;
	this.m_cellClass = options.cellClass || GridCell;
	this.m_cellOptions = options.cellOptions;
	this.m_cellElements = options.cellElements;
	
	if (!options.field && options.model && options.model.fieldExists(id)){
		//fieldId=id
		options.field = options.model.getField(id);
	}
	
	this.m_field = options.field;
	this.m_fieldId = options.fieldId;		
	this.m_format = options.format;
	this.m_formatFunction = options.formatFunction;
	this.m_mask = options.mask;
	this.m_assocImageList = options.assocImageList;
	this.m_assocValueList = options.assocValueList;
	this.m_assocClassList = options.assocClassList;
	this.m_assocIndex = options.assocIndex;
	
	//for editting
	this.m_ctrlEdit = (options.ctrlEdit!=undefined)? options.ctrlEdit:true;
	this.m_ctrlId = options.ctrlId;//Or field id
	this.m_ctrlClass = options.ctrlClass;
	this.m_ctrlClassResolve = options.ctrlClassResolve;
	this.m_ctrlOptions = options.ctrlOptions;
	this.m_ctrlBindFieldId = options.ctrlBindFieldId;
	this.m_ctrlBindField = options.ctrlBindField;
	
	this.m_grid = options.grid;
	
	this.setSearchOptions(options.searchOptions);
	this.setSearchable((options.searchable!=undefined)? options.searchable:true);
	
	this.setMaster(options.master);
	this.setDetailViewClass(options.detailViewClass);
	this.setDetailViewOptions(options.detailViewOptions);
	
	this.setFieldAlias(options.fieldAlias);
}

/* Constants */


/* private members */

/* protected*/
GridColumn.prototype.m_id;

GridColumn.prototype.m_headCell;
GridColumn.prototype.m_cellClass;
GridColumn.prototype.m_cellOptions;
GridColumn.prototype.m_cellElements;
GridColumn.prototype.m_field;
GridColumn.prototype.m_fieldId;
GridColumn.prototype.m_format;
GridColumn.prototype.m_formatFunction;
GridColumn.prototype.m_mask;
GridColumn.prototype.m_assocImageList;
GridColumn.prototype.m_assocValueList;
GridColumn.prototype.m_assocClassList;
GridColumn.prototype.m_assocIndex;

GridColumn.prototype.m_ctrlEdit;
GridColumn.prototype.m_ctrlId;
GridColumn.prototype.m_ctrlClass;
GridColumn.prototype.m_ctrlClassResolve;
GridColumn.prototype.m_ctrlOptions;
GridColumn.prototype.m_ctrlBindFieldId;

GridColumn.prototype.m_grid;
GridColumn.prototype.m_gridCell;

/* public methods */
GridColumn.prototype.getCellClass = function(){
	return this.m_cellClass;
}
GridColumn.prototype.setCellClass = function(v){
	this.m_cellClass = v;
}

GridColumn.prototype.getCellOptions = function(){
	return this.m_cellOptions;
}
GridColumn.prototype.setCellOptions = function(v){
	this.m_cellOptions = v;
}

GridColumn.prototype.getField = function(){
	if (!this.m_field && this.m_model){
		if (this.m_fieldId && this.m_model.fieldExists(this.m_fieldId)){
			this.m_field = this.m_model.getField(this.m_fieldId);
		}
		else if (this.m_model.fieldExists(this.m_id)){
			this.m_field = this.m_model.getField(this.m_id);
		}		
	}

	return this.m_field;
}
GridColumn.prototype.setField = function(v){
	this.m_field = v;
}

GridColumn.prototype.getFormat = function(){
	return this.m_format;
}
GridColumn.prototype.setFormat = function(v){
	this.m_format = v;
}

GridColumn.prototype.getHeadCell = function(){
	return this.m_headCell;
}
GridColumn.prototype.setHeadCell = function(v){
	this.m_headCell = v;
}

GridColumn.prototype.getCellClass = function(){
	return this.m_cellClass;
}
GridColumn.prototype.setCellClass = function(v){
	this.m_cellClass = v;
}

GridColumn.prototype.getMask = function(){
	return this.m_mask;
}
GridColumn.prototype.setMask = function(v){
	this.m_mask = v;
}

GridColumn.prototype.getCtrlClass = function(){
	return (this.m_ctrlClassResolve && typeof this.m_ctrlClassResolve == "function")? this.m_ctrlClassResolve.call(this) : this.m_ctrlClass;
}
GridColumn.prototype.setCtrlClass = function(v){
	this.m_ctrlClass = v;
}

GridColumn.prototype.getCtrlOptions = function(){
	return ((typeof this.m_ctrlOptions == "function")? this.m_ctrlOptions.call(this) : this.m_ctrlOptions);
}
GridColumn.prototype.setCtrlOptions = function(v){
	this.m_ctrlOptions = v;
}

GridColumn.prototype.getCtrlBindFieldId = function(){
	return this.m_ctrlBindFieldId;
}
GridColumn.prototype.setCtrlBindFieldId = function(v){
	this.m_ctrlBindFieldId = v;
}

GridColumn.prototype.getCtrlBindField = function(){
	return this.m_ctrlBindField;
}
GridColumn.prototype.setCtrlBindField = function(v){
	this.m_ctrlBindField = v;
}

GridColumn.prototype.getCtrlId = function(){
	return this.m_ctrlId;
}
GridColumn.prototype.setCtrlId = function(v){
	this.m_ctrlId = v;
}

GridColumn.prototype.getAssocValueList = function(){
	return this.m_assocValueList;
}
GridColumn.prototype.setAssocValueList = function(v){
	this.m_assocValueList = v;
}

GridColumn.prototype.getAssocIndex = function(){
	return this.m_assocIndex;
}
GridColumn.prototype.setAssocIndex = function(v){
	this.m_assocIndex = v;
}

GridColumn.prototype.getAssocImageList = function(){
	return this.m_assocImageList;
}
GridColumn.prototype.setAssocImageList = function(v){
	this.m_assocImageList = v;
}
GridColumn.prototype.getAssocClassList = function(){
	return this.m_assocClassList;
}
GridColumn.prototype.setAssocClassList = function(v){
	this.m_assocClassList = v;
}

GridColumn.prototype.getGrid = function(){
	return this.m_grid;
}
GridColumn.prototype.setGrid = function(v){
	this.m_grid = v;
}

GridColumn.prototype.getFormatFunction = function(){
	return this.m_formatFunction;
}
GridColumn.prototype.setFormatFunction = function(v){
	this.m_formatFunction = v;
}
GridColumn.prototype.getId = function(){
	return this.m_id;
}
GridColumn.prototype.setId = function(v){
	this.m_id = v;
}

/** Stub. To be overridden in inhereted classes for custom formatting
 */
GridColumn.prototype.formatVal = function(v){
	return v;
}

GridColumn.prototype.getCellElements = function(){
	return this.m_cellElements;
}
GridColumn.prototype.setModel = function(v){
	this.m_model = v;
}
GridColumn.prototype.getCtrlEdit = function(){
	return this.m_ctrlEdit;
}
GridColumn.prototype.setCtrlEdit = function(v){
	this.m_ctrlEdit = v;
}

GridColumn.prototype.setVisible = function(v){
	this.getHeadCell().setVisible(v);
	this.m_cellOptions = this.m_cellOptions || {};
	this.m_cellOptions.visible = v;
}
GridColumn.prototype.getSearchOptions = function(){
	return this.m_searchOptions;
}
GridColumn.prototype.setSearchOptions = function(v){
	this.m_searchOptions = v;
}
GridColumn.prototype.getSearchable = function(){
	return this.m_searchable;
}
GridColumn.prototype.setSearchable = function(v){
	this.m_searchable = v;
}
GridColumn.prototype.getMaster = function(){
	return this.m_master;
}
GridColumn.prototype.setMaster = function(v){
	this.m_master = v;
}
GridColumn.prototype.getDetailViewClass = function(){
	return this.m_detailViewClass;
}
GridColumn.prototype.setDetailViewClass = function(v){
	this.m_detailViewClass = v;
}
GridColumn.prototype.getDetailViewOptions = function(){
	return this.m_detailViewOptions;
}
GridColumn.prototype.setDetailViewOptions = function(v){
	this.m_detailViewOptions = v;
}

GridColumn.prototype.getGridCell = function(){
	return this.m_gridCell;
}
GridColumn.prototype.setGridCell = function(v){
	this.m_gridCell = v;
}

GridColumn.prototype.getFieldAlias = function(){
	return this.m_fieldAlias;
}
GridColumn.prototype.setFieldAlias = function(v){
	this.m_fieldAlias = v;
}

