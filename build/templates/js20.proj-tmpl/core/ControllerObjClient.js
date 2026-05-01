/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2017

 * @extends ControllerObj
 
 * @requires core/extend.js
 * @requires core/ControllerObj.js 
 * @requires core/ResponseXML.js           
 * @requires core/ResponseJSON.js 

 * @class
 * @classdesc
 
 * @param {Object} options
 * @param {Reponse} [options.responseClass=ResponseXML]
 */
function ControllerObjClient(options){
	options = options || {};	
	
	this.setClientModel(options.clientModel);
	
	ControllerObjClient.superclass.constructor.call(this,options);
}
extend(ControllerObjClient,ControllerObj);

ControllerObjClient.prototype.UPD_PARAM_PREF = "old_";

ControllerObjClient.prototype.m_clientModel;

ControllerObjClient.prototype.addInsert = function(){
	var pm = this.addMethod(this.METH_INSERT);
	
	var self = this;
	pm.run = function(options){
		if (self.m_clientModel){
			self.m_clientModel.reset();
			self.publicMethodFieldsToModel(this.getFields(),self.m_clientModel.getFields());			
			self.m_clientModel.recInsert();
			if (options.ok){
				//get all key fields to InsertedId_Model			
				var key_model_fields = {};
				var fields = self.m_clientModel.getFields();
				for (var fid in fields){
					if (fields[fid].getPrimaryKey()){
						var ft = fields[fid].getDataType();
						var fcl;
						if (ft==fields[fid].DT_INT){
							fcl = FieldInt;
						}
						else{
							fcl = FieldString;
						}
						key_model_fields[fid] = new fcl(fid,{"value":fields[fid].getValue()});
					}
				}							
				var resp,model;
				if (self.m_clientModel instanceof ModelXML){
					resp = new ResponseXML();
					model = new ModelXML("InsertedId_Model",{"fields":key_model_fields});
				}
				else if (self.m_clientModel instanceof ModelJSON){
					resp = new ResponseJSON();
					model = new ModelJSON("InsertedId_Model",{"fields":key_model_fields});
				}
				else{
					throw new Error(this.ER_UNSUPPORTED_CLIENT_MODEL);
				}
				/*
				for(var fid in key_model_fields){
					model.setFieldValue(fid,key_model_fields[fid]);					
				}
				*/
				model.recInsert();
				resp.setModelData("InsertedId_Model",model.getData());
		//console.log("resp=")
		//console.dir(resp)
				options.ok(resp);
			}						
		}
	}
	
	return pm; 
}

ControllerObjClient.prototype.addUpdate = function(){
	var pm = this.addMethod(this.METH_UPDATE);
	
	var self = this;
	pm.run = function(options){
		if (self.m_clientModel){
			self.m_clientModel.reset();
			var keyFields = {};
			self.publicMethodFieldsToModel(this.getFields(),null,keyFields);			
			self.m_clientModel.recLocate(keyFields);
			self.publicMethodFieldsToModel(this.getFields(),self.m_clientModel.getFields());			
			self.m_clientModel.recUpdate();
			if (options.ok){
				options.ok();
			}			
		}	
	}
	
	return pm; 
}

ControllerObjClient.prototype.addDelete = function(){
	var pm = this.addMethod(this.METH_DELETE);
	
	var self = this;
	pm.run = function(options){
		if (self.m_clientModel){
			self.m_clientModel.recDelete(this.m_fields);
			if (options.ok){
				options.ok();
			}			
		}	
	}
	
	return pm; 
}

ControllerObjClient.prototype.addGetList = function(){
	var pm = this.addMethod(this.METH_GET_LIST);
	
	var self = this;
	pm.run = function(options){
		//console.log("ControllerObjClient.prototype.addGetList")
		if (self.m_clientModel){
			/**
			 * @ToDo recLocate from cond_vals&cond_sgns&cond_fields !!!
			 */
			var rows = [];
			self.m_clientModel.reset();
			if (options[self.PARAM_COND_FIELDS]){
				var keys = options[self.PARAM_COND_FIELDS].split(options[self.PARAM_FIELD_SEP]);
				var vals = options[self.PARAM_COND_VALS].split(options[self.PARAM_FIELD_SEP]);
				var sgns = options[self.PARAM_COND_SGNS].split(options[self.PARAM_FIELD_SEP]);
				var opts = {};
				//if (keys.length!=vals.length)
				for (var key in options[self.PARAM_COND_FIELDS]){
					opts[key] = options[self.PARAM_COND_VALS]
				}
				//self.m_clientModel.recLocate(opts)
			}
			else{
				//all rows
				while (self.m_clientModel.getNextRow()){
					rows.push(self.m_clientModel.m_currentRow);
				}			
			}
			if (options.ok){
				options.ok(self.makeResponse(rows));
			}			
		}		
	}
	
	return pm; 
}

ControllerObjClient.prototype.addGetObject = function(){
	var pm = this.addMethod(this.METH_GET_OBJ);
	
	var self = this;
	pm.run = function(options){
		if (self.m_clientModel){
			//self.m_clientModel.recLocate(this.m_fields,true);
			/*if (!rows){
				throw Error(self.m_clientModel.ER_REС_NOT_FOUND);
			}*/
			if (options.ok){
				options.ok(self.makeResponse(self.m_clientModel.getFields()));
			}			
		}
	}
	
	return pm; 
}

ControllerObjClient.prototype.setClientModel = function(v){
	this.m_clientModel = v;
}
ControllerObjClient.prototype.getClientModel = function(){
	return this.m_clientModel;
}

ControllerObjClient.prototype.publicMethodFieldsToModel = function(sFields,tFields,keyFields){
	for (var id in sFields){
		if (keyFields && id.substr(0,this.UPD_PARAM_PREF.length)==this.UPD_PARAM_PREF){
			keyFields[id.substr(this.UPD_PARAM_PREF.length)] = sFields[id];
		}
		else if (tFields && tFields[id] && sFields[id].isSet()){ // && !sFields[id].isNull()
			tFields[id].setValue(sFields[id].getValue());
		}
	}
/*	
	console.log("publicMethodFieldsToModel sFields=")
	console.dir(sFields)
	console.log("publicMethodFieldsToModel tFields=")
	console.dir(tFields)
*/	
}

ControllerObjClient.prototype.makeResponse = function(rows){
	var resp_class;
	if (this.m_clientModel instanceof ModelXML){
		resp_class = ResponseXML;
	}
	else if (this.m_clientModel instanceof ModelJSON){
		resp_class = ResponseJSON;
	}
	else{
		throw new Error(this.ER_UNSUPPORTED_CLIENT_MODEL);
	}
	var resp = new resp_class();
	resp.setModelData(this.m_clientModel.getId(),this.m_clientModel.getData());
	return resp;
}
