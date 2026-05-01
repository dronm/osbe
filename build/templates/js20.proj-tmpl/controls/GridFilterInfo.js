/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2018

 * @extends ControlContainer
 * @requires core/extend.js
 * @requires controls/ControlContainer.js     

 * @class
 * @classdesc
 
 * @param {string} id - Object identifier
 * @param {object} options
 */
function GridFilterInfo(id,options){
	options = options || {};	
	
	GridFilterInfo.superclass.constructor.call(this,id,"DIV",options);
}
//ViewObjectAjx,ViewAjxList
extend(GridFilterInfo,ControlContainer);

/* Constants */


/* private members */

/* protected*/


/* public methods */

GridFilterInfo.prototype.addFilter = function(filter){
//console.log("GridFilterInfo.prototype.addFilter")
//console.log("filter.id="+filter.id)
	if (this.elementExists(filter.id)){
		this.delElement(filter.id);
	}
	this.addElement(new ControlContainer(this.getId()+":"+filter.id,"SPAN",{
		"elements":[
			new Control(null,"SPAN",{"value":filter.descr}),
			new Control(null,"SPAN",{"value":"×","events":{
				"click":function(){
					alert("Reset filter")
				}
			}})
		]
	}));
	this.toDOM();
}
