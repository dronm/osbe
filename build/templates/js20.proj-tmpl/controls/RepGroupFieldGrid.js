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
function RepGroupFieldGrid(id,options){
	options = options || {};	
	
	RepGroupFieldGrid.superclass.constructor.call(this,id,options);
}
//ViewObjectAjx,ViewAjxList
extend(RepGroupFieldGrid,RepFieldGrid);

/* Constants */


/* private members */

/* protected*/


/* public methods */

