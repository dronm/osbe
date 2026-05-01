/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2019

 * @extends GridCell
 * @requires controls/GridCell.js

 * @class
 * @classdesc
 
 * @param {Object} options
 */
function GridCellPhone(id,options){
	options = options || {};	

	this.m_telExt = options.telExt;
	this.m_onConnected = options.onConnected;
	
	GridCellPhone.superclass.constructor.call(this,id,options);
}
extend(GridCellPhone,GridCell);

/* Constants */


/* private members */

/* protected*/


/* public methods */
GridCellPhone.prototype.toDOM = function(parent){
	var self = this;
	this.m_cont = new Control(null,"A",{
		"value":this.getFormattedValue(),
		"attrs":{"tel":this.getValue()},
		"title":this.TITLE,
		"events":{
			"click":function(){
				window.getApp().makeCall(self.m_cont.getAttr("tel"));
				//alert("Calling...")
				/*
				if(!window.Caller_Controller){
					throw new Error(self.CONTROLLER_NOT_DEFIND);
				}
				var pm = (new Caller_Controller()).getPublicMethod("call");
				pm.setFieldValue("tel",self.m_cont.getAttr("tel"));
				pm.run({
					"ok":function(resp){
						window.showTempNote("Пытаемся позвонить на номер: "+self.m_cont.getAttr("tel"),null,10000);
					}
				})
				*/
			}
		}
	});
	this.setValue("");
	GridCellPhone.superclass.toDOM.call(this,parent);
	this.m_cont.toDOM(this.m_node);
	/*	
	
	//console.log(this.getValue())
	this.m_callControl = new ButtonCall(this.getId()+":btnCall",{
		"tel":this.getValue(),
		"telExt":this.m_telExt,
		"onConnected":function(){
			if(self.m_onConnected){
				self.m_onConnected();
			}
			else{
				window.showNote("Соединение установлено");
			}
		}
	});
	this.m_callControl.toDOM(this.getNode());
	*/
}

/*
GridCellPhone.prototype.delDOM = function(){
	this.m_callControl.delDOM();
	
	GridCellPhone.superclass.delDOM.call(this);
}
*/

