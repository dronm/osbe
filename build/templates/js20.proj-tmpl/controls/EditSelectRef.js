/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2017

 * @requires core/extend.js  

 * @class
 * @classdesc
 
 * @param {string} id - Object identifier
 * @param {namespace} options
 * @param {bool} [options.cashable=true]
 * @param {Model} options.model
 * @param {PublicMethod} options.readPublicMethod
 * @param {Array} options.modelKeyFields
 * @param {Array} options.modelKeyIds
 * @param {Array} options.modelDescrFields
 * @param {Array} options.modelDescrFields
 * @param {Array} options.modelDescrIds
 * @param {function} options.modelDescrFormatFunction
 * @param {bool} [options.autoRefresh=true] Refreshing is called automaticaly after toDOM
 * @param {string} options.modelDataStr
 
 * @param {Control} options.dependBaseControl
 * @param {Array} options.dependBaseFieldIds
 * @param {Array} options.dependFieldIds
 
 * @param {string} options.cashId
 * @param {string} [options.asyncRefresh=true]

       
 */

function EditSelectRef(id,options){
	options = options || {};
	
	options.optionClass = options.optionClass || EditSelectOptionRef;
	
	this.setModel(options.model);	
	this.setReadPublicMethod(options.readPublicMethod);
	this.setCashable((options.cashable!=undefined)? options.cashable:true);	

	this.setKeyIds(options.keyIds);
	
	this.setModelKeyFields(options.modelKeyFields);
	this.setModelKeyIds(options.modelKeyIds);	
	
	this.setModelDescrFields(options.modelDescrFields);
	this.setModelDescrIds(options.modelDescrIds);
	this.setModelDescrFormatFunction(options.modelDescrFormatFunction);
	
	//dependancy
	this.setDependBaseControl(options.dependBaseControl);
	this.setDependBaseFieldIds(options.dependBaseFieldIds);
	this.setDependFieldIds(options.dependFieldIds);
	
	this.setAutoRefresh((options.autoRefresh!=undefined)? options.autoRefresh:true);
	
	this.m_cashId = options.cashId;
	
	this.m_asyncRefresh = (options.asyncRefresh!=undefined)? options.asyncRefresh:true;
	
	//lazy init key passed
	if(options.value&&typeof(options.value)!="object"&&options.keyIds&&options.keyIds.length){
		var k_vals = {};
		for(i=0;i<options.keyIds.length;i++){
			k_vals[options.keyIds[i]]=(i==0)? options.value:null;
		}
		options.value = new RefType({"keys":k_vals});
	}	
	
	if (options.value && typeof options.value=="object" && options.value.getKeys){
		this.m_setKeys = options.value.getKeys();
		
	}else if (options.value && typeof options.value=="object" && options.value.m_keys){
		this.m_setKeys = options.value.m_keys;
	}
	
	EditSelectRef.superclass.constructor.call(this, id, options);
//console.log("EditSelect Id="+this.getName()+", options.value="+options.value,(new Date()))	
	if (options.modelDataStr && this.m_model){		
		if (this.getCashable()){
			window.getApp().setCashData(this.getCashId(),options.modelDataStr);
		}
		this.m_model.setData(options.modelDataStr);
	}
	
	//if no after toDOM autoRefresh, then refresh now
	//if (!this.m_autoRefresh)this.onRefresh();
	
}
extend(EditSelectRef,EditSelect);

/* private members */
EditSelectRef.prototype.m_oldEnabled;
EditSelectRef.prototype.m_cashable;
EditSelectRef.prototype.m_readPublicMethod;
EditSelectRef.prototype.m_model;

EditSelectRef.prototype.m_keyIds;
EditSelectRef.prototype.m_modelKeyFields;
EditSelectRef.prototype.m_modelKeyIds;
EditSelectRef.prototype.m_modelDescrFields;
EditSelectRef.prototype.m_modelDescrIds;
EditSelectRef.prototype.m_modelDescrFormatFunction;

EditSelectRef.prototype.m_dependBaseControl;
EditSelectRef.prototype.m_dependBaseFieldIds;
EditSelectRef.prototype.m_dependFieldIds;
EditSelectRef.prototype.m_dependControl;

//EditSelectRef.prototype.m_autoRefresh;

//when setValue is called m_setKeys is set, then after toDOM,refresh real value is set from m_setKeys
//delayed set implementation
EditSelectRef.prototype.m_setKeys;

//EditSelectRef.prototype.NOT_SELECTED_VAL = "null";//????should be null
EditSelectRef.prototype.KEY_ATTR = "keys";
EditSelectRef.prototype.KEY_INIT_ATTR = "initKeys";


EditSelectRef.prototype.keys2Str = function(keys){
	return CommonHelper.serialize(keys);
}

EditSelectRef.prototype.str2Keys = function(str){
	return CommonHelper.unserialize(str);
}


/* Public */
EditSelectRef.prototype.setKeys = function(keys){
	if (!CommonHelper.isEmpty(keys)){
		this.m_keyIds = [];
		for (var keyid in keys){
			this.m_keyIds.push(keyid);
		}
	}
	else if (!this.m_keyIds){
		this.m_keyIds = [];
	}
	this.setAttr(this.KEY_ATTR,this.keys2Str(keys));
	
	if (this.getDependControl()){
		this.getDependControl().dependOnSelectBase(this.getModelRow());
	}
	
	if (this.m_onValueChange){
		this.m_onValueChange.call(this);
	}
}

EditSelectRef.prototype.getKeyIds = function(){
	return this.m_keyIds;
}
EditSelectRef.prototype.setKeyIds = function(v){
	this.m_keyIds = v;
}

EditSelectRef.prototype.getKeys = function(){
	return this.str2Keys( this.getAttr(this.KEY_ATTR) );
}

EditSelectRef.prototype.setInitKeys = function(keys){
	this.setAttr(this.KEY_INIT_ATTR,this.keys2Str(keys));
}

EditSelectRef.prototype.getInitKeys = function(){
	return this.str2Keys( this.getAttr(this.KEY_INIT_ATTR) );
}

EditSelectRef.prototype.getModified = function(){
//console.log("EditSelectRef.prototype.getModified")
//console.log("EditSelectRef.prototype.getModified key=",this.getAttr(this.KEY_ATTR), 'initKe=',this.getAttr(this.KEY_INIT_ATTR))
	
	return (this.getAttr(this.KEY_ATTR) != this.getAttr(this.KEY_INIT_ATTR));
}

EditSelectRef.prototype.getIsRef = function(){
	return true;
}

EditSelectRef.prototype.resetKeys = function(){
	this.setKeys({});
}

EditSelectRef.prototype.reset = function(){	
	EditSelectRef.superclass.reset.call(this);
	this.resetKeys();
}

/**
  * @param {Object|RefType} val
  */
EditSelectRef.prototype.setValue = function(val){
//console.log("EditSelectRef.prototype.setValue "+this.getName(),val,(new Date()))
//console.dir(val)
//debugger	
	if( typeof val == "string" && val.substring(0,1)=="{" && val.substring(val.length-1)=="}"){
		val = CommonHelper.unserialize(val);		
	}

	if (val!=null && typeof val == "object" && ( (val.getKeys && val.getDescr) || (val.keys && val.descr) || (val.m_keys && val.m_descr) ) ){
		//RefType || RefType old style unserealized
		val = val.getKeys? val.getKeys() : (val.keys? val.keys : val.m_keys);
		if (!this.m_keyIds){
			this.m_keyIds = [];
			for (var keyid in val){
				this.m_keyIds.push(keyid);
			}
		}
	}
	else{
		if (!this.getModelKeyFields()){
			this.defineModelKeyFieds();
		}	
		val_str = (val!=null)? val.toString():null;
		val = {};
		//First key???
		val[this.getModelKeyFields()[0].getId()] = val_str;
	}	
	
	//val now hold keys!
	if(!val){
		return;
	}
	
	var rec_found;
	for(var id in this.m_elements){
		var v = this.m_elements[id].getValue();
		rec_found = false;
		for (var vk in v){
			rec_found = (v[vk]==val[vk]);
			if (!rec_found){
				break;			
			}
		}
		if (rec_found){
			this.selectOptionById(id);
			break;
		}
	}		

	this.m_setKeys = val;
}

EditSelectRef.prototype.selectOptionById = function(optId){
	EditSelectRef.superclass.selectOptionById.call(this,optId);
	this.callOnSelect();
}

EditSelectRef.prototype.getValue = function(){
	var ind = this.getIndex();
	//if (ind){
	
	var res = null;
	if (
	(this.getAddNotSelected()&&!this.getNotSelectedLast()&&ind)
	||(this.getAddNotSelected()&&this.getNotSelectedLast()&&ind!=(this.getCount()-1))
	||!this.getAddNotSelected()
	){
		var elem = this.getElement(ind);		
		res = !elem? null : new RefType(
			{"keys":this.getKeys(),
			"descr":elem.getDescr()
			}
		);
	}
	return res;	
	/*
	var v = EditSelectRef.superclass.getValue.call(this);
	if (v){
		var keys = {};
		keys[this.getKeyIds()[0]] = v;
		return new RefType(
			{"keys":keys,
			"descr":this.getNode().options[this.m_node.selectedIndex].innerHTML
			}
		);
	}
	*/
}
EditSelectRef.prototype.getFormattedValue = function(){
	var v = this.getValue();
	if(v && typeof(v)=="object" && v.getFormattedValue){
		v = v.getFormattedValue();
	}
	return v;
}

EditSelectRef.prototype.setInitValue = function(val){
	this.setValue(val);	
	
	if (val && typeof val == "object" && val.getKeys){
		this.setInitKeys(val.getKeys());
		//this.m_initValue = this.getValue();//val;
		//this.setInitKeys(val.keys? val.keys:this.getKeys()); //this.getKeys()
	}else if (val && typeof val == "object" && val.keys){
		this.setInitKeys(val.keys);
	}	
}

EditSelectRef.prototype.getInitValue = function(){
	return this.getInitKeys();
}

EditSelectRef.prototype.setCashable = function(v){
	this.m_cashable = v;
	if(window.getApp().getAppSrv()){
		if(v){
			//subscribe
			var self = this;			
			var pm = this.getReadPublicMethod();
			if(!pm)return;
			var contr = pm.getController();
			if(!contr)return;			
			var ev_pref = window.getApp().getEventPrefOnController(contr);
			if(!ev_pref)return;
			this.subscribeToSrvEvents({
				"events":[
					{"id": ev_pref+".update"}
					,{"id":ev_pref+".insert"}
					,{"id": ev_pref+".delete"}
				]
				,"onEvent":function(json){
					window.getApp().setCashData(self.getCashId(),null);
					self.onRefresh();
				}
				,"onClose":function(message){
					if(message && message.code>1000){
						//self.setRefreshInterval(self.m_httpRrefreshInterval);						
						//timer refresh
					}
				}
			});
		}else{
			//unsubscribe + timer refresh
			this.unsubscribeFromSrvEvents();
		}
	}
}

EditSelectRef.prototype.getCashable = function(){
	return this.m_cashable;
}

EditSelectRef.prototype.setReadPublicMethod = function(v){
	this.m_readPublicMethod = v;
}
EditSelectRef.prototype.getReadPublicMethod = function(){
	return this.m_readPublicMethod;
}

EditSelectRef.prototype.defineModelKeyFieds = function(){
	//key fields
	if (this.getModelKeyIds()){
		var key_fields = [];
		var ids = this.getModelKeyIds();
		for (var i=0;i<ids.length;i++){
			if (this.m_model.fieldExists(ids[i])){
				key_fields.push(this.m_model.getField(ids[i]));
			}
		}
		this.setModelKeyFields(key_fields);
	}
	else{
		var key_fields = [];
		var fields = this.m_model.getFields();
		for (var id in fields){
			if (fields[id].getPrimaryKey()){
				key_fields.push(fields[id]);
			}
		}
		this.setModelKeyFields(key_fields);
	}
}

EditSelectRef.prototype.defineModelDescrFieds = function(){
	//descr fields
	if (this.getModelDescrIds()){
		var key_fields = [];
		var ids = this.getModelDescrIds();
		for (var i=0;i<ids.length;i++){
			if (this.m_model.fieldExists(ids[i])){
				key_fields.push(this.m_model.getField(ids[i]));
			}
		}
		this.setModelDescrFields(key_fields);
	}
}

EditSelectRef.prototype.setModel = function(v){
	this.m_model = v;
	this.setModelKeyFields(undefined);
	this.setModelDescrFields(undefined);
	
	this.defineModelKeyFieds();
	this.defineModelDescrFieds();
		
}
EditSelectRef.prototype.getModel = function(){
	return this.m_model;
}

EditSelectRef.prototype.getModelKeyIds = function(){
	return this.m_modelKeyIds;
}
EditSelectRef.prototype.setModelKeyIds = function(v){
	this.m_modelKeyIds = v;
}

EditSelectRef.prototype.getModelKeyFields = function(){
	return this.m_modelKeyFields;
}
EditSelectRef.prototype.setModelKeyFields = function(v){
	this.m_modelKeyFields = v;
}

EditSelectRef.prototype.getModelDescrIds = function(){
	return this.m_modelDescrIds;
}
EditSelectRef.prototype.setModelDescrIds = function(v){
	this.m_modelDescrIds = v;
}

EditSelectRef.prototype.getModelDescrFields = function(){
	return this.m_modelDescrFields;
}
EditSelectRef.prototype.setModelDescrFields = function(v){
	this.m_modelDescrFields = v;
}

EditSelectRef.prototype.getModelDescrFormatFunction = function(){
	return this.m_modelDescrFormatFunction;
}
EditSelectRef.prototype.setModelDescrFormatFunction = function(v){
	this.m_modelDescrFormatFunction = v;
}


EditSelectRef.prototype.toDOM = function(parent){
	EditSelectRef.superclass.toDOM.call(this,parent);
	
	//if (this.getAutoRefresh()){
		this.onRefresh();
	//}
}

EditSelectRef.prototype.onGetData = function(resp){
var nm = this.getName();
//console.log("EditSelectRef.prototype.onGetData Name="+nm,(new Date()))	
//debugger
	if (!this.m_model){
		return;
	}
	
	if (resp){
		var m_data = resp.getModelData(this.m_model.getId());
		this.m_model.setData(m_data);
		
		if (this.getCashable()){
			window.getApp().setCashData(this.getCashId(), m_data);
		}
	}
		
	//var old_key_val,
	/*if (this.m_initValue){
		old_key_val = this.m_initValue;
		this.m_initValue = undefined;
		
	}else*/
	var old_keys;
	if(this.m_setKeys){
		old_keys = this.m_setKeys;
		this.m_setKeys = undefined;
		//console.log("Found old_keys for "+this.getName()+" old_keys=",old_keys)
	}	
	else{
		/*var old_val = this.getValue();
		if (old_val && old_val.getKeys){
			old_keys = old_val.getKeys();
		}
		*/
		old_keys = this.getKeys();
	}
//console.log("old_keys=",old_keys,(new Date()))		
	//lookup fieldselectOptionById
	if (!this.getModelKeyFields()){
		this.defineModelKeyFieds();
		/*
		if (!this.getModelKeyFields()){
			//first key field
			this.m_modelKeyFields = [];
			
			var fields = this.m_model.getFields();
			for (var id in fields){
				if (fields[id].getPrimaryKey()){
					this.m_modelKeyFields.push(fields[id]);
				}
			}		
		}
		*/
		if (!this.getModelKeyFields()){
			throw Error(CommonHelper.format(this.ER_NO_LOOKUP,Array(this.getName())));
		}		
	}
	//****************

	//descr field
	if (!this.getModelDescrFormatFunction() && !this.getModelDescrFields()){
		this.defineModelDescrFieds();
		
		if (!this.getModelDescrFields()){
			//first key field
			this.m_modelDescrFields = [];
			var fields = this.m_model.getFields();
			var fields = this.m_model.getFields();
			for (var id in fields){
				if (!fields[id].getPrimaryKey()){
					this.m_modelDescrFields.push(fields[id]);
				}
			}
		}
		if (!this.getModelKeyFields()){
			//descr = key
			this.setModelDescrFields(this.getModelKeyFields());
		}		
	}
	
	//****************
		
	this.clear();
	var opt_class = this.getOptionClass();
	
	if (this.getAddNotSelected()){
		var val = {};
		for (var i=0;i<this.m_modelKeyFields.length;i++){
			val[this.m_modelKeyFields[i].getId()] = this.NOT_SELECTED_VAL;
		}
		var def_opt_opts = {"value":val,"descr":this.NOT_SELECTED_DESCR};//"NaN"
	}
	
	var opt_ind = 0;
	
	if (this.getAddNotSelected() && !this.getNotSelectedLast()){
		this.addElement(new opt_class(this.getId()+":"+opt_ind,def_opt_opts));	
		
		opt_ind++;
	}
	
	var opt_checked = false;	
	
	/*if (old_key_val && typeof(old_key_val) == "object" && old_key_val.getKeys){
		old_keys = old_key_val.getKeys();
	}*/
	
	var ind = 0;
	while (this.m_model.getNextRow()){
	
		var opt_key_val = {};
		var key_v,key_id;
		var cur_opt_checked = false;
		for (var i=0;i<this.m_modelKeyFields.length;i++){
			key_v = this.m_modelKeyFields[i].getValue();
			key_id = this.m_modelKeyFields[i].getId();
			opt_key_val[key_id] = key_v;
			if (this.m_modelKeyFields.length==1 && !opt_checked && old_keys && old_keys[key_id] && old_keys[key_id]==key_v){
				opt_checked = true;
				cur_opt_checked = true;
			}
		}		
		
		//for multy key support we have to check all keys!
		if (old_keys && this.m_modelKeyFields.length>1 && !opt_checked){
			var all_keys_matched = true;
			for(var key_id in opt_key_val){
				if(!old_keys[key_id] || old_keys[key_id]!=opt_key_val[key_id]){
					all_keys_matched = false;
					break;
				}
			}
			if(all_keys_matched){
				opt_checked = true;
				cur_opt_checked = true;				
			}
		}
		if(cur_opt_checked){
			this.setAttr(this.KEY_ATTR,this.keys2Str(opt_key_val));
		}
		
		var descr_val = "";
		var form_f = this.getModelDescrFormatFunction();
		if (form_f){
			descr_val = form_f.call(this,this.m_model.getFields());
		}
		else{
			for (var i=0;i<this.m_modelDescrFields.length;i++){
				var descr_v = this.m_modelDescrFields[i].getValue();
				if(descr_v&&descr_v.length){
					descr_val+= (descr_val=="")? "":" ";
					descr_val+= this.m_modelDescrFields[i].getValue();
				}
			}		
		}
		
		this.addElement(new opt_class(this.getId()+":"+opt_ind,{
			"checked":cur_opt_checked,
			"value":opt_key_val,
			"descr":descr_val,
			"attrs":{
				"modelIndex":ind
			}
		}));	
		ind++;
		opt_ind++;
		
	}
	
	if (this.getAddNotSelected() && this.getNotSelectedLast()){
		if (!opt_checked){
			def_opt_opts.checked = true;
			opt_checked = true;
		}
		this.addElement(new opt_class(this.getId()+":"+opt_ind,def_opt_opts));	
	}
	
	for (var elem_id in this.m_elements){
		this.m_elements[elem_id].toDOM(this.m_node);
	}

	if (!opt_checked && this.getCount()){
		this.setIndex(0);
	}
	
	/*if(!this.m_oldEnableLocked){
		this.setEnableLock(false);
		this.setEnabled(this.m_oldEnabled);
	}*/	
}

EditSelectRef.prototype.getCashId = function(){	
	return this.m_model.getId() + ( (this.m_cashId!=undefined)? "_"+this.m_cashId:"" );
}

EditSelectRef.prototype.onRefresh = function(){	
//console.log("EditSelectRef.prototype.onRefresh "+this.getName(),(new Date()))	

	/*this.m_oldEnableLocked = this.getEnableLock();	
	if(!this.m_oldEnableLocked){
		this.m_oldEnabled = this.getEnabled();	
		this.setEnabled(false);
		this.setEnableLock(true);
	}*/

	if (this.getCashable() && this.m_model){
		
		var cash = window.getApp().getCashData(this.getCashId());
		if (cash){
			this.m_model.setData(cash);
			this.onGetData();
			return;		
		}
	}

	var self = this;
	this.getReadPublicMethod().run({
		"async":this.m_asyncRefresh,
		"ok":function(resp){			
			self.onGetData(resp);
		},
		"fail":function(resp,erCode,erStr){
			/*if(!self.m_oldEnableLocked){
				self.setEnableLock(false);
				self.setEnabled(self.m_oldEnabled);
			}*/
			
			self.getErrorControl().setValue(window.getApp().formatError(erCode,erStr));
		}
	});
}


EditSelectRef.prototype.callOnSelect = function(){
	var i = this.getIndex();
	if (i==undefined)return;
	var model_keys = this.getElement(i).getValue();
	
	var key_ids = this.getKeyIds();
	var keys = {};
	var i = 0;
	for (id in model_keys){
		keys[key_ids[i]] = model_keys[id];
		i++;
	}
	
	this.setKeys(keys);

	/*
	if (this.getDependControl()){
		this.getDependControl().dependOnSelectBase(this.getModelRow());
	}
	*/
	//EditSelectRef.superclass.callOnSelect.call(this);
	if (this.getOnSelect()){
		this.m_onSelect.call(this,this.getModelRow());
	}
	
}

EditSelectRef.prototype.getModelRow = function(){
	var ind;
	
	if (this.getIndex()>=0){
		ind = this.getNode().options[this.m_node.selectedIndex].getAttribute("modelIndex");					
	}
	
	if (ind!=undefined && ind>=0){
		this.m_model.getRow(ind);
	}
	else{
		this.m_model.reset();
	}
	
	return this.m_model.getFields();
}
EditSelectRef.prototype.setAutoRefresh = function(autoRefresh){
	this.m_autoRefresh = autoRefresh;
}
EditSelectRef.prototype.getAutoRefresh = function(){
	return this.m_autoRefresh;
}

EditSelectRef.prototype.setDependBaseControl = function(v){
	this.m_dependBaseControl = v;
	
	if (this.m_dependBaseControl && this.m_dependBaseControl.setDependentControl){
		this.setDependentControl(this);
	}
}

EditSelectRef.prototype.getDependBaseControl = function(){
	return this.m_dependBaseControl;
}

EditSelectRef.prototype.setDependBaseFieldIds = function(v){
	this.m_dependBaseFieldIds = v;
}
EditSelectRef.prototype.getDependBaseFieldIds = function(){
	return this.m_dependBaseFieldIds;
}

EditSelectRef.prototype.setDependFieldIds = function(v){
	this.m_dependFieldIds = v;
}
EditSelectRef.prototype.getDependFieldIds = function(){
	return this.m_dependFieldIds;
}
EditSelectRef.prototype.setDependControl = function(v){
	this.m_dependControl = v;
}
EditSelectRef.prototype.getDependControl = function(){
	return this.m_dependControl;
}
EditSelectRef.prototype.dependOnSelectBase = function(baseModelRow){
	
	var pm = this.getReadPublicMethod();
	if (!pm)return;
	var contr = pm.getController();
	
	var cond_fields,cond_sgns,cond_vals;

	var cond_keys = this.getDependFieldIds();
	var base_keys = this.getDependBaseFieldIds();
	var ind = -1;
	for (var fid in baseModelRow){
	
		var cond_key = undefined;
		
		if (!base_keys && baseModelRow[fid].getPrimaryKey()){
			ind++;
			cond_key = cond_keys[ind];
		}
		else if (base_keys){
			for (ind=0;ind<base_keys.length;ind++){
				if (base_keys[ind]==fid){
					cond_key = cond_keys[ind];
					break;
				}
			}
		}
		
		if (cond_key){
			cond_fields = ( (cond_fields==undefined)? "":(cond_fields+contr.PARAM_FIELD_SEP_VAL) )+cond_key;
	
			cond_sgns = ( (cond_sgns==undefined)? "":(cond_sgns+contr.PARAM_FIELD_SEP_VAL) )+contr.PARAM_SGN_EQUAL;

			cond_vals = ( (cond_vals==undefined)? "":(cond_vals+contr.PARAM_FIELD_SEP_VAL) )+baseModelRow[fid].getValue();						
			
		}
	}	
			
	pm.setFieldValue(contr.PARAM_COND_FIELDS,cond_fields);
	pm.setFieldValue(contr.PARAM_COND_SGNS,cond_sgns);
	pm.setFieldValue(contr.PARAM_COND_VALS,cond_vals);
	pm.setFieldValue(contr.PARAM_FIELD_SEP,contr.PARAM_FIELD_SEP_VAL);
	this.onRefresh();		
}

