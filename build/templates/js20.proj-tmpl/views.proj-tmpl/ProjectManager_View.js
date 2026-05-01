/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2017

 * @extends View
 * @requires core/extend.js
 * @requires controls/View.js     

 * @class
 * @classdesc
 
 * @param {string} id - Object identifier
 * @param {Object} options
 * @param {string} options.className
 */
function ProjectManager_View(id,options){
	options = options || {};	
	
	options.addElement = function(){
		this.addElement(new ButtonCmd(id+":apply_patch",{
			"caption":"Установить обновление",
			"onClick":function(){
				(new ProjectManager_Controller()).getPublicMethod("apply_patch").run({
					"ok":function(resp){
					
					}
				})
			}
		}));
		this.addElement(new ButtonCmd(id+":apply_sql",{
			"caption":"Выполнить скрипты sql",
			"onClick":function(){
				(new ProjectManager_Controller()).getPublicMethod("apply_sql").run({
					"ok":function(resp){
					
					}
				})
			}
		}));		
	}
	
	ProjectManager_View.superclass.constructor.call(this,id,options);
}
extend(ProjectManager_View,View);

/* Constants */


/* private members */

/* protected*/


/* public methods */

