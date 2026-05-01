/**	
 * @author Andrey Mikhalevich <katrenplus@mail.ru>, 2016
 
 * @class
 * @classdesc

 * @param {Object} options
 * @param {Object} options.keys key=value pairs
 * @param {string} options.descr
 */
function RefType(options){
	options = options || {};	

	this.setKeys(options.keys);
	this.setDescr(options.descr);
	this.setDataType(options.dataType);
}

/* Constants */


/* private members */
RefType.prototype.m_keys;
RefType.prototype.m_descr;
RefType.prototype.m_dataType;

/* protected*/


/* public methods */
RefType.prototype.setKeys = function(v){
	this.m_keys = v;
}
RefType.prototype.getKeys = function(){
	return this.m_keys;
}
RefType.prototype.setDescr = function(v){
	this.m_descr = v;
}
RefType.prototype.getDescr = function(){
	return this.m_descr;
}
RefType.prototype.setDataType = function(v){
	this.m_dataType = v;
}
RefType.prototype.getDataType = function(){
	return this.m_dataType;
}

RefType.prototype.getKey = function(v){
	var val;
	if (this.m_keys && v){
		val = this.m_keys[v];
	}
	else if (this.m_keys && !v){
		for(var k in this.m_keys){
			val = this.m_keys[k];
			break;
		}
	
	}
	return val;
}

RefType.prototype.isNull = function(){	
	var k = this.getKeys();
	var r = (k==undefined || k==null || CommonHelper.isEmpty(k));
	if (!r){
		for(v in k){
			r = (k[v]===null||k[v]==="null");
			if (r){			
				break;
			}
		}
	}
	return r;
}

RefType.prototype.toJSON = function(){
	return {
		"keys":this.getKeys(),
		"descr":this.getDescr(),
		"dataType":this.getDataType()
	}
	;
}

RefType.prototype.getFormattedValue = function(){
	return this.getDescr();
}

/*
RefType.prototype.toString = function(){
	return this.toJSON();
}
*/
