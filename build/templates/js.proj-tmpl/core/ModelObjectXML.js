/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016
 
 * @class
 * @classdesc

 * @requires core/extend.js
 * @requires core/ModelXML.js   
 
 * @param {string} id
 * @param {namespace} options
 */
function ModelObjectXML(id,options){
	ModelObjectXML.superclass.constructor.call(this,id,options);
}
extend(ModelObjectXML,ModelXML);

ModelObjectXML.prototype.setData = function(data){
	ModelObjectXML.superclass.setData.call(this,data);
	
	this.getNextRow();
}
