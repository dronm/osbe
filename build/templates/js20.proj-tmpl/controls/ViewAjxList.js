/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2017

 * @extends ViewAjx
 * @requires core/extend.js
 * @requires ViewAjx.js     

 * @class
 * @classdesc
 
 * @param {string} id - Object identifier
 * @param {Object} options
 * @param {bool} options.modalSelect
 */
function ViewAjxList(id,options){
	options = options || {};	
	
	var self = this;
	if (window.onSelect || options.modalSelect){//standalone OR modal window		
		//list for selection in a standalone or modal window
		options.cmdSelect = (options.cmdSelect!=undefined)? options.cmdSelect:true;
		if ( options.controlSelect ||  options.cmdSelect){
			this.setControlSelect(options.controlSelect || new ButtonMakeSelection(id+":cmdSelect",
				{"onClick":function(){
					var list = self.getElements();
					var res = false;
					for (var id in list){
						if (list[id].onSelect){
							list[id].onSelect();
							res = true;
							break;
						}
					}
					window.closeResult = res;
					window.close();									
				}
			})
			);
		}

		options.cmdCancel = (options.cmdCancel!=undefined)? options.cmdCancel:true;
		if ( options.controlCancel ||  options.cmdCancel){
			this.setControlCancel(options.controlCancel || new ButtonCancel(id+":cmdCancel",{
				"onClick":function(){
					window.closeResult = false;
					window.close();				
				}
			})
			);		
		}
	
		//commands
		if (options.commandContainer || options.commandElements || options.cmdSelect || options.cmdCancel){
			this.m_commandContainer = options.commandContainer || new ControlContainer(id+":cmd-cont","DIV",{"elements":options.commandElements});
		}
		
	}
	
	ViewAjxList.superclass.constructor.call(this,id,options);
	
	this.addControls();
}
extend(ViewAjxList,ViewAjx);

/* Constants */


/* private members */
ViewAjxList.prototype.m_controlCancel;
ViewAjxList.prototype.m_controlSelect;

ViewAjxList.prototype.m_onClose;
ViewAjxList.prototype.m_commandContainer;


/* protected*/
ViewAjxList.prototype.addControls = function(){
	if (this.m_commandContainer){
		if (this.m_controlSelect) this.m_commandContainer.addElement(this.m_controlSelect);
		if (this.m_controlCancel) this.m_commandContainer.addElement(this.m_controlCancel);	
	}
}



/* public methods */
ViewAjxList.prototype.toDOM = function(parent){
	ViewAjxList.superclass.toDOM.call(this,parent);
	
	if (this.m_commandContainer)this.m_commandContainer.toDOM(parent);
	
}

ViewAjxList.prototype.delDOM = function(){
	if (this.m_commandContainer)this.m_commandContainer.delDOM();
	ViewAjxList.superclass.delDOM.call(this);	
}


ViewAjxList.prototype.setControlSelect = function(v){
	this.m_controlSelect = v;
}
ViewAjxList.prototype.getControlSelect = function(){
	return this.m_controlSelect;
}

ViewAjxList.prototype.setControlCancel = function(v){
	this.m_controlCancel = v;
}
ViewAjxList.prototype.getControlCancel = function(){
	return this.m_controlCancel;
}

