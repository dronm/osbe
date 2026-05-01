/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016
 
 * @class
 * @classdesc Constant managing class
 
 * @param {Object} options
 * @param {object} options.values
 * @param {string} options.XMLString
 */
function ConstantManager(options){
	
	options = options || {};
	
	this.m_values = options.values || {};
	
	/*if (options.XMLString){
		this.fillFromXML(options.XMLString);
	}
	*/
}

/* private */
ConstantManager.prototype.m_values;

ConstantManager.prototype.setValFromModel = function(m){
	var v_t = m.getFieldValue("val_type");
	var v = m.getFieldValue("val");
	var v_class;
	var v_id = m.getFieldValue("id");
	if (v_t == "Int"){
		v_class = FieldInt;
	}
	else if (v_t == "Float"){
		v_class = FieldFloat;
	}				
	else if (v_t == "DateTime"){
		v_class = FieldDateTime;
	}						
	else if (v_t == "Date"){
		v_class = FieldDate;
	}								
	else if (v_t == "Bool"){
		v_class = FieldBool;
	}								
	/*else if (v_t == "JSON" || v_t == "JSONB"){
		v_class = FieldJSON;
	}*/										
	else{
		v_class = FieldString;
	}
	this.m_values[v_id] = new v_class(v_id,{"value":v});

}
/*
ConstantManager.prototype.fillFromXML = function(xml){

	var m = new Model("ConstantValueList_Model",{
		"data":xml,
		"fields":{"id":new FieldString(),
			"val":new FieldString(),
			"val_type":new FieldString()
			}
		});
	while(m.getNextRow()){
		var v_t = m.getFieldValue("val_type");
		var v = m.getFieldValue("val");
		var v_class;
		var v_id = m.getFieldValue("id");
		if (v_t == "Int"){
			v_class = FieldInt;
		}
		else if (v_t == "Float"){
			v_class = FieldFloat;
		}				
		else if (v_t == "DateTime"){
			v_class = FieldDateTime;
		}						
		else if (v_t == "Date"){
			v_class = FieldDate;
		}								
		else if (v_t == "Bool"){
			v_class = FieldBool;
		}								
		else if (v_t == "JSON" || v_t == "JSONB"){
			v_class = FieldJSON;
		}										
		else{
			v_class = FieldString;
		}
		this.m_values[v_id] = new v_class(v_id,{"value":v});
	}	
}
*/

/* Public */

/**
 * @param {object} constants[id]=null
 * on return it is filled with values from server or from cache
 */
ConstantManager.prototype.get = function(constants,callBack){	
	var not_found = "";
	var not_found_ar = [];
	var QUERY_SEP = ",";
	for (var id in constants){
		if (this.m_values[id]){
			constants[id] = this.m_values[id];
		}
		else{
			//not found
			not_found+= (not_found=="")? "":QUERY_SEP;
			not_found+= id;			
			not_found_ar.push(id);
		}
	}
	
	if (not_found!=""){
		var self = this;
		var contr = new Constant_Controller(new ServConnector(HOST_NAME))
		
		contr.run("get_values",{
			"async":(callBack!=undefined),
			"params":{
				"id_list":not_found
			},
			//"errControl":this.getErrorControl(),
			"func":function(resp){
				var m = resp.getModelById("ConstantValueList_Model");
				m.setActive(true);
				if (m.getNextRow()){
					self.setValFromModel(m)
					m.getFieldValue('id')
				}
			
				for (var i=0;i<not_found_ar.length;i++){
					constants[not_found_ar[i]] = self.m_values[not_found_ar[i]];
				}
				if(callBack){
					callBack(constants)
				}
			}
		});	
	}else if(callBack){
		callBack(constants)
	}	
}


ConstantManager.prototype.set = function(id,val,callBack){	
	var self = this;
	var contr = new Constant_Controller(new ServConnector(HOST_NAME))
	
	contr.run("set_value",{		
		"params":{
			"id":id
			,"val":JSON.stringify(val)
		},
		//"errControl":this.getErrorControl(),
		"func":function(resp){
			if(self.m_values[id]){
				self.m_values[id] = val;
			}
			if(callBack){
				callBack();
			}
		}
	});	
}

/**
 * event message handler
 */
 /*
ConstantManager.prototype.onEventSrvMessage = function(json){	
	if(json.params && json.params.id && json.params.val){
		this.m_values[json.params.id] = CommonHelper.unserialize(json.params.val);
		//console.log("Constant "+json.params.id+" set to val ",this.m_values[json.params.id])
	}
}
*/

