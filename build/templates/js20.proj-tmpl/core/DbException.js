/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2018

 * @requires core/App.js
 * @requires core/AppWin.js
 * @requires core/CommonHelper.js   

 * @class
 * @classdesc Fatal exception. Modal window on screen center. 
 *	04/05/22 - trying to reconnect, if sicceeded hide error window from screen
 
 * @param {object} options
 * @param {int} options.code - Exception identifier
 * @param {string} options.message - Exception identifier   
 */
 
 //@ToDo: resume connection - hide window
function DbException(options){
	options.cmdOk = true;
	DbException.superclass.constructor.call(this,options);
}
extend(DbException,FatalException);

DbException.prototype.TEMPLATE_ID = "DbException";

