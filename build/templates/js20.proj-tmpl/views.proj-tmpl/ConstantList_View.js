/**
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016
 
 * @class
 * @classdesc
	
 * @param {string} id view identifier
 * @param {namespace} options
 * @param {namespace} options.models All data models
 * @param {namespace} options.variantStorage {name,model}
 */	
function ConstantList_View(id,options){	

	ConstantList_View.superclass.constructor.call(this,id,options);
	this.addElement(
		new ConstantGrid(id+":grid",{"model":options.models.ConstantList_Model})
	);	

}
extend(ConstantList_View,ViewAjx);
