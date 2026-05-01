/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016

 * @class
 * @classdesc
 
 * @param {object} options
 * @param {string} options.id
 * @param {Control} options.control
 * @param {publicMethod} options.publicMethod
 * @param {array} options.bindings
 * @param {bool} options.async   
 */
function Command(id,options){
	if (typeof(id)=="object"){
		options = id;
		if (!options.id){
			options.id = options.publicMethod.getId();
		}
	}
	else{
		options = options || {};	
		options.id = id;
	}
	
	this.setId(options.id);
	this.setControl(options.control);
	this.setPublicMethod(options.publicMethod);
	this.setBindings(options.bindings || []);
	this.setAsync(options.async);
}

/* Constants */


/* private members */
Command.prototype.m_id;
Command.prototype.m_control;
Command.prototype.m_publicMethod;
Command.prototype.m_bindings;
Command.prototype.m_async;

/* protected*/


/* public methods */
Command.prototype.getPublicMethod = function(){
	return this.m_publicMethod;
}

Command.prototype.setPublicMethod = function(v){
	this.m_publicMethod = v;
}

Command.prototype.getBindings = function(){
	return this.m_bindings;
}

Command.prototype.setBindings = function(v){
	this.m_bindings = v;
}

Command.prototype.addBinding = function(binding){
	this.m_bindings.push(binding);
}

Command.prototype.getAsync = function(){
	return this.m_async;
}

Command.prototype.setAsync = function(v){
	this.m_async = v;
}

Command.prototype.getControl = function(){
	return this.m_control;
}

Command.prototype.setControl = function(v){
	this.m_control = v;
}


Command.prototype.getId = function(){
	return this.m_id;
}
Command.prototype.setId = function(v){
	this.m_id = v;
}

Command.prototype.run = function(opts){
	this.m_publicMethod.run(opts);
}
