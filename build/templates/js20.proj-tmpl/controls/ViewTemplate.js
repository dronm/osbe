/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2017

 * @extends Control
 * @requires core/extend.js
 * @requires Control.js     

 * @class
 * @classdesc
 
 * @param {string} id - Object identifier
 * @param {object} options
 * @param {object} options.templateOptions
 * @param {string|object} options.value
 * @param {PublicMethod} options.publicMethod    
 * @param {int} [options.refreshInterval=0] 
 * @param {bool} [options.autoRefresh=false] 
 * @param {function} options.onBeforeUpdateHTML
 * @param {function} options.onAfterUpdateHTML         
 * @param {function} options.modelId  
 */
function ViewTemplate(id,options){
	options = options || {};	
	
	var t_opts = ((typeof(options.value)=="string")? CommonHelper.unserialize(options.value):options.value) || {};
	if (options.templateOptions){
		for (var opt in options.templateOptions){
			t_opts[opt] = options.templateOptions[opt];
		}
	}
	options.templateOptions = t_opts;
	options.value = null;

	this.m_modelId = options.modelId;
	this.setPublicMethod(options.publicMethod);
	this.setOnBeforeUpdateHTML(options.onBeforeUpdateHTML);
	this.setOnAfterUpdateHTML(options.onAfterUpdateHTML);
	this.setRefreshInterval((options.refreshInterval!=undefined)? options.refreshInterval:0);
	this.setAutoRefresh((options.autoRefresh!=undefined)? options.autoRefresh:false);
	
	ViewTemplate.superclass.constructor.call(this,id,options.tagName,options);
}
extend(ViewTemplate,Control);

/* Constants */

/* private members */

ViewTemplate.prototype.m_refreshInterval;
ViewTemplate.prototype.m_publicMethod;
ViewTemplate.prototype.m_autoRefresh;
ViewTemplate.prototype.m_onBeforeUpdateHTML;
ViewTemplate.prototype.m_onAfterUpdateHTML;

ViewTemplate.prototype.m_refreshIntervalObj;

ViewTemplate.prototype.m_model;
ViewTemplate.prototype.m_modelId;
/* protected*/


/* public methods */

ViewTemplate.prototype.toDOM = function(parent){
	ViewTemplate.superclass.toDOM.call(this,parent);

	if (this.m_autoRefresh){
		this.onRefresh();
	}	
}


ViewTemplate.prototype.setValue = function(){
}
/*
ViewTemplate.prototype.setValue = function(v){
console.log("ViewTemplate.prototype.setValue v=");
	if (typeof(v)=="string"){
		v = CommonHelper.unserialize(v);
	}
	this.setTemplateOptions(v);
}
*/

ViewTemplate.prototype.setPublicMethod = function(v){
	this.m_publicMethod = v;
}

ViewTemplate.prototype.getPublicMethod = function(){
	return this.m_publicMethod;
}
ViewTemplate.prototype.setOnBeforeUpdateHTML = function(v){
	this.m_onBeforeUpdateHTML = v || this.onBeforeUpdateHTML;
}

ViewTemplate.prototype.getOnBeforeUpdateHTML = function(){
	return this.m_onBeforeUpdateHTML;
}

ViewTemplate.prototype.setOnAfterUpdateHTML = function(v){
	this.m_onAfterUpdateHTML = v || this.onAfterUpdateHTML;
}

ViewTemplate.prototype.getOnAfterUpdateHTML = function(){
	return this.m_onAfterUpdateHTML;
}

ViewTemplate.prototype.setRefreshInterval = function(v){
	this.m_refreshInterval = v;
	if (v==0 && this.m_refreshIntervalObj!=undefined){		
		window.clearInterval(this.m_refreshIntervalObj);
	}
	else if (v>0){
		var self = this;
		this.m_refreshIntervalObj = setInterval(function(){
			self.onRefresh();
		},v);
	}
	
}

ViewTemplate.prototype.getRefreshInterval = function(){
	return this.m_refreshInterval;
}

ViewTemplate.prototype.setAutoRefresh = function(v){
	this.m_autoRefresh = v;
}

ViewTemplate.prototype.getAutoRefresh = function(){
	return this.m_autoRefresh;
}

ViewTemplate.prototype.onRefresh = function(callBack){

	if(this.m_publicMethod){
		var self = this;
		this.m_publicMethod.run({
			"ok":function(resp){
				self.onGetData(resp);
				if(callBack){
					callBack();
				}				
			}
		});
	}
	else if(callBack){
		callBack();
	}
}

ViewTemplate.prototype.onGetData = function(resp){
	if(this.m_onBeforeUpdateHTML){
		this.m_onBeforeUpdateHTML.call(this, resp);
	}
	
    //render html
	this.updateHTML(); //Control class method
	
    //set events
	if(this.m_onAfterUpdateHTML){
		this.m_onAfterUpdateHTML.call(this,resp);
	}	
}

//stub
ViewTemplate.prototype.onAfterUpdateHTML = function(resp){
}

//Default function if no custom method set.
//Initializes m_templateOptions with all rows/fields from response.
//m_modelId is mandatory.
ViewTemplate.prototype.onBeforeUpdateHTML = function(resp){
	if(!this.m_modelId){
		return;
	}
	//get new model
	this.m_model = resp.getModel(this.m_modelId);
	if(!this.m_model){
		return;
	}
	//all rows/fields to template parameters
	this.m_templateOptions = {"rows": []};
	while(this.m_model.getNextRow()){	
		let row = [];
		let fields = this.m_model.getFields();
		for(f_id in fields){
			let fld = fields[f_id];
			let tp = fld.getDataType();
			//default value representation based on datatype
			if(tp == Field.prototype.DT_JSON || tp == Field.prototype.DT_JSONB){
				row[f_id] = fld.getValue().getDescr();

			}else if(tp == Field.prototype.DT_DATE) {
				row[f_id] = DateHelper.format(fld.getValue(), "d.m.y");

			}else if(tp == Field.prototype.DT_DATETIME || tp == Field.prototype.DT_DATETIMETZ) {
				row[f_id] = DateHelper.format(fld.getValue(), "d.m.y H:i:s");

			}else if(tp == Field.prototype.DT_BOOL) {
				row[f_id] = (fld.getValue())? "да":"нет";

			}else{
				row[f_id] = fld.getValue();
			}
			row[f_id] 
		}
		this.m_templateOptions.rows.push(row);
		console.log("templateOptions:", this.m_templateOptions);
	}
}
