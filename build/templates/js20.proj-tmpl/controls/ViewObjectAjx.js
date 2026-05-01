/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016
 
 * @class
 * @classdesc object dialog view
 
 * @extends ViewAjx
 
 * @requires core/extend.js
 * @requires controls/ViewAjx.js       
 
 * @param string id 
 * @param {namespace} options
 * @param {string} options.cmd
 * @param {Controller} options.controller 
 * @param {bool} [options.cmdOk=true]
 * @param {bool} [options.cmdSave=true] 
 * @param {bool} [options.cmdCancel=true]
 * @param {bool} [options.cmdPrint=false]     
 * @param {Control} [options.controlOk=ButtonOK]
 * @param {Control} [options.controlSave=ButtonSave]
 * @param {Control} [options.controlCancel=ButtonCancel]
 * @param {Control} [options.controlPrint=ButtonPrintList] 
 * @param {PublicMethod} options.writePublicMethod
 * @param {PublicMethod} options.readPublicMethod
 * @param {function} options.onClose
 * @param {Control} options.commandContainer
 * @param {Model} options.model
 * @param {Array} options.commandElements
 * @param {bool} [options.cmdOkAsync=true] 
 * @param {int} [options.onSaveOkMesTimeout=DEF_ONSAVE_OK_MES_TIMEOUT]
 */
function ViewObjectAjx(id,options){
	options = options || {};	
	this.setKeys(options.keys);
	
	if (options.model && options.model.getRowIndex()<0){
		options.model.getNextRow();
	}
	
	if(options.HEAD_TITLE && window.opener){
		this.m_headTitle = options.HEAD_TITLE;
	}
	
	ViewObjectAjx.superclass.constructor.call(this,id,options);

	this.addCommand(new Command(this.CMD_OK,{
		"publicMethod":options.writePublicMethod,
		"control":this.getControlOK(),
		"async":(options.cmdOkAsync!=undefined)? options.cmdOkAsync:true
		})
	);	
	
	this.setCmd(options.cmd);
	
	this.m_detailDataSets = {};
			
	this.setOnClose(options.onClose);
	
	if (!options.readPublicMethod && options.controller){
		//default
		options.readPublicMethod = options.controller.getGetObject();
	}
	this.setReadPublicMethod(options.readPublicMethod);
	
	this.setController(options.controller);
	this.setModel(options.model);
	this.m_dataType = options.dataType;
	
	this.setOnSaveOkMesTimeout(options.onSaveOkMesTimeout || this.DEF_ONSAVEOK_MES_TIMEOUT);
	
	var self = this;
		
	options.cmdOk = (options.cmdOk!=undefined)? options.cmdOk:true;
	if ( options.controlOk || options.cmdOk){
		this.setControlOK(options.controlOk || new ButtonOK(id+":cmdOk",
			{"onClick":function(){
				self.getControlOK().setEnabled(false);
				self.m_oldSaveEn = false;
				if(self.getControlSave()){
					self.m_oldSaveEn = self.getControlSave().getEnabled();
					if(self.m_oldSaveEn)self.getControlSave().setEnabled(false);
				}
				self.onOK(function(resp,errCode,errStr){
					self.getControlOK().setEnabled(true);
					if(self.m_oldSaveEn)self.getControlSave().setEnabled(true);
					self.setError(window.getApp().formatError(errCode,errStr));
				});
			}
		})
		);
	}

	options.cmdSave = (options.cmdSave!=undefined)? options.cmdSave:true;
	if ( options.controlSave || options.cmdSave ){
		this.setControlSave(options.controlSave || new ButtonSave(id+":cmdSave",
			{"onClick":function(){
				self.saveObject();
				/*
				self.getControlSave().setEnabled(false);
				self.m_oldOkEn = false;
				if(self.getControlOK()){
					self.m_oldOkEn = self.getControlOK().getEnabled();
					if(self.m_oldOkEn)self.getControlOK().setEnabled(false);
				}
				self.onSave(null,null,function(){
					self.getControlSave().setEnabled(true);
					if(self.m_oldOkEn)self.getControlOK().setEnabled(true);
				});
				*/
			}
		})
		);
	}
	
	options.cmdCancel = (options.cmdCancel!=undefined)? options.cmdCancel:true;
	if ( options.controlCancel || options.cmdCancel ){
		this.setControlCancel(options.controlCancel || new ButtonCancel(id+":cmdCancel",{
			"onClick":function(){
				self.onCancel();
			}
		})
		);		
	}
	
	options.cmdPrint = (options.printList!=undefined)? true:( (options.cmdPrint!=undefined)? options.cmdPrint:false);
	if ( options.controlPrint || options.cmdPrint){
		this.setControlPrint(options.controlPrint || new ButtonPrintList(id+":cmdPrint",{
			"printList":options.printList,
			"keyIds":options.printListKeyIds
		}));		
	}
	
	//commands
	if (options.commandContainer || options.commandElements || options.cmdOk || options.cmdSave || options.cmdCancel || options.cmdPrint){
		this.m_commandContainer = options.commandContainer || new ControlContainer(id+":cmd-cont","DIV",{"elements":options.commandElements});
	}
		
	//Commands
	/*
	var pm;
	if (options.writePublicMethod){
		pm = options.writePublicMethod;
	}
	else*/
	/*
	if (!options.writePublicMethod && options.controller && options.cmd){
		options.writePublicMethod = options.controller.getPublicMethod( (options.cmd=="insert"||options.cmd=="copy")? options.controller.METH_INSERT:options.controller.METH_UPDATE );
	}
	*/
	
	this.setWritePublicMethod(options.writePublicMethod);
	
	this.addControls();
	
	this.m_keyEvent = function(e){
		e = EventHelper.fixKeyEvent(e);
		if (self.keyPressEvent(e.keyCode,e)){
			e.preventDefault();
			e.stopPropagation();
			return false;
		}
	};		
}
extend(ViewObjectAjx,ViewAjx);

/* Constants */
ViewObjectAjx.prototype.DEF_ONSAVEOK_MES_TIMEOUT = 2000;
ViewObjectAjx.prototype.CMD_OK = "ok";

/* private members */
ViewObjectAjx.prototype.m_controlCancel;
ViewObjectAjx.prototype.m_controlOK;
ViewObjectAjx.prototype.m_controlSave;
ViewObjectAjx.prototype.m_controlPrint;

ViewObjectAjx.prototype.m_onClose;
ViewObjectAjx.prototype.m_readPublicMethod;
ViewObjectAjx.prototype.m_commandContainer;
ViewObjectAjx.prototype.m_replacedNode;
ViewObjectAjx.prototype.m_cmd;
ViewObjectAjx.prototype.m_controller;
ViewObjectAjx.prototype.m_model;
ViewObjectAjx.prototype.m_refType;
ViewObjectAjx.prototype.m_dataType;

ViewObjectAjx.prototype.m_keys;

/**
 * {bool} updated,
 * {object} newKeys
 * {object} window window-owner reference
 */
ViewObjectAjx.prototype.m_editResult;

/*{control,controlFieldId,field}*/
ViewObjectAjx.prototype.m_detailDataSets;

ViewObjectAjx.prototype.addKeyEvents = function(){
	for (var elem_id in this.m_elements){
		if (this.m_elements[elem_id] && this.m_elements[elem_id].setInitValue){
			EventHelper.add(this.m_elements[elem_id].getNode(),"keydown",this.m_keyEvent,false);
		}
	}
	
}

ViewObjectAjx.prototype.delKeyEvents = function(){
	for (var elem_id in this.m_elements){
		if (this.m_elements[elem_id] && this.m_elements[elem_id].setInitValue){
			EventHelper.del(this.m_elements[elem_id].getNode(),"keydown",this.m_keyEvent,false);
		}
	}	
}

ViewObjectAjx.prototype.keyPressEvent = function(keyCode,event){	
	var res=false;
	//console.log("ViewObjectAjx.prototype.keyPressEvent keyCode="+keyCode);
	switch (keyCode){
		case 27: // escape
			res = true;
			this.onCancel();
			break;
		case 13: // enter
			if (event.ctrlKey){
				res = true;
				this.onOK();
			}
			break;
	}	
	return res;
}


/* protected*/
ViewObjectAjx.prototype.addControls = function(){
	if (this.m_commandContainer){
		if (this.m_controlOK) this.m_commandContainer.addElement(this.m_controlOK);
		if (this.m_controlSave) this.m_commandContainer.addElement(this.m_controlSave);
		if (this.m_controlPrint)this.m_commandContainer.addElement(this.m_controlPrint);
		if (this.m_controlCancel) this.m_commandContainer.addElement(this.m_controlCancel);	
	}
}


ViewObjectAjx.prototype.close = function(res){	
	if(this.m_onClose){
		res = res || {};
		res.window = window;
		this.m_onClose.call(this,res);
	}
	else{		
		window.closeResult = res;
		window.close();
	}
}

/**
 * @param {ServResp} resp
 * @param {boolean} initControls whethear to set controls' init values 
 * if form is not going to be closed initControls=true for modifying form controls
 */
ViewObjectAjx.prototype.onAfterUpsert = function(resp,initControls){
	/** All fields from response to model and controls
	 */
	this.m_editResult.updated = true;
	
	var app = window.getApp();
	
	if (resp && typeof(resp)=="object" && resp.modelExists(app.INSERTED_KEY_MODEL_ID) && this.m_dataBindings && this.m_dataBindings.length){
		this.m_editResult.newKeys = {};
		var model_obj_class = this.getWritePublicMethod().getController().getObjModelClass();
		var ret_model = new model_obj_class({"data":resp.getModelData(app.INSERTED_KEY_MODEL_ID)});
		
		var base_model_class;
		if (ret_model instanceof ModelXML){
			base_model_class = ModelXML;
		}
		else if (ret_model instanceof ModelJSON){
			base_model_class = ModelJSON;
		}
		else{
			throw Error(this.ER_UNSUPPORTED_BASE_MODEL);
		}	
		var ret_model_serv_fields;
		var ret_model_serv = new base_model_class(app.INSERTED_KEY_MODEL_ID, {"data":resp.getModelData(app.INSERTED_KEY_MODEL_ID)});
		if (ret_model_serv.getNextRow()){
			ret_model_serv_fields = ret_model_serv.getFields();
		}
		
		var ret_fields;
		//first
		if (ret_model.getNextRow()){
			ret_fields = ret_model.getFields();
		}
		
		if (ret_model_serv_fields && ret_fields) {
			for (ret_id in ret_model_serv_fields){
				if (ret_model_serv_fields[ret_id].isSet() && ret_fields[ret_id]){
					this.m_editResult.newKeys[ret_id] = ret_fields[ret_id].getValue();
				}
			}
		}
		
		if (initControls){
			/* write bindings are not updated!!?? */
			for (var i=0;i<this.m_dataBindings.length;i++){
				this.defineField(i);
				var f = this.m_dataBindings[i].getField();
				if (f){		
					//update controls which fields have come from server
					var val;
					if (ret_model_serv_fields[f.getId()] && ret_fields[f.getId()] && ret_fields[f.getId()].isSet()){
						val = ret_fields[f.getId()].getValue();
					}
					else{
						if(!this.m_dataBindings[i].getControl()){
							console.dir(this.m_dataBindings[i])
						}
						val = this.m_dataBindings[i].getControl().getValue();
					}
			
					if (this.m_dataBindings[i].getControl().setInitValue){
						this.m_dataBindings[i].getControl().setInitValue(val);
					}
					//console.log("ViewObjectAjx.prototype.onAfterUpsert setting "+f.getId()+" to "+val)
					f.setValue(val);
				}
			}
		}
	}
	else{
		//after insert/update no keys
		for (var i=0;i<this.m_dataBindings.length;i++){
			this.defineField(i);
			var f = this.m_dataBindings[i].getField();			
			if (f){
				var ctrl = this.m_dataBindings[i].getControl();				
				if (ctrl){
					var val;
					val = ctrl.getValue();
			
					if (initControls && ctrl.setInitValue){
						ctrl.setInitValue(val);
					}
					if (val!=null && typeof val == "object" && val.getKeys){
						var keys = val.getKeys();
						for (key in keys){
							val = keys[key];
							break;
						}
					}
					//console.log("ViewObjectAjx.prototype.onAfterUpsert fieldId="+f.getId()+" Val=")
					//console.dir(val)
					try{
						f.setValue(val);
					}
					catch(e){
					}
				}
			}
		}	
	}
	
	//lsn
	this.m_editResult.lsn = app.getLsnValueFromResponse(resp);	
}

ViewObjectAjx.prototype.onOK = function(failFunc){
	var self = this;
	this.execCommand(
		this.CMD_OK,
		function(resp){
			self.onAfterUpsert(resp,false);
			self.close(self.m_editResult);
		},
		failFunc
	);
}

ViewObjectAjx.prototype.onSave = function(okFunc,failFunc,allFunc){	
	/*
	var contr = this.getController();
	var form_cmd = this.getCmd();	
	if (contr && (form_cmd=="insert"||form_cmd=="copy") ){
		contr.getPublicMethod(contr.METH_INSERT).setFieldValue("ret_id",1);
	}
	*/
	var self = this;
	this.execCommand(
		this.CMD_OK,
		function(resp){
			self.onSaveOk.call(self,resp);
			if (okFunc){
				okFunc.call(self);
			}
		},
		failFunc,
		allFunc
	);
}

ViewObjectAjx.prototype.getModified = function(cmd){
	return ViewObjectAjx.superclass.getModified.call(this,(cmd)? cmd:this.CMD_OK);
}

ViewObjectAjx.prototype.onCancel = function(){

	if (this.getModified(this.CMD_OK)){
		var self = this;
		
		//this.delKeyEvents();
		
		WindowQuestion.show({
			"text":this.Q_SAVE_CHANGES,
			"timeout":this.SAVE_CH_TIMEOUT,
			"winObj":this.m_winObj,
			"callBack":function(res){
				if (res==WindowQuestion.RES_YES){
					self.onOK();
				}
				else if(res==WindowQuestion.RES_NO){
					self.close(this.m_editResult);
				}
				//self.addKeyEvents();				
			}
		});
	}
	else{
		this.close(this.m_editResult);
	}
}

ViewObjectAjx.prototype.setWriteTempEnabled = function(cmd){
	ViewObjectAjx.superclass.setWriteTempEnabled.call(this,cmd);
	
	//save btn
	if (this.m_controlSave) this.m_controlSave.setEnabled(true);
}

ViewObjectAjx.prototype.setWriteTempDisabled = function(cmd){
	ViewObjectAjx.superclass.setWriteTempDisabled.call(this,cmd);
	
	//save btn
	if (this.m_controlSave) this.m_controlSave.setEnabled(false);
}


/* public methods */

ViewObjectAjx.prototype.setDetailDataSetEnabled = function(en){
	for(var det_id in this.m_detailDataSets){
		var ctrl = this.m_detailDataSets[det_id].control;
		if(ctrl && ctrl.setEnabled){
			ctrl.setEnabled(en);
		}
	}
}

ViewObjectAjx.prototype.toDOM = function(parent){
	ViewObjectAjx.superclass.toDOM.call(this,parent,this.getCmd());
	
	//disable all detail controls
	if(this.getCmd() == "insert"){
		this.setDetailDataSetEnabled(false);
	}
		
	if (this.m_commandContainer)this.m_commandContainer.toDOM(parent);
	
	this.addKeyEvents();
	
	this.setDefRefVals();
	
	//set title
	if(this.m_headTitle){
		document.title = this.m_headTitle;
	}
}

ViewObjectAjx.prototype.delDOM = function(){
	this.delKeyEvents();	
	if (this.m_commandContainer)this.m_commandContainer.delDOM();
	ViewObjectAjx.superclass.delDOM.call(this);	
}


ViewObjectAjx.prototype.setControlOK = function(v){
	this.m_controlOK = v;
}
ViewObjectAjx.prototype.getControlOK = function(){
	return this.m_controlOK;
}

ViewObjectAjx.prototype.setControlSave = function(v){
	this.m_controlSave = v;
}
ViewObjectAjx.prototype.getControlSave = function(){
	return this.m_controlSave;
}

ViewObjectAjx.prototype.setControlCancel = function(v){
	this.m_controlCancel = v;
}
ViewObjectAjx.prototype.getControlCancel = function(){
	return this.m_controlCancel;
}

ViewObjectAjx.prototype.setControlPrint = function(v){
	this.m_controlPrint = v;
}
ViewObjectAjx.prototype.getControlPrint = function(){
	return this.m_controlPrint;
}

ViewObjectAjx.prototype.setWritePublicMethod = function(v){
	if (v && window.getParam){
		var opts = window.getParam("editViewOptions");
		if (opts && opts.keys){
			for (var key in opts.keys){
				v.setFieldValue(key,opts.keys[key]);
			}
		}
	}
		
	this.getCommands()[this.CMD_OK].setPublicMethod(v);
}

ViewObjectAjx.prototype.getWritePublicMethod = function(){
	return this.getCommands()[this.CMD_OK].getPublicMethod();
}

ViewObjectAjx.prototype.setReadPublicMethod = function(v){
	this.m_readPublicMethod = v;
}
ViewObjectAjx.prototype.getReadPublicMethod = function(){
	return this.m_readPublicMethod;
}

ViewObjectAjx.prototype.setOnClose = function(v){
	this.m_onClose = v;
}
ViewObjectAjx.prototype.getOnClose = function(){
	return this.m_onClose;
}

ViewObjectAjx.prototype.setReplacedNode = function(v){
	this.m_replacedNode = v;
}
ViewObjectAjx.prototype.getReplacedNode = function(){
	return this.m_replacedNode;
}

ViewObjectAjx.prototype.setCmd = function(v){
	this.m_cmd = v;
	
	//enable all detail controls
	if(v != "insert"){
		this.setDetailDataSetEnabled(true);
	}	
}

ViewObjectAjx.prototype.getCmd = function(){
	if (!this.m_cmd && window.getParam){
		this.m_cmd = window.getParam("cmd");
	}
	else if (!this.m_cmd){
		this.m_cmd = "edit";
	}
	return this.m_cmd;
}

ViewObjectAjx.prototype.setWritePublicMethodOnController = function(){	
//console.log("ViewObjectAjx.prototype.setWritePublicMethodOnController")
	if (this.m_controller){
		var frm_cmd = this.getCmd();
		if (frm_cmd){
			var pm_id = (frm_cmd=="insert"||frm_cmd=="copy")? this.m_controller.METH_INSERT:this.m_controller.METH_UPDATE;
			if (this.m_controller.publicMethodExists(pm_id)){
				this.setWritePublicMethod(this.m_controller.getPublicMethod(pm_id));
			}
		}
	}
}

ViewObjectAjx.prototype.setController = function(v){
	this.m_controller = v;
	
	this.setWritePublicMethodOnController();
}

ViewObjectAjx.prototype.getController = function(){
	return this.m_controller;
}

/**
 * update controls from server response
 */
ViewObjectAjx.prototype.updateControlsFromResponse = function(resp){
	this.onAfterUpsert(resp,true);
	
	this.setCmd("update");			
	this.setWritePublicMethod(null);
	
	//set detail controls enabled
	for (var id in this.m_detailDataSets){		
		if(this.m_detailDataSets[id].control&&!this.m_detailDataSets[id].control.getEnabled()){
			this.m_detailDataSets[id].control.setEnabled(true);
		}
	}
	this.setDetailKey();
}

ViewObjectAjx.prototype.onSaveOk = function(resp){

	this.updateControlsFromResponse(resp);
	
	window.showTempNote(this.NOTE_SAVED,null,this.m_onSaveOkMesTimeout);
}


/* Setting write public method insert||update */
ViewObjectAjx.prototype.execCommand = function(cmd,sucFunc,failFunc,allFunc){	
	
	if (cmd==this.CMD_OK && !this.getWritePublicMethod() && this.getController()){
		this.setWritePublicMethodOnController();
	}
	/*
	debugger;
	for (var id in this.m_detailDataSets){
		if (this.m_detailDataSets[id].controlFieldId && this.m_detailDataSets[id].field){
			this.getCommand(cmd).getPublicMethod().setFieldValue(
				this.m_detailDataSets[id].controlFieldId,
				this.m_detailDataSets[id].field.getValue()
			);
		}	
	}
	*/		
	ViewObjectAjx.superclass.execCommand.call(this,cmd,sucFunc,failFunc,allFunc);
}

/*ReadPublicMethod
*/
ViewObjectAjx.prototype.read = function(cmd,failFunc){
	//console.log("ViewObjectAjx.prototype.read");
	var self = this;
	this.setReadTempDisabled();
	const pm = this.getReadPublicMethod();
	pm.run({
		"all":function(){
			self.setTempEnabled();
		},
		"ok":function(resp){
			self.onGetData(resp,cmd);
		},
		"fail":function(resp,erCode,erStr){			
			if (failFunc){
				failFunc.call(self,resp,erCode,erStr);
			}
			else{
				throw new Error(erStr);
			}
		}
	});
}

/*
 * Found out that this function is called twice, once from toDOM(), the other from grid->read()
 * in case if grid edit with modalWindow View is used for editting.
 * So it ussues two queries to server, one is with empty key if key depends on form model field.
 * That is why decided to check primary keys before setting detail keys.
 * If primary keys are not set then there is no need to set detail keys.
 */
ViewObjectAjx.prototype.setDetailKey = function(){
	//check if form model fields are not set - return
	if(this.m_model){
		var f = this.m_model.getFields();
		let keys_not_set = false;
		for (var id in f){
			if (f[id].getPrimaryKey() && f[id].getValue()===undefined){
				keys_not_set = true;
				break;
			}
		}	
		if(keys_not_set){
			return;
		}
	}
	
	for (var id in this.m_detailDataSets){		
		var ds = this.m_detailDataSets[id].control;			
		
		if(CommonHelper.isArray(this.m_detailDataSets[id].controlFieldId)
		&& CommonHelper.isArray(this.m_detailDataSets[id].value)){
			var pm = ds.getReadPublicMethod();
			var contr = pm.getController();								
		
			for(var i = 0; i< this.m_detailDataSets[id].controlFieldId.length; i++){
				//WRITE
				var v;
				if(typeof(this.m_detailDataSets[id].value[i]) == "function"){
					v = this.m_detailDataSets[id].value[i].call(this);
				}else{
					v = this.m_detailDataSets[id].value[i];
				}
				var pm = ds.getInsertPublicMethod();
				if (pm) pm.setFieldValue(this.m_detailDataSets[id].controlFieldId[i], v);
				var pm = ds.getUpdatePublicMethod();
				if (pm) pm.setFieldValue(this.m_detailDataSets[id].controlFieldId[i], v);
				
				ds.setFilter({
					"field": this.m_detailDataSets[id].controlFieldId[i],
					"sign":contr.PARAM_SGN_EQUAL,
					"val": v
				});
			}
			//get count from Pagination!
			if(ds.getPagination){
				var pg = ds.getPagination();
				if(pg){
					var pm = ds.getReadPublicMethod();	
					pm.setFieldValue(pm.getController().PARAM_COUNT,pg.getCountPerPage());
				}
			}
			
			ds.onRefresh(function(){
				ds.setEnabled(true);
			});
						
		}else{
		
			var key;
			if(this.m_detailDataSets[id].field){
				key = this.m_detailDataSets[id].field.getValue();
			}
			else if(this.m_detailDataSets[id].fieldId){
				this.m_detailDataSets[id].field = this.m_model.getField(this.m_detailDataSets[id].fieldId);
				key = this.m_detailDataSets[id].field.getValue();
			}
			else if(this.m_detailDataSets[id].value){
				//function?
				if(typeof(this.m_detailDataSets[id].value)=="function"){
					key = this.m_detailDataSets[id].value.call(this);
				}
				else{
					key = this.m_detailDataSets[id].value;
				}
			}
			
			if (key){
				//WRITE
				var pm = ds.getInsertPublicMethod();
				if (pm) pm.setFieldValue(this.m_detailDataSets[id].controlFieldId,key);
				var pm = ds.getUpdatePublicMethod();
				if (pm) pm.setFieldValue(this.m_detailDataSets[id].controlFieldId,key);

				var pm = ds.getReadPublicMethod();
				var contr = pm.getController();	
				
				ds.setFilter({
					"field":this.m_detailDataSets[id].controlFieldId,
					"sign":contr.PARAM_SGN_EQUAL,
					"val":key
				});
				/*
				//!!!READ!!! Write set in execCommand			
				pm.setFieldValue(contr.PARAM_COND_FIELDS,this.m_detailDataSets[id].controlFieldId);
				pm.setFieldValue(contr.PARAM_COND_SGNS,contr.PARAM_SGN_EQUAL);
				pm.setFieldValue(contr.PARAM_COND_VALS,key);
				*/
				
				//get count from Pagination!
				if(ds.getPagination){
					var pg = ds.getPagination();
					if(pg){
						var pm = ds.getReadPublicMethod();	
						pm.setFieldValue(pm.getController().PARAM_COUNT,pg.getCountPerPage());
					}
				}
				
				ds.onRefresh(function(){
					ds.setEnabled(true);
				});
			}		
		}
	}
}

ViewObjectAjx.prototype.onGetData = function(resp,cmd){
	cmd = (cmd===undefined)? this.getCmd() : ((cmd===true)? "copy":cmd);
//console.log("ViewObjectAjx.prototype.onGetData cmd="+cmd+" getCmd="+this.getCmd())
	ViewObjectAjx.superclass.onGetData.call(this,resp,cmd);
	
	/*
	if (!cmd && !window.getParam && this.m_dataBindings.length){
		var m = this.m_dataBindings[0].getModel();
		cmd = (m.getRowCount())? "edit":"insert";
	}	
	this.setCmd(cmd);
	*/
	if (!CommonHelper.isEmpty(this.m_detailDataSets) && cmd!="insert" && cmd!="copy"){
		this.setDetailKey();
	}
	
	if (this.m_controlPrint && this.m_model){
		var list = this.m_controlPrint.getObjList();
		var keys = {};
		var keyIds = this.m_controlPrint.getKeyIds();
		var fields = this.m_model.getFields();		
		if (!keyIds){
			//model keys			
			for (var fid in fields){
				if (fields[fid].getPrimaryKey()){
					keys[fid] = fields[fid].getValue();
				}
			}
		}
		else{
			for (var i=0;i<keyIds.length;i++){
				if (fields[keyIds[i]]){
					keys[keyIds[i]] = fields[keyIds[i]].getValue();
				}
			}
		}
		
		for (var i=0;i<list.length;i++){
			list[i].setKeys(keys);		
		}
	}
}

/**
 * @param object dsParams{
 *	@param {Control} control,
 *	@param {string|array} controlFieldId,
 *	@param {string|function|array} value
 *	@param {Field} field
 *	@param {string} fieldId
 *	}
 */
ViewObjectAjx.prototype.addDetailDataSet = function(dsParams){
	this.m_detailDataSets[dsParams.control.getId()] = dsParams;
	
	var self = this;
	dsParams.control.initEditWinObjOrig = dsParams.control.initEditWinObj;
	dsParams.control.initEditWinObj = function(cmd){
		var ds_id = this.getId();

		var o = this.getEditViewOptions() || {};
		o.keys = {};		
		if(CommonHelper.isArray(self.m_detailDataSets[ds_id].controlFieldId) && CommonHelper.isArray(self.m_detailDataSets[ds_id].value)){
			//many keys
			for(var i=0; i < self.m_detailDataSets[ds_id].controlFieldId.length; i++){
				var v;
				if(typeof(self.m_detailDataSets[ds_id].value[i]) == "function"){
					v = self.m_detailDataSets[ds_id].value[i].call(this);
				}else{
					v = self.m_detailDataSets[ds_id].value[i];
				}
				o.keys[self.m_detailDataSets[ds_id].controlFieldId[i]] = v;
			}
			
		}else{
			//one kye
			if(self.m_detailDataSets[ds_id].fieldId){
				self.m_detailDataSets[ds_id].field = self.m_model.getField(self.m_detailDataSets[ds_id].fieldId);
			}
			var key;
			if(self.m_detailDataSets[ds_id].field){
				key = self.m_detailDataSets[ds_id].field.getValue();
			}
			else if(self.m_detailDataSets[ds_id].value){
				if(typeof(self.m_detailDataSets[ds_id].value)=="function"){
					key = self.m_detailDataSets[ds_id].value();
				}
				else{
					key = self.m_detailDataSets[ds_id].value;
				}			
			}
											
			o.keys[self.m_detailDataSets[ds_id].controlFieldId] = key;
		}
		this.setEditViewOptions(o);	
		this.initEditWinObjOrig(cmd);
	}
	
	//add filters
	if(dsParams.control && dsParams.control.getInsertPublicMethod() && dsParams.value && !CommonHelper.isArray(dsParams.value)){
		var key;
		if(typeof(dsParams.value)=="function"){
			key = dsParams.value();
		}
		else{
			key = dsParams.value;
		}
		if(key){
			dsParams.control.setFilter({
				"field":dsParams.controlFieldId,
				"sign":dsParams.control.getInsertPublicMethod().getController().PARAM_SGN_EQUAL,
				"val":key
			});
		}
		
	}else if(dsParams.control && dsParams.control.getInsertPublicMethod() && dsParams.value && CommonHelper.isArray(dsParams.value)){
		for(var i=0; i < dsParams.controlFieldId.length; i++){
			var v;
			if(typeof(dsParams.value[i]) == "function"){
				v = dsParams.value[i].call(this);
			}else{
				v = dsParams.value[i];
			}
			dsParams.control.setFilter({
				"field": dsParams.controlFieldId[i],
				"sign": dsParams.control.getInsertPublicMethod().getController().PARAM_SGN_EQUAL,
				"val": v
			});
		}	
	}			
}

ViewObjectAjx.prototype.copyControl = function(fromName,toName){
	var name = this.getElement(fromName).getValue();
	if (name && !this.getElement(toName).getValue()){
		this.getElement(toName).setValue(name);
	}
}

/*Must be overridden*/
ViewObjectAjx.prototype.setDefRefVals = function(){
}

ViewObjectAjx.prototype.setModel = function(v){
	this.m_model = v;
}

ViewObjectAjx.prototype.getModel = function(){
	return this.m_model;
}

ViewObjectAjx.prototype.setDataBindings = function(bindings){
	if (this.m_model){
		var bd_ids = [];
		for (var b_ind=0;b_ind<bindings.length;b_ind++){
			if (bindings[b_ind]){
				if (!bindings[b_ind].getModel()){
					bindings[b_ind].setModel(this.m_model);
				}
				if (bindings[b_ind].getControl()){
					bd_ids.push(bindings[b_ind].getControl().getName());
				}
			}
		}
		
		var fields = this.m_model.getFields();
		for (var f in fields){
			if (fields[f].getPrimaryKey()){
				var ctrl = this.getElement(f);
				if (!ctrl){
					ctrl = new HiddenKey(this.getId()+":"+f);
					this.addElement(ctrl);
				}
				if (CommonHelper.inArray(f,bd_ids)<0){
					//missing
					bindings.push(new DataBinding({
						"model":this.m_model,
						"control":ctrl,
						"field":fields[f]
					}));
				}
			}
		}
	}

	ViewObjectAjx.superclass.setDataBindings.call(this,bindings);
}

ViewObjectAjx.prototype.addDataBinding = function(bind){

	if (this.m_model && !bind.getModel()){
		bind.setModel(this.m_model);
	}	
	
	ViewObjectAjx.superclass.addDataBinding.call(this,bind);
}

ViewObjectAjx.prototype.setWriteBindings = function(bindings,cmd){
//debugger
	if (this.m_model){
		var bd_ids = [];
		for (var b_ind=0;b_ind<bindings.length;b_ind++){
			//bindings[b_ind] && 
			
			var f_id;
			if (!bindings[b_ind]){
				throw new Error("ViewObjectAjx::setWriteBindings field index="+b_ind+". Field not defined!")
			}
			if (bindings[b_ind].getField()){
				f_id = bindings[b_ind].getField().getId();
			}
			else if (bindings[b_ind].getFieldId()){
				f_id = bindings[b_ind].getFieldId();
			}
			else if (bindings[b_ind].getControl()){
				f_id = bindings[b_ind].getControl().getName();				
			}
			//console.log("IND="+b_ind+" f_id="+f_id)
			if (f_id){
				bd_ids.push(f_id);
			}
		}

		var fields = this.m_model.getFields();
		//console.dir(bd_ids)
		for (var f in fields){
			if (fields[f].getPrimaryKey()){
				//console.log("PrimaryKeyField "+f)
				if (CommonHelper.inArray(f,bd_ids)<0){
					//missing
					//console.log("Added missing primary key to write binding "+f)
					bindings.push(new CommandBinding({
						"control":this.getElement(f),
						"fieldId":f
					}));
				}
			}
		}
	}
	this.getCommands()[ ( cmd? cmd:this.CMD_OK ) ].setBindings(bindings);	
}

ViewObjectAjx.prototype.getCommandContainer = function(){
	return this.m_commandContainer;
}

ViewObjectAjx.prototype.getRefType = function(){
	if (!this.m_refType && this.m_model && this.m_dataType){
		var keys = {};
		var f = this.m_model.getFields();
		for (var id in f){
			if (f[id].getPrimaryKey() && this.elementExists(id)){
				keys[id] = this.getElement(id).getValue();
			}
		}
		this.m_refType = new RefType({"keys":keys,"descr":"", "dataType":this.m_dataType});
	}
	return this.m_refType;
}

ViewObjectAjx.prototype.saveObject = function(callBack){
	this.m_oldSaveEn = false;
	this.m_oldOkEn = false;
	if (this.getControlSave()&&this.getControlSave().getEnabled){
		this.m_oldSaveEn = this.getControlSave().getEnabled();
		if(this.m_oldSaveEn)this.getControlSave().setEnabled(false);
	}	
	if(this.getControlOK()&&this.getControlOK().getEnabled){
		this.m_oldOkEn = this.getControlOK().getEnabled();
		if(this.m_oldOkEn)this.getControlOK().setEnabled(false);
	}
	var self = this;
	this.onSave(null,null,function(){
		if(self.m_oldSaveEn)self.getControlSave().setEnabled(true);
		if(self.m_oldOkEn)self.getControlOK().setEnabled(true);
		if (callBack)callBack();
	});

}
ViewObjectAjx.prototype.setKeys = function(v){
	this.m_keys = v;
}
ViewObjectAjx.prototype.getKeys = function(){
	return this.m_keys;
}
ViewObjectAjx.prototype.setOnSaveOkMesTimeout = function(v){
	this.m_onSaveOkMesTimeout = v;
}
ViewObjectAjx.prototype.getOnSaveOkMesTimeout = function(){
	return this.m_onSaveOkMesTimeout;
}
