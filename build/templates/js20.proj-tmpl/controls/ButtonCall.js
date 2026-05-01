/**
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016
 
 * @class
 * @classdesc button for making a telephone call

 * @extends ButtonCtrl 

 * @requires core/extend.js
 * @requires controls/ButtonCtrl.js
 * @requires controllers/Caller_Controller.js          
  
 * @param {string} id - html tag id
 * @param {namespase} options
 * @param {string} options.tel
 * @param {string} options.telExt
 * @param {function} options.onClick
 * @param {function} options.onConnected ServResp object is passed to this caller
 */
function ButtonCall(id,options){
	options = options || {};
	
	options.glyph = "glyphicon-earphone";
	
	this.m_tel = options.tel;
	this.m_telExt = options.telExt;
	this.m_onConnected = options.onConnected;
	
	var self = this;
	options.onClick = options.onClick || function(){
		self.onClick();
	};
	
	ButtonCall.superclass.constructor.call(this,id,options);
}
extend(ButtonCall,ButtonCtrl);

ButtonCall.prototype.m_tel;
ButtonCall.prototype.m_telExt;
ButtonCall.prototype.m_onConnected;

ButtonCall.prototype.onClick = function(){
	if (this.m_tel && this.m_telExt){
		if (this.m_tel==""){
			throw new Error(this.ER_NO_TEL);
		}
		var contr = new Caller_Controller();
		var pm = contr.getPublicMethod("call");
		pm.setFieldValue("tel",this.m_tel);
		pm.setFieldValue("ext",this.m_telExt);
		var self = this;
		pm.run({
			"ok":function(resp){
				self.m_onConnected(resp);
			}
		});
	}
}
