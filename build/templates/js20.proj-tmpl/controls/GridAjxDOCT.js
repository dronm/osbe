/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016

 * @extends GridAjx
 * @requires core/extend.js
 * @requires GridAjx.js     

 * @class
 * @classdesc
 
 * @param {string} id - Object identifier
 * @param {object} options
 */
function GridAjxDOCT(id,options){
	options = options || {};	
	
	options.refreshAfterDelRow = true;
	options.refreshInterval = 0;
	
	GridAjxDOCT.superclass.constructor.call(this, id, options);
}
extend(GridAjxDOCT,GridAjx);

/* Constants */
GridAjxDOCT.prototype.m_modified;

/* private members */

/* protected*/
/* public methods */

GridAjxDOCT.prototype.afterServerDelRow = function(){
	this.setModified(true);
	GridAjxDOCT.superclass.afterServerDelRow.call(this);
}

GridAjxDOCT.prototype.refreshAfterEdit = function(res){
	
	GridAjxDOCT.superclass.refreshAfterEdit.call(this,res);
	if (res && res.updated){
		this.setModified(true);
	}
}

GridAjxDOCT.prototype.getModified = function(){
	return this.m_modified;
}
GridAjxDOCT.prototype.setModified = function(v){
	this.m_modified = v;
}
