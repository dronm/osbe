/**
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016
 
 * @class
 * @classdesc
	
 * @param {string} id view identifier
 * @param {namespace} options
 * @param {namespace} options.models All data models
 * @param {namespace} options.variantStorage {name,model}
 */	
function MainMenuConstructor_View(id,options){	

	options = options || {};
	
	MainMenuConstructor_View.superclass.constructor.call(this,id,options);
		
	var self = this;

	this.addElement(new HiddenKey(id+":id"));	
	
	this.addElement(new Enum_role_types(id+":role",{
		"labelCaption":"Роль:"
	}));	

	this.addElement(new UserEditRef(id+":user",{
		"labelCaption":"Пользователь:"
	}));	
	
	this.addElement(new MainMenuTree(id+":content"));
	//this.addElement(new EditText(id+":content"));		

	//****************************************************
	var contr = new MainMenuConstructor_Controller();
	
	//read
	this.setReadPublicMethod(contr.getPublicMethod("get_object"));
	this.m_model = (options.models&&options.models.MainMenuConstructorDialog_Model)? options.models.MainMenuConstructorDialog_Model : new MainMenuConstructorDialog_Model();
	this.setDataBindings([
		new DataBinding({"control":this.getElement("id")}),
		new DataBinding({"control":this.getElement("content")}),
		new DataBinding({"control":this.getElement("role"),"fieldId":"role_id"}),
		new DataBinding({"control":this.getElement("user"),"keyIds":["user_id"],"fieldId":"user_descr"})
	]);
	
	//write
	this.setController(contr);
	this.getCommand(this.CMD_OK).setBindings([
		new CommandBinding({"control":this.getElement("id")}),
		new CommandBinding({"control":this.getElement("content"),"fieldId":"content"}),
		new CommandBinding({"control":this.getElement("role"),"fieldId":"role_id"}),
		new CommandBinding({"control":this.getElement("user"),"fieldId":"user_id"})
	]);
}
extend(MainMenuConstructor_View,ViewObjectAjx);

