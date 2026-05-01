/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2020
 
 * @class
 * @classdesc SessionVar managing class
 
 */
function SessionVarManager(){

	this.m_values = {};
	this.m_keys = [];// all keys

}

/* private */
SessionVarManager.prototype.m_values;

SessionVarManager.prototype.getCont = function(resp,varList,callBack){	
	var m = resp.getModel("SessionVarList_Model");
	while(m.getNextRow()){
		var id = m.getFieldValue("id");
		this.setValue(id, CommonHelper.unserialize(m.getFieldValue("val")));
		varList[id] = this.m_values[id];
	}
	if(callBack){
		callBack(varList);
	}	
}

/* Public */

/**
 * @param {object} varList
 * on return it is filled with values from server or from cache
 */
SessionVarManager.prototype.get = function(varList,callBack){	
	var not_found = "";
	var not_found_ar = [];
	var QUERY_SEP = ",";

	for (var id in varList){
		if (CommonHelper.inArray(id, this.m_keys) >= 0){
			varList[id] = this.m_values[id];

		}else{
			//not found
			not_found+= (not_found=="")? "":QUERY_SEP;
			not_found+= id;			
			not_found_ar.push(id);
		}
	}
	if (not_found!=""){
		var self = this;
		var pm = (new SessionVar_Controller()).getPublicMethod("get_values");
		pm.setFieldValue("id_list",not_found);
		pm.run({
			"async": (callBack? true:false),
			"ok":function(resp){			
				self.getCont(resp,varList,callBack);
			}
		});
	}	
	else if(callBack){
		callBack(varList);
	}
}

SessionVarManager.prototype.set = function(id,val,callBack){	
	console.log("SessionVarManager.prototype.set id="+id+", val="+val)
	var self = this;
	var pm = (new SessionVar_Controller()).getPublicMethod("set_value");
	pm.setFieldValue("id",id);
	pm.setFieldValue("val",CommonHelper.serialize(val));
	pm.run({
		"ok":function(resp){
			self.setValue(id, val)
			if(callBack){
				callBack();
			}
		}
	});

}

SessionVarManager.prototype.setValue = function(key, val){	
	this.m_values[key] = val;
	if(CommonHelper.inArray(key, this.m_keys) == -1){
		this.m_keys.push(key);
	}
}
/**
 * event message handler
 */
SessionVarManager.prototype.onEventSrvMessage = function(json){	
	if(json.params && json.params.id && json.params.val!==undefined){
		this.setValue(json.params.id, CommonHelper.unserialize(json.params.val));
		console.log("SessionVar "+json.params.id+" set to val ",this.m_values[json.params.id])
	}
}

