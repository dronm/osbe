/* Copyright (c) 2012 
	Andrey Mikhalevich, Katren ltd.
*/
/*	
	Description
*/
//ф
/** Requirements
 * @requires controls/View.js
*/

/* constructor */
function ViewInlineGridEdit(id,options){
	options = options || {};
	options.tagName = options.tagName || this.DEF_TAG_NAME;
	this.m_tagName = options.tagName;	
	
	ViewInlineGridEdit.superclass.constructor.call(this,
		id,options);	
	
	this.m_containerClassName = options.containerClassName||"input-group";
	
	if (options.onClose){		
		this.setOnClose(options.onClose);
	}		
	var self = this;
	var onOk = function(){
		self.writeData();
		if (self.m_lastWriteResult){
			self.getOnClose().call(self,1);
		}
	}
	var onCancel = function(){
		self.setWriteMethodId((self.getIsNew())? self.m_insertMethId:self.m_updateMethId);
		if (self.getModified()){
			WindowQuestion.show({
				text:"Сохранить изменения?",
				yes:true,
				cancel:true,
				no:true,
				timeout:30000,
				winObj:this.m_winObj,
				callBack:function(res){
					if (res==WindowQuestion.RES_YES){
						self.onClickOk();
					}
					else if (self.getOnClose){
						self.getOnClose().call(self,0);
					}				
				}
			});
		}
		else{
			self.getOnClose().call(self,0);
		}
		
	}
	
	this.m_ctrlOk = new ButtonCmd(id+"btnOk",		
		{"caption":"ОК",
		"onClick":onOk,
		"attrs":{
			"title":"записать"}
		});
	this.m_ctrlCancel = new ButtonCmd(id+"btnCancel",
		{"caption":"Отмена",
		"onClick":onCancel,
		"attrs":{
			"title":"отмена"}
		});
	this.m_ctrlContainer = new ControlContainer(null,(this.m_tagName=="tr")? "td":this.m_tagName);
	this.m_ctrlContainer.setElementById("ok",this.m_ctrlOk);
	this.m_ctrlContainer.setElementById("cancel",this.m_ctrlCancel);
	
	this.setIsNew(true);
	this.m_insertMethId = options.insertMethodId || this.DEF_INSERT_METH_ID;
	this.m_updateMethId = options.updateMethodId || this.DEF_UPDATE_METH_ID;	
	this.setReadMethodId(options.readMethodId || this.DEF_READ_METH_ID);
	
	this.m_dataControls = [];
}
extend(ViewInlineGridEdit,View);

ViewInlineGridEdit.prototype.m_isNew;
ViewInlineGridEdit.prototype.m_insertMethId;
ViewInlineGridEdit.prototype.m_updateMethId;
//
ViewInlineGridEdit.prototype.m_onClose;
ViewInlineGridEdit.prototype.m_ctrlOk;
ViewInlineGridEdit.prototype.m_ctrlCancel;
ViewInlineGridEdit.prototype.m_ctrlContainer;
ViewInlineGridEdit.prototype.m_tagName;
//
ViewInlineGridEdit.prototype.DEF_INSERT_METH_ID = 'insert';
ViewInlineGridEdit.prototype.DEF_UPDATE_METH_ID = 'update';
ViewInlineGridEdit.prototype.DEF_READ_METH_ID = "get_object";
ViewInlineGridEdit.prototype.DEF_TAG_NAME = "tr";

ViewInlineGridEdit.prototype.m_dataControls;
//
ViewInlineGridEdit.prototype.getOnClose = function(){
	return this.m_onClose;
}
ViewInlineGridEdit.prototype.setOnClose = function(onClose){
	this.m_onClose = onClose;
}

ViewInlineGridEdit.prototype.getIsNew = function(){
	return this.m_isNew;
}
ViewInlineGridEdit.prototype.setIsNew = function(isNew){
	this.m_isNew = isNew;
}

ViewInlineGridEdit.prototype.toDOM = function(parent,replacedNode){
	var elem;
	for (var elem_id in this.m_elements){
		elem = this.m_elements[elem_id];
		elem.toDOM(this.m_node);
	}
	//sys column
	this.m_ctrlContainer.toDOM(this.m_node);
	
	if (replacedNode){
		parent.replaceChild(this.m_node,replacedNode);
	}
	else{
		var rows = parent.getElementsByTagName(this.m_node.nodeName);
		if (rows.length==0){
			parent.appendChild(this.m_node);
		}
		else{			
			parent.insertBefore(this.m_node,rows[0]);
		}
	}
	//this.m_ctrlOk.toDOM(parent);
	//this.m_ctrlCancel.toDOM(parent);	
		
	//setting focus
	for (var bind in this.m_bindings){
		if (this.m_bindings[bind].options==undefined ||
		!this.m_bindings[bind].options.autoFillOnInsert){
			this.m_bindings[bind].control.m_node.focus();
			break;
		}
	}
	
}

ViewInlineGridEdit.prototype.removeDOM = function(){		
	//this.m_ctrlOk.removeDOM();
	//this.m_ctrlCancel.removeDOM();
	this.m_ctrlContainer.removeDOM();
	ViewInlineGridEdit.superclass.removeDOM.call(this);
}
ViewInlineGridEdit.prototype.readData = function(async,isCopy){
	this.m_isCopy = (isCopy==undefined)? false:isCopy;
	this.setIsNew(this.m_isCopy);
	ViewInlineGridEdit.superclass.readData.call(this,async);
}
ViewInlineGridEdit.prototype.onGetData = function(resp){
	ViewInlineGridEdit.superclass.onGetData.call(this,resp,this.m_isCopy);	
	//???clean autoinc fields???	
	if (this.m_isCopy){		
		if (this.afterCopyData){
			this.afterCopyData();
		}
	}	
}
ViewInlineGridEdit.prototype.getWriteMethodId = function(){
	return (this.getIsNew()||this.m_isCopy)? this.m_insertMethId:this.m_updateMethId;
}

ViewInlineGridEdit.prototype.writeData = function(){
	this.setWriteMethodId((this.getIsNew())? this.m_insertMethId:this.m_updateMethId);
	ViewInlineGridEdit.superclass.writeData.call(this);
}
ViewInlineGridEdit.prototype.setReadIdValue = function(fieldId,value){
	this.getReadController().getPublicMethodById(this.getReadMethodId()).setParamValue(fieldId,value);
}
ViewInlineGridEdit.prototype.addDataControl = function(control,readBind,writeBind,options){
	var container = new ControlContainer(uuid(),"div",{
		className:this.m_containerClassName
	});	
	
	this.m_dataControls[control.getId()] = control;
	
	var container_td = new ControlContainer(uuid(),"td");	
	container_td.setVisible(control.getVisible());
	container_td.setEnabled(control.getEnabled());	
	//this.setElementById("cont"+control.getId(),container_td);
	container_td.addElement(container);
	
	container.addElement(control);
	this.bindControl(control,readBind,writeBind,options);
	
	this.addElement(container_td);
}
