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
function ViewDialog(id,options){
	options = options || {};
	options.errorControl = options.errorControl ||
		new ErrorControl(id+"_errors");
		
	options.tagName=options.tagName||"form";
	options.className = "form-horizontal";
	
	options.readMethodId = options.readMethodId || this.DEF_READ_METH_ID;
	options.writeController = options.writeController || options.readController;
	
	options.formWidth = 1000;
	options.formHeight = 1000;
	
	ViewDialog.superclass.constructor.call(this,
		id,options);	
	if (options.onClose){
		this.setOnClose(options.onClose);
	}
	if (options.noWaitControl==undefined||options.waitControl==false){
		this.m_waitControl = new WaitControl(id);
	}
	
	var self = this;
	if (options.noOk==undefined||(options.noOk!=undefined&&options.noOk==false)){
		this.m_ctrlOk = new ButtonCmd(id+"btnOk",		
			{"caption":"ОК",
			"onClick":function(){
				self.onClickOk();
			},
			"attrs":{
				"title":"записать,закрыть"}
			});
	}
	/*
	if (options.noSave==undefined||(options.noSave!=undefined&&options.noSave==false)){
		this.m_ctrlSave = new ButtonCmd(id+"btnSave",
			{"caption":"Записать",
			"onClick":function(){
				self.onClickSave();
			},
			"attrs":{
				"title":"Записать"},
			"className":"viewBtn"
			});
	}
	*/
	if (options.noCancel==undefined||(options.noCancel!=undefined&&options.noCancel==false)){
		this.m_ctrlCancel = new ButtonCmd(id+"btnCancel",
			{"caption":"Закрыть",
			"onClick":function(){
				self.onCancel();
			},
			"attrs":{
				"title":"закрыть без сохранения"}
			});
	}
	this.setIsNew(true);
	this.m_insertMethId = options.insertMethodId || this.DEF_INSERT_METH_ID;
	this.m_updateMethId = options.updateMethodId || this.DEF_UPDATE_METH_ID;		
	
	//escape
	this.m_keyEvent = options.keyEvent || function(event){
		event = EventHandler.fixMouseEvent(event);
		var key_code = (event.charCode) ? event.charCode : event.keyCode;
		if (key_code==27){
			event.preventDefault();
			//event.stopPropagation();
		
			self.onCancel();
			return false;
		}
	};
	
	//history back
	/*this.m_backEvent = function(event){
		console.log("m_backEvent ")
		event.preventDefault();
		self.onCancel();
		return false;
	}*/
		
	this.m_customWriteMethod = options.customWriteMethod;
	
	this.m_cmdControls = options.cmdControls;
	
}
extend(ViewDialog,View);

ViewDialog.prototype.m_isNew;
ViewDialog.prototype.m_insertMethId;
ViewDialog.prototype.m_updateMethId;
//
ViewDialog.prototype.m_onClose;
ViewDialog.prototype.m_ctrlOk;
ViewDialog.prototype.m_ctrlSave;
ViewDialog.prototype.m_ctrlCancel;

//
ViewDialog.prototype.DEF_READ_METH_ID = 'get_object';
ViewDialog.prototype.DEF_INSERT_METH_ID = 'insert';
ViewDialog.prototype.DEF_UPDATE_METH_ID = 'update';
//
ViewDialog.prototype.getOnClose = function(){
	return this.m_onClose;
}
ViewDialog.prototype.setOnClose = function(onClose){
	this.m_onClose = onClose;
}

ViewDialog.prototype.getIsNew = function(){
	return this.m_isNew;
}
ViewDialog.prototype.setIsNew = function(isNew){
	this.m_isNew = isNew;
}

ViewDialog.prototype.toDOM = function(parent){
	ViewDialog.superclass.toDOM.call(this,parent);
	this.m_cmdContainer = new Control(null,"div",{"className":"view_cmd_cont"});
	
	if (this.m_waitControl){
		this.m_waitControl.toDOM(this.m_cmdContainer.m_node);
	}
	if (this.m_ctrlOk){
		this.m_ctrlOk.toDOM(this.m_cmdContainer.m_node);
	}
	if (this.m_ctrlSave){
		this.m_ctrlSave.toDOM(this.m_cmdContainer.m_node);
	}
	if (this.m_ctrlCancel){
		this.m_ctrlCancel.toDOM(this.m_cmdContainer.m_node);
	}
	if (this.m_cmdControls){
		if (is_array(this.m_cmdControls)){
			for (var i=0;i<this.m_cmdControls.length;i++){
				this.m_cmdControls[i].toDOM(this.m_cmdContainer.m_node);
			}					
		}
		else{
			for (var id in this.m_cmdControls){
				this.m_cmdControls[id].toDOM(this.m_cmdContainer.m_node);
			}		
		}
	}
	
	this.m_cmdContainer.toDOM(parent);
	if (this.m_keyEvent){
		EventHandler.addEvent(this.getWinObjDocum(),'keydown',this.m_keyEvent,false);
	}
	/*if(this.m_backEvent){
	console.log("Adding popstate")
		history.pushState({"a":1}, '');
		EventHandler.addEvent(this.getWinObjDocum(),'popstate',this.m_backEvent,false);	
	}*/
	
	this.m_node.scrollIntoView();
}
ViewDialog.prototype.removeDOM = function(){		
	if (this.m_waitControl){
		this.m_waitControl.removeDOM();
	}
	if (this.m_ctrlOk){
		this.m_ctrlOk.removeDOM();
	}
	if (this.m_ctrlSave){
		this.m_ctrlSave.removeDOM();
	}
	if (this.m_ctrlCancel){
		this.m_ctrlCancel.removeDOM();
	}
	if (this.m_cmdContainer){
		this.m_cmdContainer.removeDOM();
	}
	if (this.m_keyEvent){
		EventHandler.removeEvent(this.getWinObjDocum(),'keydown',this.m_keyEvent,false);
	}
	/*if(this.m_backEvent){
		console.log("removeEvent popstate")
		EventHandler.removeEvent(this.getWinObjDocum(),'popstate',this.m_backEvent,false);	
	}*/
	
	ViewDialog.superclass.removeDOM.call(this);
}
ViewDialog.prototype.readData = function(async,isCopy){

	this.m_isCopy = (isCopy==undefined)? false:isCopy;
	this.setIsNew(this.m_isCopy);
	ViewDialog.superclass.readData.call(this,async);	
	
	
	if (this.m_beforeOpen){		
		this.m_beforeOpen(this.getReadController(),false,isCopy);
	}
	
}

ViewDialog.prototype.onGetData = function(resp){
	ViewDialog.superclass.onGetData.call(this,resp,this.m_isCopy);	
	
	//???clean autoinc fields???	
	if (this.m_isCopy){
		
		if (this.afterCopyData){
			this.afterCopyData();
		}
	}	
}
ViewDialog.prototype.getWriteMethodId = function(){
	if (this.m_customWriteMethod){
		return this.m_writeMethodId;
	}
	else{
		return (this.getIsNew()||this.m_isCopy)? this.m_insertMethId:this.m_updateMethId;
	}
}

ViewDialog.prototype.setReadIdValue = function(fieldId,value){
	this.getReadController().getPublicMethodById(this.getReadMethodId()).setParamValue(fieldId,value);
}
ViewDialog.prototype.onWriteOk = function(resp){
	ViewDialog.superclass.onWriteOk.call(this,resp);
	
	if (this.getIsNew() && resp){
		//need return new serial id if any
		var contr = this.getWriteController();
		var meth_id = this.getWriteMethodId();
		var pm = contr.getPublicMethodById(meth_id);
		if (pm.paramExists(contr.PARAM_RET_ID)){			
			if (resp.modelExists("InsertedId_Model")){
				var model = resp.getModelById("InsertedId_Model",true);
				if (model.getNextRow()){
					for (var id in model.m_fields){
						this.setReadIdValue(id,model.getFieldById(id).getValue());
					}
					this.setIsNew(false);
				}
			}
		}
	}	
}
ViewDialog.prototype.onClickOk = function(){
	this.writeData(false);
	if (this.m_lastWriteResult&&this.getOnClose()){
		this.getOnClose().call(this,1);
	}
	return true;
}
ViewDialog.prototype.onClickSave = function(){
	if (this.getIsNew()){
		//need return new serial id if any
		var contr = this.getWriteController();
		var meth_id = this.getWriteMethodId();
		var pm = contr.getPublicMethodById(meth_id);
		if (pm.paramExists(contr.PARAM_RET_ID)){
			pm.setParamValue(contr.PARAM_RET_ID,1);
		}
	}
	this.writeData(false);
	if (this.m_lastWriteResult)this.readData(false);	
}
ViewDialog.prototype.onCancel = function(){
	if (this.getModified()){
		var self = this;
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
	else if (this.getOnClose){
		this.getOnClose().call(this,0);
	}
	return true;
}
ViewDialog.prototype.setEnabled = function(enabled){
	ViewDialog.superclass.setEnabled.call(this,enabled);
	if (this.m_ctrlOk){
		this.m_ctrlOk.setEnabled(enabled);
	}
	if (this.m_ctrlCancel){
		this.m_ctrlCancel.setEnabled(enabled);
	}
}
/*
ViewDialog.prototype.writeData = function(){
	ViewDialog.superclass.writeData.call(this);
	this.m_modified = true;
}
*/
ViewDialog.prototype.setTempDisabled = function(){
	ViewDialog.superclass.setTempDisabled.call(this);
	if (this.m_waitControl){
		this.m_waitControl.setVisible(true); 
	}			
}
ViewDialog.prototype.setTempEnabled = function(){
	ViewDialog.superclass.setTempEnabled.call(this);
	if (this.m_waitControl){
		this.m_waitControl.setVisible(false); 
	}			
}
