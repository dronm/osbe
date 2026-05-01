/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2017

 * @extends ControlContainer
 * @requires core/extend.js
 * @requires ControlContainer.js     

 * @class
 * @classdesc
 
 * @param {string} id - Object identifier
 * @param {Object} options
 * @param {int} [options.keyLength=DEF_KEYLENGTH]
 * @param {Control} [options.errorControl=ErrorControl]
 * @param {object} options.keyEvents
 * @param {string} options.captchaId 
 */
function Captcha(id,options){
	options = options || {};	
	
	options.required = true;
	
	this.m_keyLength = options.keyLength || this.DEF_KEYLENGTH;
	this.m_captchaId = options.captchaId;
	this.m_captchaWidth = options.captchaWidth;
	this.m_captchaHeight = options.captchaHeight;
	this.m_captchaCount = options.captchaCount;
	
	self = this;
	options.addElement = function(){
		this.addElement(new ButtonCtrl(id+":refresh",{
			"title":self.REFRESH_TITLE,
			"onClick":(function(cont){
				return function(){
					cont.refresh();
				}
			})(self)
		}));
		this.addElement(new Control(id+":imgCont","SPAN"));
		options.keyEvents = options.keyEvents || {};
		options.keyEvents.input = options.keyEvents.input || function(){
			//var n = self.getElement("key").getNode();
			if(DOMHelper.hasClass(this.getNode(), self.INCORRECT_VAL_CLASS)){
				self.setValid();
			}
		}
		this.addElement(new Control(id+":key","INPUT",{			
			"attrs":{
				"required":"required",
				"type":"text",
				"maxlength":self.m_keyLength,
				"title":self.KEY_TITLE,
				"placeholder":self.KEY_PLACEHOLDER
				
			},
			"events": options.keyEvents
		}));
		self.setErrorControl((options.errorControl!==undefined)? options.errorControl: ((self.m_html)? null:new ErrorControl(self.getId()+":error")) );
		this.addElement(self.getErrorControl());		
	}
	
	Captcha.superclass.constructor.call(this,id,"DIV",options);
	
}
extend(Captcha,ControlContainer);

/* Constants */
Captcha.prototype.DEF_KEYLENGTH = 6;
Captcha.prototype.INCORRECT_VAL_CLASS="error";

/* private members */
Captcha.prototype.m_keyLength;

/* protected*/


/* public methods */
Captcha.prototype.toDOM = function(parent){
	Captcha.superclass.toDOM.call(this,parent);
	this.refresh();
}

Captcha.prototype.setErrorControl = function(v){
	this.m_errorControl = v;
}
Captcha.prototype.getErrorControl = function(){
	return this.m_errorControl;
}

Captcha.prototype.getModified = function(){
	return true;
}

Captcha.prototype.setFromResp = function(resp){
	var m = new ModelObjectXML("Captcha_Model",{
		"fields":["img"],
		"data":resp.getModelData("Captcha_Model")
	});
	//CommonHelper.md5(
	var b64 = m.getFieldValue("img");
	var n_cont = this.getElement("imgCont").getNode();
	DOMHelper.delAllChildren(n_cont);	
	var img = document.createElement("IMG");
	img.setAttribute("src", "data:image;base64,"+b64);
	n_cont.appendChild(img);
	this.getElement("imgCont").toDOM();
	this.m_i++;
	this.reset();
}

Captcha.prototype.refresh = function(){
	if(!this.getEnabled()){
		return;
	}
	this.getElement("refresh").setEnabled(false);
	var self = this;
	var pm = (new Captcha_Controller()).getPublicMethod("get");
	if(this.m_captchaId){
		pm.setFieldValue("id", this.m_captchaId);
	}
	if(pm.fieldExists("width")){
		pm.setFieldValue("width", this.m_captchaWidth);
		pm.setFieldValue("height", this.m_captchaHeight);
		pm.setFieldValue("count", this.m_captchaCount);
	}
	pm.run({
		"ok":function(resp){
			self.setFromResp(resp);
		},
		"fail":function(resp,errCode,errStr){
			self.getErrorControl().setValue(errStr);
		},
		"all":function(){
			self.getElement("refresh").setEnabled(true);
		}
	});
}

Captcha.prototype.getValue = function(){
	var v = this.getElement("key").getNode().value;
	return (!v || !v.length)? null:v;
}

Captcha.prototype.reset = function(){
	this.getElement("key").getNode().value = "";
}

Captcha.prototype.setValid = function(){
	DOMHelper.delClass(this.getElement("key").getNode(),this.INCORRECT_VAL_CLASS);
	this.getErrorControl().clear();
}

Captcha.prototype.setNotValid = function(str){
	DOMHelper.addClass(this.getElement("key").getNode(), this.INCORRECT_VAL_CLASS);
	this.getErrorControl().setValue(str);
}

Captcha.prototype.validate = function(){
	var v = this.getValue();
	if(!v || v.length != this.m_captchaCount){
		this.setNotValid(Validator.prototype.ER_EMPTY);
		return false;
	}
	return true;
}


