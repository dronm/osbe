/**
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016
 
 * @class
 * @classdesc
	
 * @param {string} id view identifier
 * @param {namespace} options
 * @param {namespace} options.models All data models
 * @param {namespace} options.variantStorage {name,model}
 */	
function MailForSending_View(id,options){	

	options = options || {};
	
	options.enabled = false;
	options.controller = new MailForSending_Controller();
	options.model = options.models.MailForSending_Model;
	
	MailForSending_View.superclass.constructor.call(this,id,options);
		
	var self = this;

	this.addElement(new EditString(id+":from_addr",{
		"labelCaption":"Адрес отправителя:"
	}));	

	this.addElement(new EditDateTime(id+":date_time",{
		"labelCaption":"Дата создания:"
	}));	

	this.addElement(new EditString(id+":from_name",{
		"labelCaption":"Имя отправителя:"
	}));	

	this.addElement(new EditString(id+":to_addr",{
		"labelCaption":"Адрес получателя:"
	}));	
	this.addElement(new EditString(id+":to_name",{
		"labelCaption":"Имя получателя:"
	}));	

	this.addElement(new EditString(id+":reply_addr",{
		"labelCaption":"Адрес для ответа:"
	}));	

	this.addElement(new EditString(id+":reply_name",{
		"labelCaption":"Имя для ответа:"
	}));	

	this.addElement(new EditString(id+":subject",{
		"labelCaption":"Тема:"
	}));	

	this.addElement(new EditText(id+":body",{
		"labelCaption":"Тело:"
	}));	

	this.addElement(new EditCheckBox(id+":sent",{
		"labelCaption":"Отправлено:"
	}));	
	
	this.addElement(new EditDateTime(id+":sent_date_time",{
		"labelCaption":"Дата отправки:"
	}));	
	
	//****************************************************	
	
	//read
	//this.setReadPublicMethod(options.controller.getPublicMethod("get_object"));	
	
	this.setDataBindings([
		new DataBinding({"control":this.getElement("from_addr")})
		,new DataBinding({"control":this.getElement("date_time")})
		,new DataBinding({"control":this.getElement("from_name")})
		,new DataBinding({"control":this.getElement("to_addr")})
		,new DataBinding({"control":this.getElement("to_name")})
		,new DataBinding({"control":this.getElement("rely_addr")})
		,new DataBinding({"control":this.getElement("rely_name")})
		,new DataBinding({"control":this.getElement("subject")})
		,new DataBinding({"control":this.getElement("body")})
		,new DataBinding({"control":this.getElement("sent")})
		,new DataBinding({"control":this.getElement("sent_date_time")})
		
	]);	
	
	this.setWriteBindings([
		new CommandBinding({"control":this.getElement("from_addr")})
		,new CommandBinding({"control":this.getElement("date_time")})
		,new CommandBinding({"control":this.getElement("from_name")})
		,new CommandBinding({"control":this.getElement("to_addr")})
		,new CommandBinding({"control":this.getElement("to_name")})
		,new CommandBinding({"control":this.getElement("rely_addr")})
		,new CommandBinding({"control":this.getElement("rely_name")})
		,new CommandBinding({"control":this.getElement("subject")})
		,new CommandBinding({"control":this.getElement("body")})
		,new CommandBinding({"control":this.getElement("sent")})
		,new CommandBinding({"control":this.getElement("sent_date_time")})
	]);
	
}
extend(MailForSending_View,ViewObjectAjx);
