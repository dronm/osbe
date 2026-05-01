/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2018

 * @extends Control
 * @requires core/extend.js
 * @requires controls/Control.js     

 * @class
 * @classdesc
 
 * @param {string} id - Object identifier
 * @param {object} options
 */
function Uploader(id,options){
	options = options || {};	
	
	options.tagName = options.tagName || this.DEF_TAG_NAME;
	
	var self = this;
	
	this.m_button = options.button || new Button(id+":btn",{
		"caption":options.buttonCaption,
		"title":options.buttonTitle,
		"glyph":options.buttonGlyph,
		"onClick":function(){
			self.addFiles();
		}
	});
	
	Uploader.superclass.constructor.call(this,id,options.tagName,options);
}
//ViewObjectAjx,ViewAjxList
extend(Uploader,Control);

/* Constants */
Uploader.prototype.DEF_TAG_NAME = "DIV";

/* private members */
Uploader.prototype.m_button;
Uploader.prototype.m_fileContainer;

/* protected*/


/* public methods */

Uploader.prototype.toDOM = function(parent){
	Uploader.superclass.toDOM.call(this,parent);
	
	this.m_button.toDOM(this.m_node);
	
	this.m_fileContainer.toDOM(this.m_node);
}
