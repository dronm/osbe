/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2019

 * @extends EditJSON
 * @requires core/extend.js
 * @requires controls/EditJSON.js     

 * @class
 * @classdesc
 
 * @param {string} id - Object identifier
 * @param {object} options
 
 */
function WindowMessageStyleCtrl(id,options){
	options = options || {};	
	
	var self = this;
	options.addElement = function(){
		var app = window.getApp();
		this.addElement(new EditRadioGroup(id+":win_position",{
			"elements":[
				new EditRadio(id+":win_position:overlap",{
					"name":id+":win_position",
					"value":"overlap",
					"labelCaption":self.WIN_POS_OVERLAP_LAB_CAPION,
					"title":self.WIN_POS_OVERLAP_TITLE,
					"contClassName":window.getBsCol(4),
					"labelClassName":"control-label "+window.getBsCol(6),
					"checked":(app.WIN_MES_POS_DEF=="overlap")
				})
				,new EditRadio(id+":win_position:stick",{
					"name":id+":win_position",
					"value":"stick",
					"labelCaption":self.WIN_POS_STICK_LAB_CAPION,
					"title":self.WIN_POS_STICK_TITLE,
					"contClassName":window.getBsCol(4),
					"labelClassName":"control-label "+window.getBsCol(8),
					"checked":(app.WIN_MES_POS_DEF=="stick")
				})						
			],
			"events":{
				"change":function(){
					self.valueChanged.call(self);
				}
			}											
			
		}
		));
	
		this.addElement(new EditNum(id+":win_width",{
			"labelCaption":self.WIN_WIDTH_LAB_CAPION,
			"title":self.WIN_WIDTH_TITLE,
			"placeholder":self.WIN_WIDTH_PLACEHOLDER,
			"value":app.WIN_MES_WIDTH_DEF,
			"events":{
				"keyup":function(){
					self.valueChanged.call(self);
				}
			}											
		}
		));
	}
	WindowMessageStyleCtrl.superclass.constructor.call(this,id,options);
}

extend(WindowMessageStyleCtrl,EditJSON);

/* Constants */

/* private members */

/* protected*/


/* public methods */

