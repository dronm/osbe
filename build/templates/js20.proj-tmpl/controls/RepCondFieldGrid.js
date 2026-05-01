/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2019

 * @extends RepFieldGrid
 * @requires core/extend.js
 * @requires controls/RepFieldGrid.js     

 * @class
 * @classdesc
 
 * @param {string} id - Object identifier
 * @param {object} options
 */
function RepCondFieldGrid(id,options){
	options = options || {};	
	
	RepCondFieldGrid.superclass.constructor.call(this,id,options);
}
//ViewObjectAjx,ViewAjxList
extend(RepCondFieldGrid,RepFieldGrid);

/* Constants */


/* private members */

/* protected*/


/* public methods */

