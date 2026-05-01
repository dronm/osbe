/* Copyright (c) 2016
 *	Andrey Mikhalevich, Katren ltd.
 */
function UserProfile_View(id,options){	

	options = options || {};
	
	options.cmdOk = false;
	options.cmdCancel = false;
	
	UserProfile_View.superclass.constructor.call(this,id,options);
		
	var self = this;

	this.addElement(new HiddenKey(id+":id"));	
	
	this.addElement(new UserNameEdit(id+":name",{
		"events":{
			"keyup":function(){
				self.getControlSave().setEnabled(true);
			}
		}
		
	}));	

	this.addElement(new EditPassword(id+":pwd",{
		"labelCaption":"Пароль:",
		"events":{
			"keyup":function(){
				self.checkPass();	
			}
		}
	}));	
	this.addElement(new EditPassword(id+":pwd_confirm",{
		"labelCaption":"Подтверждение пароля:",
		"events":{
			"keyup":function(){
				self.checkPass();	
			}
		}
	}));	

	this.addElement(new EditEmail(id+":email",{
		"labelCaption":"Эл.почта:",
		"events":{
			"keyup":function(){
				self.getControlSave().setEnabled(true);
			}
		}		
	}));	

	//****************************************************
	var contr = new User_Controller();
	
	//read
	this.setReadPublicMethod(contr.getPublicMethod("get_object"));
	this.m_model = options.models.UserDialog_Model;
	
	this.setDataBindings([
		new DataBinding({"control":this.getElement("id"),"model":this.m_model}),
		new DataBinding({"control":this.getElement("name"),"model":this.m_model}),
		new DataBinding({"control":this.getElement("email"),"model":this.m_model})
	]);
	
	//write
	this.setController(contr);
	this.getCommand(this.CMD_OK).setBindings([
		new CommandBinding({"control":this.getElement("id")}),
		new CommandBinding({"control":this.getElement("name")}),
		new CommandBinding({"control":this.getElement("email")}),
		new CommandBinding({"control":this.getElement("phone_cel")})
	]);
	
	this.getControlSave().setEnabled(false);
}
extend(UserProfile_View,ViewObjectAjx);


UserProfile_View.prototype.TXT_PWD_ER = "Пароли не совпадают";


UserProfile_View.prototype.checkPass = function(){
	var pwd = this.getElement("pwd").getValue();
	if (pwd && pwd.length){
		var pwd_conf = this.getElement("pwd_confirm").getValue();
		if (pwd_conf && pwd_conf.length && pwd!=pwd_conf){
			this.getElement("pwd_confirm").setNotValid(this.TXT_PWD_ER);
			this.getControlSave().setEnabled(false);
		}
		else if (pwd_conf && pwd_conf.length){
			this.getElement("pwd_confirm").setValid();
			if (!this.getControlSave().getEnabled()){
				this.getControlSave().setEnabled(true);
			}
		}
		else if ((!pwd_conf || !pwd_conf.length) && this.getControlSave().getEnabled()){
			this.getControlSave().setEnabled(false);
		}
	}
}

/*
UserProfile_View.prototype.onSaveOk = function(resp){
	UserProfile_View.superclass.onSaveOk.call(this,resp);
	
	window.showNote(this.NOTE_DATA_SAVED,null,3000);
}
*/
