/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2017

 * @extends EditPeriodDate
 * @requires core/extend.js
 * @requires consols/EditPeriodDate.js     

 * @class
 * @classdesc
 
 * @param {string} id - Object identifier
 * @param {object} options
 */
function EditPeriodDateTime(id,options){
	options = options || {};	
	options.editClass = EditDateTime;
	
	EditPeriodDateTime.superclass.constructor.call(this,id,options);
}
extend(EditPeriodDateTime,EditPeriodDate);

/* Constants */


/* private members */

/* protected*/


/* public methods */

