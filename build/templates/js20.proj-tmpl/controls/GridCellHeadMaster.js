/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2019

 * @class
 * @classdesc For Master-Detail schema

 * @param {object} options
 * @param {Field} options.field
 */
 
function GridCellHeadMaster(id,options){
	options = options || {};

	//constructor
	GridCellHeadMaster.superclass.constructor.call(this,id,options);

}
extend(GridCellHeadMaster,GridCellHead); 

GridCellHeadMaster.prototype.SWITCH_TAG = "SPAN";
GridCellHeadMaster.prototype.SWITCH_CLASS = "glyphicon glyphicon-triangle-right";

GridCellHeadMaster.prototype.initMasterDedail = function(){
	var el = document.createElement(this.SWITCH_TAG);
	el.className = this.SWITCH_CLASS;
	el.name = "show_det";

	var divs = this.m_node.getElementsByTagName("div");		
	var parent = this.m_node;
	if (divs && divs.length){
		parent=divs[0];
	}
	//var els = parent.getElementsByTagName(this.SWITCH_TAG);	
	var els = DOMHelper.getElementsByAttr(el.name, parent, "name", true,this.SWITCH_TAG);
	if (els && els.length){
		DOMHelper.delNode(els[0]);
	}
	parent.appendChild(el);
}

GridCellHeadMaster.prototype.toDOM = function(parent){	
	GridCellHeadMaster.superclass.toDOM.call(this,parent);
			
	this.initMasterDedail();	
}
