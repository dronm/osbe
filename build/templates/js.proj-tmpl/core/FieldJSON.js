/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2017

 * @extends Field
 * @requires core/Field.js
 * @requires core/ValidatorJSON.js    
 * @class
 * @classdesc
 
 * @param {string} id - Field identifier
 * @param {namespace} options
 */
function FieldJSON(id,options){
	options = options || {};
	options.validator = options.validator || new ValidatorJSON(options);
	options.dataType = this.DT_JSON;

	FieldJSON.superclass.constructor.call(this,id,options);
}
extend(FieldJSON,Field);

FieldJSON.prototype.getValueXHR = function(){
	return ( CommonHelper.serialize(this.getValue()));
/*	var v = (this.getValue()).toString();
console.log("FieldJSON.prototype.getValueXHR v=",v)	
	return v;*/
	
}

FieldJSON.prototype.setValue = function(id,v){
	if (!v && typeof(id)=="object"){
		//structure or RefType?
		this.m_value = id;
		//(!id.getKeys && id.keys)? new RefType(id) : id;
		//this.m_value = new RefType(id);
	}
	else if (!v && typeof(id)=="string" && id.length){		
		//console.log("FieldJSON.prototype.setValue id="+this.getId()+" val="+id)		
		this.m_value = CommonHelper.unserialize(id);
		//console.dir(this.m_value);	
	}
	else if (v){
		this.m_value = this.m_value || {};
		this.m_value[id] = v;
	}
}

FieldJSON.prototype.isEmpty = function(val,checkNull){
	val = (val && val.getKeys)? val.getKeys() : val;
	var r = (val==undefined);
	if (!r){
		r = true;
		for(v in val){
			if (checkNull && val[v]!==null || !checkNull && val[v]!==undefined){			
				r = false;
				break;
			}
		}
	}
	return r;
}

FieldJSON.prototype.isNull = function(){
	var r = this.isEmpty(this.getValue(),true);
	if (r){
		r = this.isEmpty(this.getDefValue(),true);
	}
	return r;

}

FieldJSON.prototype.isSet = function(){
	var r = this.isEmpty(this.getValue(),false);
	if (r){
		r = this.isEmpty(this.getDefValue(),false);
	}
	return !r;
}
